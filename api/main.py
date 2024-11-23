# api/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.endpoints import router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Teaching Assistant API",
    description="API for processing audio lectures and generating educational content",
    version="1.0.0"
)

# Define allowed origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",                    # Local development
    "https://*.vercel.app",                     # Vercel deployments
    "https://*.render.com",                     # Render deployments
]

# Add CORS middleware with expanded configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "*",
        "X-Deepgram-Key",
        "X-Groq-Key",
        "Content-Type",
        "Authorization",
    ],
    expose_headers=["*"]
)

# Include router with prefix
app.include_router(router, prefix="/api")

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Startup event logging
@app.on_event("startup")
async def startup_event():
    logger.info("Starting FastAPI application")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Allowed origins: {ALLOWED_ORIGINS}")

# Get port from environment variable
PORT = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting uvicorn server on port {PORT}")
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=True,
        log_level="info"
    )