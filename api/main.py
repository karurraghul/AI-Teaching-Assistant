# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.endpoints import router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-Deepgram-Key", "X-Groq-Key"],
)

# Include router with prefix
app.include_router(router, prefix="/api")