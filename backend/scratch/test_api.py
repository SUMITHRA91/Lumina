import requests

def test_chat():
    url = "http://localhost:8000/api/chat/"
    data = {
        "text": "Hello Lumina, how are you?",
        "emotion": "neutral",
        "scores": {"neutral": 1.0},
        "user_name": "TestUser",
        "user_id": "test-id"
    }
    print(f"Sending POST to {url}...")
    try:
        response = requests.post(url, json=data, timeout=15)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(response.json())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat()
