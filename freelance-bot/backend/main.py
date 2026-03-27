from fastapi import FastAPI

app = FastAPI(title="Freelance Monitor API")

@app.get("/")
def read_root():
    return {"message": "Freelance Bot API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
