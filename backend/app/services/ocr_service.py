"""
OCR service using Tesseract via pytesseract.
Handles scanned PDFs and image files (PNG, JPG).
"""

import io
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class OCRResult:
    text: str
    confidence: float
    page_count: int = 1


class OCRService:
    """Runs OCR on image bytes using Tesseract."""

    def extract_from_image(self, file_bytes: bytes) -> OCRResult:
        """Run OCR on a PNG/JPG image."""
        try:
            import pytesseract
            from PIL import Image

            image = Image.open(io.BytesIO(file_bytes))
            # Get detailed OCR data including confidence scores
            data = pytesseract.image_to_data(
                image, output_type=pytesseract.Output.DICT
            )
            text = pytesseract.image_to_string(image)

            # Average confidence of recognised words (ignore -1 entries)
            confs = [c for c in data["conf"] if c != -1]
            avg_conf = (sum(confs) / len(confs) / 100) if confs else 0.0

            logger.info(
                "OCR complete | chars=%d | confidence=%.2f", len(text), avg_conf
            )
            return OCRResult(text=text, confidence=round(avg_conf, 2))

        except Exception as exc:
            logger.error("OCR failed: %s", exc)
            raise ValueError(
                "Could not perform OCR on the uploaded image. "
                "Please try a clearer image."
            ) from exc

    def extract_from_scanned_pdf(self, file_bytes: bytes) -> OCRResult:
        """Convert each PDF page to an image and run OCR."""
        try:
            import fitz
            import pytesseract
            from PIL import Image

            doc = fitz.open(stream=file_bytes, filetype="pdf")
            pages_text: list[str] = []
            all_confs: list[float] = []

            for page in doc:
                # Render page at 300 DPI for good OCR quality
                mat = fitz.Matrix(300 / 72, 300 / 72)
                pix = page.get_pixmap(matrix=mat)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

                import io as _io
                buf = _io.BytesIO()
                img.save(buf, format="PNG")
                result = self.extract_from_image(buf.getvalue())
                pages_text.append(result.text)
                all_confs.append(result.confidence)

            doc.close()
            avg_conf = sum(all_confs) / len(all_confs) if all_confs else 0.0
            full_text = "\n\n".join(pages_text)

            logger.info(
                "Scanned PDF OCR | pages=%d | chars=%d | confidence=%.2f",
                len(pages_text), len(full_text), avg_conf,
            )
            return OCRResult(
                text=full_text,
                confidence=round(avg_conf, 2),
                page_count=len(pages_text),
            )

        except ValueError:
            raise
        except Exception as exc:
            logger.error("Scanned PDF OCR failed: %s", exc)
            raise ValueError(f"OCR processing failed: {exc}") from exc
