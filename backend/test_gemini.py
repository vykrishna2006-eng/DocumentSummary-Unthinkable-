import json
from google import genai
from google.genai import types
from app.core.config import settings

client = genai.Client(api_key=settings.gemini_api_key)
model_name = "gemini-3.6-flash"

prompt = """
You are DocuMind, an expert AI document intelligence assistant.
Analyze the following document and provide:
1. Multi-tiered summaries (executive ~100 words, standard ~250 words, detailed ~500 words).
2. Exactly 6 key actionable insights.
3. Exactly 4 improvement suggestions with category and icon ('warning', 'check', 'idea').
4. Quality score metrics (clarity, structure, completeness, overall) from 0 to 100.

Return ONLY a JSON object with this schema:
{
  "summary": {
    "executive": "...",
    "standard": "...",
    "detailed": "..."
  },
  "key_insights": [
    {"index": 1, "text": "...", "source_page": null}
  ],
  "improvements": [
    {"category": "Clarity", "icon": "idea", "message": "...", "suggestion": "..."}
  ],
  "quality": {
    "clarity": 85,
    "structure": 80,
    "completeness": 90,
    "overall": 85
  }
}

Document:
Project Proposal: Capstone Project Proposal RAGDocs Member 2
Document Analysis and Intelligent Retrieval-Augmented Generation (RAG) System.
This project addresses the challenge of information overload in corporate and academic research environments by providing automated semantic summarization, optical character recognition for scanned reports, and intelligent key-finding extraction.
Built using modern high-performance web frameworks, the system enables users to upload heterogeneous document formats (PDF, PNG, JPEG), parse text structure, compute readability indices, and generate executive briefs.
"""

print("Running test with model:", model_name)
resp = client.models.generate_content(
    model=model_name,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        http_options={"timeout": 45000}
    )
)

data = json.loads(resp.text)
print("Keys returned:", list(data.keys()))
print("Summary standard:", data["summary"]["standard"][:120], "...")
print("Key insights count:", len(data["key_insights"]))
print("Improvements count:", len(data["improvements"]))
print("Quality:", data["quality"])