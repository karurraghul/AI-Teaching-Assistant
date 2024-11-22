# api/core/config.py
from pydantic_settings import BaseSettings
from pathlib import Path
from functools import lru_cache
import os
from typing import Optional
import logging
import shutil
from datetime import datetime

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Teaching Assistant"
    DEBUG: bool = True
    
    # API Keys
    DEEPGRAM_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"  # New unified storage directory
    NOTES_DIR: Path = STORAGE_DIR / "notes"  # For lecture notes
    AUDIO_DIR: Path = STORAGE_DIR / "audio"  # For audio files
    TEMP_DIR: Path = STORAGE_DIR / "temp"    # For temporary files
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        try:
            # First create the new storage structure
            self.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
            self.NOTES_DIR.mkdir(parents=True, exist_ok=True)
            self.AUDIO_DIR.mkdir(parents=True, exist_ok=True)
            self.TEMP_DIR.mkdir(parents=True, exist_ok=True)
            
            # Then move files from old locations if they exist
            old_temp = self.BASE_DIR / "temp"
            old_api_temp = self.BASE_DIR / "api" / "temp"
            
            if old_temp.exists():
                try:
                    # Move files instead of directories
                    for file_path in old_temp.glob('*'):
                        if file_path.is_file():
                            new_path = self.STORAGE_DIR / file_path.name
                            if not new_path.exists():
                                shutil.move(str(file_path), str(new_path))
                    # Remove old directory after moving files
                    if old_temp.exists():
                        shutil.rmtree(str(old_temp))
                    logger.info(f"Moved files from old temp directory to: {self.STORAGE_DIR}")
                except Exception as e:
                    logger.error(f"Error moving files from old temp directory: {str(e)}")

            if old_api_temp.exists():
                try:
                    # Move files instead of directories
                    for file_path in old_api_temp.glob('*'):
                        if file_path.is_file():
                            new_path = self.STORAGE_DIR / file_path.name
                            if not new_path.exists():
                                shutil.move(str(file_path), str(new_path))
                    # Remove old directory after moving files
                    if old_api_temp.exists():
                        shutil.rmtree(str(old_api_temp))
                    logger.info(f"Moved files from old api temp directory to: {self.STORAGE_DIR}")
                except Exception as e:
                    logger.error(f"Error moving files from old api temp directory: {str(e)}")
            
            # Log the directory structure
            logger.info(f"Storage directory structure:")
            logger.info(f"- Storage root: {self.STORAGE_DIR.absolute()}")
            logger.info(f"- Notes directory: {self.NOTES_DIR.absolute()}")
            logger.info(f"- Audio directory: {self.AUDIO_DIR.absolute()}")
            logger.info(f"- Temp directory: {self.TEMP_DIR.absolute()}")
            
            # List existing files
            notes_files = list(self.NOTES_DIR.glob('*.docx'))
            audio_files = list(self.AUDIO_DIR.glob('*'))
            logger.info(f"Existing notes files: {[f.name for f in notes_files]}")
            logger.info(f"Existing audio files: {[f.name for f in audio_files]}")
            
        except Exception as e:
            logger.error(f"Error configuring directories: {str(e)}")
            # Don't raise the error, just log it
            logger.error("Continuing with initialization despite error")

    def cleanup_old_files(self, max_age_hours: int = 24):
        """Clean up files older than specified hours"""
        current_time = datetime.now()
        
        for directory in [self.NOTES_DIR, self.AUDIO_DIR, self.TEMP_DIR]:
            for file_path in directory.glob('*'):
                if file_path.is_file():
                    file_age = current_time - datetime.fromtimestamp(file_path.stat().st_mtime)
                    if file_age.total_seconds() > (max_age_hours * 3600):
                        file_path.unlink()
                        logger.info(f"Cleaned up old file: {file_path}")

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings."""
    return Settings()