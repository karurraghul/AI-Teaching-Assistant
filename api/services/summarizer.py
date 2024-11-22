import json
import os
import logging
from dotenv import load_dotenv
from groq import Groq
from fastapi import Request, HTTPException
from typing import Optional, List

logger = logging.getLogger(__name__)

load_dotenv()


def _generate_additional_questions(groq_api_key: str, text: str, remaining_count: int) -> List[dict]:
    """
    Generate additional questions to meet the requested count.
    
    Parameters:
    groq_api_key (str): The Groq API key.
    text (str): The content to generate additional questions from.
    remaining_count (int): The number of additional questions to generate.
    
    Returns:
    List[dict]: A list of additional question dictionaries.
    """
    additional_questions = []
    client = Groq(api_key=groq_api_key)
    
    for i in range(remaining_count):
        # Generate a new question using the Llama model
        prompt = f"""
        Act as an expert quiz creator. Create a single multiple-choice question with four options based on the provided text.

        Requirements:
        1. Create a clear, concise question text
        2. Provide four options labeled A, B, C, D
        3. Identify one correct answer
        4. The question should test understanding, not just memorization
        5. The question and options should be unambiguous and distinct

        Format the question in this exact JSON structure:
        {{
            "question": "Clear question text here?",
            "options": {{
                "A": "First option",
                "B": "Second option",
                "C": "Third option",
                "D": "Fourth option"
            }},
            "correct_answer": "A"
        }}

        Content to create question from:
        {text}
        """
        
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a specialized quiz question generator that uses the Llama model to create precise, well-structured educational questions. You always maintain proper JSON formatting."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-70b-versatile",
            temperature=0.3,
            max_tokens=512,
            top_p=0.9,
            stop=["```"]
        )
        
        question_text = completion.choices[0].message.content.strip()
        
        # Clean up the response
        if '```json' in question_text:
            question_text = question_text.split('```json')[1].split('```')[0]
        elif '```' in question_text:
            question_text = question_text.split('```')[1].split('```')[0]
        
        question_text = question_text.strip()
        
        try:
            question = json.loads(question_text)
            
            # Validate the generated question
            if not isinstance(question, dict):
                raise ValueError(f"Generated question is not a dictionary: {question_text}")
            
            required_fields = ['question', 'options', 'correct_answer']
            missing_fields = [field for field in required_fields if field not in question]
            if missing_fields:
                raise ValueError(f"Generated question is missing fields: {', '.join(missing_fields)}")
            
            if not isinstance(question['options'], dict):
                raise ValueError(f"Options for generated question is not a dictionary: {question_text}")
            
            required_options = ['A', 'B', 'C', 'D']
            missing_options = [opt for opt in required_options if opt not in question['options']]
            if missing_options:
                raise ValueError(f"Generated question is missing options: {', '.join(missing_options)}")
            
            if question['correct_answer'] not in required_options:
                raise ValueError(f"Generated question has invalid correct_answer: {question['correct_answer']}")
            
            if not question['question'].strip():
                raise ValueError(f"Generated question has empty question text: {question_text}")
            
            for opt, text in question['options'].items():
                if not text.strip():
                    raise ValueError(f"Generated question has empty option text for option {opt}: {question_text}")
            
            additional_questions.append(question)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}\nRaw text: {question_text[:200]}...")
            continue
    
    return additional_questions

async def generate_quiz(request: Request, text: str, groq_api_key: str, question_count: Optional[int] = 5):
    if not groq_api_key:
        logger.error("Groq API key is missing")
        raise HTTPException(status_code=401, detail="Groq API key is required")

    if question_count not in [5, 10, 20]:
        logger.error(f"Invalid question count: {question_count}")
        raise HTTPException(
            status_code=400,
            detail="Question count must be 5, 10, or 20"
        )

    try:
        client = Groq(api_key=groq_api_key)
    except ValueError as e:
        logger.error(f"Error getting Groq client: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create Groq client"
        )

    try:
        # Optimized prompt for Llama model
        prompt = f"""
        Act as an expert quiz creator. Create a comprehensive multiple-choice quiz with exactly {question_count} questions based on the provided text.

        Requirements:
        1. Generate exactly {question_count} questions
        2. Each question must follow this structure:
           - Clear, concise question text
           - Four options labeled A, B, C, D
           - One correct answer marked
        3. Questions should:
           - Test understanding, not just memorization
           - Cover different aspects of the content
           - Be clear and unambiguous
           - Have plausible but distinct options

        Format the quiz in this exact JSON structure:
        {{
            "questions": [
                {{
                    "question": "Clear question text here?",
                    "options": {{
                        "A": "First option",
                        "B": "Second option",
                        "C": "Third option",
                        "D": "Fourth option"
                    }},
                    "correct_answer": "A"
                }}
            ]
        }}

        Remember:
        - Create EXACTLY {question_count} questions
        - Each question must have EXACTLY 4 options
        - Use proper JSON formatting
        - Ensure one clear correct answer per question
        
        Content to create quiz from:
        {text}
        """

        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a specialized quiz generator that uses the Llama model to create precise, well-structured educational assessments. You always maintain proper JSON formatting and exactly follow the specified number of questions."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-70b-versatile",
            temperature=0.3,
            max_tokens=4096,
            top_p=0.9,
            stop=["```"]
        )
        
        quiz_text = completion.choices[0].message.content.strip()
        
        # Clean up the response
        if '```json' in quiz_text:
            quiz_text = quiz_text.split('```json')[1].split('```')[0]
        elif '```' in quiz_text:
            quiz_text = quiz_text.split('```')[1].split('```')[0]
        
        quiz_text = quiz_text.strip()
        
        # Parse and validate JSON with detailed error handling
        try:
            quiz_data = json.loads(quiz_text)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}\nRaw text: {quiz_text[:200]}...")
            raise HTTPException(
                status_code=422,
                detail=f"Invalid JSON format: {str(e)}"
            )

        # Thorough validation
        if not isinstance(quiz_data, dict):
            raise HTTPException(
                status_code=422,
                detail="Quiz response is not a dictionary"
            )
        
        if 'questions' not in quiz_data:
            raise HTTPException(
                status_code=422,
                detail="Quiz is missing 'questions' array"
            )
        
        if not isinstance(quiz_data['questions'], list):
            raise HTTPException(
                status_code=422,
                detail="'questions' is not an array"
            )
        
        actual_count = len(quiz_data['questions'])
        if actual_count != question_count:
            logger.warning(f"Question count mismatch: got {actual_count}, expected {question_count}")
            
            # If we got more questions than requested, trim the excess
            if actual_count > question_count:
                quiz_data['questions'] = quiz_data['questions'][:question_count]
            # If we got fewer questions than requested, generate additional questions
            elif actual_count < question_count:
                remaining_questions = question_count - actual_count
                additional_questions = await _generate_additional_questions(groq_api_key, text, remaining_questions)
                quiz_data['questions'].extend(additional_questions)
        
        # Validate each question thoroughly
        for idx, question in enumerate(quiz_data['questions']):
            if not isinstance(question, dict):
                raise HTTPException(
                    status_code=422,
                    detail=f"Question {idx + 1} is not a dictionary"
                )
            
            required_fields = ['question', 'options', 'correct_answer']
            missing_fields = [field for field in required_fields if field not in question]
            if missing_fields:
                raise HTTPException(
                    status_code=422,
                    detail=f"Question {idx + 1} is missing fields: {', '.join(missing_fields)}"
                )
            
            if not isinstance(question['options'], dict):
                raise HTTPException(
                    status_code=422,
                    detail=f"Options for question {idx + 1} is not a dictionary"
                )
            
            required_options = ['A', 'B', 'C', 'D']
            missing_options = [opt for opt in required_options if opt not in question['options']]
            if missing_options:
                raise HTTPException(
                    status_code=422,
                    detail=f"Question {idx + 1} is missing options: {', '.join(missing_options)}"
                )
            
            if question['correct_answer'] not in required_options:
                raise HTTPException(
                    status_code=422,
                    detail=f"Question {idx + 1} has invalid correct_answer: {question['correct_answer']}"
                )
            
            # Validate content
            if not question['question'].strip():
                raise HTTPException(
                    status_code=422,
                    detail=f"Question {idx + 1} has empty question text"
                )
            
            for opt, text in question['options'].items():
                if not text.strip():
                    raise HTTPException(
                        status_code=422,
                        detail=f"Question {idx + 1}, option {opt} has empty text"
                    )

        logger.info(f"Successfully generated and validated quiz with {len(quiz_data['questions'])} questions")
        return quiz_data
    
    except Exception as e:
        logger.error(f"Quiz generation error: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate quiz: {str(e)}"
            )