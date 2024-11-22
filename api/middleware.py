from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import os

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Get API keys from cookies
        deepgram_key = request.cookies.get('DEEPGRAM_API_KEY')
        groq_key = request.cookies.get('GROQ_API_KEY')

        # Temporarily set environment variables for this request
        if deepgram_key:
            os.environ['DEEPGRAM_API_KEY'] = deepgram_key
        if groq_key:
            os.environ['GROQ_API_KEY'] = groq_key

        response = await call_next(request)
        return response 