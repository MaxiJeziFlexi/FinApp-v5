import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, Cpu, Sparkles, Zap, Search, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThoughtStep {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
  progress: number;
}

interface AdvancedThinkingProcessProps {
  isVisible: boolean;
  currentThought?: string;
  className?: string;
}

const thinkingSteps: ThoughtStep[] = [
  {
    id: 'analysis',
    icon: Search,
    title: 'Analyzing Query',
    description: 'Understanding your financial question and context',
    color: 'blue',
    progress: 25
  },
  {
    id: 'research',
    icon: BookOpen,
    title: 'Gathering Information',
    description: 'Accessing relevant financial data and market insights',
    color: 'purple',
    progress: 50
  },
  {
    id: 'processing',
    icon: Cpu,
    title: 'Processing Data',
    description: 'Analyzing patterns and calculating recommendations',
    color: 'orange',
    progress: 75
  },
  {
    id: 'synthesis',
    icon: Lightbulb,
    title: 'Synthesizing Response',
    description: 'Crafting personalized financial advice for you',
    color: 'green',
    progress: 100
  }
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    glow: 'shadow-blue-500/25'
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30', 
    text: 'text-purple-600',
    icon: 'text-purple-500',
    glow: 'shadow-purple-500/25'
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-600', 
    icon: 'text-orange-500',
    glow: 'shadow-orange-500/25'
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-600',
    icon: 'text-green-500', 
    glow: 'shadow-green-500/25'
  }
};

export default function AdvancedThinkingProcess({ 
  isVisible, 
  currentThought,
  className 
}: AdvancedThinkingProcessProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    scale: number;
    delay: number;
  }>>([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 400,
      y: Math.random() * 200,
      scale: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, [isVisible]);

  // Auto-progress through steps
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % thinkingSteps.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, type: "spring" }}
        className={cn(
          "relative p-6 rounded-3xl border backdrop-blur-md bg-gradient-to-br from-background/80 to-background/40",
          "shadow-2xl border-border/50",
          className
        )}
      >
        {/* Background particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [particle.x, particle.x + 50, particle.x],
                y: [particle.y, particle.y - 30, particle.y],
                scale: [particle.scale, particle.scale * 1.5, particle.scale]
              }}
              transition={{
                duration: 3,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Main thinking content */}
        <div className="relative z-10">
          {/* Header with 3D brain */}
          <div className="flex items-center space-x-4 mb-6">
            <motion.div
              className="relative"
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <Brain className="w-8 h-8 text-blue-500" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl" />
              </div>
            </motion.div>
            
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Financial Advisor
              </h3>
              <p className="text-sm text-muted-foreground">
                Processing your request with advanced AI
              </p>
            </div>
          </div>

          {/* Current thinking step */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            {(() => {
              const step = thinkingSteps[currentStep];
              const colors = colorClasses[step.color as keyof typeof colorClasses];
              const Icon = step.icon;

              return (
                <div className={cn(
                  "flex items-start space-x-4 p-4 rounded-2xl border transition-all duration-300",
                  colors.bg,
                  colors.border,
                  colors.glow,
                  "shadow-lg"
                )}>
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="flex-shrink-0"
                  >
                    <div className="p-2 rounded-xl bg-background/50">
                      <Icon className={cn("w-6 h-6", colors.icon)} />
                    </div>
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className={cn("font-semibold mb-1", colors.text)}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    
                    {/* Progress bar */}
                    <div className="bg-muted/30 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", colors.icon.replace('text-', 'bg-'))}
                        initial={{ width: '0%' }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>

          {/* Current thought bubble */}
          {currentThought && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl p-4 border border-border/50"
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Current thought:
                  </p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm"
                  >
                    {currentThought}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {thinkingSteps.map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "bg-primary scale-125 shadow-lg shadow-primary/50" 
                    : "bg-muted-foreground/30"
                )}
                whileHover={{ scale: 1.5 }}
              />
            ))}
          </div>

          {/* Floating action indicators */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-4 h-4 text-yellow-500" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                delay: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Target className="w-4 h-4 text-blue-500" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}