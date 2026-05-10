from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    creator_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "Medium"
    status: str = "To Do"
    assigned_to_id: Optional[int] = None

class TaskCreate(TaskBase):
    project_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None

class Task(TaskBase):
    id: int
    project_id: int
    class Config:
        from_attributes = True

class ProjectMemberAdd(BaseModel):
    email: str
    role: str = "Member"

class DashboardStats(BaseModel):
    total_tasks: int
    tasks_by_status: dict
    tasks_per_user: dict
    overdue_tasks: int

class GlobalDashboardStats(BaseModel):
    due_soon_tasks: int
    overdue_tasks: int

