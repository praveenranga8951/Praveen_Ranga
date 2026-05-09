from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import database, models, schemas, auth

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/stats/{project_id}", response_model=schemas.DashboardStats)
def get_dashboard_stats(project_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Check membership
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized")

    total_tasks = db.query(models.Task).filter(models.Task.project_id == project_id).count()

    tasks_by_status_raw = db.query(models.Task.status, func.count(models.Task.id)).filter(
        models.Task.project_id == project_id
    ).group_by(models.Task.status).all()
    tasks_by_status = {status: count for status, count in tasks_by_status_raw}

    # Fill in missing statuses
    for s in ["To Do", "In Progress", "Done"]:
        if s not in tasks_by_status:
            tasks_by_status[s] = 0

    tasks_per_user_raw = db.query(models.User.name, func.count(models.Task.id)).join(
        models.Task, models.User.id == models.Task.assigned_to_id
    ).filter(models.Task.project_id == project_id).group_by(models.User.name).all()
    tasks_per_user = {name: count for name, count in tasks_per_user_raw}

    overdue_tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id,
        models.Task.due_date < datetime.utcnow(),
        models.Task.status != "Done"
    ).count()

    return {
        "total_tasks": total_tasks,
        "tasks_by_status": tasks_by_status,
        "tasks_per_user": tasks_per_user,
        "overdue_tasks": overdue_tasks
    }
