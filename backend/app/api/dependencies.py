"""
FastAPI dependency injection helpers.
"""

from app.services.document_service import DocumentService

_document_service: DocumentService | None = None


def get_document_service() -> DocumentService:
    global _document_service
    if _document_service is None:
        _document_service = DocumentService()
    return _document_service
