# DocuMind — Approach Write-Up (≤200 words)

DocuMind treats document analysis as a structured intelligence pipeline, not a
single LLM call. On upload, the system intelligently routes the file: text-based
PDFs go through PyMuPDF for high-fidelity extraction; scanned documents and
images are processed with Tesseract OCR. The raw text is then normalised,
cleaned, and split into overlapping semantic chunks using a paragraph-aware
strategy.

Rather than sending an entire document to the LLM at once, DocuMind uses a
**hierarchical summarisation** approach: each chunk is summarised independently,
and the chunk summaries are then synthesised into three modes — Executive
(~100 words), Standard (~250 words), and Detailed (~500 words) — in a single
AI pass. Key insights are extracted with optional page citations, and a separate
improvement analysis returns structured quality scores (clarity, structure,
completeness) alongside actionable suggestions.

The React frontend communicates exclusively with the FastAPI backend; the AI
API key never leaves the server. The UI features an animated processing pipeline
overlay, a Document Explorer with section navigation, and responsive error
handling for unsupported files, empty scans, and service failures. The full
stack is deployable on Vercel (frontend) and Render (backend) with minimal
configuration.
