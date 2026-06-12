from fastapi import UploadFile, File
import os

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from app.rag_service import load_sample_context
from app.analysis_service import analyze_incident


app = FastAPI(
    title="AI Incident Copilot",
    description="GenAI RCA platform using FastAPI, RAG and Ollama",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IncidentRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "AI Incident Copilot backend is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze")
def analyze(request: IncidentRequest):
    context = load_sample_context()
    result = analyze_incident(context, request.question)

    return {
        "question": request.question,
        "report": result
    }

UPLOAD_DIR = "app/uploads"

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename
    }