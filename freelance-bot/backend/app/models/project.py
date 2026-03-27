from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)  # mostaql, khamsat, etc
    project_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    currency = Column(String(10), default="SAR")
    duration_days = Column(Integer, nullable=True)
    client_name = Column(String(200), nullable=True)
    client_rating = Column(Float, nullable=True)
    client_projects_count = Column(Integer, nullable=True)
    proposals_count = Column(Integer, nullable=True)
    url = Column(String(500), nullable=True)
    tags = Column(Text, nullable=True)  # JSON string
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    scraped_at = Column(DateTime(timezone=True), server_default=func.now())
