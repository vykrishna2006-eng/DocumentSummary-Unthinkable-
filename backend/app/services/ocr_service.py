"""
OCR & Multimodal Vision Service.
Extracts text, visual elements, tables, and structure from image files and scanned PDFs
using Google Gemini Vision with optional local Tesseract fallback.
"""

import io
import logging
from dataclasses import dataclass
from app.services.ai_client import ai_client

logger = logging.getLogger(__name__)


@dataclass
class OCRResult:
    text: str
    confidence: float
    page_count: int = 1


class OCRService:
    """Extracts text and visual document intelligence from images and scanned PDFs."""

    def extract_from_image(self, file_bytes: bytes, mime_type: str = "image/png") -> OCRResult:
        """
        Extracts text and evaluates content from a PNG/JPG/WEBP image using Gemini Vision.
        """
        logger.info("Starting image extraction | bytes=%d | mime=%s", len(file_bytes), mime_type)

        prompt = (
            "You are an expert Optical Character Recognition (OCR) and Document Intelligence AI.\n"
            "Analyse this image or scanned document thoroughly:\n"
            "1. Transcribe all text, headings, numbers, tables, lists, and captions accurately.\n"
            "2. Preserve original formatting, layout hierarchy, and line breaks.\n"
            "3. If the image contains diagrams, charts, UI elements, or graphics, provide a clear structured description "
            "of what is shown, including key data points and visual relationships.\n"
            "4. Return clean, comprehensive markdown text representing the full contents of the image."
        )

        try:
            # 1. Try Gemini Multimodal Vision (Industry-leading OCR accuracy)
            extracted_text = ai_client.call_vision(
                image_bytes=file_bytes,
                mime_type=mime_type,
                prompt=prompt,
                timeout=45000,
            )

            if extracted_text and extracted_text.strip():
                logger.info("Gemini Vision extraction successful | chars=%d", len(extracted_text))
                return OCRResult(text=extracted_text.strip(), confidence=0.98, page_count=1)

        except Exception as exc:
            logger.warning("Gemini Vision extraction encountered error: %s. Attempting local fallback...", exc)

        # 2. Local Tesseract Fallback (if installed)
        try:
            import pytesseract
            from PIL import Image

            image = Image.open(io.BytesIO(file_bytes))
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            tess_text = pytesseract.image_to_string(image)

            confs = [c for c in data.get("conf", []) if c != -1]
            avg_conf = (sum(confs) / len(confs) / 100) if confs else 0.75

            if tess_text and tess_text.strip():
                logger.info("Local Tesseract OCR successful | chars=%d | conf=%.2f", len(tess_text), avg_conf)
                return OCRResult(text=tess_text.strip(), confidence=round(avg_conf, 2), page_count=1)

        except Exception as tess_exc:
            logger.warning("Local Tesseract not available or failed: %s", tess_exc)

        raise ValueError(
            "Could not extract text or visual content from the image. "
            "Please ensure the image is clear and try again."
        )

    def extract_from_scanned_pdf(self, file_bytes: bytes) -> OCRResult:
        """Convert each PDF page to a high-resolution image and run Vision OCR."""
        try:
            import fitz  # PyMuPDF

            doc = fitz.open(stream=file_bytes, filetype="pdf")
            pages_text: list[str] = []
            page_count = len(doc)

            logger.info("Processing scanned PDF with %d pages...", page_count)

            for idx, page in enumerate(doc):
                # Render page at 200 DPI for optimal speed and vision clarity
                mat = fitz.Matrix(200 / 72, 200 / 72)
                pix = page.get_pixmap(matrix=mat)
                img_bytes = pix.tobytes("png")

                result = self.extract_from_image(img_bytes, mime_type="image/png")
                page_header = f"--- Page {idx + 1} ---\n" if page_count > 1 else ""
                pages_text.append(f"{page_header}{result.text}")

            doc.close()
            full_text = "\n\n".join(pages_text)

            return OCRResult(
                text=full_text,
                confidence=0.97,
                page_count=page_count,
            )

        except ValueError:
            raise
        except Exception as exc:
            logger.error("Scanned PDF Vision OCR failed: %s", exc)
            raise ValueError(f"Scanned PDF processing failed: {exc}") from exc
