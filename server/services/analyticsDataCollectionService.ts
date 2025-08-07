// Enhanced Analytics Data Collection Service
// Captures comprehensive user data from every possible interaction point in the app

import { db } from '../db';
import { eq } from 'drizzle-orm';
import {
  userSessions,
  pageAnalytics,
  userInteractionEvents,
  financialDataCollection,
  toolUsageAnalytics,
  aiInteractionAnalytics,
  communityEngagementAnalytics,
  gamificationAnalytics,
  errorTrackingAnalytics,
  reportingAnalytics,
  predictiveAnalytics
} from '@shared/schema';

class AnalyticsDataCollectionService {
  // Session Management
  async createUserSession(sessionData: {
    userId: string;
    deviceType?: string;
    browser?: string;
    operatingSystem?: string;
    screenResolution?: string;
    ipAddress?: string;
    geolocation?: any;
    referrer?: string;
  }) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await db.insert(userSessions).values({
        id: sessionId,
        userId: sessionData.userId,
        sessionToken,
        deviceType: sessionData.deviceType,
        browser: sessionData.browser,
        operatingSystem: sessionData.operatingSystem,
        screenResolution: sessionData.screenResolution,
        ipAddress: sessionData.ipAddress,
        geolocation: sessionData.geolocation,
        referrer: sessionData.referrer,
        engagementScore: 0,
        conversionEvents: []
      });
      
      return { sessionId, sessionToken };
    } catch (error) {
      console.error('Error creating user session:', error);
      throw error;
    }
  }

  // Page Analytics
  async trackPageView(data: {
    sessionId: string;
    userId: string;
    pagePath: string;
    pageTitle?: string;
    loadTime?: number;
    performanceMetrics?: any;
  }) {
    try {
      await db.insert(pageAnalytics).values({
        id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: data.sessionId,
        userId: data.userId,
        pagePath: data.pagePath,
        pageTitle: data.pageTitle,
        loadTime: data.loadTime,
        performanceMetrics: data.performanceMetrics || {},
        heatmapData: {}
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  async updatePageAnalytics(sessionId: string, pagePath: string, updates: {
    timeOnPage?: number;
    scrollDepth?: number;
    clickCount?: number;
    exitPage?: boolean;
  }) {
    try {
      await db.update(pageAnalytics)
        .set(updates)
        .where(eq(pageAnalytics.sessionId, sessionId) && eq(pageAnalytics.pagePath, pagePath));
    } catch (error) {
      console.error('Error updating page analytics:', error);
    }
  }

  // User Interaction Events
  async trackUserInteraction(data: {
    sessionId: string;
    userId: string;
    eventType: string; // click, hover, scroll, form_submit, etc.
    eventCategory?: string; // financial_tool, navigation, learning
    eventAction?: string;
    eventLabel?: string;
    elementId?: string;
    elementClass?: string;
    elementText?: string;
    pagePath: string;
    coordinates?: { x: number; y: number };
    metadata?: any;
    conversionValue?: number;
    funnelStep?: string;
  }) {
    try {
      await db.insert(userInteractionEvents).values({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: data.sessionId,
        userId: data.userId,
        eventType: data.eventType,
        eventCategory: data.eventCategory,
        eventAction: data.eventAction,
        eventLabel: data.eventLabel,
        elementId: data.elementId,
        elementClass: data.elementClass,
        elementText: data.elementText,
        pagePath: data.pagePath,
        coordinates: data.coordinates,
        metadata: data.metadata || {},
        conversionValue: data.conversionValue?.toString(),
        funnelStep: data.funnelStep
      });
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }

  // Financial Data Collection
  async collectFinancialData(data: {
    userId: string;
    dataType: string; // income, expenses, assets, liabilities, goals
    dataSource: string; // manual_input, bank_sync, ai_inference, import
    originalData: any;
    processedData?: any;
    confidence?: number;
    verified?: boolean;
    category?: string;
    subcategory?: string;
    amount?: number;
    currency?: string;
    reportingPeriod?: string;
    tags?: string[];
    aiInsights?: any;
  }) {
    try {
      await db.insert(financialDataCollection).values({
        id: `financial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        dataType: data.dataType,
        dataSource: data.dataSource,
        originalData: data.originalData,
        processedData: data.processedData,
        confidence: data.confidence?.toString(),
        verified: data.verified || false,
        category: data.category,
        subcategory: data.subcategory,
        amount: data.amount?.toString(),
        currency: data.currency || 'USD',
        reportingPeriod: data.reportingPeriod,
        tags: data.tags || [],
        aiInsights: data.aiInsights
      });
    } catch (error) {
      console.error('Error collecting financial data:', error);
    }
  }

  // Tool Usage Analytics
  async trackToolUsage(data: {
    userId: string;
    toolName: string;
    featureName?: string;
    sessionId?: string;
    timeSpent?: number;
    actionsPerformed?: number;
    inputData?: any;
    outputData?: any;
    completionStatus: string; // completed, abandoned, error
    userSatisfaction?: number;
    errorCount?: number;
    helpRequested?: boolean;
    sharingBehavior?: any;
    conversionMetrics?: any;
  }) {
    try {
      const startTime = new Date();
      const endTime = data.timeSpent ? new Date(startTime.getTime() + data.timeSpent * 1000) : undefined;

      await db.insert(toolUsageAnalytics).values({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        toolName: data.toolName,
        featureName: data.featureName,
        sessionId: data.sessionId,
        startTime,
        endTime,
        timeSpent: data.timeSpent,
        actionsPerformed: data.actionsPerformed || 0,
        inputData: data.inputData,
        outputData: data.outputData,
        completionStatus: data.completionStatus,
        userSatisfaction: data.userSatisfaction,
        errorCount: data.errorCount || 0,
        helpRequested: data.helpRequested || false,
        sharingBehavior: data.sharingBehavior,
        conversionMetrics: data.conversionMetrics
      });
    } catch (error) {
      console.error('Error tracking tool usage:', error);
    }
  }

  // AI Interaction Analytics
  async trackAIInteraction(data: {
    userId: string;
    sessionId?: string;
    advisorType?: string;
    messageId?: string;
    userInput: string;
    aiResponse: string;
    responseTime: number; // in milliseconds
    tokenUsage?: number;
    cost?: number;
    userSatisfaction?: number;
    helpfulness?: number;
    accuracy?: number;
    followUpQuestions?: number;
    actionsTaken?: any;
    sentimentAnalysis?: any;
    intentRecognition?: any;
    personalizationFactors?: any;
    improvementSuggestions?: string;
  }) {
    try {
      await db.insert(aiInteractionAnalytics).values({
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        sessionId: data.sessionId,
        advisorType: data.advisorType,
        messageId: data.messageId,
        userInput: data.userInput,
        aiResponse: data.aiResponse,
        responseTime: data.responseTime,
        tokenUsage: data.tokenUsage,
        cost: data.cost?.toString(),
        userSatisfaction: data.userSatisfaction,
        helpfulness: data.helpfulness,
        accuracy: data.accuracy,
        followUpQuestions: data.followUpQuestions || 0,
        actionsTaken: data.actionsTaken,
        sentimentAnalysis: data.sentimentAnalysis,
        intentRecognition: data.intentRecognition,
        personalizationFactors: data.personalizationFactors,
        improvementSuggestions: data.improvementSuggestions
      });
    } catch (error) {
      console.error('Error tracking AI interaction:', error);
    }
  }

  // Community Engagement Analytics
  async trackCommunityEngagement(data: {
    userId: string;
    engagementType: string; // post, comment, like, share, view
    contentId?: string;
    contentType?: string;
    engagementQuality?: number;
    timeSpent?: number;
    reactionType?: string;
    sharingBehavior?: any;
    influenceScore?: number;
    networkEffects?: any;
    topicAffinity?: any;
    expertiseLevel?: string;
    helpfulnessRating?: number;
  }) {
    try {
      await db.insert(communityEngagementAnalytics).values({
        id: `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        engagementType: data.engagementType,
        contentId: data.contentId,
        contentType: data.contentType,
        engagementQuality: data.engagementQuality?.toString(),
        timeSpent: data.timeSpent,
        reactionType: data.reactionType,
        sharingBehavior: data.sharingBehavior,
        influenceScore: data.influenceScore?.toString(),
        networkEffects: data.networkEffects,
        topicAffinity: data.topicAffinity,
        expertiseLevel: data.expertiseLevel,
        helpfulnessRating: data.helpfulnessRating
      });
    } catch (error) {
      console.error('Error tracking community engagement:', error);
    }
  }

  // Gamification Analytics
  async trackGamificationEvent(data: {
    userId: string;
    gameElement: string; // points, badges, leaderboard, challenges
    actionType: string;
    pointsEarned?: number;
    levelAchieved?: number;
    badgesUnlocked?: any;
    challengeCompleted?: string;
    difficultyLevel?: number;
    timeToComplete?: number;
    motivationImpact?: number;
    engagementBoost?: number;
    socialSharing?: boolean;
    competitiveRanking?: number;
    achievementMetadata?: any;
  }) {
    try {
      await db.insert(gamificationAnalytics).values({
        id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        gameElement: data.gameElement,
        actionType: data.actionType,
        pointsEarned: data.pointsEarned || 0,
        levelAchieved: data.levelAchieved,
        badgesUnlocked: data.badgesUnlocked,
        challengeCompleted: data.challengeCompleted,
        difficultyLevel: data.difficultyLevel,
        timeToComplete: data.timeToComplete,
        motivationImpact: data.motivationImpact,
        engagementBoost: data.engagementBoost?.toString(),
        socialSharing: data.socialSharing || false,
        competitiveRanking: data.competitiveRanking,
        achievementMetadata: data.achievementMetadata
      });
    } catch (error) {
      console.error('Error tracking gamification event:', error);
    }
  }

  // Error Tracking Analytics
  async trackError(data: {
    userId?: string;
    sessionId?: string;
    errorType: string;
    errorCode?: string;
    errorMessage?: string;
    stackTrace?: string;
    pagePath?: string;
    userAgent?: string;
    reproductionSteps?: any;
    userImpact: string; // low, medium, high, critical
    frequency?: number;
    workaroundProvided?: boolean;
    userFeedback?: string;
    automaticRecovery?: boolean;
  }) {
    try {
      await db.insert(errorTrackingAnalytics).values({
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        sessionId: data.sessionId,
        errorType: data.errorType,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace,
        pagePath: data.pagePath,
        userAgent: data.userAgent,
        reproductionSteps: data.reproductionSteps,
        userImpact: data.userImpact,
        frequency: data.frequency || 1,
        resolved: false,
        workaroundProvided: data.workaroundProvided || false,
        userFeedback: data.userFeedback,
        automaticRecovery: data.automaticRecovery || false
      });
    } catch (error) {
      console.error('Error tracking error analytics:', error);
    }
  }

  // Report Generation Analytics
  async trackReportGeneration(data: {
    userId: string;
    reportType: string;
    reportCategory?: string;
    generationTime: number; // in milliseconds
    dataPointsIncluded?: number;
    timeRange?: any;
    filters?: any;
    customizations?: any;
    exportFormat?: string;
    userRating?: number;
    feedback?: string;
    actionsTaken?: any;
    businessImpact?: any;
  }) {
    try {
      await db.insert(reportingAnalytics).values({
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        reportType: data.reportType,
        reportCategory: data.reportCategory,
        generationTime: data.generationTime,
        dataPointsIncluded: data.dataPointsIncluded,
        timeRange: data.timeRange,
        filters: data.filters,
        customizations: data.customizations,
        exportFormat: data.exportFormat,
        downloadCount: 0,
        shareCount: 0,
        viewTime: 0,
        userRating: data.userRating,
        feedback: data.feedback,
        actionsTaken: data.actionsTaken,
        businessImpact: data.businessImpact
      });
    } catch (error) {
      console.error('Error tracking report generation:', error);
    }
  }

  // Predictive Analytics
  async storePrediction(data: {
    userId: string;
    predictionType: string; // financial_goal, behavior, risk, opportunity
    modelVersion?: string;
    inputFeatures: any;
    prediction: any;
    confidence: number; // 0-100
    timeHorizon?: number; // prediction window in days
    actionRecommendations?: any;
    riskFactors?: any;
    monitoringMetrics?: any;
    feedbackLoop?: any;
  }) {
    try {
      await db.insert(predictiveAnalytics).values({
        id: `predict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: data.userId,
        predictionType: data.predictionType,
        modelVersion: data.modelVersion,
        inputFeatures: data.inputFeatures,
        prediction: data.prediction,
        confidence: data.confidence.toString(),
        timeHorizon: data.timeHorizon,
        actionRecommendations: data.actionRecommendations,
        riskFactors: data.riskFactors,
        monitoringMetrics: data.monitoringMetrics,
        feedbackLoop: data.feedbackLoop
      });
    } catch (error) {
      console.error('Error storing prediction:', error);
    }
  }

  // Comprehensive Analytics Queries
  async getUserBehaviorInsights(userId: string, timeRange?: { start: Date; end: Date }) {
    try {
      const conditions = timeRange 
        ? `WHERE user_id = '${userId}' AND created_at BETWEEN '${timeRange.start.toISOString()}' AND '${timeRange.end.toISOString()}'`
        : `WHERE user_id = '${userId}'`;

      // This would be implemented with proper Drizzle queries
      return {
        pageViews: await this.getPageViewAnalytics(userId, timeRange),
        interactions: await this.getUserInteractions(userId, timeRange),
        toolUsage: await this.getToolUsagePatterns(userId, timeRange),
        aiInteractions: await this.getAIInteractionPatterns(userId, timeRange),
        financialBehavior: await this.getFinancialDataPatterns(userId, timeRange)
      };
    } catch (error) {
      console.error('Error getting user behavior insights:', error);
      return null;
    }
  }

  // Helper methods for specific analytics queries
  private async getPageViewAnalytics(userId: string, timeRange?: { start: Date; end: Date }) {
    // Implementation would use proper Drizzle queries
    return {
      totalPageViews: 0,
      uniquePages: 0,
      averageTimeOnPage: 0,
      bounceRate: 0,
      popularPages: []
    };
  }

  private async getUserInteractions(userId: string, timeRange?: { start: Date; end: Date }) {
    return {
      totalInteractions: 0,
      interactionTypes: {},
      conversionEvents: 0,
      engagementScore: 0
    };
  }

  private async getToolUsagePatterns(userId: string, timeRange?: { start: Date; end: Date }) {
    return {
      toolsUsed: [],
      totalUsageTime: 0,
      completionRates: {},
      satisfactionScores: {}
    };
  }

  private async getAIInteractionPatterns(userId: string, timeRange?: { start: Date; end: Date }) {
    return {
      totalInteractions: 0,
      averageResponseTime: 0,
      satisfactionScore: 0,
      improvementAreas: []
    };
  }

  private async getFinancialDataPatterns(userId: string, timeRange?: { start: Date; end: Date }) {
    return {
      dataPoints: 0,
      categories: {},
      confidenceLevel: 0,
      verificationRate: 0
    };
  }
}

export const analyticsDataCollectionService = new AnalyticsDataCollectionService();
export default analyticsDataCollectionService;