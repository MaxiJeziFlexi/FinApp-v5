// Basic sentiment analysis utilities for client-side processing
// The main sentiment analysis is handled by OpenAI on the server

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions?: string[];
}

export interface FinancialSentimentResult extends SentimentResult {
  financialContext: 'optimistic' | 'pessimistic' | 'neutral' | 'anxious';
  stressLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
}

// Basic keyword-based sentiment analysis for client-side processing
export const analyzeSentiment = (text: string): SentimentResult => {
  if (!text || typeof text !== 'string') {
    return {
      sentiment: 'neutral',
      confidence: 0,
    };
  }

  const cleanText = text.toLowerCase().trim();
  
  // Positive sentiment keywords
  const positiveWords = [
    'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'happy',
    'pleased', 'satisfied', 'love', 'like', 'enjoy', 'appreciate', 'thank',
    'perfect', 'awesome', 'brilliant', 'outstanding', 'superb', 'helpful',
    'effective', 'successful', 'progress', 'improvement', 'better', 'best'
  ];

  // Negative sentiment keywords
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry',
    'frustrated', 'disappointed', 'worried', 'concerned', 'problem', 'issue',
    'error', 'wrong', 'difficult', 'hard', 'impossible', 'failure', 'failed',
    'worse', 'worst', 'useless', 'broken', 'annoying', 'confusing'
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      positiveScore += matches.length;
    }
  });

  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      negativeScore += matches.length;
    }
  });

  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  let confidence = 0;

  if (positiveScore > negativeScore) {
    sentiment = 'positive';
    confidence = Math.min(0.8, 0.3 + (positiveScore - negativeScore) * 0.1);
  } else if (negativeScore > positiveScore) {
    sentiment = 'negative';
    confidence = Math.min(0.8, 0.3 + (negativeScore - positiveScore) * 0.1);
  } else {
    sentiment = 'neutral';
    confidence = 0.5;
  }

  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
  };
};

// Financial-specific sentiment analysis
export const analyzeFinancialSentiment = (text: string): FinancialSentimentResult => {
  const basicSentiment = analyzeSentiment(text);
  const cleanText = text.toLowerCase().trim();

  // Financial optimism keywords
  const optimisticWords = [
    'save', 'saving', 'invest', 'investing', 'growth', 'profit', 'gain',
    'budget', 'plan', 'goal', 'achieve', 'success', 'secure', 'stable',
    'confident', 'optimistic', 'future', 'retirement', 'emergency fund'
  ];

  // Financial anxiety keywords
  const anxiousWords = [
    'debt', 'broke', 'poor', 'expensive', 'cost', 'payment', 'bill',
    'struggle', 'difficult', 'tight', 'limited', 'worried', 'anxious',
    'stress', 'pressure', 'bankruptcy', 'foreclosure', 'collection'
  ];

  // Urgency keywords
  const urgentWords = [
    'urgent', 'immediate', 'asap', 'quickly', 'emergency', 'crisis',
    'deadline', 'overdue', 'late', 'behind', 'rush', 'now', 'today'
  ];

  let optimismScore = 0;
  let anxietyScore = 0;
  let urgencyScore = 0;

  // Count financial optimism
  optimisticWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      optimismScore += matches.length;
    }
  });

  // Count anxiety indicators
  anxiousWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      anxietyScore += matches.length;
    }
  });

  // Count urgency indicators
  urgentWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      urgencyScore += matches.length;
    }
  });

  // Determine financial context
  let financialContext: 'optimistic' | 'pessimistic' | 'neutral' | 'anxious' = 'neutral';
  
  if (anxietyScore > 0) {
    financialContext = 'anxious';
  } else if (optimismScore > anxietyScore) {
    financialContext = 'optimistic';
  } else if (anxietyScore > optimismScore) {
    financialContext = 'pessimistic';
  }

  // Determine stress level
  let stressLevel: 'low' | 'medium' | 'high' = 'low';
  if (anxietyScore >= 3 || basicSentiment.sentiment === 'negative') {
    stressLevel = 'high';
  } else if (anxietyScore >= 1 || urgencyScore >= 1) {
    stressLevel = 'medium';
  }

  // Determine urgency
  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (urgencyScore >= 2) {
    urgency = 'high';
  } else if (urgencyScore >= 1) {
    urgency = 'medium';
  }

  return {
    ...basicSentiment,
    financialContext,
    stressLevel,
    urgency,
  };
};

// Utility function to get emotion indicators
export const getEmotionIndicators = (text: string): string[] => {
  const cleanText = text.toLowerCase();
  const emotions: string[] = [];

  const emotionKeywords = {
    'excited': ['excited', 'thrilled', 'enthusiastic', 'eager'],
    'worried': ['worried', 'concerned', 'anxious', 'nervous', 'scared'],
    'confused': ['confused', 'unclear', 'lost', 'puzzled', 'uncertain'],
    'frustrated': ['frustrated', 'annoyed', 'irritated', 'angry'],
    'hopeful': ['hopeful', 'optimistic', 'positive', 'confident'],
    'overwhelmed': ['overwhelmed', 'stressed', 'too much', 'overloaded']
  };

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    const hasEmotion = keywords.some(keyword => 
      cleanText.includes(keyword)
    );
    if (hasEmotion) {
      emotions.push(emotion);
    }
  });

  return emotions;
};

// Format sentiment for display
export const formatSentimentDisplay = (sentiment: SentimentResult): string => {
  const { sentiment: type, confidence } = sentiment;
  
  if (confidence < 0.3) {
    return 'Neutral';
  }
  
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
  const confidencePercent = Math.round(confidence * 100);
  
  return `${capitalizedType} (${confidencePercent}%)`;
};

// Get sentiment color for UI
export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600';
    case 'negative':
      return 'text-red-600';
    case 'neutral':
    default:
      return 'text-gray-600';
  }
};

// Export for server-side compatibility check
export const validateMessage = (message: string): boolean => {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  const trimmed = message.trim();
  return trimmed.length >= 1 && trimmed.length <= 1000;
};
