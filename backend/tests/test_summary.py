"""
Tests for text service, chunk service, and summary pipeline.
"""

import pytest
from app.services.text_service import TextService
from app.services.chunk_service import ChunkService, TextChunk


class TestTextService:

    def test_normalize_removes_control_chars(self):
        svc = TextService()
        raw = "Hello\x00World\x01test"
        result = svc.normalize(raw)
        assert "\x00" not in result
        assert "Hello" in result

    def test_normalize_collapses_blank_lines(self):
        svc = TextService()
        raw = "Line 1\n\n\n\n\nLine 2"
        result = svc.normalize(raw)
        assert "\n\n\n" not in result

    def test_word_count(self):
        svc = TextService()
        assert svc.count_words("Hello world how are you") == 5

    def test_language_detection_english(self):
        svc = TextService()
        text = "The quick brown fox jumps over the lazy dog and the cat"
        assert svc.detect_language(text) == "English"


class TestChunkService:

    def test_basic_chunking(self):
        svc = ChunkService(chunk_size=100, overlap=20)
        text = ("A " * 50 + "\n\n") * 5  # 5 paragraphs ~100 chars each
        chunks = svc.chunk(text)
        assert len(chunks) >= 1
        for c in chunks:
            assert isinstance(c, TextChunk)
            assert c.text.strip()

    def test_single_short_document(self):
        svc = ChunkService(chunk_size=5000, overlap=200)
        text = "This is a short document."
        chunks = svc.chunk(text)
        assert len(chunks) == 1
        assert "short document" in chunks[0].text

    def test_chunk_indices_are_sequential(self):
        svc = ChunkService(chunk_size=200, overlap=50)
        text = ("Word " * 100 + "\n\n") * 4
        chunks = svc.chunk(text)
        for i, c in enumerate(chunks):
            assert c.index == i
