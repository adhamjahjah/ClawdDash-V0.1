"""
ClawdReporter — lightweight SDK for reporting Clawd bot activity to the dashboard.

Usage:
    from clawd_reporter import ClawdReporter

    r = ClawdReporter("http://localhost:8000", api_key="your-key")

    # Simple usage
    task_id = r.create_task("Scrape G2", type="web_automation", subtype="scraping",
                             steps=["Launch browser", "Navigate", "Extract", "Export"],
                             tags=["scraping"], eta="~3 min")
    r.update(task_id, progress=50, step="Extract", step_idx=2)
    r.log(task_id, "Scrape G2", "info", "Page 3 complete — 47 records found")
    r.complete(task_id)

    # Context manager (auto complete / fail)
    with r.task("Daily backup", type="local_ops", subtype="backup",
                steps=["Dump DB", "Compress", "Verify"]) as t:
        t.step(0);  do_dump();  t.done(0)
        t.step(1);  compress(); t.done(1)
        t.step(2);  verify();   t.done(2)
        # Exception → r.fail() called automatically

All calls are fire-and-forget (errors are logged, never re-raised).
"""

import json
import logging
import urllib.request
import urllib.error
from typing import Optional

logger = logging.getLogger("clawd_reporter")


class ClawdReporter:
    def __init__(self, base_url: str, api_key: str, timeout: int = 5):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    # ── Internal HTTP helper ──────────────────────────────

    def _request(self, method: str, path: str, body: Optional[dict] = None) -> Optional[dict]:
        url = f"{self.base_url}{path}"
        data = json.dumps(body).encode() if body is not None else None
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
        }
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            logger.warning("ClawdReporter %s %s → HTTP %s", method, path, e.code)
        except Exception as e:
            logger.warning("ClawdReporter %s %s → %s", method, path, e)
        return None

    # ── Public API ────────────────────────────────────────

    def create_task(
        self,
        name: str,
        *,
        type: str,
        subtype: str,
        steps: list[str] = None,
        tags: list[str] = None,
        priority: str = "medium",
        eta: str = None,
    ) -> Optional[str]:
        """Create a task on the dashboard. Returns task_id or None on error."""
        res = self._request("POST", "/api/tasks", {
            "name":     name,
            "type":     type,
            "subtype":  subtype,
            "steps":    steps or [],
            "tags":     tags or [],
            "priority": priority,
            "eta":      eta,
        })
        return res.get("task_id") if res else None

    def update(
        self,
        task_id: str,
        *,
        progress: int = None,
        step: str = None,
        step_idx: int = None,
        status: str = None,
        eta: str = None,
        error_code: str = None,
        error_message: str = None,
    ):
        """Update progress/status of an existing task."""
        body = {}
        if progress is not None:   body["progress"]      = progress
        if step is not None:       body["current_step"]  = step
        if step_idx is not None:   body["step_idx"]      = step_idx
        if status is not None:     body["status"]        = status
        if eta is not None:        body["eta"]           = eta
        if error_code is not None: body["error_code"]    = error_code
        if error_message is not None: body["error_message"] = error_message
        if body:
            self._request("PATCH", f"/api/tasks/{task_id}", body)

    def complete(self, task_id: str, *, progress: int = 100):
        """Mark task as completed."""
        self.update(task_id, status="completed", progress=progress)

    def fail(self, task_id: str, *, error_code: str = None, error_message: str = None):
        """Mark task as failed."""
        self.update(task_id, status="failed",
                    error_code=error_code, error_message=error_message)

    def log(self, task_id: Optional[str], task_name: Optional[str], level: str, msg: str):
        """Append a log entry."""
        self._request("POST", "/api/logs", {
            "level":     level,
            "task_id":   task_id,
            "task_name": task_name,
            "msg":       msg,
        })

    def schedule(
        self,
        id: str,
        name: str,
        *,
        type: str,
        subtype: str,
        next_run: Optional[int] = None,
        recurrence: Optional[str] = None,
        avg_dur: Optional[str] = None,
    ):
        """Upsert a scheduled task entry."""
        self._request("POST", "/api/scheduled", {
            "id":         id,
            "name":       name,
            "type":       type,
            "subtype":    subtype,
            "next_run":   next_run,
            "recurrence": recurrence,
            "avg_dur":    avg_dur,
        })

    def task(self, name: str, **kwargs) -> "_TaskContext":
        """Return a context manager for a task (auto complete/fail)."""
        return _TaskContext(self, name, **kwargs)


class _TaskContext:
    """Context manager that auto-completes or fails a task."""

    def __init__(self, reporter: ClawdReporter, name: str, **kwargs):
        self._r = reporter
        self._name = name
        self._kwargs = kwargs
        self.id: Optional[str] = None

    def __enter__(self):
        self.id = self._r.create_task(self._name, **self._kwargs)
        if self.id:
            self._r.update(self.id, status="running")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if not self.id:
            return False
        if exc_type is None:
            self._r.complete(self.id)
        else:
            self._r.fail(
                self.id,
                error_code=type(exc_val).__name__,
                error_message=str(exc_val),
            )
            self._r.log(self.id, self._name, "error", f"Task failed: {exc_val}")
        return False  # don't suppress exceptions

    def step(self, idx: int):
        """Mark a step as running."""
        if self.id:
            steps = self._kwargs.get("steps", [])
            label = steps[idx] if idx < len(steps) else f"Step {idx}"
            pct = round(idx / max(len(steps), 1) * 100)
            self._r.update(self.id, progress=pct, step=label, step_idx=idx)

    def done(self, idx: int):
        """Mark a step as completed (advance progress)."""
        if self.id:
            steps = self._kwargs.get("steps", [])
            pct = round((idx + 1) / max(len(steps), 1) * 100)
            self._r.update(self.id, progress=pct, step_idx=idx + 1)
