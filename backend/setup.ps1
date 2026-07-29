# backend/setup.ps1
Write-Host "🚀 Setting up YouTube Agent Backend..." -ForegroundColor Green

# Activate virtual environment
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
    & .\venv\Scripts\Activate.ps1
}

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pip install fastapi uvicorn python-dotenv requests pydantic python-multipart
pip install agno groq youtube_transcript_api

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Creating .env file..." -ForegroundColor Yellow
    @"
GROQ_API_KEY=your_api_key_here
"@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host "📝 Please add your GROQ_API_KEY to .env file" -ForegroundColor Yellow
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "🚀 Run: python -m uvicorn main:app --reload --port 8000" -ForegroundColor Cyan