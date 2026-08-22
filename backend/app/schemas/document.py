"""
Pydantic schemas for document-related request/response models.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class SummaryMode(str, Enum):
    executive = "executive"
    standard = "standard"
    detailed = "detailed"


class ExtractionMethod(str, Enum):
    pdf_text = "pdf_text"
    ocr = "ocr"
    hybrid = "hybrid"


class DocumentStats(BaseModel):
    name: str
    type: str
    pages: int
    word_count: int
    char_count: int
    language: str = "English"
    extraction_method: ExtractionMethod
    confidence: float = Field(ge=0.0, le=1.0)


class SummaryResult(BaseModel):
    executive: str
    standard: str
    detailed: str
    mode_used: SummaryMode = SummaryMode.standard


class KeyInsight(BaseModel):
    index: int
    text: str
    source_page: Optional[int] = None


class ImprovementItem(BaseModel):
    category: str           # "Clarity", "Structure", "Completeness", etc.
    icon: str               # "warning", "check", "idea"
    message: str
    suggestion: str


class DocumentSection(BaseModel):
    index: int
    title: str
    preview: str
    word_count: int
    start_char: int


class QualityScore(BaseModel):
    clarity: int = Field(ge=0, le=100)
    structure: int = Field(ge=0, le=100)
    completeness: int = Field(ge=0, le=100)
    overall: int = Field(ge=0, le=100)
