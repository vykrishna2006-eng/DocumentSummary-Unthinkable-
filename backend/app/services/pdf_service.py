"""
PDF text extraction using PyMuPDF.
Returns extracted text and page count.
"""

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class PDFExtractionResult:
    text: str
    page_count: int
    has_text: bool          # False if the PDF appears to be scanned
    confidence: float       # 0.0 – 1.0


class PDFService:
    """Extracts text from PDF files using PyMuPDF (fitz)."""

    MIN_TEXT_CHARS_PER_PAGE = 30    # threshold to detect scanned PDFs

    def extract(self, file_bytes: bytes) -> PDFExtractionResult:
        """Extract text from a PDF byte stream."""
        try:
            import fitz  # PyMuPDF

            doc = fitz.open(stream=file_bytes, filetype="pdf")
            pages_text: list[str] = []

            for page in doc:
                pages_text.append(page.get_text("text"))

            doc.close()

            full_text = "\n\n".join(pages_text)
            page_count = len(pages_text)
            avg_chars = len(full_text) / max(page_count, 1)
            has_text = avg_chars >= self.MIN_TEXT_CHARS_PER_PAGE

            # Confidence based on text density
            confidence = min(1.0, avg_chars / 500) if has_text else 0.1

            logger.info(
                "PDF extracted | pages=%d | chars=%d | has_text=%s | confidence=%.2f",
                page_count, len(full_text), has_text, confidence,
            )
            return PDFExtractionResult(
                text=full_text,
                page_count=page_count,
                has_text=has_text,
                confidence=round(confidence, 2),
            )

        except Exception as exc:
            logger.error("PDF extraction failed: %s", exc)
            raise ValueError(f"Could not read PDF file: {exc}") from exc
