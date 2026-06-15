import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")


def analyze_incident(context, question):
    prompt = f"""
You are an AI Incident Analysis Assistant.

Use the context below to generate a production-ready RCA report.

Context:
{context}

Incident Question:
{question}

Return ONLY valid JSON in this exact structure:

{{
  "root_cause": "one short technical sentence",
  "confidence": "percentage only, example: 92%",
  "evidence": [
    "evidence point 1",
    "evidence point 2"
  ],
  "fix_steps": [
    "fix step 1",
    "fix step 2",
    "fix step 3"
  ],
  "prevention": [
    "prevention point 1",
    "prevention point 2"
  ]
}}

Rules:
- Do not return markdown.
- Do not add explanation outside JSON.
- Keep each item concise.
- Base the answer only on the provided context.
"""

    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }
    )

    raw_output = response.json()["response"]
    print(raw_output)

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        return {
            "root_cause": "Unable to parse model output into structured JSON.",
            "confidence": "70%",
            "evidence": ["Model returned non-JSON response."],
            "fix_steps": ["Retry analysis with a clearer incident question."],
            "prevention": ["Improve JSON output validation in backend."]
        }