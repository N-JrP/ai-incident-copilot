from fastapi import UploadFile, File
import os

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from app.services.rag_service import load_sample_context, retrieve_documents
from app.services.analysis_service import analyze_incident
from app.evaluation.evaluator import run_evaluations


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

@app.post("/retrieve")
def retrieve(request: IncidentRequest):
    results = retrieve_documents(request.question)

    return {
        "question": request.question,
        "retrieved_documents": results
    }

@app.post("/incident-intelligence")
def incident_intelligence(request: IncidentRequest):
    retrieved_documents = retrieve_documents(request.question)
    context = load_sample_context()
    report = analyze_incident(context, request.question)

    return {
        "question": request.question,
        "retrieved_documents": retrieved_documents,
        "report": report
    }

@app.get("/evaluate")
def evaluate():
    def generate_answer(question: str):
        context = load_sample_context()
        return analyze_incident(context, question)

    results = run_evaluations(generate_answer)

    return {
        "status": "completed",
        "results": results
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