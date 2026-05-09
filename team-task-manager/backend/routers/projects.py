from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import database, models, schemas, auth

router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)

@router.post("/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_project = models.Project(
        name=project.name,
        description=project.description,
        creator_id=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Creator becomes Admin automatically
    member = models.ProjectMember(project_id=new_project.id, user_id=current_user.id, role="Admin")
    db.add(member)
    db.commit()

    return new_project

@router.get("/", response_model=List[schemas.Project])
def get_projects(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return current_user.projects

@router.get("/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if user is a member
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")

    return project

@router.post("/{project_id}/members", status_code=status.HTTP_201_CREATED)
def add_member(project_id: int, member_data: schemas.ProjectMemberAdd, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Check if current user is Admin
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()

    if not membership or membership.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can add members")

    # Find user to add
    user_to_add = db.query(models.User).filter(models.User.email == member_data.email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already a member
    existing_member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_to_add.id
    ).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member")

    new_member = models.ProjectMember(project_id=project_id, user_id=user_to_add.id, role=member_data.role)
    db.add(new_member)
    db.commit()
    return {"message": "Member added successfully"}

@router.delete("/{project_id}/members/{user_id}")
def remove_member(project_id: int, user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Check if current user is Admin
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()

    if not membership or membership.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can remove members")

    member_to_remove = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id
    ).first()

    if not member_to_remove:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member_to_remove)
    db.commit()
    return {"message": "Member removed successfully"}

@router.get("/{project_id}/members", response_model=List[dict])
def get_project_members(project_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Check if user is member
    membership = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not authorized")

    members = db.query(models.User, models.ProjectMember.role).join(
        models.ProjectMember, models.User.id == models.ProjectMember.user_id
    ).filter(models.ProjectMember.project_id == project_id).all()

    return [{"id": m[0].id, "name": m[0].name, "email": m[0].email, "role": m[1]} for m in members]
