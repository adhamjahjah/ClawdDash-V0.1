import sqlite3
import json
import time
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "clawd.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subtype TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    progress INTEGER NOT NULL DEFAULT 0,
    current_step TEXT,
    step_idx INTEGER NOT NULL DEFAULT 0,
    started_at INTEGER,
    completed_at INTEGER,
    eta TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    error_code TEXT,
    error_message TEXT,
    tags_json TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS task_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL REFERENCES tasks(id),
    label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    seq INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL,
    task_id TEXT,
    task_name TEXT,
    msg TEXT NOT NULL,
    ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subtype TEXT NOT NULL,
    next_run INTEGER,
    recurrence TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    avg_dur TEXT,
    last_status TEXT
);
"""


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)


def now_ms():
    return int(time.time() * 1000)


# ── Tasks ────────────────────────────────────────────────

def create_task(task_id, name, type_, subtype, steps, tags, priority, eta):
    created = now_ms()
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO tasks (id, name, type, subtype, status, priority, progress,
               current_step, step_idx, eta, tags_json, created_at)
               VALUES (?, ?, ?, ?, 'pending', ?, 0, ?, 0, ?, ?, ?)""",
            (task_id, name, type_, subtype, priority,
             steps[0] if steps else None, eta, json.dumps(tags), created)
        )
        for i, label in enumerate(steps):
            conn.execute(
                "INSERT INTO task_steps (task_id, label, status, seq) VALUES (?, ?, 'pending', ?)",
                (task_id, label, i)
            )


def update_task(task_id, fields: dict):
    if not fields:
        return
    # Auto-set timestamps
    if fields.get("status") == "running":
        fields.setdefault("started_at", now_ms())
    if fields.get("status") in ("completed", "failed", "cancelled"):
        fields.setdefault("completed_at", now_ms())

    cols = ", ".join(f"{k} = ?" for k in fields)
    vals = list(fields.values()) + [task_id]
    with get_conn() as conn:
        conn.execute(f"UPDATE tasks SET {cols} WHERE id = ?", vals)


def get_task(task_id):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if not row:
            return None
        task = dict(row)
        task["tags"] = json.loads(task.pop("tags_json", "[]"))
        task["steps"] = [
            dict(s) for s in conn.execute(
                "SELECT label, status FROM task_steps WHERE task_id = ? ORDER BY seq", (task_id,)
            ).fetchall()
        ]
        return task


def get_all_tasks():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
        tasks = []
        for row in rows:
            task = dict(row)
            task["tags"] = json.loads(task.pop("tags_json", "[]"))
            task["steps"] = [
                dict(s) for s in conn.execute(
                    "SELECT label, status FROM task_steps WHERE task_id = ? ORDER BY seq",
                    (task["id"],)
                ).fetchall()
            ]
            tasks.append(task)
        return tasks


# ── Logs ─────────────────────────────────────────────────

LOG_CAP = 500

def append_log(log_id, level, task_id, task_name, msg):
    ts = now_ms()
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO logs (id, level, task_id, task_name, msg, ts) VALUES (?, ?, ?, ?, ?, ?)",
            (log_id, level, task_id, task_name, msg, ts)
        )
        count = conn.execute("SELECT COUNT(*) FROM logs").fetchone()[0]
        if count > LOG_CAP:
            conn.execute(
                "DELETE FROM logs WHERE id IN (SELECT id FROM logs ORDER BY ts ASC LIMIT ?)",
                (count - LOG_CAP,)
            )


def get_logs(limit=60):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM logs ORDER BY ts DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


# ── Scheduled ─────────────────────────────────────────────

def upsert_scheduled(id_, name, type_, subtype, next_run, recurrence, avg_dur):
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO scheduled (id, name, type, subtype, next_run, recurrence, enabled, avg_dur)
               VALUES (?, ?, ?, ?, ?, ?, 1, ?)
               ON CONFLICT(id) DO UPDATE SET
                 name=excluded.name, type=excluded.type, subtype=excluded.subtype,
                 next_run=excluded.next_run, recurrence=excluded.recurrence,
                 avg_dur=excluded.avg_dur""",
            (id_, name, type_, subtype, next_run, recurrence, avg_dur)
        )


def update_scheduled(id_, fields: dict):
    if not fields:
        return
    cols = ", ".join(f"{k} = ?" for k in fields)
    vals = list(fields.values()) + [id_]
    with get_conn() as conn:
        conn.execute(f"UPDATE scheduled SET {cols} WHERE id = ?", vals)


def get_all_scheduled():
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM scheduled ORDER BY next_run ASC").fetchall()
        return [dict(r) for r in rows]


# ── Analytics ─────────────────────────────────────────────

TYPE_COLORS = {
    "web_automation": "var(--c-web)",
    "research":       "var(--c-res)",
    "api_integration":"var(--c-api)",
    "dev_infra":      "var(--c-dev)",
    "local_ops":      "var(--c-local)",
}

TYPE_LABELS = {
    "web_automation": "Web Auto",
    "research":       "Research",
    "api_integration":"API Integ",
    "dev_infra":      "Dev/Infra",
    "local_ops":      "Local Ops",
}

STATUS_COLORS = {
    "completed":     "var(--c-done)",
    "running":       "var(--c-run)",
    "failed":        "var(--c-fail)",
    "pending":       "var(--hint)",
    "waiting_input": "var(--c-wait)",
    "cancelled":     "var(--hint)",
}

def compute_analytics():
    window_ms = 30 * 24 * 3600 * 1000
    cutoff = now_ms() - window_ms

    with get_conn() as conn:
        # Total tasks in last 30d
        total = conn.execute(
            "SELECT COUNT(*) FROM tasks WHERE created_at >= ?", (cutoff,)
        ).fetchone()[0] or 0

        # Completed in last 30d
        completed_count = conn.execute(
            "SELECT COUNT(*) FROM tasks WHERE created_at >= ? AND status = 'completed'", (cutoff,)
        ).fetchone()[0] or 0

        # Failed in last 30d
        failed_count = conn.execute(
            "SELECT COUNT(*) FROM tasks WHERE created_at >= ? AND status = 'failed'", (cutoff,)
        ).fetchone()[0] or 0

        success_pct = round(completed_count / total * 100) if total else 0

        # Avg duration of completed tasks (ms → seconds → format)
        avg_row = conn.execute(
            """SELECT AVG(completed_at - started_at) FROM tasks
               WHERE created_at >= ? AND status = 'completed'
               AND completed_at IS NOT NULL AND started_at IS NOT NULL""",
            (cutoff,)
        ).fetchone()[0]
        if avg_row:
            avg_s = int(avg_row / 1000)
            avg_dur = f"{avg_s // 60}m {avg_s % 60}s"
        else:
            avg_dur = "—"

        # Running now
        running_now = conn.execute(
            "SELECT COUNT(*) FROM tasks WHERE status = 'running'"
        ).fetchone()[0] or 0

        kpis = [
            {"label": "Tasks (30d)", "value": str(total),         "trend": "—", "dir": "flat"},
            {"label": "Success Rate","value": f"{success_pct}%",  "trend": "—", "dir": "flat"},
            {"label": "Avg Duration","value": avg_dur,             "trend": "—", "dir": "flat"},
            {"label": "Active Now",  "value": str(running_now),   "trend": "—", "dir": "flat"},
        ]

        # Task types
        type_rows = conn.execute(
            "SELECT type, COUNT(*) as cnt FROM tasks WHERE created_at >= ? GROUP BY type ORDER BY cnt DESC",
            (cutoff,)
        ).fetchall()
        total_typed = sum(r["cnt"] for r in type_rows) or 1
        types = [
            {
                "label": TYPE_LABELS.get(r["type"], r["type"]),
                "count": r["cnt"],
                "pct":   round(r["cnt"] / total_typed * 100),
                "color": TYPE_COLORS.get(r["type"], "var(--accent)"),
            }
            for r in type_rows
        ]

        # Status distribution
        status_rows = conn.execute(
            "SELECT status, COUNT(*) as cnt FROM tasks WHERE created_at >= ? GROUP BY status",
            (cutoff,)
        ).fetchall()
        total_status = sum(r["cnt"] for r in status_rows) or 1
        status_dist = [
            {
                "label": r["status"].replace("_", " ").title(),
                "pct":   round(r["cnt"] / total_status * 100),
                "color": STATUS_COLORS.get(r["status"], "var(--hint)"),
            }
            for r in status_rows
        ]

        # Top failure codes
        failure_rows = conn.execute(
            """SELECT error_code, COUNT(*) as cnt FROM tasks
               WHERE created_at >= ? AND status = 'failed' AND error_code IS NOT NULL
               GROUP BY error_code ORDER BY cnt DESC LIMIT 5""",
            (cutoff,)
        ).fetchall()
        max_fail = failure_rows[0]["cnt"] if failure_rows else 1
        failures = [
            {
                "name":  r["error_code"],
                "count": r["cnt"],
                "pct":   round(r["cnt"] / max_fail * 100),
            }
            for r in failure_rows
        ]

    return {
        "kpis":       kpis,
        "types":      types,
        "statusDist": status_dist,
        "failures":   failures,
    }
