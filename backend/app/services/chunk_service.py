"""
Semantic chunking engine.
Splits normalised text into overlapping chunks for AI processing.
Implements a paragraph-aware strategy to avoid splitting mid-sentence.
"""

import logging
from dataclasses import dataclass
from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class TextChunk:
    index: int
    text: str
    start_char: int
    end_char: int
    word_count: int


class ChunkService:
    """Splits text into manageable chunks for LLM processing."""

    def __init__(
        self,
        chunk_size: int = settings.chunk_size,
        overlap: int = settings.chunk_overlap,
    ):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str) -> list[TextChunk]:
        """
        Paragraph-aware chunking:
        1. Split by double-newline (paragraph boundary)
        2. Accumulate paragraphs until chunk_size is reached
        3. Include overlap from previous chunk for context continuity
        """
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks: list[TextChunk] = []
        current: list[str] = []
        current_len = 0
        start_char = 0
        char_cursor = 0

        for para in paragraphs:
            para_len = len(para)

            if current_len + para_len > self.chunk_size and current:
                # Emit current chunk
                chunk_text = "\n\n".join(current)
                chunks.append(
                    TextChunk(
                        index=len(chunks),
                        text=chunk_text,
                        start_char=start_char,
                        end_char=char_cursor,
                        word_count=len(chunk_text.split()),
                    )
                )
                # Overlap: keep last paragraph(s) up to `overlap` chars
                overlap_paras: list[str] = []
                overlap_len = 0
                for p in reversed(current):
                    if overlap_len + len(p) <= self.overlap:
                        overlap_paras.insert(0, p)
                        overlap_len += len(p)
                    else:
                        break
                current = overlap_paras
                current_len = overlap_len
                start_char = char_cursor - overlap_len

            current.append(para)
            current_len += para_len
            char_cursor += para_len + 2  # +2 for "\n\n"

        # Emit remaining text as final chunk
        if current:
            chunk_text = "\n\n".join(current)
            chunks.append(
                TextChunk(
                    index=len(chunks),
                    text=chunk_text,
                    start_char=start_char,
                    end_char=char_cursor,
                    word_count=len(chunk_text.split()),
                )
            )

        logger.info(
            "Chunking complete | %d chunks from %d chars", len(chunks), len(text)
        )
        return chunks

    def detect_sections(self, text: str) -> list[dict]:
        """
        Heuristically detect section headings in the document.
        Returns a list of {title, start_char, preview} dicts.
        """
        import re

        lines = text.splitlines()
        sections: list[dict] = []
        char_pos = 0

        heading_pattern = re.compile(
            r"^(?:\d+[\.\)]\s+)?([A-Z][A-Za-z\s]{2,50})$"
        )

        for line in lines:
            stripped = line.strip()
            if heading_pattern.match(stripped) and len(stripped) >= 4:
                # Grab a short preview from the next ~150 chars
                preview_start = char_pos + len(line) + 1
                preview = text[preview_start: preview_start + 150].split("\n")[0]
                sections.append(
                    {
                        "title": stripped,
                        "start_char": char_pos,
                        "preview": preview.strip(),
                    }
                )
            char_pos += len(line) + 1  # +1 for newline

        return sections
