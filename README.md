# AI Teaching Assistant 🤖📚

An innovative application that transforms audio lectures into interactive learning materials using AI. This project leverages the power of Deepgram for audio transcription and Groq for AI-powered content generation.

## Features ✨

### Core Functionalities
- **Audio Processing** 
  - Support for MP3, WAV, M4A formats
  - Maximum file size: 20MB
  - Real-time transcription using Deepgram API

### Generated Content
- **Lecture Notes**
  - Automated transcription
  - Structured chapter organization
  - Downloadable Word documents (.docx)
  - Key points extraction
  - Timestamp markers

- **Interactive Quizzes**
  - AI-generated questions based on lecture content
  - Multiple-choice format
  - Customizable number of questions
  - Topic-focused question generation

### Security & Session Management
- **API Key Management**
  - Secure storage of Deepgram and Groq API keys
  - Session-based key management
  - Automatic session cleanup
  - Key verification system

### Technical Features
- **Backend (FastAPI)**
  - RESTful API architecture
  - Async request handling
  - File storage management
  - Error handling and logging
  - CORS configuration

- **Frontend (Next.js)**
  - Modern React components
  - Server-side API routes
  - Responsive design
  - Real-time processing feedback
  - Session management

## Technology Stack 🛠

### Frontend
- Next.js 14
- React
- TypeScript
- TailwindCSS
- ShadcnUI Components

### Backend
- FastAPI
- Python 3.9+
- Pydantic
- uvicorn

### AI Services
- Deepgram API (Audio transcription)
- Groq API (Content generation)

### Deployment
- Frontend: Vercel
- Backend: Render

## Getting Started 🚀

### Prerequisites
```bash
# Node.js 18+ and Python 3.9+
npm install
pip install -r requirements.txt

# Backend
uvicorn api.main:app --reload --port 8000

# Frontend
npm run dev
