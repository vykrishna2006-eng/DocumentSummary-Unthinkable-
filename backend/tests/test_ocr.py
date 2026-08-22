"""
Tests for OCR service.
"""

import pytest
from unittest.mock import patch, MagicMock
from app.services.ocr_service import OCRService, OCRResult


class TestOCRService:

    def test_extract_from_image_returns_text(self):
        """Should return OCR text from an image."""
        svc = OCRService()

        with patch("pytesseract.image_to_string", return_value="Sample extracted text"):
            with patch("pytesseract.image_to_data", return_value={"conf": [90, 85, 92]}):
                with patch("PIL.Image.open"):
                    result = svc.extract_from_image(b"fake_image_bytes")

        assert isinstance(result, OCRResult)
        assert "Sample" in result.text
        assert 0.0 <= result.confidence <= 1.0

    def test_low_confidence_on_bad_image(self):
        """Should return low confidence for poorly scanned images."""
        svc = OCRService()

        with patch("pytesseract.image_to_string", return_value=""):
            with patch("pytesseract.image_to_data", return_value={"conf": [-1, -1]}):
                with patch("PIL.Image.open"):
                    result = svc.extract_from_image(b"blurry_image")

        assert result.confidence == 0.0

    def test_ocr_failure_raises(self):
        """Should raise ValueError when OCR fails entirely."""
        svc = OCRService()
        with patch("PIL.Image.open", side_effect=Exception("bad image")):
            with pytest.raises(ValueError, match="Could not perform OCR"):
                svc.extract_from_image(b"invalid")
