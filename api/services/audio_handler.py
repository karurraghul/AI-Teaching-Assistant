# api/services/audio_handler.py
from fastapi import HTTPException, UploadFile, Request
from pathlib import Path
from datetime import datetime
import logging
import json
from typing import Dict, Any, Optional
import os
from deepgram import Deepgram
from api.core.config import get_settings

from .lecture_notes import LectureNotesGenerator
from .Transcriber import transcribe_audio
from .summarizer import generate_quiz


# Configure logging
logger = logging.getLogger(__name__)

class AudioProcessingHandler:
    def __init__(self, request: Request):
        self.deepgram = None
        self.request = request
        self.settings = get_settings()
        self.groq_key = request.headers.get('X-Groq-Key')

    def initialize_deepgram(self):
        if self.deepgram is None:
            deepgram_api_key = self.request.headers.get('X-Deepgram-Key')
            if not deepgram_api_key:
                raise ValueError("Deepgram API Key not found in request headers")
            self.deepgram = Deepgram(deepgram_api_key)
        return self.deepgram

    async def process_audio(self, audio_file: UploadFile):
        self.initialize_deepgram()
        
        try:
            # Read the file content
            file_content = await audio_file.read()
            
            # Process with Deepgram
            source = {'buffer': file_content, 'mimetype': audio_file.content_type}
            response = await self.deepgram.transcription.prerecorded(source, {
                'smart_format': True,
                'model': 'general',
            })
            
            # Extract transcription
            transcript = response['results']['channels'][0]['alternatives'][0]['transcript']

            # Generate lecture notes
            try:
                notes_generator = LectureNotesGenerator(groq_api_key=self.groq_key)
                notes_filename = await notes_generator.generate_notes(
                    transcript=transcript,
                    metadata={
                        'title': 'Lecture Notes',
                        'date': datetime.now().strftime('%Y-%m-%d')
                    },
                    temp_dir=self.settings.NOTES_DIR
                )
                logger.info(f"Generated lecture notes: {notes_filename}")
                
                return {
                    "transcript": transcript,
                    "notes_file": notes_filename
                }
                
            except Exception as notes_error:
                logger.error(f"Failed to generate notes: {str(notes_error)}")
                return {
                    "transcript": transcript,
                    "notes_file": None
                }
            
        except Exception as e:
            raise ValueError(f"Failed to process audio: {str(e)}")

    
    async def get_lecture_notes(self, filename: str) -> Path:
        """Retrieve generated lecture notes."""
        try:
            notes_path = self.settings.NOTES_DIR / filename  # Use NOTES_DIR
            logger.info(f"Retrieving notes from: {notes_path}")
            
            if not notes_path.exists():
                logger.error(f"Notes file not found: {notes_path}")
                raise HTTPException(
                    status_code=404,
                    detail=f"Notes file not found: {filename}"
                )
                
            logger.info(f"Found notes file, size: {notes_path.stat().st_size} bytes")
            return notes_path
            
        except Exception as e:
            logger.error(f"Error retrieving notes: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to retrieve lecture notes: {str(e)}"
            )