"""
model_utils.py  –  Lumina AI response generation via Local Ollama API.

Replaces the previous Google Gemini API system.
Public interface is kept identical so views.py does not need to change:
  - model_manager.get_response(text)  → list[str] or None
  - esconv_manager.get_response(text) → list[str] or None
"""

import logging
import textwrap
import time
import requests
import os
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Ollama configuration
# ─────────────────────────────────────────────
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate")
# Defaulting to llama3.2, user can override via .env
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")

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
    """Split a text response into readable paragraph chunks."""
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


def _call_ollama(user_text: str, system_override: str | None = None) -> list[str] | None:
    """
    Calls the local Ollama API to generate a response.
    Returns a list of text chunks, or None on unrecoverable failure.
    """
    system = system_override if system_override else _SYSTEM_PROMPT
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": user_text,
        "system": system,
        "stream": False,
        "options": {
            "temperature": 0.8,
            "num_predict": 512,
        }
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        raw = data.get("response", "").strip()
        
        if not raw:
            return None
            
        return _parse_chunks(raw)

    except requests.exceptions.RequestException as exc:
        logger.error(f"Ollama API error: {exc}")
        print(f"DEBUG ERROR: Ollama API error: {exc}") # Print to stdout for visibility
        return None
    except Exception as exc:
        logger.error(f"Unexpected error calling Ollama: {exc}")
        return None


# ─────────────────────────────────────────────
# ModelManager
# ─────────────────────────────────────────────
class ModelManager:
    """
    Provides general mental-health supportive responses via Ollama.
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
            logger.info(f"ModelManager initialised (Ollama API backend: {OLLAMA_MODEL}).")
        return cls._instance

    def get_response(self, query: str) -> list[str] | None:
        if not query or not query.strip():
            return None
        return _call_ollama(query, system_override=self._STANDARD_SYSTEM)


# ─────────────────────────────────────────────
# ESConvManager
# ─────────────────────────────────────────────
class ESConvManager:
    """
    Provides empathetic supporter-style responses via Ollama,
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
            logger.info(f"ESConvManager initialised (Ollama API backend: {OLLAMA_MODEL}).")
        return cls._instance

    def get_response(self, query: str) -> list[str] | None:
        if not query or not query.strip():
            return None
        return _call_ollama(query, system_override=self._ESCONV_SYSTEM)


# ─────────────────────────────────────────────
# Singleton instances (imported by views.py)
# ─────────────────────────────────────────────
model_manager  = ModelManager()
esconv_manager = ESConvManager()
