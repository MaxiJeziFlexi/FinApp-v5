import { db } from "../db";
import { 
  learningAnalytics, 
  behaviorPatterns, 
  aiModelPerformance, 
  educationContent,
  chatMessages,
  userProfiles,
  type InsertLearningAnalytics,
  type InsertBehaviorPattern,
  type InsertAIModelPerformance
} from "@shared/schema";
import { eq, desc, avg, count, sum, gte, sql } from "drizzle-orm";

export interface LearningEvent {
  userId: string;
  eventType: string;
  eventData: any;
  timeSpent?: number;
  interactionCount?: number;
  completionRate?: number;
  difficultyLevel?: string;
  learningPath?: string;
}

export interface AIModelMetrics {
  modelVersion: string;
  promptType: string;
  requestData: any;
  responseData: any;
  userFeedback?: number;
  responseTime: number;
  tokenUsage: number;
  accuracy?: number;
  relevanceScore?: number;
  userEngagement?: any;
}

export interface UserBehaviorAnalysis {
  userId: string;
  engagementScore: number;
  learningStyle: string;
  riskTolerance: string;
  preferredTopics: string[];
  completionRate: number;
  averageSessionTime: number;
  interactionPatterns: any;
}

export class AnalyticsService {
  // Learning Analytics
  async trackLearningEvent(data: LearningEvent): Promise<void> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const analytics: InsertLearningAnalytics = {
      id: `analytics_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: data.userId,
      sessionId,
      eventType: data.eventType,
      eventData: data.eventData,
      timeSpent: data.timeSpent,
      interactionCount: data.interactionCount || 0,
      completionRate: data.completionRate,
      difficultyLevel: data.difficultyLevel,
      learningPath: data.learningPath,
    };

    await db.insert(learningAnalytics).values(analytics);
    
    // Update user behavior patterns based on this event
    await this.updateBehaviorPattern(data.userId, data);
  }

  // AI Model Performance Tracking
  async trackAIModelPerformance(data: AIModelMetrics): Promise<void> {
    const performance: InsertAIModelPerformance = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      modelVersion: data.modelVersion,
      promptType: data.promptType,
      requestData: data.requestData,
      responseData: data.responseData,
      userFeedback: data.userFeedback,
      responseTime: data.responseTime,
      tokenUsage: data.tokenUsage,
      accuracy: data.accuracy?.toString() || null,
      relevanceScore: data.relevanceScore,
      userEngagement: data.userEngagement || {},
    };

    await db.insert(aiModelPerformance).values(performance);
  }

  // Behavior Pattern Analysis
  async updateBehaviorPattern(userId: string, eventData: LearningEvent): Promise<void> {
    // Analyze engagement patterns
    const engagementData = await this.analyzeEngagementPattern(userId);
    
    // Determine learning style
    const learningStyle = await this.detectLearningStyle(userId);
    
    // Analyze risk tolerance from financial decisions
    const riskTolerance = await this.analyzeRiskTolerance(userId);

    const behaviorData: InsertBehaviorPattern = {
      id: `pattern_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      patternType: 'comprehensive_analysis',
      patternData: {
        engagement: engagementData,
        learningStyle,
        riskTolerance,
        lastEvent: eventData,
        analyzedAt: new Date().toISOString()
      },
      confidence: engagementData.confidence?.toString() || "0.75",
      predictiveScore: engagementData.score || 75,
    };

    await db.insert(behaviorPatterns).values(behaviorData);
  }

  // Advanced Analytics Methods
  private async analyzeEngagementPattern(userId: string): Promise<any> {
    try {
      const recentAnalytics = await db
        .select()
        .from(learningAnalytics)
        .where(eq(learningAnalytics.userId, userId))
        .orderBy(desc(learningAnalytics.createdAt))
        .limit(20);

      if (recentAnalytics.length === 0) {
        return { score: 50, confidence: 0.5, pattern: 'new_user' };
      }

      const totalTime = recentAnalytics.reduce((sum, record) => sum + (record.timeSpent || 0), 0);
      const totalInteractions = recentAnalytics.reduce((sum, record) => sum + (record.interactionCount || 0), 0);
      const avgCompletionRate = recentAnalytics
        .filter(record => record.completionRate !== null)
        .reduce((sum, record) => sum + (record.completionRate || 0), 0) / recentAnalytics.length;

      // Calculate engagement score (0-100)
      const engagementScore = Math.min(100, Math.max(0, 
        (totalTime / 60 * 0.3) + // Time spent factor
        (totalInteractions * 0.4) + // Interaction factor
        (avgCompletionRate * 0.3) // Completion factor
      ));

      return {
        score: Math.round(engagementScore),
        confidence: Math.min(1.0, recentAnalytics.length / 20),
        pattern: engagementScore > 70 ? 'highly_engaged' : 
                 engagementScore > 40 ? 'moderately_engaged' : 'low_engagement',
        details: {
          totalTime,
          totalInteractions,
          avgCompletionRate,
          sessionCount: recentAnalytics.length
        }
      };
    } catch (error) {
      console.error('Error analyzing engagement pattern:', error);
      return { score: 50, confidence: 0.5, pattern: 'error' };
    }
  }

  private async detectLearningStyle(userId: string): Promise<string> {
    try {
      const recentEvents = await db
        .select()
        .from(learningAnalytics)
        .where(eq(learningAnalytics.userId, userId))
        .orderBy(desc(learningAnalytics.createdAt))
        .limit(10);

    // Analyze interaction patterns to determine learning style
    const interactionTypes = recentEvents.map(event => event.eventData?.interactionType).filter(Boolean);
    const visualInteractions = interactionTypes.filter(type => ['chart_view', 'graph_interaction', 'visual_element'].includes(type)).length;
    const auditoryInteractions = interactionTypes.filter(type => ['voice_input', 'audio_content', 'speech_recognition'].includes(type)).length;
    const kinestheticInteractions = interactionTypes.filter(type => ['drag_drop', 'slider_interaction', 'touch_gesture'].includes(type)).length;
    const readingInteractions = interactionTypes.filter(type => ['text_reading', 'article_view', 'documentation'].includes(type)).length;

    const total = visualInteractions + auditoryInteractions + kinestheticInteractions + readingInteractions;
    if (total === 0) return 'mixed';

    const percentages = {
      visual: visualInteractions / total,
      auditory: auditoryInteractions / total,
      kinesthetic: kinestheticInteractions / total,
      reading: readingInteractions / total
    };

    const dominantStyle = Object.entries(percentages).reduce((a, b) => percentages[a[0]] > percentages[b[0]] ? a : b)[0];
    return dominantStyle;
    } catch (error) {
      console.error('Error detecting learning style:', error);
      return 'mixed';
    }
  }

  private async analyzeRiskTolerance(userId: string): Promise<string> {
    const chatHistory = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(20);

    // Analyze financial decision keywords and sentiment
    const conservativeKeywords = ['safe', 'secure', 'low-risk', 'conservative', 'stable', 'guaranteed'];
    const aggressiveKeywords = ['high-return', 'aggressive', 'risk', 'growth', 'volatile', 'speculative'];

    let conservativeScore = 0;
    let aggressiveScore = 0;

    chatHistory.forEach(message => {
      if (message.role === 'user') {
        const content = message.content.toLowerCase();
        conservativeKeywords.forEach(keyword => {
          if (content.includes(keyword)) conservativeScore += 1;
        });
        aggressiveKeywords.forEach(keyword => {
          if (content.includes(keyword)) aggressiveScore += 1;
        });
      }
    });

    if (conservativeScore > aggressiveScore * 1.5) return 'conservative';
    if (aggressiveScore > conservativeScore * 1.5) return 'aggressive';
    return 'moderate';
  }

  // Dashboard Analytics
  async getUserDashboardData(userId: string): Promise<UserBehaviorAnalysis> {
    const [engagementData, userProfile] = await Promise.all([
      this.analyzeEngagementPattern(userId),
      db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1)
    ]);

    const profile = userProfile[0];
    const learningStyle = await this.detectLearningStyle(userId);
    const riskTolerance = await this.analyzeRiskTolerance(userId);

    // Get preferred topics from chat history
    const recentChats = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);

    const topicTags = recentChats
      .flatMap(chat => chat.topicTags || [])
      .filter(Boolean) as string[];
    
    const topicCounts = topicTags.reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    const preferredTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      userId,
      engagementScore: engagementData.score,
      learningStyle,
      riskTolerance,
      preferredTopics,
      completionRate: engagementData.details?.avgCompletionRate || 0,
      averageSessionTime: engagementData.details?.totalTime / engagementData.details?.sessionCount || 0,
      interactionPatterns: engagementData.details
    };
  }

  // Get AI model performance insights
  async getModelPerformanceInsights(): Promise<any> {
    try {
      const performances = await db
        .select()
        .from(aiModelPerformance)
        .orderBy(desc(aiModelPerformance.createdAt))
        .limit(1000);

      const byModel = performances.reduce((acc, perf) => {
        if (!acc[perf.modelVersion]) {
          acc[perf.modelVersion] = [];
        }
        acc[perf.modelVersion].push(perf);
        return acc;
      }, {} as Record<string, typeof performances>);

      const insights = Object.entries(byModel).map(([model, perfs]) => ({
        model,
        totalRequests: perfs.length,
        avgResponseTime: perfs.reduce((sum, p) => sum + (p.responseTime || 0), 0) / perfs.length,
        avgTokenUsage: perfs.reduce((sum, p) => sum + (p.tokenUsage || 0), 0) / perfs.length,
        avgUserFeedback: perfs
          .filter(p => p.userFeedback !== null)
          .reduce((sum, p) => sum + (p.userFeedback || 0), 0) / perfs.filter(p => p.userFeedback !== null).length,
        avgRelevanceScore: perfs
          .filter(p => p.relevanceScore !== null)
          .reduce((sum, p) => sum + (p.relevanceScore || 0), 0) / perfs.filter(p => p.relevanceScore !== null).length
      }));

      return {
        totalRequests: performances.length,
        modelInsights: insights,
        promptTypeDistribution: performances.reduce((acc, perf) => {
          acc[perf.promptType || 'unknown'] = (acc[perf.promptType || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error getting model performance insights:', error);
      return {
        totalRequests: 0,
        modelInsights: [],
        promptTypeDistribution: {}
      };
    }
  }

  // Real-time learning analytics
  async getRealTimeLearningInsights(): Promise<any> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
      const recentEvents = await db
        .select()
        .from(learningAnalytics)
        .where(gte(learningAnalytics.createdAt, last24Hours))
        .orderBy(desc(learningAnalytics.createdAt));

      const eventTypes = recentEvents.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const learningPaths = recentEvents.reduce((acc, event) => {
        if (event.learningPath) {
          acc[event.learningPath] = (acc[event.learningPath] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        last24Hours: {
          totalEvents: recentEvents.length,
          uniqueUsers: new Set(recentEvents.map(e => e.userId)).size,
          eventTypeDistribution: eventTypes,
          popularLearningPaths: learningPaths,
          avgEngagement: recentEvents.length > 0 ? recentEvents.reduce((sum, e) => sum + (e.interactionCount || 0), 0) / recentEvents.length : 0
        }
      };
    } catch (error) {
      console.error('Error getting real-time learning insights:', error);
      return {
        last24Hours: {
          totalEvents: 0,
          uniqueUsers: 0,
          eventTypeDistribution: {},
          popularLearningPaths: {},
          avgEngagement: 0
        }
      };
    }
  }
}

export const analyticsService = new AnalyticsService();