from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Freelance Monitor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Freelance Bot API is running"}

@app.get("/api/projects")
def get_projects():
    return {"projects": []}

@app.get("/api/health")
def health():
    return {"status": "healthy"}
