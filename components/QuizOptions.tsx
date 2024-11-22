import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BackButton } from "./BackButton";

interface QuizOptionsProps {
  onSelect: (questionCount: number) => void;
  isLoading: boolean;
  notesId?: string;
  onBack: () => void;  // Add this prop
}

export default function QuizOptions({ onSelect, isLoading, notesId, onBack }: QuizOptionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  const options = [
    { count: 5, label: 'Quick Quiz', description: 'A brief knowledge check' },
    { count: 10, label: 'Standard Quiz', description: 'Comprehensive coverage' },
    { count: 20, label: 'Extended Quiz', description: 'In-depth assessment' }
  ];

  const handleDownload = async () => {
    if (!notesId) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/download/notes/${notesId}`, {
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to download notes: ${response.status}`);
      }
      
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Received empty file');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${notesId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Lecture notes downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download lecture notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      <BackButton onBack={onBack} />
      <div className="mt-12">
        <Card className="p-6 border-2 shadow-lg bg-card/50 backdrop-blur-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Select Quiz Length</h2>
            <p className="text-muted-foreground">
              Choose how many questions you'd like in your quiz
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {options.map((option) => (
              <Button
                key={option.count}
                onClick={() => onSelect(option.count)}
                disabled={isLoading}
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 hover:bg-primary/5"
              >
                <span className="text-xl font-bold">{option.count}</span>
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </Button>
            ))}
          </div>

          {notesId && (
            <div className="border-t pt-6">
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Your AI-generated lecture notes are ready for download
                </p>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Lecture Notes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}