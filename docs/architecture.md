# DocuMind — System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          USER                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   React + Vite (Frontend)                   │
│   Home page → Upload → Mode select → Analysis Dashboard     │
└──────────────────────────┬──────────────────────────────────┘
                           │  REST API  (multipart/form-data)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI Backend  (Python 3.11+)               │
│   POST /api/v1/documents/analyze                            │
└──────────────┬────────────────────────────────┬─────────────┘
               │                                │
               ▼                                ▼
┌──────────────────────┐          ┌─────────────────────────┐
│   PDF Service        │          │   OCR Service           │
│   PyMuPDF            │          │   Tesseract             │
│   (text-based PDFs)  │          │   (scanned docs/images) │
└──────────┬───────────┘          └────────────┬────────────┘
           │                                   │
           └──────────────┬────────────────────┘
                          ▼
           ┌──────────────────────────┐
           │   Text Service           │
           │   Normalise + Clean      │
           └──────────────┬───────────┘
                          ▼
           ┌──────────────────────────┐
           │   Chunk Service          │
           │   Paragraph-aware        │
           │   Semantic Chunking      │
           └──────────────┬───────────┘
                          ▼
           ┌──────────────────────────────────────┐
           │         AI Analysis Engine            │
           │  (OpenAI GPT-4o-mini / GPT-4o)        │
           └───────┬──────────────┬───────────────-┘
                   │              │               │
                   ▼              ▼               ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
          │ Summary Svc  │ │ Insight Svc  │ │ Improvement Svc  │
          │ Hierarchical │ │ Evidence     │ │ Quality scores   │
          │ pipeline     │ │ citations    │ │ Suggestions      │
          └──────┬───────┘ └──────┬───────┘ └──────┬───────────┘
                 │                │                 │
                 └────────────────┼─────────────────┘
                                  ▼
                    ┌─────────────────────────┐
                    │   Analysis Response     │
                    │   (AnalysisResponse)    │
                    └─────────────┬───────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Premium Dashboard     │
                    │   Stats · Summary       │
                    │   Insights · Explorer   │
                    └─────────────────────────┘
```

## Key Design Decisions

1. **Separation of concerns** — each service has one responsibility (PDF, OCR, text, chunking, summary, insights, improvements).
2. **Intelligent routing** — the system automatically detects scanned vs. text PDFs and routes accordingly.
3. **Hierarchical summarisation** — avoids sending entire documents to the LLM; chunks are summarised individually then synthesised.
4. **API key stays server-side** — the React frontend never touches the OpenAI key.
5. **All three summary modes generated in one API call** — no extra round trips from the UI.
