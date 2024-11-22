# api/services/utils.py
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

def format_timestamp(position: int, duration: int) -> str:
    """Convert position to timestamp format."""
    minutes = position // 60
    seconds = position % 60
    return f"{minutes:02d}:{seconds:02d}"

def generate_filename(prefix: str, extension: str) -> str:
    """Generate unique filename with timestamp."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"{prefix}_{timestamp}.{extension}"

def ensure_temp_directory(temp_dir: Path) -> None:
    """Ensure temporary directory exists."""
    try:
        temp_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        logger.error(f"Failed to create temp directory: {e}")
        raise