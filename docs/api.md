# DocuMind API Reference

Base URL: `https://your-backend.onrender.com/api/v1`  
Interactive docs: `/api/docs` (Swagger UI)

---

## POST /documents/analyze

Analyse a PDF or image document.

### Request

`Content-Type: multipart/form-data`

| Field          | Type   | Required | Description                                      |
|----------------|--------|----------|--------------------------------------------------|
| `file`         | File   | ✓        | PDF, PNG, or JPG. Max 20 MB.                     |
| `summary_mode` | string | ✗        | `executive` / `standard` / `detailed` (default) |

### Response `200 OK`

```json
{
  "document": {
    "name": "research.pdf",
    "type": "Research Paper",
    "pages": 18,
    "word_count": 7842,
    "char_count": 45231,
    "language": "English",
    "extraction_method": "pdf_text",
    "confidence": 0.97
  },
  "extraction": {
    "method": "pdf_text",
    "confidence": 0.97,
    "raw_text_preview": "Abstract: This paper presents..."
  },
  "summary": {
    "executive": "...",
    "standard": "...",
    "detailed": "...",
    "mode_used": "standard"
  },
  "key_insights": [
    { "index": 1, "text": "The proposed method reduces latency by 32%.", "source_page": 7 }
  ],
  "improvements": [
    {
      "category": "Clarity",
      "icon": "warning",
      "message": "Long sentences in methodology",
      "suggestion": "Break sentences over 40 words into shorter ones."
    }
  ],
  "sections": [
    { "index": 1, "title": "Introduction", "preview": "This paper...", "word_count": 12, "start_char": 0 }
  ],
  "quality": {
    "clarity": 82,
    "structure": 74,
    "completeness": 88,
    "overall": 81
  },
  "full_text": "Full extracted document text..."
}
```

### Error Responses

| Status | Code                   | Description                         |
|--------|------------------------|-------------------------------------|
| 422    | `UNPROCESSABLE_ENTITY` | Invalid file type, size, or empty   |
| 500    | `INTERNAL_SERVER_ERROR`| AI service unavailable              |

---

## GET /health

Returns service health status.

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "api": "operational",
    "pdf_extractor": "operational",
    "ocr_engine": "operational",
    "ai_pipeline": "operational"
  }
}
```
