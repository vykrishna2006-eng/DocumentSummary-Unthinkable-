"""
Unified API response envelope schemas.
"""

from pydantic import BaseModel
from typing import Optional, Any
from app.schemas.document import (
    DocumentStats,
    SummaryResult,
    KeyInsight,
    ImprovementItem,
    DocumentSection,
    QualityScore,
    ExtractionMethod,
)


class ExtractionInfo(BaseModel):
    method: ExtractionMethod
    confidence: float
    raw_text_preview: str       # first 300 chars of extracted text


class AnalysisResponse(BaseModel):
    """Full analysis response returned to the frontend."""

    document: DocumentStats
    extraction: ExtractionInfo
    summary: SummaryResult
    key_insights: list[KeyInsight]
    improvements: list[ImprovementItem]
    sections: list[DocumentSection]
    quality: QualityScore
    full_text: str              # full extracted text for Document Explorer


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: str = "ANALYSIS_ERROR"


class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict[str, str]
