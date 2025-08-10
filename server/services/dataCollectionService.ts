import { db } from '../db';
import { 
  userSessions, 
  pageAnalytics, 
  userInteractionEvents,
  chatMessages
} from '@shared/schema';

export class DataCollectionService {
  // Collect page view data
  async trackPageView(userId: string, pageData: any) {
    try {
      await db.insert(pageAnalytics).values({
        id: `page_${Date.now()}_${userId}`,
        pagePath: pageData.url || '/',
        sessionId: `session_${userId}`,
        userAgent: pageData.userAgent || '',
        timestamp: new Date(),
        metadata: {
          pageTitle: pageData.title || 'Unknown Page',
          deviceInfo: pageData.deviceInfo || {},
          referrer: pageData.referrer
        }
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
      await db.insert(userInteractionEvents).values({
        id: `event_${Date.now()}_${userId}`,
        userId,
        eventType: eventData.type,
        elementId: eventData.target,
        pageUrl: eventData.pageContext?.url || '/',
        timestamp: new Date(),
        metadata: {
          eventValue: eventData.value,
          pageContext: eventData.pageContext || {},
          sessionContext: eventData.sessionContext || {}
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking interaction:', error);
      return { success: false, error };
    }
  }

  // Collect financial data - simplified version
  async collectFinancialData(userId: string, data: any) {
    try {
      // For now, store in chat messages as metadata since we don't have financial data table
      await db.insert(chatMessages).values({
        id: `financial_${Date.now()}_${userId}`,
        advisorSessionId: `financial_session_${userId}`,
        sender: 'user',
        content: 'Financial data collected',
        timestamp: new Date(),
        metadata: data
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error collecting financial data:', error);
      return { success: false, error };
    }
  }

  // Track tool usage - simplified
  async trackToolUsage(userId: string, toolData: any) {
    try {
      await db.insert(chatMessages).values({
        id: `tool_${Date.now()}_${userId}`,
        advisorSessionId: `tool_session_${userId}`,
        sender: 'system',
        content: `Tool usage: ${toolData.name}`,
        timestamp: new Date(),
        metadata: toolData
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
      await db.insert(chatMessages).values({
        id: `ai_${Date.now()}_${userId}`,
        advisorSessionId: interactionData.sessionId || `session_${userId}`,
        sender: 'assistant',
        content: interactionData.response || '',
        timestamp: new Date(),
        metadata: {
          modelName: interactionData.modelName,
          interactionType: interactionData.type || 'chat',
          prompt: interactionData.prompt,
          confidence: interactionData.confidence,
          sentiment: interactionData.sentiment,
          feedback: interactionData.feedback,
          responseTime: interactionData.responseTime || 0,
          tokensUsed: interactionData.tokensUsed || 0,
          cost: interactionData.cost || '0'
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking AI interaction:', error);
      return { success: false, error };
    }
  }

  // Track community engagement - simplified
  async trackCommunityEngagement(userId: string, engagementData: any) {
    try {
      await db.insert(chatMessages).values({
        id: `community_${Date.now()}_${userId}`,
        advisorSessionId: `community_session_${userId}`,
        sender: 'system',
        content: `Community activity: ${engagementData.type}`,
        timestamp: new Date(),
        metadata: engagementData
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking community engagement:', error);
      return { success: false, error };
    }
  }

  // Track gamification data - simplified
  async trackGamificationData(userId: string, gameData: any) {
    try {
      await db.insert(chatMessages).values({
        id: `game_${Date.now()}_${userId}`,
        advisorSessionId: `game_session_${userId}`,
        sender: 'system',
        content: `Game activity: ${gameData.type}`,
        timestamp: new Date(),
        metadata: gameData
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking gamification data:', error);
      return { success: false, error };
    }
  }

  // Track errors - simplified
  async trackError(userId: string, errorData: any) {
    try {
      await db.insert(chatMessages).values({
        id: `error_${Date.now()}_${userId}`,
        advisorSessionId: `error_session_${userId}`,
        sender: 'system',
        content: `Error: ${errorData.message}`,
        timestamp: new Date(),
        metadata: errorData
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking error:', error);
      return { success: false, error };
    }
  }

  // Get aggregated analytics data
  async getAnalyticsData(userId: string) {
    try {
      const totalSessions = await db.select().from(userSessions);
      const totalPageViews = await db.select().from(pageAnalytics);
      const totalInteractions = await db.select().from(userInteractionEvents);
      const totalChats = await db.select().from(chatMessages);
      
      return {
        success: true,
        data: {
          totalSessions: totalSessions.length,
          totalPageViews: totalPageViews.length,
          totalInteractions: totalInteractions.length,
          totalChats: totalChats.length,
          avgSessionDuration: 0,
          avgPageTimeSpent: 0
        }
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return {
        success: false,
        error,
        data: {
          totalSessions: 0,
          totalPageViews: 0,
          totalInteractions: 0,
          totalChats: 0,
          avgSessionDuration: 0,
          avgPageTimeSpent: 0
        }
      };
    }
  }
}