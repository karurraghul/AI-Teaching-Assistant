// components/LandingPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Brain, Bot, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LandingPage = () => {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Smart Notes Generation",
      description: "AI-powered summarization and key points extraction from your audio lectures"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Interactive Quizzes",
      description: "Automatically generate engaging quizzes to reinforce learning and assess understanding"
    },
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "Magic Transformation",
      description: "Turn passive listening into active learning with AI-enhanced educational materials"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8 animate-fadeIn">
            <div className="relative inline-block">
              <h1 className="text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                AI Teaching Assistant
              </h1>
              <Sparkles className="absolute -top-8 -right-8 w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your educational content into engaging learning experiences with the power of artificial intelligence.
            </p>
          </div>

          {/* Features Grid - Reformatted for 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-scaleIn">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              className="group relative px-8 py-6 text-lg"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => router.push('/?app=true')}
            >
              Get Started
              <ArrowRight 
                className={`ml-2 w-5 h-5 transition-transform duration-300 ${
                  isHovering ? 'translate-x-1' : ''
                }`} 
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;