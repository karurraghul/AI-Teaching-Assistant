# api/main.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.endpoints import router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

@app.get("/")
def root():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    port = os.getenv("PORT", 10000)
    logger.info(f"Starting application on port {port}")