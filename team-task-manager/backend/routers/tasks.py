from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import database, models, schemas, auth

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)

@router.post("/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Check if user is member of project and is Admin
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == task.project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()

    if not membership or membership.role != "Admin":
        raise HTTPException(status_code=403, detail="Only project admins can create tasks")

    new_task = models.Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        status=task.status,
        project_id=task.project_id,
        assigned_to_id=task.assigned_to_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/project/{project_id}", response_model=List[schemas.Task])
def get_project_tasks(project_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Check membership
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(models.Task).filter(models.Task.project_id == project_id).all()

@router.patch("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == db_task.project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = task_update.model_dump(exclude_unset=True)

    # Authorization logic
    is_admin = membership.role == "Admin"
    is_assigned = db_task.assigned_to_id == current_user.id

    if not is_admin:
        # If not admin, can ONLY update status
        if list(update_data.keys()) != ["status"]:
             raise HTTPException(status_code=403, detail="Members can only update the status of tasks")

        # If not admin, can only update status if assigned to the task
        if not is_assigned:
             raise HTTPException(status_code=403, detail="Members can only update the status of tasks assigned to them")

    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/my-tasks", response_model=List[schemas.Task])
def get_my_tasks(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Task).filter(models.Task.assigned_to_id == current_user.id).all()
