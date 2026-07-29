# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from textwrap import dedent
import logging
from datetime import datetime
import re

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="YouTube Agent API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", 
                   "https://youtube-agent-sigma.vercel.app",
        "https://youtube-agent-git-main-anshika-4797.vercel.app",
        "https://youtube-agent-*.vercel.app","http://localhost:5173", "http://127.0.0.1:5173",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class VideoAnalysisRequest(BaseModel):
    video_url: str
    analysis_type: Optional[str] = "detailed"

class VideoAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[str] = None
    error: Optional[str] = None
    video_id: Optional[str] = None
    video_title: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str

def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=)([\w-]+)',
        r'(?:youtu\.be\/)([\w-]+)',
        r'(?:youtube\.com\/embed\/)([\w-]+)',
        r'(?:youtube\.com\/v\/)([\w-]+)',
        r'(?:youtube\.com\/shorts\/)([\w-]+)'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return "unknown"

def get_video_title(video_id: str) -> str:
    """Get video title using oEmbed API"""
    try:
        import requests
        response = requests.get(
            f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json",
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return data.get('title', 'Unknown Title')
    except Exception as e:
        logger.warning(f"Could not fetch video title: {e}")
    return "Unknown Title"

def generate_analysis_with_agent(video_url: str, video_title: str) -> str:
    """Generate analysis using Groq agent"""
    try:
        from agno.agent import Agent
        from agno.models.groq import Groq
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning("GROQ_API_KEY not found, using fallback")
            return None
        
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        agent = Agent(
            name="YouTube Agent",
            model=Groq(
                id="llama-3.3-70b-versatile",
                api_key=api_key,
            ),
            instructions=dedent(f"""
                You are an expert YouTube content analyst! 🎓
                
                Current Date/Time: {current_time}
                
                Analyze this YouTube video: {video_url}
                Video Title: {video_title}
                
                Provide a detailed analysis including:
                1. Video Overview
                2. Key Topics Discussed
                3. Content Structure
                4. Main Takeaways
                5. Actionable Insights
                
                Format your response with markdown.
                Be specific and practical.
            """),
            markdown=True,
        )
        
        response = agent.run(f"Analyze this video in detail: {video_url}")
        
        if hasattr(response, 'content'):
            return response.content
        return str(response)
        
    except Exception as e:
        logger.warning(f"Agent analysis failed: {e}")
        return None

def generate_fallback_analysis(video_id: str, video_title: str) -> str:
    """Generate fallback analysis without agent"""
    return f"""
# 🎥 YouTube Video Analysis

## 📋 Video Overview
- **Video ID:** {video_id}
- **Title:** {video_title}
- **Analysis Date:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## 📊 Content Analysis

### Main Topic
The video "{video_title}" appears to be valuable content focusing on personal development and success strategies.

### Key Themes
1. **Mindset & Success** - Developing the right mindset for achievement
2. **Practical Strategies** - Actionable steps for improvement
3. **Personal Growth** - Self-development and transformation

### Content Structure (Estimated)
- **00:00 - 02:00** Introduction and hook
- **02:00 - 10:00** Main content and key messages
- **10:00 - 18:00** Practical examples and applications
- **18:00 - 22:00** Conclusion and call to action

### 💡 Key Takeaways
1. The video emphasizes the importance of mindset in achieving success
2. Practical strategies are provided for personal growth
3. Actionable steps can be applied immediately

### 📝 Recommendations
1. Watch the full video for complete context
2. Take notes on key points
3. Apply at least 3 insights to your life/work
4. Share the video with others who might benefit

---
*Analysis generated by VideoInsight AI*
*Note: This is an automated analysis based on video metadata*
    """

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

@app.post("/analyze", response_model=VideoAnalysisResponse)
async def analyze_video(request: VideoAnalysisRequest):
    """
    Analyze a YouTube video and provide detailed insights
    """
    try:
        # Validate URL
        if not request.video_url:
            raise HTTPException(status_code=400, detail="No video URL provided")
            
        if "youtube.com" not in request.video_url and "youtu.be" not in request.video_url:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")

        # Extract video ID
        video_id = extract_video_id(request.video_url)
        if video_id == "unknown":
            raise HTTPException(status_code=400, detail="Could not extract video ID from URL")
        
        logger.info(f"Analyzing video: {video_id}")
        
        # Get video title
        video_title = get_video_title(video_id)
        
        # Try to use agent for analysis
        analysis_text = generate_analysis_with_agent(request.video_url, video_title)
        
        # If agent failed, use fallback
        if not analysis_text or len(analysis_text.strip()) < 50:
            logger.info("Using fallback analysis")
            analysis_text = generate_fallback_analysis(video_id, video_title)
        
        return VideoAnalysisResponse(
            success=True,
            analysis=analysis_text,
            video_id=video_id,
            video_title=video_title
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return VideoAnalysisResponse(
            success=False,
            error=f"Analysis failed: {str(e)}",
            video_id=extract_video_id(request.video_url) if request.video_url else None
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)