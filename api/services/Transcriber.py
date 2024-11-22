# api/services/transcriber.py
from deepgram import Deepgram
import json
import asyncio
import os
from pathlib import Path
from typing import Optional
import logging
from .types import ProcessingResult
from .utils import ensure_temp_directory

logger = logging.getLogger(__name__)

# MIME type mapping
MIME_TYPES = {
    '.mp3': 'audio/mp3',
    '.wav': 'audio/wav',
    '.m4a': 'audio/m4a',
    '.flac': 'audio/flac'
}

async def async_transcribe(api_key: str, audio_file_path: str) -> Optional[str]:
    """Asynchronously transcribe audio file."""
    try:
        deepgram = Deepgram(api_key)
        file_ext = Path(audio_file_path).suffix.lower()
        mime_type = MIME_TYPES.get(file_ext, 'audio/mp3')

        with open(audio_file_path, "rb") as file:
            buffer_data = file.read()

        source = {
            "buffer": buffer_data,
            "mimetype": mime_type
        }
        
        options = {
            "model": "nova-2",
            "smart_format": True,
            "paragraphs": True,
            "language": "en"
        }

        response = await deepgram.transcription.prerecorded(source, options)
        return response["results"]["channels"][0]["alternatives"][0]["transcript"]

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return None

async def transcribe_audio(api_key: str, audio_file_path: str) -> Optional[str]:
    """Transcribe audio file to text."""
    try:
        file_path = Path(audio_file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
            
        if file_path.suffix.lower() not in MIME_TYPES:
            raise ValueError(f"Unsupported audio format: {file_path.suffix}")
        
        transcript = await async_transcribe(api_key, audio_file_path)
        return transcript
        
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return None