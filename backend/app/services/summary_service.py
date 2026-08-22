"""
Summarisation service — multi-tier summaries with AI model fallback and heuristic backup.
"""

import logging
from app.core.config import settings
from app.schemas.document import SummaryMode, SummaryResult
from app.services.ai_client import ai_client

logger = logging.getLogger(__name__)


class SummaryService:
    """Generates multi-tier summaries (Executive, Standard, Detailed)."""

    def generate(self, chunks: list, full_text: str) -> SummaryResult:
        logger.info("Generating summaries | text_len=%d", len(full_text))
        sample = full_text[:6000] if len(full_text) > 6000 else full_text

        prompt = (
            "You are DocuMind, an expert document analyst. "
            "Analyse the following document and return ONLY a JSON object with exactly these keys:\n"
            '{"executive":"...","standard":"...","detailed":"..."}\n\n'
            "Requirements:\n"
            "- executive: ~100 words, high-level overview of core objectives and conclusions\n"
            "- standard: ~250 words, balanced summary covering key findings, methods, and insights\n"
            "- detailed: ~500 words, comprehensive analysis with contextual details\n"
            "- Written in third-person, professional prose, without bullet points\n\n"
            f"Document:\n\n{sample}"
        )

        try:
            parsed = ai_client.call_json(prompt, timeout=45000)
            return SummaryResult(
                executive=parsed.get("executive", self._heuristic_summary(sample, 100)),
                standard=parsed.get("standard", self._heuristic_summary(sample, 250)),
                detailed=parsed.get("detailed", self._heuristic_summary(sample, 500)),
                mode_used=SummaryMode.standard,
            )
        except Exception as exc:
            logger.error("Summary AI call failed: %s. Using heuristic summary.", exc)
            fallback = self._heuristic_summary(sample, 250)
            return SummaryResult(
                executive=self._heuristic_summary(sample, 100),
                standard=fallback,
                detailed=self._heuristic_summary(sample, 400),
                mode_used=SummaryMode.standard,
            )

    def _heuristic_summary(self, text: str, target_words: int) -> str:
        """Extract top sentences as a graceful fallback when AI is unavailable."""
        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 20]
        if not sentences:
            return "Document analysis completed. Summary will be generated upon retry."

        result: list[str] = []
        current_words = 0
        for sentence in sentences:
            words = len(sentence.split())
            if current_words + words > target_words and result:
                break
            result.append(sentence)
            current_words += words

        return ". ".join(result) + "."