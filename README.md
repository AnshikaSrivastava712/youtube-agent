# 🎥 YouTube Video Analyzer
An AI-powered web application that provides deep insights, timestamps, and comprehensive analysis of any YouTube video.
## 🌐 Live Demo

- **Frontend:** [youtube-agent-sigma.vercel.app](https://youtube-agent-sigma.vercel.app)
- **Backend API:** [youtube-agent-zvjl.onrender.com](https://youtube-agent-zvjl.onrender.com)

## ✨ Features

- 🤖 **AI-Powered Analysis** - Get intelligent insights from YouTube videos
- 📊 **Smart Timestamps** - Automatic video segmentation with detailed summaries
- 📝 **Key Topics** - Identifies main themes and topics discussed
- 💡 **Actionable Insights** - Practical takeaways from each video
- 🎬 **Video Preview** - Embedded YouTube player for instant viewing
- 📋 **Copy & Download** - Share analysis results with ease
- 🎨 **Modern UI** - Beautiful glass-morphism design with animations
- 📱 **Responsive** - Works perfectly on all devices
- 📚 **Analysis History** - Locally stored history of past analyses

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Custom CSS with animations
- **Deployment:** Vercel

### Backend
- **Framework:** FastAPI (Python)
- **AI/LLM:** Groq LLaMA 3.3 (Optional, with fallback)
- **Video Data:** YouTube oEmbed API
- **Deployment:** Render

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Python (v3.11+)
- Groq API Key (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/AnshikaSrivastava712/youtube-agent.git
cd youtube-agent
2. Frontend Setup
bash
cd frontend
npm install
npm run dev
The frontend will run at http://localhost:5173

3. Backend Setup
bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend directory:

env
GROQ_API_KEY=your_groq_api_key_here
Run the backend:

bash
uvicorn main:app --reload --port 8000
The API will be available at http://localhost:8000

4. Configure Frontend Environment
Create .env.local in the frontend directory:

env
VITE_API_URL=http://localhost:8000
📁 Project Structure
text
youtube-agent/
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main application
│   │   ├── App.css          # Styling
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
└── README.md
🔧 Deployment
Frontend (Vercel)
bash
cd frontend
vercel --prod --force
Backend (Render)
Push code to GitHub

Connect repository to Render

Set environment variables:

GROQ_API_KEY (optional)

Deploy

🎯 API Endpoints
Health Check
text
GET /
Response: {"status": "healthy", "version": "1.0.0"}
Analyze Video
text
POST /analyze
Request: {"video_url": "https://youtu.be/..."}
Response: {
    "success": true,
    "analysis": "markdown text",
    "video_id": "video-id",
    "video_title": "Video Title"
}
🧪 Testing
Test Backend
bash
curl https://youtube-agent-zvjl.onrender.com/
Test Analysis
bash
curl -X POST https://youtube-agent-zvjl.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://youtu.be/31PStxD7Yao"}'
📊 Environment Variables
Frontend (.env.production)
Variable	Description
VITE_API_URL	Backend API URL
Backend (.env)
Variable	Description
GROQ_API_KEY	Groq API key (optional)
🔒 CORS Configuration
The backend is configured to accept requests from:

python
allow_origins=[
    "https://youtube-agent-sigma.vercel.app",
    "https://youtube-agent-*.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]
🎨 UI Features
Glass-morphism design with backdrop blur

Smooth animations (fade-in, slide-in)

Loading skeletons for better UX

Responsive layout for all screen sizes

Dark theme with gradient background

📝 License
This project is open source and available under the MIT License.

👤 Author
Anshika Srivastava

🙏 Acknowledgments
Groq for AI/LLM capabilities

Vercel for frontend hosting

Render for backend hosting

YouTube for video data

🤝 Contributing
Contributions, issues, and feature requests are welcome!

📞 Support
For support, please open an issue in the GitHub repository.
