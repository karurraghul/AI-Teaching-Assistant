# api/services/types.py
from typing import TypedDict, List, Dict, Optional
from datetime import datetime

class QuizQuestion(TypedDict):
    """Structure for a single quiz question."""
    question: str
    options: Dict[str, str]
    correct_answer: str

class Quiz(TypedDict):
    """Structure for a complete quiz."""
    questions: List[QuizQuestion]

class TopicSection(TypedDict):
    """Structure for a single topic section in lecture notes."""
    title: str
    summary: str
    key_points: List[str]
    timestamp: str

class Topics(TypedDict):
    """Structure for all topics in lecture notes."""
    topics: List[TopicSection]

class ProcessingResult(TypedDict):
    """Structure for the complete processing result."""
    success: bool
    transcript: Optional[str]
    notes_file: Optional[str]
    quiz: Optional[Quiz]
    timestamp: str
    error: Optional[str]

    @classmethod
    def create_success(cls, transcript: str, notes_file: str, quiz: Quiz) -> 'ProcessingResult':
        """Create a successful processing result."""
        return {
            'success': True,
            'transcript': transcript,
            'notes_file': notes_file,
            'quiz': quiz,
            'timestamp': datetime.now().isoformat(),
            'error': None
        }

    @classmethod
    def create_error(cls, error: str) -> 'ProcessingResult':
        """Create an error processing result."""
        return {
            'success': False,
            'transcript': None,
            'notes_file': None,
            'quiz': None,
            'timestamp': datetime.now().isoformat(),
            'error': error
        }