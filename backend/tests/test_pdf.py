"""
Tests for PDF extraction service.
"""

import pytest
from unittest.mock import patch, MagicMock
from app.services.pdf_service import PDFService, PDFExtractionResult


class TestPDFService:

    def test_extract_text_pdf(self):
        """Should extract text from a text-based PDF."""
        svc = PDFService()
        mock_page = MagicMock()
        mock_page.get_text.return_value = "This is a test document with enough words."

        with patch("fitz.open") as mock_open:
            mock_doc = MagicMock()
            mock_doc.__iter__ = MagicMock(return_value=iter([mock_page]))
            mock_doc.__len__ = MagicMock(return_value=1)
            mock_open.return_value = mock_doc

            result = svc.extract(b"fake_pdf_bytes")

        assert isinstance(result, PDFExtractionResult)
        assert result.has_text is True
        assert result.page_count >= 1

    def test_detect_scanned_pdf(self):
        """Should detect a scanned (image-only) PDF as having no text."""
        svc = PDFService()
        mock_page = MagicMock()
        mock_page.get_text.return_value = ""  # no text

        with patch("fitz.open") as mock_open:
            mock_doc = MagicMock()
            mock_doc.__iter__ = MagicMock(return_value=iter([mock_page]))
            mock_doc.__len__ = MagicMock(return_value=1)
            mock_open.return_value = mock_doc

            result = svc.extract(b"fake_scanned_pdf")

        assert result.has_text is False
        assert result.confidence <= 0.1

    def test_invalid_file_raises(self):
        """Should raise ValueError for non-PDF bytes."""
        svc = PDFService()
        with patch("fitz.open", side_effect=Exception("not a PDF")):
            with pytest.raises(ValueError, match="Could not read PDF"):
                svc.extract(b"not_a_pdf")
