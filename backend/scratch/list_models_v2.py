import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

with open('scratch/models_list.txt', 'w', encoding='utf-8') as f:
    try:
        for m in client.models.list():
            f.write(f"Model: {m.name}\n")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
