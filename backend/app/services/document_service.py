"""
DocumentService — orchestrates the full analysis pipeline.

Flow:
  Upload → Validate → Route (PDF / OCR) → Normalise → Chunk
        → AI Analysis (unified multi-tier summary + insights + quality & improvements)
        → Build response
"""

import logging
from app.schemas.document import (
    SummaryMode, DocumentStats, ExtractionMethod, SummaryResult,
    KeyInsight, ImprovementItem, QualityScore, DocumentSection
)
from app.schemas.response import AnalysisResponse, ExtractionInfo
from app.services.pdf_service import PDFService
from app.services.ocr_service import OCRService
from app.services.text_service import TextService
from app.services.chunk_service import ChunkService
from app.services.summary_service import SummaryService
from app.services.insight_service import InsightService
from app.services.improvement_service import ImprovementService
from app.services.ai_client import ai_client

logger = logging.getLogger(__name__)


class DocumentService:
    """
    Orchestrates the entire document intelligence pipeline.
    """

    def __init__(self):
        self.pdf_svc = PDFService()
        self.ocr_svc = OCRService()
        self.text_svc = TextService()
        self.chunk_svc = ChunkService()
        self.summary_svc = SummaryService()
        self.insight_svc = InsightService()
        self.improvement_svc = ImprovementService()

    async def analyze(
        self,
        filename: str,
        file_bytes: bytes,
        summary_mode: SummaryMode = SummaryMode.standard,
    ) -> AnalysisResponse:
        """Run the full document intelligence pipeline."""
        ext = filename.rsplit(".", 1)[-1].lower()
        logger.info("Pipeline start | file=%s | ext=%s", filename, ext)

        # ── 1. Extract text ───────────────────────────────────────────────────
        raw_text, page_count, extraction_method, confidence = \
            self._extract(file_bytes, ext)

        if not raw_text.strip():
            raise ValueError(
                "No readable text detected. "
                "The document may be blank or heavily corrupted."
            )

        # ── 2. Normalise ──────────────────────────────────────────────────────
        clean_text = self.text_svc.normalize(raw_text)
        word_count = self.text_svc.count_words(clean_text)
        language = self.text_svc.detect_language(clean_text)

        # ── 3. Chunk ──────────────────────────────────────────────────────────
        chunks = self.chunk_svc.chunk(clean_text)

        # ── 4. Detect sections ────────────────────────────────────────────────
        raw_sections = self.chunk_svc.detect_sections(clean_text)
        sections = [
            DocumentSection(
                index=i + 1,
                title=s["title"],
                preview=s["preview"],
                word_count=len(s["preview"].split()),
                start_char=s["start_char"],
            )
            for i, s in enumerate(raw_sections[:10])
        ]

        # ── 5. AI analysis (Unified single-pass AI with graceful fallback) ─────
        summary, insights, improvements, quality = self._analyze_ai(
            chunks, clean_text, page_count
        )

        # ── 6. Build response ─────────────────────────────────────────────────
        doc_type = self._infer_doc_type(clean_text)

        return AnalysisResponse(
            document=DocumentStats(
                name=filename,
                type=doc_type,
                pages=page_count,
                word_count=word_count,
                char_count=len(clean_text),
                language=language,
                extraction_method=extraction_method,
                confidence=confidence,
            ),
            extraction=ExtractionInfo(
                method=extraction_method,
                confidence=confidence,
                raw_text_preview=clean_text[:300],
            ),
            summary=summary,
            key_insights=insights,
            improvements=improvements,
            sections=sections,
            quality=quality,
            full_text=clean_text,
        )

    def _analyze_ai(
        self, chunks: list, clean_text: str, page_count: int
    ) -> tuple[SummaryResult, list[KeyInsight], list[ImprovementItem], QualityScore]:
        """
        Runs comprehensive document intelligence in a single optimized Gemini call.
        Falls back to individual specialized services if needed.
        """
        sample = clean_text[:6000] if len(clean_text) > 6000 else clean_text

        unified_prompt = (
            "You are DocuMind, an expert AI document intelligence platform.\n"
            "Analyse the provided document thoroughly and return ONLY a JSON object with this exact structure:\n"
            "{\n"
            '  "summary": {\n'
            '    "executive": "~100 words high-level executive summary of purpose and conclusions",\n'
            '    "standard": "~250 words balanced summary covering background, key methods, and findings",\n'
            '    "detailed": "~500 words thorough analytical summary covering all nuances"\n'
            "  },\n"
            '  "key_insights": [\n'
            '    {"index": 1, "text": "Specific key finding or takeaway under 25 words", "source_page": null}\n'
            "  ],\n"
            '  "improvements": [\n'
            '    {"category": "Clarity", "icon": "idea", "message": "Short title", "suggestion": "Actionable advice"}\n'
            "  ],\n"
            '  "quality": {\n'
            '    "clarity": 85,\n'
            '    "structure": 80,\n'
            '    "completeness": 85,\n'
            '    "overall": 83\n'
            "  }\n"
            "}\n\n"
            "Guidelines:\n"
            "- 'summary': Write clear, professional, third-person prose. Do not use bullet points inside summary values.\n"
            "- 'key_insights': Exactly 6 high-value insights.\n"
            "- 'improvements': Exactly 4 actionable constructive items (categories: Clarity, Structure, Completeness, Recommendation; icons: warning, check, idea).\n"
            "- 'quality': Integer scores 0-100 reflecting genuine readability, structure, completeness, and overall document quality.\n\n"
            f"Document Content:\n\n{sample}"
        )

        try:
            logger.info("Executing unified AI document intelligence...")
            parsed = ai_client.call_json(unified_prompt, timeout=45000)

            # 1. Summary
            sum_data = parsed.get("summary", {})
            summary = SummaryResult(
                executive=sum_data.get("executive", self.summary_svc._heuristic_summary(sample, 100)),
                standard=sum_data.get("standard", self.summary_svc._heuristic_summary(sample, 250)),
                detailed=sum_data.get("detailed", self.summary_svc._heuristic_summary(sample, 500)),
                mode_used=SummaryMode.standard,
            )

            # 2. Key Insights
            raw_insights = parsed.get("key_insights", [])
            if isinstance(raw_insights, list) and raw_insights:
                insights = [
                    KeyInsight(
                        index=item.get("index", i + 1),
                        text=str(item.get("text", "")).strip(),
                        source_page=item.get("source_page"),
                    )
                    for i, item in enumerate(raw_insights[:6])
                ]
            else:
                insights = self.insight_svc._heuristic_insights(sample)

            # 3. Improvements
            raw_improvements = parsed.get("improvements", [])
            if isinstance(raw_improvements, list) and raw_improvements:
                improvements = [
                    ImprovementItem(
                        category=item.get("category", "General"),
                        icon=item.get("icon", "idea"),
                        message=item.get("message", "Document feedback"),
                        suggestion=item.get("suggestion", "Review document structure."),
                    )
                    for item in raw_improvements[:4]
                ]
            else:
                improvements, _ = self.improvement_svc._heuristic_analysis(sample)

            # 4. Quality
            q = parsed.get("quality", {})
            quality = QualityScore(
                clarity=min(100, max(10, int(q.get("clarity", 80)))),
                structure=min(100, max(10, int(q.get("structure", 75)))),
                completeness=min(100, max(10, int(q.get("completeness", 85)))),
                overall=min(100, max(10, int(q.get("overall", 80)))),
            )

            return summary, insights, improvements, quality

        except Exception as exc:
            logger.warning("Unified AI call failed: %s. Falling back to specialized sub-services.", exc)
            summary = self.summary_svc.generate(chunks, clean_text)
            insights = self.insight_svc.extract(clean_text, page_count)
            improvements, quality = self.improvement_svc.analyse(clean_text)
            return summary, insights, improvements, quality

    # ── Private helpers ───────────────────────────────────────────────────────

    def _extract(
        self, file_bytes: bytes, ext: str
    ) -> tuple[str, int, ExtractionMethod, float]:
        """
        Intelligent routing:
        - PDF → try PDF text extraction first
          - If low text density → fall back to OCR
        - Image → OCR
        """
        if ext == "pdf":
            result = self.pdf_svc.extract(file_bytes)
            if result.has_text:
                return (
                    result.text,
                    result.page_count,
                    ExtractionMethod.pdf_text,
                    result.confidence,
                )
            else:
                logger.info("PDF appears scanned — routing to OCR.")
                ocr = self.ocr_svc.extract_from_scanned_pdf(file_bytes)
                return (
                    ocr.text,
                    ocr.page_count,
                    ExtractionMethod.ocr,
                    ocr.confidence,
                )

        elif ext in ("png", "jpg", "jpeg"):
            ocr = self.ocr_svc.extract_from_image(file_bytes)
            return (ocr.text, 1, ExtractionMethod.ocr, ocr.confidence)

        else:
            raise ValueError(f"Unsupported file type: .{ext}")

    def _infer_doc_type(self, text: str) -> str:
        """Heuristically infer a human-readable document type."""
        sample = text[:1000].lower()
        if any(w in sample for w in ["abstract", "methodology", "references", "doi"]):
            return "Research Paper"
        if any(w in sample for w in ["invoice", "bill to", "total", "tax"]):
            return "Invoice"
        if any(w in sample for w in ["agreement", "whereas", "party", "hereby"]):
            return "Legal Document"
        if any(w in sample for w in ["executive summary", "revenue", "q1", "fiscal"]):
            return "Business Report"
        if any(w in sample for w in ["curriculum", "experience", "education", "skills"]):
            return "Resume / CV"
        return "Document"
