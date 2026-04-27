from deep_translator import GoogleTranslator
import logging
import base64
from gtts import gTTS
import os
import tempfile

logger = logging.getLogger(__name__)

LANGUAGE_MAP = {
    "kannada": "kn",
    "hindi": "hi",
    "english": "en",
    "tamil": "ta",
    "telugu": "te",
    "malayalam": "ml"
}

def translate_text(text, target_lang_name):
    target_code = LANGUAGE_MAP.get(target_lang_name.lower())
    if not target_code or target_code == "en":
        return text, "en"
    
    try:
        translated = GoogleTranslator(source='auto', target=target_code).translate(text)
        return translated, target_code
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return text, "en"

def detect_language_intent(text):
    text_lower = text.lower()
    for lang in LANGUAGE_MAP.keys():
        if f"talk in {lang}" in text_lower or f"speak in {lang}" in text_lower or f"change language to {lang}" in text_lower:
            return lang
    return None

def generate_audio_base64(text, lang_code):
    try:
        tts = gTTS(text=text, lang=lang_code)
        
        # Use a temporary file to save the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
            temp_filename = fp.name
            
        tts.save(temp_filename)
        
        # Read the audio file and convert to base64
        with open(temp_filename, "rb") as fp:
            audio_data = fp.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
        # Clean up
        os.remove(temp_filename)
        
        return audio_base64
    except Exception as e:
        logger.error(f"TTS generation error: {e}")
        return None
