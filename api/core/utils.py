# api/core/utils.py
import os
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

async def save_upload_file(upload_file: UploadFile, temp_dir: Path) -> Optional[Path]:
    """Save uploaded file to temporary directory."""
    try:
        # Create temp directory if it doesn't exist
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"{timestamp}_{upload_file.filename.replace(' ', '_')}"
        file_path = temp_dir / safe_filename
        
        # Save file
        content = await upload_file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
            
        return file_path
    
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        return None

def cleanup_old_files(temp_dir: Path, max_age_hours: int = 24):
    """Remove temporary files older than specified hours."""
    try:
        current_time = datetime.now().timestamp()
        
        for file_path in temp_dir.glob("*"):
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > (max_age_hours * 3600):
                    file_path.unlink()
                    logger.info(f"Cleaned up old file: {file_path}")
    
    except Exception as e:
        logger.error(f"Error cleaning up files: {str(e)}")

def validate_audio_file(file: UploadFile, max_size: int, allowed_types: set) -> tuple[bool, str]:
    """Validate audio file size and type."""
    # Check file type
    if file.content_type not in allowed_types:
        return False, "Invalid file type. Please upload an audio file (MP3 or WAV)."
    
    # Check file size
    try:
        content = file.file.read()
        file.file.seek(0)  # Reset file pointer
        
        if len(content) > max_size:
            return False, f"File too large. Maximum size is {max_size/(1024*1024)}MB."
        
        return True, ""
    except Exception as e:
        return False, f"Error validating file: {str(e)}"