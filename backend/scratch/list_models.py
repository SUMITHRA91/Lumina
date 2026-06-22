from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.environ.get("GEMINI_API_KEY")

def list_models():
    client = genai.Client(api_key=API_KEY)
    print("Available models:")
    try:
        # The new SDK might have different attribute names
        for m in client.models.list():
            # Try to print whatever attributes it has
            print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
