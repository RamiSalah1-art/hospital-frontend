from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import projects_router
from .core.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Freelance Monitor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)

@app.get("/")
def read_root():
    return {"message": "Freelance Bot API is running"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}
