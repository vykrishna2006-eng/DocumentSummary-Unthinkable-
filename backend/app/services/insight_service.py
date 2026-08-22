"""
Key insight extraction with AI model fallback and heuristic backup.
"""

import logging
from app.schemas.document import KeyInsight
from app.services.ai_client import ai_client

logger = logging.getLogger(__name__)


class InsightService:
    """Extracts high-impact key takeaways from documents."""

    def extract(self, text: str, page_count: int = 1) -> list[KeyInsight]:
        logger.info("Extracting insights | text_len=%d", len(text))
        sample = text[:5000] if len(text) > 5000 else text

        prompt = (
            "Extract exactly 6 key actionable insights or takeaways from this document. "
            "Return ONLY a JSON array with objects containing 'index' (number), 'text' (string under 25 words), "
            "and 'source_page' (integer or null):\n"
            '[{"index":1,"text":"insight here","source_page":null},...]\n\n'
            f"Document:\n\n{sample}"
        )

        try:
            parsed = ai_client.call_json(prompt, timeout=35000)
            if isinstance(parsed, dict):
                parsed = list(parsed.values())[0]

            if isinstance(parsed, list) and parsed:
                return [
                    KeyInsight(
                        index=item.get("index", i + 1),
                        text=str(item.get("text", "")).strip(),
                        source_page=item.get("source_page"),
                    )
                    for i, item in enumerate(parsed[:6])
                ]
            raise ValueError("Invalid insights structure returned by AI")

        except Exception as exc:
            logger.error("Insight extraction AI failed: %s. Using heuristic insights.", exc)
            return self._heuristic_insights(sample)

    def _heuristic_insights(self, text: str) -> list[KeyInsight]:
        """Extract prominent sentences as graceful insights."""
        sentences = [
            s.strip() for s in text.replace("\n", " ").split(".")
            if 30 < len(s.strip()) < 180 and not s.strip().startswith(("Page", "Table", "Figure"))
        ]
        if not sentences:
            sentences = ["Key document insights are being indexed and processed."]

        return [
            KeyInsight(index=i + 1, text=s, source_page=None)
            for i, s in enumerate(sentences[:6])
        ]