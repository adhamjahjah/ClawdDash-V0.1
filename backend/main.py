import os
import uuid
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import database as db

load_dotenv()

API_KEY = os.getenv("API_KEY", "changeme")

app = FastAPI(title="Clawd Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

db.init_db()


# ── Auth ──────────────────────────────────────────────────

def require_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# ── GET /api/state ────────────────────────────────────────

@app.get("/api/state")
def get_state(auth=Depends(require_api_key)):
    tasks = db.get_all_tasks()
    logs = db.get_logs(60)
    scheduled = db.get_all_scheduled()
    analytics = db.compute_analytics()

    # Convert scheduled next_run int → keep as int (JS will convert)
    return {
        "tasks":     tasks,
        "logs":      logs,
        "scheduled": scheduled,
        "analytics": analytics,
    }


# ── POST /api/tasks ───────────────────────────────────────

class CreateTaskBody(BaseModel):
    name: str
    type: str
    subtype: str
    steps: list[str] = []
    tags: list[str] = []
    priority: str = "medium"
    eta: Optional[str] = None


@app.post("/api/tasks", status_code=201)
def create_task(body: CreateTaskBody, auth=Depends(require_api_key)):
    task_id = f"tsk_{uuid.uuid4().hex[:8]}"
    db.create_task(
        task_id=task_id,
        name=body.name,
        type_=body.type,
        subtype=body.subtype,
        steps=body.steps,
        tags=body.tags,
        priority=body.priority,
        eta=body.eta,
    )
    return {"task_id": task_id}


# ── PATCH /api/tasks/{id} ────────────────────────────────

class UpdateTaskBody(BaseModel):
    progress: Optional[int] = None
    current_step: Optional[str] = None
    step_idx: Optional[int] = None
    status: Optional[str] = None
    eta: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None


@app.patch("/api/tasks/{task_id}")
def update_task(task_id: str, body: UpdateTaskBody, auth=Depends(require_api_key)):
    task = db.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    db.update_task(task_id, fields)
    return {"ok": True}


# ── POST /api/logs ────────────────────────────────────────

class CreateLogBody(BaseModel):
    level: str
    task_id: Optional[str] = None
    task_name: Optional[str] = None
    msg: str


@app.post("/api/logs", status_code=201)
def create_log(body: CreateLogBody, auth=Depends(require_api_key)):
    log_id = f"lg_{uuid.uuid4().hex[:12]}"
    db.append_log(log_id, body.level, body.task_id, body.task_name, body.msg)
    return {"log_id": log_id}


# ── POST /api/scheduled ───────────────────────────────────

class UpsertScheduledBody(BaseModel):
    id: str
    name: str
    type: str
    subtype: str
    next_run: Optional[int] = None
    recurrence: Optional[str] = None
    avg_dur: Optional[str] = None


@app.post("/api/scheduled", status_code=201)
def upsert_scheduled(body: UpsertScheduledBody, auth=Depends(require_api_key)):
    db.upsert_scheduled(
        id_=body.id,
        name=body.name,
        type_=body.type,
        subtype=body.subtype,
        next_run=body.next_run,
        recurrence=body.recurrence,
        avg_dur=body.avg_dur,
    )
    return {"ok": True}


# ── PATCH /api/scheduled/{id} ────────────────────────────

class UpdateScheduledBody(BaseModel):
    enabled: Optional[bool] = None


@app.patch("/api/scheduled/{sched_id}")
def update_scheduled(sched_id: str, body: UpdateScheduledBody, auth=Depends(require_api_key)):
    fields = {}
    if body.enabled is not None:
        fields["enabled"] = 1 if body.enabled else 0
    db.update_scheduled(sched_id, fields)
    return {"ok": True}


# ── Action endpoints ──────────────────────────────────────

@app.post("/api/tasks/{task_id}/cancel")
def cancel_task(task_id: str, auth=Depends(require_api_key)):
    task = db.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.update_task(task_id, {"status": "cancelled"})
    return {"ok": True}


@app.post("/api/tasks/{task_id}/retry")
def retry_task(task_id: str, auth=Depends(require_api_key)):
    task = db.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.update_task(task_id, {
        "status": "running",
        "progress": 0,
        "retry_count": (task.get("retry_count") or 0) + 1,
        "error_code": None,
        "error_message": None,
        "started_at": db.now_ms(),
    })
    return {"ok": True}


@app.post("/api/tasks/{task_id}/rerun")
def rerun_task(task_id: str, auth=Depends(require_api_key)):
    task = db.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.update_task(task_id, {
        "status": "pending",
        "progress": 0,
        "started_at": None,
        "completed_at": None,
        "step_idx": 0,
        "current_step": "Waiting in queue",
    })
    return {"ok": True}
