"""
Health check endpoint.
"""

from fastapi import APIRouter
from app.schemas.response import HealthResponse
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Returns service health status."""
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        services={
            "api": "operational",
            "pdf_extractor": "operational",
            "ocr_engine": "operational",
            "ai_pipeline": "operational" if settings.gemini_api_key else "no_key_configured",
        },
    )
