import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AITypingIndicatorProps {
  isVisible: boolean;
  message?: string;
  stage?: 'thinking' | 'typing' | 'processing';
  className?: string;
}

const stageConfig = {
  thinking: {
    icon: Bot,
    text: "Thinking",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  typing: {
    icon: Sparkles,
    text: "Typing",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  processing: {
    icon: Zap,
    text: "Processing",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  }
};

export default function AITypingIndicator({
  isVisible,
  message,
  stage = 'thinking',
  className
}: AITypingIndicatorProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm max-w-xs",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Animated avatar */}
      <div className="relative flex-shrink-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotateY: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={cn("p-2 rounded-full", config.bgColor)}
        >
          <Icon className={cn("w-4 h-4", config.color)} />
        </motion.div>
        
        {/* Glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={cn(
            "absolute inset-0 rounded-full blur-md",
            config.color.replace('text-', 'bg-'),
            "opacity-30"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Status text with dots */}
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", config.color)}>
            {config.text}
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn("w-1 h-1 rounded-full", config.color.replace('text-', 'bg-'))}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Optional message */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground mt-1 truncate"
          >
            {message}
          </motion.p>
        )}
      </div>

      {/* Animated wave indicator */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn("w-0.5 bg-current rounded-full", config.color)}
            animate={{
              height: ["4px", "12px", "4px"],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1,
              delay: i * 0.1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}