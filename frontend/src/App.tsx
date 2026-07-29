// frontend/src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface AnalysisResponse {
  success: boolean;
  analysis?: string;
  error?: string;
  video_id?: string;
}

interface VideoHistory {
  id: string;
  url: string;
  title: string;
  timestamp: string;
}

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [history, setHistory] = useState<VideoHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('videoHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history');
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (url: string, title: string, id: string) => {
    const newEntry: VideoHistory = {
      id,
      url,
      title: title || 'Untitled Video',
      timestamp: new Date().toLocaleString()
    };
    const updatedHistory = [newEntry, ...history.slice(0, 9)];
    setHistory(updatedHistory);
    localStorage.setItem('videoHistory', JSON.stringify(updatedHistory));
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([\w-]+)/,
      /(?:youtu\.be\/)([\w-]+)/,
      /(?:youtube\.com\/embed\/)([\w-]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const fetchVideoTitle = async (id: string) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return data.title || 'Unknown Title';
      }
    } catch (e) {
      console.error('Failed to fetch video title');
    }
    return 'Unknown Title';
  };

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      inputRef.current?.focus();
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Please check and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setVideoId(null);
    setVideoTitle('');

    try {
      // Fetch video title
      const title = await fetchVideoTitle(videoId);
      setVideoTitle(title);

      // Call backend API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_url: videoUrl }),
      });

      const data: AnalysisResponse = await response.json();

      if (data.success) {
        setAnalysis(data.analysis || 'No analysis available');
        setVideoId(data.video_id || null);
        saveToHistory(videoUrl, title, data.video_id || videoId);
        
        // Scroll to analysis
        setTimeout(() => {
          analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please make sure the backend is running on port 8000.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.includes('youtube.com') || text.includes('youtu.be'))) {
        setVideoUrl(text);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const handleHistoryClick = (url: string) => {
    setVideoUrl(url);
    setShowHistory(false);
    setTimeout(() => handleAnalyze(), 100);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('videoHistory');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-analysis-${videoId || 'video'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🎥</span>
          <span className="brand-text">VideoInsight</span>
          <span className="brand-badge">AI</span>
        </div>
        <div className="nav-actions">
          <button 
            className="nav-btn history-btn"
            onClick={() => setShowHistory(!showHistory)}
            title="View History"
          >
            📚 {history.length > 0 && <span className="badge">{history.length}</span>}
          </button>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-btn github-btn"
          >
            <svg height="20" viewBox="0 0 16 16" width="20">
              <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </div>
      </nav>

      {/* History Dropdown */}
      {showHistory && (
        <div className="history-dropdown">
          <div className="history-header">
            <h3>📚 Analysis History</h3>
            {history.length > 0 && (
              <button onClick={clearHistory} className="clear-history-btn">
                Clear All
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="empty-history">
              <span>📭</span>
              <p>No analysis history yet</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => handleHistoryClick(item.url)}
                >
                  <div className="history-item-icon">▶️</div>
                  <div className="history-item-content">
                    <div className="history-item-title">{item.title}</div>
                    <div className="history-item-meta">
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            AI-Powered YouTube
            <span className="gradient-text"> Video Analysis</span>
          </h1>
          <p className="hero-subtitle">
            Get deep insights, timestamps, and comprehensive analysis of any YouTube video
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="input-section glass-effect">
          <div className="input-wrapper">
            <div className="input-icon">🔗</div>
            <input
              ref={inputRef}
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste YouTube URL here..."
              className="url-input"
              disabled={loading}
            />
            <button 
              className="paste-btn"
              onClick={handlePaste}
              title="Paste from clipboard"
            >
              📋
            </button>
          </div>
          
          <div className="input-actions">
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !videoUrl.trim()}
              className={`analyze-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Analyze Video
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-message slide-in">
              <span className="error-icon">❌</span>
              <span>{error}</span>
              <button className="error-close" onClick={() => setError(null)}>×</button>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="loading-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="analysis-container slide-in" ref={analysisRef}>
            {videoId && (
              <div className="video-preview-card">
                <div className="video-preview-header">
                  <h3>📺 Video Preview</h3>
                  {videoTitle && <span className="video-title">{videoTitle}</span>}
                </div>
                <div className="video-embed-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            )}
            
            <div className="analysis-content-card glass-effect">
              <div className="analysis-header">
                <div className="analysis-title">
                  <span>📊</span>
                  <h3>Analysis Results</h3>
                </div>
                <div className="analysis-actions">
                  <button 
                    className="action-btn"
                    onClick={() => copyToClipboard(analysis)}
                    title="Copy to clipboard"
                  >
                    {copied ? '✅' : '📋'} Copy
                  </button>
                  <button 
                    className="action-btn"
                    onClick={downloadAnalysis}
                    title="Download analysis"
                  >
                    💾 Download
                  </button>
                </div>
              </div>
              
              <div className="markdown-content">
                {analysis.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="fade-in">{line.slice(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="fade-in">{line.slice(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="fade-in">{line.slice(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="fade-in">{line.slice(2)}</li>;
                  } else if (line.startsWith('* ')) {
                    return <li key={index} className="fade-in bullet-star">{line.slice(2)}</li>;
                  } else if (line.startsWith('> ')) {
                    return <blockquote key={index} className="fade-in">{line.slice(2)}</blockquote>;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else if (line.startsWith('---')) {
                    return <hr key={index} className="fade-in" />;
                  } else {
                    return <p key={index} className="fade-in">{line}</p>;
                  }
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span>🎥 VideoInsight</span>
            <span className="footer-version">v1.0</span>
          </div>
          <div className="footer-links">
            <span>Built with ❤️ using Agno, Groq & React</span>
          </div>
          <div className="footer-status">
            <span className="status-dot"></span>
            <span>API Status: Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;