"use client";
import { BackButton } from "./BackButton";
import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import type { Quiz } from '@/types/quiz';
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

interface QuizSectionProps {
  quiz: Quiz;
  notesId?: string;
  onBack: () => void;
}

export default function QuizSection({ quiz, notesId, onBack }: QuizSectionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (submitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    const totalQuestions = quiz.questions.length;
    const answeredQuestions = Object.keys(selectedAnswers).length;

    if (answeredQuestions < totalQuestions) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer all ${totalQuestions} questions before submitting.`,
        variant: "destructive",
      });
      return;
    }

    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);

    toast({
      title: "Quiz Submitted!",
      description: `You scored ${finalScore} out of ${totalQuestions}!`,
    });
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  

  return (
    <div className="relative">
      <BackButton onBack={onBack} />
      <div className="space-y-8 max-w-3xl mx-auto p-4 animate-fadeIn mt-12">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📚 Quiz Results & Notes
          </h1>
          {notesId && (
            <Button variant="outline" asChild className="hover:bg-accent">
              <a 
                href={`/api/download/notes/${notesId}`} 
                download
                className="no-underline hover:no-underline flex items-center gap-2"
              >
                <span>📝</span> Download Notes
              </a>
            </Button>
          )}
        </div>
  
        <Card className="p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              🧠 Knowledge Check
            </h2>
            <div>
              {!submitted ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                  className={cn(
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 active:scale-[0.98]",
                    "transition-all duration-250",
                    "shadow-sm"
                  )}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button 
                  onClick={handleReset}
                  variant="outline"
                  className="hover:bg-accent"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
  
          <div className="space-y-10">
            {quiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="space-y-4 animate-fadeIn" style={{ animationDelay: `${qIndex * 0.1}s` }}>
                <div className="font-medium text-lg break-words pb-2">
                  {qIndex + 1}. {question.question}
                </div>
  
                <div className="space-y-3 w-full">
                  {Object.entries(question.options).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => !submitted && handleAnswerSelect(qIndex, key)}
                      disabled={submitted}
                      className={cn(
                        "w-full text-left transition-all duration-200 min-h-[60px]",
                        "rounded-lg border p-4 shadow-sm flex items-start",
                        "hover:border-primary/50 hover:bg-accent/50",
                        selectedAnswers[qIndex] === key && "border-primary bg-primary/5",
                        submitted && key === question.correct_answer && "border-green-500 bg-green-50/50",
                        submitted && selectedAnswers[qIndex] === key && key !== question.correct_answer && "border-red-500 bg-red-50/50",
                        submitted && "pointer-events-none",
                        "relative overflow-visible"
                      )}>
                      <div className="flex items-start gap-3 w-full break-words">
                        <span className="text-gray-500 font-medium shrink-0 w-6">
                          {key.toUpperCase()}. 
                        </span>
                        <span className="flex-1 text-left whitespace-normal">{value}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
  
          {submitted && score !== null && (
            <div className="mt-12 border rounded-lg overflow-hidden animate-fadeIn">
              <div className="p-6 bg-accent/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Final Results</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Here's how you performed:
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {score} / {quiz.questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {((score / quiz.questions.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-background border-t">
                <Button 
                  onClick={handleReset}
                  variant="outline"
                  className="w-full hover:bg-accent"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}