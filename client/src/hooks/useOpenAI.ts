import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SendMessageOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  advisorId?: string;
  userId?: string;
  userProfile?: any;
  decisionPath?: any[];
}

interface OpenAIResponse {
  response: string;
  model: string;
  responseTime: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface UseOpenAIReturn {
  sendMessage: (
    message: string, 
    options?: SendMessageOptions
  ) => Promise<OpenAIResponse | null>;
  sendEnhancedMessage: (
    message: string,
    advisorId: string,
    options?: SendMessageOptions
  ) => Promise<OpenAIResponse | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const useOpenAI = (): UseOpenAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(async (
    message: string,
    options: SendMessageOptions = {}
  ): Promise<OpenAIResponse | null> => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        message: message.trim(),
        advisor_id: options.advisorId || 'financial',
        user_id: options.userId || '1',
        user_profile: options.userProfile,
        decision_path: options.decisionPath || [],
        model: options.model || 'gpt-4o',
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 800,
      };

      const response = await apiRequest('POST', '/api/chat/send', requestData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      return {
        response: data.response || data.message,
        model: data.model || requestData.model,
        responseTime: data.responseTime || 0,
        usage: data.usage,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "OpenAI Error",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendEnhancedMessage = useCallback(async (
    message: string,
    advisorId: string,
    options: SendMessageOptions = {}
  ): Promise<OpenAIResponse | null> => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return null;
    }

    if (!advisorId) {
      setError('Advisor ID is required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        message: message.trim(),
        advisor_id: advisorId,
        user_id: options.userId || '1',
        use_chatgpt: true,
        model: options.model || 'gpt-4o',
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 800,
      };

      const response = await apiRequest('POST', '/api/chat/enhanced-response', requestData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get enhanced response');
      }

      return {
        response: data.response,
        model: data.model || requestData.model,
        responseTime: data.responseTime || 0,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Enhanced Response Error",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    sendMessage,
    sendEnhancedMessage,
    isLoading,
    error,
    clearError,
  };
};

export default useOpenAI;
