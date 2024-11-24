from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Header
from fastapi.responses import FileResponse,JSONResponse
from api.services.audio_handler import AudioProcessingHandler
from api.services.summarizer import generate_quiz
from api.core.config import Settings,get_settings
import logging
import tempfile
from pathlib import Path
from typing import Optional
from deepgram import Deepgram
from groq import Groq
from pydantic import BaseModel
import os
import json
import shutil
import asyncio

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

class QuizRequest(BaseModel):
    text: str
    question_count: Optional[int] = 5


@router.post("/process-audio")
async def process_audio(
    request: Request,
    audio_file: UploadFile = File(...),
    x_deepgram_key: Optional[str] = Header(None, alias="X-Deepgram-Key"),
    x_groq_key: Optional[str] = Header(None, alias="X-Groq-Key")
):
    if not x_deepgram_key or not x_groq_key:
        raise HTTPException(status_code=401, detail="API keys are required")

    if not audio_file:
        raise HTTPException(status_code=400, detail="No audio file provided")

    try:
        settings = get_settings()
        # Initialize audio handler
        audio_handler = AudioProcessingHandler(request)
        
        # Process audio and get result
        result = await audio_handler.process_audio(audio_file)
        
        if not result or "transcript" not in result:
            raise HTTPException(
                status_code=500,
                detail="Failed to process audio and generate transcript"
            )

        # Log file location using NOTES_DIR instead of TEMP_DIR
        logger.info(f"Processing successful. Notes file: {result.get('notes_file')}")
        if result.get('notes_file'):
            notes_path = settings.NOTES_DIR / result['notes_file']
            logger.info(f"File should be at: {notes_path}")
            logger.info(f"File exists: {notes_path.exists()}")
            if notes_path.exists():
                logger.info(f"File size: {notes_path.stat().st_size} bytes")

        return {
            "success": True,
            "transcript": result["transcript"],
            "notes_file": result["notes_file"]
        }

    except ValueError as e:
        logger.error(f"Value error in process_audio: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in process_audio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process audio: {str(e)}"
        )

@router.get("/debug/files")
async def debug_files():
    """Debug endpoint to check file system structure."""
    settings = get_settings()
    try:
        return {
            "base_dir": str(settings.BASE_DIR.absolute()),
            "storage_dir": str((settings.BASE_DIR / "storage").absolute()),
            "notes_dir": str(settings.NOTES_DIR.absolute()),
            "temp_dir": str(settings.TEMP_DIR.absolute()),
            "notes_files": [
                str(f.name) for f in settings.NOTES_DIR.glob('*.docx')
            ] if settings.NOTES_DIR.exists() else [],
            "directories_exist": {
                "base_dir": settings.BASE_DIR.exists(),
                "storage_dir": (settings.BASE_DIR / "storage").exists(),
                "notes_dir": settings.NOTES_DIR.exists(),
                "temp_dir": settings.TEMP_DIR.exists(),
            }
        }
    except Exception as e:
        return {"error": str(e)}
    

@router.get("/download/notes/{filename}")
async def download_notes(
    filename: str,
    request: Request
):
    logger.info("Download request received")
    logger.info(f"Headers: {dict(request.headers)}")  # Log headers for debugging

    try:
        settings = get_settings()
        file_path = settings.NOTES_DIR / filename
        logger.info(f"Looking for file at: {file_path}")

        if not file_path.exists():
            logger.error(f"File not found: {file_path}")
            logger.error(f"Directory contents: {list(settings.NOTES_DIR.glob('*.docx'))}")
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {filename}"
            )

        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/generate-quiz")
async def create_quiz(
    request: Request,
    quiz_request: QuizRequest,
    groq_api_key: str = Header(None, alias="groq-api-key")
):
    if not groq_api_key:
        raise HTTPException(status_code=401, detail="Groq API key is required")

    if not quiz_request.text:
        raise HTTPException(status_code=400, detail="Text content is required")

    try:
        quiz_data = await generate_quiz(
            request=request,
            text=quiz_request.text,
            groq_api_key=groq_api_key,
            question_count=quiz_request.question_count
        )


        
        return quiz_data
        
    except Exception as e:
        logger.error(f"Quiz generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quiz: {str(e)}"
        )

@router.post("/verify-keys")
async def verify_keys(request: Request):
    """Verify Deepgram and Groq API keys."""
    try:
        # Get the keys from request body
        body = await request.json()
        deepgram_key = body.get('deepgramKey')
        groq_key = body.get('groqKey')

        logger.info("Received verification request")

        if not deepgram_key or not groq_key:
            logger.error("Missing API keys")
            raise HTTPException(
                status_code=401,
                detail="API keys are required"
            )

        try:
            # Verify Deepgram key
            logger.info("Verifying Deepgram key...")
            deepgram = Deepgram(deepgram_key)
            
            # Verify Groq key
            logger.info("Verifying Groq key...")
            client = Groq(api_key=groq_key)
            
            logger.info("API keys verified successfully")
            return {
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Key verification failed: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid API keys"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.delete("/cleanup-session")
async def cleanup_session():
    """Clean up all storage directories during logout."""
    try:
        settings = get_settings()
        cleanup_summary = {
            "files_removed": 0,
            "dirs_cleaned": []
        }
        
        # Clean all directories
        for directory in [settings.NOTES_DIR, settings.AUDIO_DIR, settings.TEMP_DIR]:
            if directory.exists():
                for file_path in directory.glob('*'):
                    if file_path.is_file():
                        file_path.unlink()
                        cleanup_summary["files_removed"] += 1
                        if directory.name not in cleanup_summary["dirs_cleaned"]:
                            cleanup_summary["dirs_cleaned"].append(directory.name)
        
        message = (f"Cleaned {cleanup_summary['files_removed']} files "
                  f"from {', '.join(cleanup_summary['dirs_cleaned'])} directories")
        logger.info(message)
        
        return {"success": True, "message": message}
        
    except Exception as e:
        logger.error(f"Session cleanup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clean up session data")

@router.get("/health")
async def health_check():
    return {"status": "ok"}
