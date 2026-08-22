"""
Centralized, resilient Gemini AI client with automatic model fallback, retry, JSON parsing, and multimodal vision.
"""

import json
import re
import time
import logging
from typing import Any, Optional
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiAIClient:
    """
    Encapsulates Google GenAI client with multi-model fallback, JSON resilience, and vision support.
    """

    def __init__(self):
        self._api_key = settings.gemini_api_key
        self._client: Optional[genai.Client] = None
        if self._api_key:
            self._client = genai.Client(api_key=self._api_key)

    @property
    def candidate_models(self) -> list[str]:
        """Ordered list of models to try in case of temporary 503/429/404 errors."""
        primary = settings.gemini_model
        ordered = [primary]
        for m in settings.fallback_models:
            if m not in ordered:
                ordered.append(m)
        return ordered

    def call_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        timeout: int = 45000,
    ) -> Any:
        """
        Executes a Gemini prompt expecting structured JSON.
        Automatically cycles through fallback models if primary model is unavailable.
        """
        if not self._client:
            raise ValueError("GEMINI_API_KEY is not configured.")

        last_error: Optional[Exception] = None

        for model_name in self.candidate_models:
            try:
                logger.info("Attempting Gemini JSON call with model=%s", model_name)
                config_kwargs: dict[str, Any] = {
                    "response_mime_type": "application/json",
                    "http_options": {"timeout": timeout},
                }
                if system_instruction:
                    config_kwargs["system_instruction"] = system_instruction

                response = self._client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_kwargs),
                )

                if not response or not response.text:
                    raise ValueError(f"Empty response received from model {model_name}")

                raw = response.text.strip()
                raw = re.sub(r"^```(?:json)?\s*", "", raw)
                raw = re.sub(r"\s*```$", "", raw)

                try:
                    return json.loads(raw)
                except json.JSONDecodeError:
                    match = re.search(r"(\{.*\}|\[.*\])", raw, re.DOTALL)
                    if match:
                        return json.loads(match.group(0))
                    raise

            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Gemini JSON call failed with model=%s: %s. Trying fallback model...",
                    model_name,
                    exc,
                )
                time.sleep(0.8)

        logger.error("All Gemini candidate models failed for JSON call: %s", last_error)
        raise ValueError(f"AI service unavailable across all fallback models: {last_error}") from last_error

    def call_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        timeout: int = 45000,
    ) -> str:
        """
        Executes a Gemini prompt expecting text response with fallback models.
        """
        if not self._client:
            raise ValueError("GEMINI_API_KEY is not configured.")

        last_error: Optional[Exception] = None

        for model_name in self.candidate_models:
            try:
                logger.info("Attempting Gemini text call with model=%s", model_name)
                config_kwargs: dict[str, Any] = {
                    "http_options": {"timeout": timeout},
                }
                if system_instruction:
                    config_kwargs["system_instruction"] = system_instruction

                response = self._client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_kwargs),
                )

                if response and response.text:
                    return response.text.strip()

            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Gemini text call failed with model=%s: %s. Trying fallback model...",
                    model_name,
                    exc,
                )
                time.sleep(0.8)

        logger.error("All Gemini candidate models failed for text call: %s", last_error)
        raise ValueError(f"AI service unavailable across all fallback models: {last_error}") from last_error

    def call_vision(
        self,
        image_bytes: bytes,
        mime_type: str = "image/png",
        prompt: str = "Extract all text, structure, tables, and information from this image accurately.",
        timeout: int = 45000,
    ) -> str:
        """
        Executes a Gemini multimodal vision call on raw image bytes.
        """
        if not self._client:
            raise ValueError("GEMINI_API_KEY is not configured.")

        last_error: Optional[Exception] = None

        for model_name in self.candidate_models:
            try:
                logger.info("Attempting Gemini Vision call with model=%s", model_name)
                response = self._client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                        prompt,
                    ],
                    config=types.GenerateContentConfig(
                        http_options={"timeout": timeout},
                    ),
                )

                if response and response.text:
                    return response.text.strip()

            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Gemini Vision call failed with model=%s: %s. Trying fallback model...",
                    model_name,
                    exc,
                )
                time.sleep(0.8)

        logger.error("All Gemini candidate models failed for vision call: %s", last_error)
        raise ValueError(f"AI Vision unavailable across all fallback models: {last_error}") from last_error


# Singleton instance
ai_client = GeminiAIClient()
