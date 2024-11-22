// types/quiz.ts
import type { AudioProcessingResponse } from './api';

export interface Quiz {
  questions: {
    question: string;
    options: {
      [key: string]: string;
    };
    correct_answer: string;
  }[];
}

export interface AudioUploaderProps {
  onSuccess?: (data: AudioProcessingResponse) => void;
}