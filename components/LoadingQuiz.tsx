// components/LoadingQuiz.tsx

import { Card } from "./ui/card";
import { Brain, Loader2 } from "lucide-react";

export default function LoadingQuiz() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto p-4 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🎯 Generating Your Quiz
        </h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
          <div className="relative">
            <Brain className="w-12 h-12 text-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-center mt-4">
            Creating Your Knowledge Check
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            Our AI is carefully analyzing your content and crafting relevant questions...
          </p>

          <div className="w-full max-w-md space-y-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-12 bg-muted/30 rounded-lg animate-pulse"
                      style={{
                        animationDelay: `${(i * 4 + j) * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}