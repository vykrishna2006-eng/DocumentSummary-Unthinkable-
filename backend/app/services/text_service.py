"""
Text normalisation and cleaning pipeline.
Runs after PDF extraction or OCR before chunking.
"""

import re
import logging

logger = logging.getLogger(__name__)


class TextService:
    """Cleans and normalises raw extracted text."""

    def normalize(self, raw: str) -> str:
        """Full normalisation pipeline."""
        text = raw

        # Remove null bytes and control characters (keep newlines/tabs)
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

        # Collapse runs of spaces/tabs (but not newlines)
        text = re.sub(r"[ \t]{2,}", " ", text)

        # Collapse 3+ consecutive blank lines into 2
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Strip trailing whitespace from each line
        lines = [line.rstrip() for line in text.splitlines()]
        text = "\n".join(lines)

        # Remove page markers like "Page 1 of 18" or "- 3 -"
        text = re.sub(r"(?i)(page\s+\d+\s+of\s+\d+|-\s*\d+\s*-)", "", text)

        # Remove lines that are only punctuation/numbers (common in scanned docs)
        cleaned_lines = []
        for line in text.splitlines():
            stripped = line.strip()
            if stripped and not re.fullmatch(r"[\d\s\.\-\_\|]+", stripped):
                cleaned_lines.append(line)
            elif not stripped:
                cleaned_lines.append("")

        text = "\n".join(cleaned_lines).strip()
        logger.debug("Text normalised | chars: %d", len(text))
        return text

    def count_words(self, text: str) -> int:
        return len(text.split())

    def detect_language(self, text: str) -> str:
        """Heuristic language detection (defaults to English for Latin/English text)."""
        if not text or not text.strip():
            return "Unknown"

        sample = text[:2000].lower()
        words = set(re.findall(r"\b[a-z]{2,}\b", sample))

        if not words:
            return "Unknown"

        english_common = {
            "the", "and", "of", "to", "in", "a", "is", "that", "for", "it",
            "as", "was", "with", "be", "by", "on", "not", "he", "at", "this",
            "from", "or", "have", "an", "are", "which", "will", "all", "we",
            "one", "their", "has", "more", "can", "been", "were", "other",
            "they", "project", "system", "data", "report", "document", "proposal",
        }

        spanish_common = {"el", "la", "de", "que", "en", "los", "del", "se", "las", "por", "un", "para", "con", "una"}
        french_common = {"le", "la", "de", "et", "les", "des", "en", "du", "un", "une", "dans", "pour", "qui", "sur"}
        german_common = {"der", "die", "das", "und", "in", "den", "von", "zu", "mit", "ist", "des", "nicht", "eine"}

        if len(spanish_common & words) >= 3:
            return "Spanish"
        if len(french_common & words) >= 3:
            return "French"
        if len(german_common & words) >= 3:
            return "German"
        if len(english_common & words) >= 1 or any(c.isascii() and c.isalpha() for c in sample):
            return "English"

        return "Unknown"

