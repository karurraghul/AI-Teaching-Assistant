// components/Home.tsx
'use client';

import { useState, useEffect } from 'react';
import AudioUploader from "@/components/AudioUploader";
import { MotivationalQuotes } from "@/components/MotivationalQuotes";
import { Sparkles, LogOut } from "lucide-react";
import ApiKeyModal from "@/components/ApiKeyModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getSecureApiKeys, clearSecureApiKeys } from '@/lib/session';
import { BackButton } from "@/components/BackButton";
import QuizOptions from "@/components/QuizOptions";
import QuizSection from "@/components/QuizSection";
import type { Quiz } from '@/types/quiz';
import type { AudioProcessingResponse } from '@/types/api';


type View = 'uploader' | 'options' | 'quiz';

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasValidKeys, setHasValidKeys] = useState(false);
    const [currentView, setCurrentView] = useState<View>('uploader');
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [notesId, setNotesId] = useState<string | null>(null);
    const { toast } = useToast();
  
    useEffect(() => {
      const checkApiKeys = () => {
        const keys = getSecureApiKeys();
        setHasValidKeys(!!keys);
        setIsLoading(false);
      };
  
      checkApiKeys();
  
  // Combined cleanup function
  const performCleanup = async () => {
    clearSecureApiKeys();
    try {
      await fetch('/api/session', { method: 'DELETE' });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  // Update all handlers to use performCleanup instead of just clearSecureApiKeys
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    performCleanup();
    e.preventDefault();
    return (e.returnValue = '');
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      performCleanup();
    }
  };

  const handleUnload = () => {
    performCleanup();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
      performCleanup();
    }
  };
  
      // Add all event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('unload', handleUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('keydown', handleKeyDown);
  
      // Clean up all event listeners
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('unload', handleUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, []);
  
    const renderContent = () => {
      switch (currentView) {
        case 'quiz':
          return quizData && (
            <div className="w-full">
              <QuizSection 
                quiz={quizData} 
                notesId={notesId || undefined}
                onBack={() => {
                  setCurrentView('options');
                  setQuizData(null);
                }}
              />
            </div>
          );
        case 'options':
          return (
            <div className="w-full">
              <QuizOptions
                onSelect={async (count) => {
                  // Add async handling for quiz generation
                  try {
                    // You might want to add quiz generation logic here
                    setCurrentView('quiz');
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to generate quiz",
                      variant: "destructive",
                    });
                  }
                }}
                isLoading={false}
                notesId={notesId || undefined}
                onBack={() => {
                  setCurrentView('uploader');
                  setQuizData(null);
                }}
              />
            </div>
          );
        default:
          return (
            <AudioUploader 
              onSuccess={(data: AudioProcessingResponse) => {
                if (data.success) {
                  setNotesId(data.notes_file); // This now matches the type
                  setQuizData(data.quiz as Quiz);
                  setCurrentView('options');
                  toast({
                    title: "Success",
                    description: data.message,
                  });
                } else {
                  toast({
                    title: "Error",
                    description: data.message,
                    variant: "destructive",
                  });
                }
              }}
            />
          );
      }
    };
    const handleLogout = async () => {
      try {
        // Clear client-side storage
        clearSecureApiKeys();
  
        // Clear server-side session
        const response = await fetch('/api/session', {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          throw new Error('Failed to clear session');
        }
        console.log('Remaining cookies after logout:', document.cookie);
  
        setHasValidKeys(false);
        toast({
          title: "Logged out",
          description: "Your session has been cleared.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear session. Please try again.",
          variant: "destructive",
        });
      }
    };
  
  
  
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
          <div className="animate-pulse">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
      );
    }
  
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 relative overflow-hidden">
        
        {hasValidKeys && (
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
  
        {!hasValidKeys && (
          <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50">
            <ApiKeyModal
              onKeysSubmitted={() => {
                setHasValidKeys(true);
                toast({
                  title: "Success",
                  description: "You can now start uploading audio files.",
                });
              }}
            />
          </div>
        )}
        
        <div className={`transition-opacity duration-300 ${!hasValidKeys ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <MotivationalQuotes />
          <div className="container mx-auto px-4 py-16 relative">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block">
                  <div className="relative">
                    <h1 className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                      AI Teaching Assistant
                    </h1>
                    <Sparkles className="absolute -top-6 -right-8 w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
                  Transform your audio lectures into interactive quizzes with the power of AI.
                  Upload your content and watch the magic happen!
                </p>
              </div>
  
              <div className="space-y-8">
                <AudioUploader/>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
}