"""
Tests for OCR / Vision service.
Now uses Gemini Vision as the primary extractor with Tesseract as local fallback.
"""

import pytest
from unittest.mock import patch, MagicMock
from app.services.ocr_service import OCRService, OCRResult


class TestOCRService:

    def test_extract_from_image_returns_text(self):
        """Should return OCR text from an image using Gemini Vision."""
        svc = OCRService()

        with patch("app.services.ocr_service.ai_client") as mock_ai:
            mock_ai.call_vision.return_value = "Sample extracted text from Vision"
            result = svc.extract_from_image(b"fake_image_bytes")

        assert isinstance(result, OCRResult)
        assert "Sample" in result.text
        assert 0.0 <= result.confidence <= 1.0
        assert result.confidence == 0.98  # Gemini Vision path sets 0.98

    def test_low_confidence_on_bad_image(self):
        """Should fall back and raise ValueError when both Vision and Tesseract fail."""
        svc = OCRService()

        # Gemini Vision fails AND Tesseract is not available
        with patch("app.services.ocr_service.ai_client") as mock_ai:
            mock_ai.call_vision.side_effect = ValueError("Vision failed")
            with pytest.raises(ValueError, match="Could not extract text"):
                svc.extract_from_image(b"blurry_image")

    def test_ocr_failure_raises(self):
        """Should raise ValueError when Vision fails and Tesseract is unavailable."""
        svc = OCRService()
        with patch("app.services.ocr_service.ai_client") as mock_ai:
            mock_ai.call_vision.side_effect = ValueError("Gemini Vision error")
            with pytest.raises(ValueError, match="Could not extract text"):
                svc.extract_from_image(b"invalid")
