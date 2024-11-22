"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const quotes = [
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
  { text: "The only person who is educated is the one who has learned how to learn.", author: "Carl Rogers" },
];

export function MotivationalQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 800);
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-6 p-8">
        {Array.from({ length: 9 }).map((_, i) => {
          const quote = quotes[(currentQuoteIndex + i) % quotes.length];
          return (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center text-center transform",
                "transition-all duration-800 ease-in-out",
                "hover:opacity-[0.15]",
                isVisible ? "opacity-[0.08] scale-100 rotate-[-10deg]" : "opacity-0 scale-95 rotate-0",
              )}
            >
              <div>
                <p className="text-5xl font-bold">{quote.text}</p>
                <p className="text-2xl mt-3">- {quote.author}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}