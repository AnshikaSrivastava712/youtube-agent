# backend/test_api.py
import requests
import json

def test_api():
    # Test health
    health = requests.get("http://localhost:8000/")
    print("Health:", health.json())
    
    # Test analysis
    url = "https://youtu.be/Zc4CcUkYKJk"
    response = requests.post(
        "http://localhost:8000/analyze",
        json={"video_url": url}
    )
    
    if response.status_code == 200:
        data = response.json()
        print("\n✅ Success!")
        print(f"Video: {data.get('video_title')}")
        print(f"Analysis length: {len(data.get('analysis', ''))} chars")
        print("\nPreview:")
        print(data.get('analysis', '')[:500])
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.json())

if __name__ == "__main__":
    test_api()