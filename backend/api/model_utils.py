"""
model_utils.py  –  Lumina AI response generation via Google Gemini API.

Replaces the previous matrix.pkl / vectorizer.pkl TF-IDF retrieval system.
Public interface is kept identical so views.py does not need to change:
  - model_manager.get_response(text)  → list[str] or None
  - esconv_manager.get_response(text) → list[str] or None
"""

import logging
import textwrap
import time
import threading

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Gemini configuration
# ─────────────────────────────────────────────
import os
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_KEY")
# gemini-2.5-flash-lite: working model with available quota on this key
GEMINI_MODEL   = "gemini-2.5-flash-lite"

_client = genai.Client(api_key=GEMINI_API_KEY)

# ─────────────────────────────────────────────
# Quota / retry state
# ─────────────────────────────────────────────
_quota_lock        = threading.Lock()
_quota_retry_after = 0.0   # epoch seconds – do not call Gemini before this time
MAX_RETRIES        = 3
BASE_BACKOFF       = 2     # seconds

# System instruction shared by default
_SYSTEM_PROMPT = textwrap.dedent("""
    You are Lumina, a warm, empathetic AI mental-health companion.
    Your role is to provide supportive, non-judgmental responses to people
    who may be experiencing emotional distress.

    Guidelines:
    - Speak gently and conversationally — never clinical or robotic.
    - Validate feelings before offering suggestions.
    - Keep each response concise (2-4 sentences per paragraph).
    - Do NOT diagnose or prescribe medication.
    - If the user seems to be in crisis, encourage them to reach out to a professional or call a helpline.
    - Return plain text only — no markdown symbols, no bullet points, no headers.
""").strip()


def _parse_chunks(raw: str) -> list[str] | None:
    """Split a Gemini response into readable paragraph chunks."""
    paragraphs = [p.strip() for p in raw.split("\n") if p.strip()]
    if not paragraphs:
        paragraphs = [raw]

    chunks: list[str] = []
    current = ""
    current_wc = 0
    for p in paragraphs:
        wc = len(p.split())
        if current_wc + wc > 200 and current:
            chunks.append(current.strip())
            current = p + " "
            current_wc = wc
        else:
            current += p + " "
            current_wc += wc
    if current:
        chunks.append(current.strip())

    return chunks if chunks else None


def _call_gemini(user_text: str, system_override: str | None = None) -> list[str] | None:
    """
    Calls the Gemini API with retry + exponential backoff on rate-limit errors.
    Returns a list of text chunks, or None on unrecoverable failure.
    """
    global _quota_retry_after

    # Fast-fail if we know we're still in a quota cooldown
    with _quota_lock:
        wait = _quota_retry_after - time.time()
    if wait > 0:
        logger.warning(f"Gemini quota cooldown active — {wait:.0f}s remaining.")
        return None

    system = system_override if system_override else _SYSTEM_PROMPT

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = _client.models.generate_content(
                model=GEMINI_MODEL,
                contents=user_text,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    temperature=0.8,
                    max_output_tokens=512,
                ),
            )

            raw = result.text.strip() if result.text else ""
            if not raw:
                return None

            # Reset quota guard on success
            with _quota_lock:
                _quota_retry_after = 0.0

            return _parse_chunks(raw)

        except Exception as exc:
            err_str = str(exc)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                # Parse retry delay from error message if available
                retry_delay = BASE_BACKOFF * (2 ** attempt)
                try:
                    import re
                    match = re.search(r"retry in (\d+\.?\d*)s", err_str, re.IGNORECASE)
                    if match:
                        retry_delay = float(match.group(1)) + 1
                except Exception:
                    pass

                with _quota_lock:
                    _quota_retry_after = time.time() + retry_delay

                logger.warning(
                    f"Gemini rate-limited (attempt {attempt}/{MAX_RETRIES}). "
                    f"Retrying in {retry_delay:.1f}s..."
                )
                if attempt < MAX_RETRIES:
                    time.sleep(retry_delay)
            else:
                logger.error(f"Gemini API error: {exc}")
                return None

    logger.error("Gemini API failed after max retries.")
    return None


# ─────────────────────────────────────────────
# ModelManager
# ─────────────────────────────────────────────
class ModelManager:
    """
    Provides general mental-health supportive responses via Gemini.
    """

    _instance = None

    _STANDARD_SYSTEM = textwrap.dedent("""
        You are Lumina, an AI mental-health companion acting as a Standard Guidance Counselor.
        
        Guidelines:
        - Offer structured support and clear psychiatric-style guidance (without prescribing).
        - Focus on cognitive reframing and immediate relief techniques.
        - Validate feelings before offering suggestions.
        - Keep each response concise (2-4 sentences per paragraph).
        - Return plain text only — no markdown symbols, no bullet points, no headers.
    """).strip()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = True
            logger.info("ModelManager initialised (Gemini API backend).")
        return cls._instance

    def get_response(self, query: str) -> list[str] | None:
        if not query or not query.strip():
            return None
        return _call_gemini(query, system_override=self._STANDARD_SYSTEM)


# ─────────────────────────────────────────────
# ESConvManager
# ─────────────────────────────────────────────
class ESConvManager:
    """
    Provides empathetic supporter-style responses via Gemini,
    inspired by the ESConv dataset style.
    """

    _instance = None

    _ESCONV_SYSTEM = textwrap.dedent("""
        You are Lumina, a warm, empathetic AI mental-health companion trained
        in the style of a peer-support counsellor (ESConv dataset style).

        Guidelines:
        - Respond with warmth, reflection, and a solution-focused mindset.
        - Use open-ended questions to help the user explore their feelings.
        - Validate feelings before offering suggestions.
        - Keep each response concise (2-4 sentences per paragraph).
        - Do NOT diagnose or prescribe medication.
        - Return plain text only — no markdown symbols, no bullet points, no headers.
    """).strip()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = True
            logger.info("ESConvManager initialised (Gemini API backend).")
        return cls._instance

    def get_response(self, query: str) -> list[str] | None:
        if not query or not query.strip():
            return None
        return _call_gemini(query, system_override=self._ESCONV_SYSTEM)


# ─────────────────────────────────────────────
# Singleton instances (imported by views.py)
# ─────────────────────────────────────────────
model_manager  = ModelManager()
esconv_manager = ESConvManager()
