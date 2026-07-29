# backend/test.py
import requests
import json

def test_api():
    # Test health
    health = requests.get("http://localhost:8000/")
    print("Health Check:", health.json())
    
    # Test analysis
    url = "https://youtu.be/Zc4CcUkYKJk"
    response = requests.post(
        "http://localhost:8000/analyze",
        json={"video_url": url}
    )
    
    if response.status_code == 200:
        data = response.json()
        print("\n✅ Analysis Successful!")
        print(f"Video ID: {data.get('video_id')}")
        print(f"Video Title: {data.get('video_title')}")
        print("\nAnalysis Preview:")
        print(data.get('analysis', '')[:500] + "...")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.json())

if __name__ == "__main__":
    test_api()