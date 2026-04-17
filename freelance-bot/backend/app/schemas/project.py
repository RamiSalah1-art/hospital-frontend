from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProjectBase(BaseModel):
    platform: str
    project_id: str
    title: str
    description: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    currency: str = "SAR"
    duration_days: Optional[int] = None
    client_name: Optional[str] = None
    client_rating: Optional[float] = None
    client_projects_count: Optional[int] = None
    proposals_count: Optional[int] = None
    url: Optional[str] = None
    tags: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    is_active: bool
    created_at: datetime
    scraped_at: datetime

    class Config:
        from_attributes = True
