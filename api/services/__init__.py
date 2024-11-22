# api/services/__init__.py
from .Transcriber import transcribe_audio
from .lecture_notes import LectureNotesGenerator
from .summarizer import generate_quiz
from .audio_handler import AudioProcessingHandler
from .types import (
    Quiz,
    QuizQuestion,
    ProcessingResult,
    TopicSection,
    Topics
)
from .utils import format_timestamp, generate_filename, ensure_temp_directory
__all__ = [
    # Main service classes and functions
    'AudioProcessingHandler',
    'LectureNotesGenerator',
    'transcribe_audio',
    'generate_quiz',
    
    # Types
    'Quiz',
    'QuizQuestion',
    'ProcessingResult',
    'TopicSection',
    'Topics',

    # Utilities
    'format_timestamp',
    'generate_filename',
    'ensure_temp_directory'
]

# Version info
__version__ = '1.0.0'

# Module level logger
import logging
logger = logging.getLogger(__name__)