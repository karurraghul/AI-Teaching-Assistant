"use client";

import { useState, useRef } from "react";
import { File, Loader2, Info } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Progress } from "./ui/progress";
import QuizSection from "./QuizSection";
import QuizOptions from "./QuizOptions";
import type { Quiz } from "@/types/quiz";
import LoadingQuiz from "./LoadingQuiz";
import type { AudioProcessingResponse, SessionValidationResponse } from "@/types/api";

type ProcessingStage = 'idle' | 'transcribing' | 'selecting' | 'generating' | 'complete';

interface QuizQuestion {
  question: string;
  options: { [key: string]: string };
  correct_answer: string;
}

interface QuizAPIResponse {
  success: boolean;
  quiz: {
    questions: QuizQuestion[];
  };
}

interface AudioUploaderClientProps {
  onSuccess?: (data: AudioProcessingResponse) => void;
}

export default function AudioUploaderClient({ onSuccess }: AudioUploaderClientProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [transcript, setTranscript] = useState<string | undefined>(undefined);
  const [notesId, setNotesId] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkSession = async (): Promise<{ isValid: boolean }> => {
    try {
      const response = await fetch('/api/session', {
        method: 'GET',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to validate session');
      }

      const data: SessionValidationResponse = await response.json();
      return { isValid: Boolean(data.isValid) };
    } catch (error) {
      console.error('Session check error:', error);
      return { isValid: false };
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 20MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const sessionState = await checkSession();
      if (!sessionState.isValid) {
        toast({
          title: "Session Error",
          description: "Please enter your API keys first",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      setProcessingStage('transcribing');
      setUploadProgress(0);
      setQuizData(null);
      setNotesId(null);

      const formData = new FormData();
      formData.append('audio_file', file, file.name);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
        credentials: 'same-origin'
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process audio file');
      }

      const data: AudioProcessingResponse = await response.json();
      console.log('Transcript received:', data); // Debug log
      
      if (!data.transcript) {
        throw new Error('No transcript was generated from the audio');
      }

      setUploadProgress(100);
      setTranscript(data.transcript);
      setNotesId(data.notes_file);
      setProcessingStage('selecting');

      onSuccess?.(data);

      toast({
        title: "Success",
        description: "Audio processed successfully! Select quiz length to continue.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process audio file';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      resetState();
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBack = () => {
    switch (processingStage) {
      case 'selecting':
        setProcessingStage('idle');
        break;
      case 'complete':
        setProcessingStage('selecting');
        break;
      default:
        setProcessingStage('idle');
    }
  };

  const handleQuizLengthSelect = async (questionCount: number) => {
    console.log('=== Quiz Generation Debug ===');
    console.log('1. Function called with count:', questionCount);
    console.log('2. Current transcript:', transcript ? 'exists' : 'missing');
    console.log('3. Current processing stage:', processingStage);
    console.log('4. isGeneratingQuiz:', isGeneratingQuiz);
    
    try {
      const sessionState = await checkSession();
      console.log('5. Session check result:', sessionState);

      if (!sessionState.isValid) {
        toast({
          title: "Session Error",
          description: "Please enter your API keys first",
          variant: "destructive",
        });
        return;
      }

      if (!transcript) {
        console.log('6. Error: No transcript available');
        toast({
          title: "Error",
          description: "No transcript available. Please upload an audio file first.",
          variant: "destructive",
        });
        return;
      }

      setIsGeneratingQuiz(true);
      setProcessingStage('generating');
      console.log('7. Set processing stage to generating');
      
      console.log('8. Making API request with data:', {
        questionCount,
        transcriptLength: transcript.length
      });

      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: transcript,
          question_count: questionCount
        }),
        credentials: 'same-origin'
      });

      console.log('9. API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('10. API error:', errorData);
        throw new Error(errorData.detail || `Failed to generate quiz: ${response.status}`);
      }

      const data = await response.json();
      console.log('11. API response data:', data);
      
      if (!data.quiz) {
        throw new Error('Quiz data is missing from the response');
      }

      setQuizData(data.quiz);
      setProcessingStage('complete');
      console.log('12. Quiz generation complete');

      toast({
        title: "Success",
        description: `Quiz generated successfully!${notesId ? " You can now download your lecture notes." : ""}`,
      });
    } catch (error) {
      console.error('13. Quiz generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setProcessingStage('selecting');
    } finally {
      setIsGeneratingQuiz(false);
      console.log('14. Quiz generation process finished');
    }
  };


  if (processingStage === 'generating') {
    return <LoadingQuiz />;
  }
  const resetState = () => {
    setIsUploading(false);
    setIsGeneratingQuiz(false);
    setUploadProgress(0);
    setQuizData(null);
    setProcessingStage('idle');
    setTranscript(undefined);
    setNotesId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render different stages


  if (processingStage === 'selecting') {
    console.log("this is running fine");
    return (
      <QuizOptions 
        onSelect={handleQuizLengthSelect}
        isLoading={isGeneratingQuiz}
        notesId={notesId || undefined}
        onBack={handleBack}
      />
    );
  }

  if (processingStage === 'complete' && quizData) {
    return (
      <QuizSection 
        quiz={quizData}
        notesId={notesId || undefined}
        onBack={handleBack}
      />
    );
  }

  // Default upload UI
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4" />
        <span>Supported formats: MP3, WAV, M4A (Max size: 20MB)</span>
      </div>
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/m4a"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center gap-4">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <p className="text-sm text-gray-500">
                {processingStage === 'transcribing' 
                  ? 'Transcribing audio...' 
                  : 'Processing...'}
              </p>
            </>
          ) : (
            <>
              <File className="h-8 w-8 text-gray-500" />
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Click to select an audio file
                </p>
                <p className="text-xs text-muted-foreground">
                  MP3, WAV, or M4A up to 20MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="mt-4 space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-gray-500 text-center">{uploadProgress}%</p>
        </div>
      )}
    </div>
  );
}