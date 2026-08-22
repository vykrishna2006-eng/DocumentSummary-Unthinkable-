"""
Document analysis route — primary endpoint for DocuMind.

POST /api/v1/documents/analyze
"""

import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse

from app.schemas.document import SummaryMode
from app.schemas.response import AnalysisResponse, ErrorResponse
from app.services.document_service import DocumentService
from app.utils.validators import validate_file

logger = logging.getLogger(__name__)
router = APIRouter()
document_service = DocumentService()


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analyze a document",
    description="Upload a PDF or image and receive full AI-powered analysis.",
)
async def analyze_document(
    file: UploadFile = File(..., description="PDF, PNG, or JPG file"),
    summary_mode: SummaryMode = Form(SummaryMode.standard),
):
    """
    Full document intelligence pipeline:
    1. Validate file
    2. Route to PDF extractor or OCR engine
    3. Normalize & chunk text
    4. Run AI analysis (summary, key insights, improvements)
    5. Return structured response
    """
    logger.info("Received file: %s | mode: %s", file.filename, summary_mode)

    # ── Validate ──────────────────────────────────────────────────────────────
    try:
        file_bytes = await file.read()
        validate_file(file.filename or "", len(file_bytes))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )

    # ── Process ───────────────────────────────────────────────────────────────
    try:
        result = await document_service.analyze(
            filename=file.filename or "document",
            file_bytes=file_bytes,
            summary_mode=summary_mode,
        )
        return result

    except ValueError as exc:
        logger.warning("Document processing error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except Exception as exc:
        logger.error("Unexpected error during analysis: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analysis temporarily unavailable. Please try again.",
        )
