# DocuMind

### AI-Powered Document Intelligence Platform

> Upload any PDF or image. DocuMind extracts, analyses, and summarises it using a full AI intelligence pipeline — not just a single LLM call.

---

## Overview

DocuMind is a full-stack AI document intelligence application. It goes beyond basic summarisation by routing documents through a multi-stage processing pipeline: intelligent text extraction, semantic chunking, hierarchical AI analysis, and evidence-aware insight extraction — all surfaced through a premium React dashboard.

## Problem

Existing document tools either call an LLM directly (losing structure and context), or require expensive enterprise subscriptions. DocuMind demonstrates how a well-engineered pipeline — PDF extraction, OCR fallback, chunking, and hierarchical summarisation — produces dramatically better results than passing a raw document to a chatbot.

## Solution

A structured intelligence pipeline:

```
Upload → Intelligent Router → Text Extraction / OCR
       → Normalise → Semantic Chunking
       → Hierarchical AI Analysis
       → Summary (3 modes) + Key Insights + Improvement Suggestions
       → Interactive Dashboard with Document Explorer
```

---

## Key Features

| Feature | Description |
|---|---|
| **Intelligent routing** | Automatically detects text-based vs. scanned PDFs |
| **PDF extraction** | PyMuPDF for high-fidelity text extraction |
| **OCR engine** | Tesseract for scanned documents and images |
| **Hierarchical summarisation** | Chunk-level → global synthesis pipeline |
| **3 summary modes** | Executive (~100w), Standard (~250w), Detailed (~500w) |
| **Key insights** | 6 numbered insights with optional page citations |
| **Quality analysis** | Clarity, Structure, Completeness scores + AI suggestions |
| **Document Explorer** | Section navigation + full-text reader |
| **Processing pipeline UI** | Animated stage-by-stage progress overlay |
| **Responsive design** | Works on desktop and mobile |

---

## System Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full diagram.

```
User → React Frontend → FastAPI Backend
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         PDF Service     OCR Service    (fallback)
         (PyMuPDF)       (Tesseract)
              │               │
              └───────┬───────┘
                      ▼
               Text Service (normalise)
                      ▼
               Chunk Service (semantic chunking)
                      ▼
              AI Analysis Engine (OpenAI)
              ┌───────┼───────┐
              ▼       ▼       ▼
           Summary  Insights  Improvements
                      ▼
              Premium Dashboard
```

---

## Document Processing Pipeline

1. **File Validation** — type, size, and content checks
2. **Intelligent Router** — PDF text density analysis → PDF extractor or OCR
3. **Text Normalisation** — remove control characters, collapse whitespace, strip page markers
4. **Semantic Chunking** — paragraph-aware, overlapping chunks (2000 chars, 200 overlap)
5. **Chunk Summarisation** — each chunk summarised independently
6. **Global Synthesis** — chunk summaries combined into 3 modes
7. **Insight Extraction** — 6 key insights with page citations via structured JSON output
8. **Quality Analysis** — improvement suggestions + clarity/structure/completeness scores

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Backend | FastAPI (Python 3.11+) |
| PDF Extraction | PyMuPDF (fitz) |
| OCR | Tesseract + pytesseract |
| AI | Gemini AI |
| Validation | Pydantic v2 |
| Deployment | Vercel (frontend) + Render (backend) |

---

## API Architecture

Single primary endpoint:

```
POST /api/v1/documents/analyze
Content-Type: multipart/form-data

Fields:
  file          — PDF / PNG / JPG (max 20 MB)
  summary_mode  — executive | standard | detailed
```

Full API reference: [`docs/api.md`](docs/api.md)

---

## AI Summarisation Strategy

DocuMind uses **Hierarchical Summarisation** rather than raw document-to-LLM:

```
Document
   │
   ├── Chunk 1 → mini-summary
   ├── Chunk 2 → mini-summary
   ├── Chunk 3 → mini-summary
   └── Chunk N → mini-summary
            │
            ▼
      Global Synthesis
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
Executive Standard Detailed
```

This avoids token limits, preserves document context, and produces more accurate summaries for long documents.

---

## Error Handling

| Scenario | Response |
|---|---|
| Unsupported file type | 422 — "Please upload PDF, PNG or JPG" |
| File too large | 422 — "File exceeds 20 MB limit" |
| Empty / blank scan | 422 — "No readable text detected" |
| AI service failure | 500 — "Analysis temporarily unavailable" |
| Network error | Client-side toast with retry option |

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Tesseract OCR installed ([installation guide](https://github.com/tesseract-ocr/tesseract))
- OpenAI API key

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

uvicorn app.main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/api/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## Environment Variables

### Backend (`.env`)

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
ALLOWED_ORIGINS=["http://localhost:5173"]
MAX_FILE_SIZE_MB=20
DEBUG=false
```

### Frontend (`.env.local`)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel or run: vercel --prod
```

Set environment variable `VITE_API_URL` to your backend URL.

### Backend → Render

1. Create a new Web Service on Render
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add `OPENAI_API_KEY` in Render environment variables

---

## Testing

```bash
cd backend
pytest tests/ -v
```

Tests cover: PDF extraction, OCR service, text normalisation, and chunk service.

---

## Project Structure

```
documind/
├── frontend/
│   ├── src/
│   │   ├── components/         # DocumentStats, SummaryPanel, KeyInsights, etc.
│   │   ├── pages/              # Home.jsx, Analysis.jsx
│   │   ├── services/           # api.js (axios client)
│   │   ├── hooks/              # useDocumentAnalysis.js
│   │   └── utils/              # formatters.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/routes/         # health.py, documents.py
│   │   ├── core/               # config.py, logging.py
│   │   ├── schemas/            # document.py, response.py
│   │   ├── services/           # document_service.py, pdf_service.py, etc.
│   │   └── utils/              # validators.py, helpers.py
│   ├── tests/
│   └── requirements.txt
│
├── docs/
│   ├── architecture.md
│   ├── approach.md
│   └── api.md
│
├── sample_data/
├── README.md
├── .gitignore
└── LICENSE
```

---

## Design Decisions

- **No direct frontend-to-AI calls** — API key stays server-side
- **Hierarchical summarisation** — handles documents of any length without truncation
- **Pydantic v2 schemas** — strict typed I/O throughout the pipeline
- **Single analysis endpoint** — clean, predictable API surface
- **Paragraph-aware chunking** — never splits mid-sentence

## Limitations

- OCR accuracy depends on scan quality (300 DPI recommended)
- Very large documents (100+ pages) may take 30-60 seconds
- Language detection is heuristic; non-English documents are processed but may have lower quality summaries
- Tesseract must be installed separately on the server

## Future Improvements

- Multi-language support via language detection + model selection
- Vector database integration for document Q&A
- Batch document processing
- Export summaries to PDF/DOCX
- User accounts with analysis history

---

## Approach

See [`docs/approach.md`](docs/approach.md) for the 200-word approach write-up.
