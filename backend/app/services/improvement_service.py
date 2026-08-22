"""
Improvement suggestions and document quality scoring with AI model fallback.
"""

import logging
from app.schemas.document import ImprovementItem, QualityScore
from app.services.ai_client import ai_client

logger = logging.getLogger(__name__)


class ImprovementService:
    """Evaluates document quality and generates structured improvement suggestions."""

    def analyse(self, text: str) -> tuple[list[ImprovementItem], QualityScore]:
        logger.info("Analysing improvements | text_len=%d", len(text))
        sample = text[:5000] if len(text) > 5000 else text

        prompt = (
            "Analyse this document's structure, readability, and completeness. "
            "Return ONLY a JSON object with this exact structure:\n"
            '{\n'
            '  "improvements": [\n'
            '    {"category": "Clarity", "icon": "idea", "message": "Short title", "suggestion": "Specific constructive feedback"},\n'
            '    {"category": "Structure", "icon": "check", "message": "Short title", "suggestion": "Specific constructive feedback"},\n'
            '    {"category": "Completeness", "icon": "warning", "message": "Short title", "suggestion": "Specific constructive feedback"},\n'
            '    {"category": "Recommendation", "icon": "idea", "message": "Short title", "suggestion": "Specific constructive feedback"}\n'
            '  ],\n'
            '  "quality": {"clarity": 85, "structure": 80, "completeness": 85, "overall": 83}\n'
            '}\n\n'
            "Rules:\n"
            "- Exactly 4 improvement items\n"
            "- category: Clarity / Structure / Completeness / Recommendation / Strength\n"
            "- icon: warning / check / idea\n"
            "- quality scores: integers 0-100 reflecting genuine document quality\n\n"
            f"Document:\n\n{sample}"
        )

        try:
            parsed = ai_client.call_json(prompt, timeout=35000)

            improvements_data = parsed.get("improvements", [])
            improvements = [
                ImprovementItem(
                    category=item.get("category", "General"),
                    icon=item.get("icon", "idea"),
                    message=item.get("message", "Document feedback"),
                    suggestion=item.get("suggestion", "Review document structure and formatting."),
                )
                for item in improvements_data[:4]
            ]

            q = parsed.get("quality", {})
            quality = QualityScore(
                clarity=min(100, max(10, int(q.get("clarity", 80)))),
                structure=min(100, max(10, int(q.get("structure", 75)))),
                completeness=min(100, max(10, int(q.get("completeness", 85)))),
                overall=min(100, max(10, int(q.get("overall", 80)))),
            )
            return improvements, quality

        except Exception as exc:
            logger.error("Improvement AI call failed: %s. Using heuristic analysis.", exc)
            return self._heuristic_analysis(sample)

    def _heuristic_analysis(self, text: str) -> tuple[list[ImprovementItem], QualityScore]:
        """Provides baseline document metrics if AI is unavailable."""
        word_count = len(text.split())
        has_headings = any(line.isupper() or line.startswith(("#", "1.", "2.")) for line in text.splitlines())

        clarity_score = min(90, max(65, 70 + (10 if word_count > 200 else -10)))
        structure_score = 85 if has_headings else 70
        completeness_score = min(92, max(60, 60 + int(word_count / 30)))
        overall_score = round((clarity_score + structure_score + completeness_score) / 3)

        improvements = [
            ImprovementItem(
                category="Structure",
                icon="check" if has_headings else "idea",
                message="Section Hierarchy",
                suggestion="Document includes clear structural divisions and topical flow."
                if has_headings else "Consider adding clear section headers to improve navigational readability.",
            ),
            ImprovementItem(
                category="Clarity",
                icon="idea",
                message="Terminology & Readability",
                suggestion="Text maintains consistent tone and vocabulary throughout key sections.",
            ),
            ImprovementItem(
                category="Completeness",
                icon="check" if word_count > 300 else "warning",
                message="Content Depth",
                suggestion="Document provides thorough coverage of core concepts."
                if word_count > 300 else "Expanding key arguments with supporting data would strengthen completeness.",
            ),
            ImprovementItem(
                category="Recommendation",
                icon="idea",
                message="Executive Presentation",
                suggestion="Include an explicit key takeaways or bulleted action items summary at the top.",
            ),
        ]

        return improvements, QualityScore(
            clarity=clarity_score,
            structure=structure_score,
            completeness=completeness_score,
            overall=overall_score,
        )