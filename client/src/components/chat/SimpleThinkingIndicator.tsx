import React from 'react';
import { Bot } from 'lucide-react';

interface SimpleThinkingIndicatorProps {
  message?: string;
}

export default function SimpleThinkingIndicator({ message }: SimpleThinkingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border max-w-md">
      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
        <Bot className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Thinking</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        {message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}