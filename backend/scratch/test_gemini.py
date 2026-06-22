import os
from google import genai
from google.genai import types

# Use the key from .env manually for testing if needed, or assume it's in env
API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-flash-lite-latest"

def test_gemini():
    print(f"Testing Gemini with model: {MODEL}")
    try:
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_content(
            model=MODEL,
            contents="Hello, how are you?"
        )
        print("Response received:")
        print(response.text)
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    test_gemini()
