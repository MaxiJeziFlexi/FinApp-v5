import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Zap, Target, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingAnimationProps {
  stage?: 'analyzing' | 'processing' | 'synthesizing' | 'responding';
  message?: string;
  className?: string;
}

const thinkingStages = {
  analyzing: {
    icon: Target,
    text: "Analyzing your question...",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    particles: "blue"
  },
  processing: {
    icon: Brain,
    text: "Processing information...",
    color: "text-purple-500", 
    bgColor: "bg-purple-500/10",
    particles: "purple"
  },
  synthesizing: {
    icon: Zap,
    text: "Synthesizing response...",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10", 
    particles: "orange"
  },
  responding: {
    icon: Sparkles,
    text: "Crafting your answer...",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    particles: "green"
  }
};

export default function ThinkingAnimation({ 
  stage = 'analyzing', 
  message, 
  className 
}: ThinkingAnimationProps) {
  const [currentStage, setCurrentStage] = useState(stage);
  const [dots, setDots] = useState('');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);

  const stageConfig = thinkingStages[currentStage];
  const Icon = stageConfig.icon;

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 200,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, [currentStage]);

  // Auto-progress through stages
  useEffect(() => {
    if (stage) {
      setCurrentStage(stage);
      return;
    }

    const stages = Object.keys(thinkingStages) as Array<keyof typeof thinkingStages>;
    let stageIndex = 0;

    const interval = setInterval(() => {
      stageIndex = (stageIndex + 1) % stages.length;
      setCurrentStage(stages[stageIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border/50 p-6 backdrop-blur-sm",
      stageConfig.bgColor,
      className
    )}>
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={cn(
              "absolute rounded-full opacity-20 animate-float",
              stageConfig.color.replace('text-', 'bg-')
            )}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* 3D Brain container */}
      <div className="relative flex items-center space-x-4">
        {/* Animated 3D icon */}
        <div className="relative">
          <div className={cn(
            "relative z-10 p-3 rounded-xl transition-all duration-500 transform-gpu",
            stageConfig.bgColor,
            "animate-bounce-gentle shadow-lg"
          )}>
            <Icon 
              className={cn(
                "w-8 h-8 transition-all duration-500",
                stageConfig.color,
                "animate-pulse-slow"
              )} 
            />
          </div>
          
          {/* 3D glow effect */}
          <div className={cn(
            "absolute inset-0 rounded-xl blur-xl opacity-40 animate-pulse-slow",
            stageConfig.color.replace('text-', 'bg-'),
            "transform-gpu scale-110"
          )} />
        </div>

        {/* Thinking content */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={cn("font-semibold text-lg", stageConfig.color)}>
              {stageConfig.text}{dots}
            </h3>
            <ChevronRight className={cn(
              "w-5 h-5 animate-pulse-slow transform-gpu",
              stageConfig.color
            )} />
          </div>
          
          {message && (
            <p className="text-sm text-muted-foreground animate-fade-in">
              {message}
            </p>
          )}
          
          {/* Animated progress bar */}
          <div className="mt-3 bg-muted/50 rounded-full h-1 overflow-hidden">
            <div className={cn(
              "h-full rounded-full animate-progress",
              stageConfig.color.replace('text-', 'bg-'),
              "transform-gpu origin-left"
            )} />
          </div>
        </div>

        {/* Animated thinking bubbles */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full animate-bounce-stagger transform-gpu",
                stageConfig.color.replace('text-', 'bg-')
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Geometric 3D decoration */}
      <div className="absolute top-2 right-2 opacity-10">
        <div className={cn(
          "w-8 h-8 border-2 rotate-45 animate-spin-slow transform-gpu",
          stageConfig.color.replace('text-', 'border-')
        )} />
      </div>
    </div>
  );
}

// Enhanced CSS animations via Tailwind classes
const additionalStyles = `
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
}

@keyframes bounce-gentle {
  0%, 100% { 
    transform: translateY(0px) scale(1) rotateY(0deg);
  }
  50% { 
    transform: translateY(-4px) scale(1.05) rotateY(180deg);
  }
}

@keyframes pulse-slow {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes bounce-stagger {
  0%, 60%, 100% {
    transform: translateY(0px);
  }
  30% {
    transform: translateY(-10px);
  }
}

@keyframes progress {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg) perspective(1000px) rotateX(0deg); }
  to { transform: rotate(360deg) perspective(1000px) rotateX(360deg); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0px); }
}

.animate-float { animation: float 3s ease-in-out infinite; }
.animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
.animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
.animate-bounce-stagger { animation: bounce-stagger 1.4s ease-in-out infinite; }
.animate-progress { animation: progress 3s ease-out infinite; }
.animate-spin-slow { animation: spin-slow 4s linear infinite; }
.animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
`;