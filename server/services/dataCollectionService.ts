import { db } from '../db';
import { 
  userSessions, 
  pageAnalytics, 
  interactionEvents,
  financialData,
  toolUsage,
  aiInteractions,
  communityEngagement,
  gamificationData,
  errorTracking,
  reportingAnalytics
} from '@shared/schema';

export class DataCollectionService {
  // Collect page view data
  async trackPageView(userId: string, pageData: any) {
    try {
      await db.insert(pageAnalytics).values({
        userId,
        pageUrl: pageData.url || '/',
        pageTitle: pageData.title || 'Unknown Page',
        entryTime: new Date(),
        exitTime: null,
        timeSpent: 0,
        scrollDepth: 0,
        deviceInfo: pageData.deviceInfo || {},
        referrer: pageData.referrer
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking page view:', error);
      return { success: false, error };
    }
  }

  // Collect interaction events
  async trackInteraction(userId: string, eventData: any) {
    try {
      await db.insert(interactionEvents).values({
        userId,
        eventType: eventData.type,
        eventTarget: eventData.target,
        eventValue: eventData.value,
        pageUrl: eventData.pageUrl,
        timestamp: new Date(),
        metadata: eventData.metadata || {}
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking interaction:', error);
      return { success: false, error };
    }
  }

  // Collect financial data
  async collectFinancialData(userId: string, data: any) {
    try {
      await db.insert(financialData).values({
        userId,
        dataType: data.type,
        income: data.income,
        expenses: data.expenses,
        savings: data.savings,
        investments: data.investments,
        debts: data.debts,
        goals: data.goals || {},
        riskTolerance: data.riskTolerance,
        preferences: data.preferences || {},
        timestamp: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error collecting financial data:', error);
      return { success: false, error };
    }
  }

  // Track tool usage
  async trackToolUsage(userId: string, toolData: any) {
    try {
      await db.insert(toolUsage).values({
        userId,
        toolName: toolData.name,
        feature: toolData.feature,
        startTime: new Date(toolData.startTime),
        endTime: toolData.endTime ? new Date(toolData.endTime) : null,
        duration: toolData.duration || 0,
        completionRate: toolData.completionRate || 0,
        outcome: toolData.outcome,
        feedback: toolData.feedback
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking tool usage:', error);
      return { success: false, error };
    }
  }

  // Track AI interactions
  async trackAIInteraction(userId: string, interactionData: any) {
    try {
      await db.insert(aiInteractions).values({
        userId,
        modelName: interactionData.modelName,
        interactionType: interactionData.type || 'chat',
        prompt: interactionData.prompt,
        response: interactionData.response,
        confidence: interactionData.confidence,
        sentiment: interactionData.sentiment,
        feedback: interactionData.feedback,
        responseTime: interactionData.responseTime || 0,
        tokensUsed: interactionData.tokensUsed || 0,
        cost: interactionData.cost || '0',
        timestamp: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking AI interaction:', error);
      return { success: false, error };
    }
  }

  // Track community engagement
  async trackCommunityEngagement(userId: string, engagementData: any) {
    try {
      await db.insert(communityEngagement).values({
        userId,
        activityType: engagementData.type,
        contentId: engagementData.contentId,
        contentType: engagementData.contentType,
        action: engagementData.action,
        value: engagementData.value,
        reputation: engagementData.reputation || 0,
        timestamp: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking community engagement:', error);
      return { success: false, error };
    }
  }

  // Track gamification data
  async trackGamification(userId: string, gameData: any) {
    try {
      await db.insert(gamificationData).values({
        userId,
        gameType: gameData.type,
        level: gameData.level || 1,
        points: gameData.points || 0,
        achievements: gameData.achievements || [],
        challenges: gameData.challenges || [],
        rewards: gameData.rewards || [],
        streakDays: gameData.streakDays || 0,
        timestamp: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking gamification:', error);
      return { success: false, error };
    }
  }

  // Track errors
  async trackError(errorData: any) {
    try {
      await db.insert(errorTracking).values({
        userId: errorData.userId,
        errorType: errorData.type,
        errorMessage: errorData.message,
        errorStack: errorData.stack,
        pageUrl: errorData.pageUrl,
        userAgent: errorData.userAgent,
        severity: errorData.severity || 'medium',
        resolved: false,
        timestamp: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking error:', error);
      return { success: false, error };
    }
  }

  // Get aggregated user data for admin panel
  async getUserAnalytics(userId: string) {
    try {
      // Get all user data from various tables
      const [pages, interactions, financial, tools, ai, community, games] = await Promise.all([
        db.select().from(pageAnalytics).where(eq(pageAnalytics.userId, userId)).limit(100),
        db.select().from(interactionEvents).where(eq(interactionEvents.userId, userId)).limit(100),
        db.select().from(financialData).where(eq(financialData.userId, userId)).limit(10),
        db.select().from(toolUsage).where(eq(toolUsage.userId, userId)).limit(50),
        db.select().from(aiInteractions).where(eq(aiInteractions.userId, userId)).limit(50),
        db.select().from(communityEngagement).where(eq(communityEngagement.userId, userId)).limit(50),
        db.select().from(gamificationData).where(eq(gamificationData.userId, userId)).limit(10)
      ]);

      return {
        pageViews: pages.length,
        interactions: interactions.length,
        financialDataPoints: financial.length,
        toolsUsed: tools.length,
        aiInteractions: ai.length,
        communityEngagements: community.length,
        gamificationLevel: games[0]?.level || 0,
        totalPoints: games.reduce((sum, g) => sum + (g.points || 0), 0),
        data: {
          pages,
          interactions,
          financial,
          tools,
          ai,
          community,
          games
        }
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  // Get system-wide analytics for admin dashboard
  async getSystemAnalytics() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get counts from all tables
      const [
        totalPages,
        totalInteractions,
        totalAI,
        totalErrors,
        recentPages,
        recentAI
      ] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(pageAnalytics),
        db.select({ count: sql`count(*)` }).from(interactionEvents),
        db.select({ count: sql`count(*)` }).from(aiInteractions),
        db.select({ count: sql`count(*)` }).from(errorTracking),
        db.select({ count: sql`count(*)` }).from(pageAnalytics).where(gte(pageAnalytics.entryTime, oneDayAgo)),
        db.select({ count: sql`count(*)` }).from(aiInteractions).where(gte(aiInteractions.timestamp, oneDayAgo))
      ]);

      return {
        totalPageViews: totalPages[0]?.count || 0,
        totalInteractions: totalInteractions[0]?.count || 0,
        totalAIInteractions: totalAI[0]?.count || 0,
        totalErrors: totalErrors[0]?.count || 0,
        dailyPageViews: recentPages[0]?.count || 0,
        dailyAIInteractions: recentAI[0]?.count || 0,
        timestamp: now
      };
    } catch (error) {
      console.error('Error getting system analytics:', error);
      return null;
    }
  }
}

// Import necessary functions
import { eq, gte, sql } from 'drizzle-orm';

export const dataCollectionService = new DataCollectionService();