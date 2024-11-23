# api/main.py
import os
import logging
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from api.routes.endpoints import router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get port from environment with Render's default
PORT = int(os.getenv("PORT", 10000))
logger.info(f"Configured to use PORT: {PORT}")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.render.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-Deepgram-Key", "X-Groq-Key"],
)

# Include router with prefix
app.include_router(router, prefix="/api")

# Updated root endpoint to handle both GET and HEAD
@app.get("/")
@app.head("/")  # Added HEAD method support
async def root():
    return {
        "status": "ok",
        "port": PORT,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting application on port {PORT}")

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting uvicorn on port {PORT}")
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=PORT,
        log_level="info"
    )