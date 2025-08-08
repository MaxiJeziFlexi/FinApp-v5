import { Router } from 'express';
import { analyticsService } from '../services/analyticsService';
import { aiMetricsService } from '../services/aiMetricsService';

const router = Router();

// Enhanced data collection endpoints for AI model training
export function setupDataCollectionRoutes(app: any) {
  
  // Comprehensive AI interaction tracking
  app.post('/api/data-collection/ai-interaction', async (req, res) => {
    try {
      const { userId, modelName, prompt, response, metrics } = req.body;
      
      // Store detailed AI interaction data
      const interactionData = {
        userId,
        modelName,
        prompt: prompt.substring(0, 1000), // Limit prompt length for storage
        responseLength: response.length,
        responseTime: metrics.responseTime,
        tokensUsed: metrics.tokensUsed,
        cost: metrics.cost,
        accuracy: metrics.accuracy,
        userRating: metrics.userRating,
        timestamp: new Date().toISOString(),
        sessionId: req.headers['x-session-id'],
        userAgent: req.headers['user-agent'],
        ip: req.ip
      };
      
      await analyticsService.trackEvent(userId, 'detailed_ai_interaction', interactionData);
      
      res.json({ 
        success: true, 
        message: 'AI interaction data collected',
        dataId: `ai_${Date.now()}`
      });
    } catch (error) {
      console.error('Error collecting AI interaction data:', error);
      res.status(500).json({ error: 'Failed to collect AI interaction data' });
    }
  });

  // User behavior pattern collection
  app.post('/api/data-collection/user-behavior', async (req, res) => {
    try {
      const { userId, sessionData, learningPatterns, preferences } = req.body;
      
      const behaviorData = {
        userId,
        sessionDuration: sessionData.duration,
        pagesVisited: sessionData.pages,
        interactions: sessionData.interactions,
        learningStyle: learningPatterns.style,
        preferredTopics: learningPatterns.topics,
        completionRate: learningPatterns.completionRate,
        engagementScore: learningPatterns.engagementScore,
        riskTolerance: preferences.riskTolerance,
        communicationStyle: preferences.communicationStyle,
        deviceType: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      await analyticsService.trackEvent(userId, 'user_behavior_pattern', behaviorData);
      
      res.json({ 
        success: true, 
        message: 'User behavior data collected',
        patterns: behaviorData
      });
    } catch (error) {
      console.error('Error collecting user behavior data:', error);
      res.status(500).json({ error: 'Failed to collect user behavior data' });
    }
  });

  // Financial data collection for AI training
  app.post('/api/data-collection/financial-data', async (req, res) => {
    try {
      const { userId, financialData, goals, risk_profile } = req.body;
      
      const enhancedFinancialData = {
        userId,
        income: financialData.income,
        expenses: financialData.expenses,
        assets: financialData.assets,
        debts: financialData.debts,
        goals: goals,
        riskProfile: risk_profile,
        creditScore: financialData.creditScore,
        investmentExperience: financialData.investmentExperience,
        timestamp: new Date().toISOString(),
        dataVersion: '2.0'
      };
      
      await analyticsService.trackEvent(userId, 'financial_profile_data', enhancedFinancialData);
      
      res.json({ 
        success: true, 
        message: 'Financial data collected for AI training',
        profileScore: Math.random() * 100 // Placeholder for actual profile scoring
      });
    } catch (error) {
      console.error('Error collecting financial data:', error);
      res.status(500).json({ error: 'Failed to collect financial data' });
    }
  });

  // Decision tree outcomes collection
  app.post('/api/data-collection/decision-outcomes', async (req, res) => {
    try {
      const { userId, decisionTreeId, outcomes, effectiveness } = req.body;
      
      const outcomeData = {
        userId,
        decisionTreeId,
        selectedPaths: outcomes.paths,
        finalRecommendation: outcomes.recommendation,
        userSatisfaction: effectiveness.satisfaction,
        actionTaken: effectiveness.actionTaken,
        resultAfter30Days: effectiveness.result30Days,
        improvementMeasured: effectiveness.improvement,
        timestamp: new Date().toISOString()
      };
      
      await analyticsService.trackEvent(userId, 'decision_tree_outcome', outcomeData);
      
      res.json({ 
        success: true, 
        message: 'Decision outcome data collected',
        effectivenessScore: effectiveness.satisfaction
      });
    } catch (error) {
      console.error('Error collecting decision outcome data:', error);
      res.status(500).json({ error: 'Failed to collect decision outcome data' });
    }
  });

  // AI model performance feedback collection
  app.post('/api/data-collection/model-feedback', async (req, res) => {
    try {
      const { modelName, performance, userFeedback, systemMetrics } = req.body;
      
      const feedbackData = {
        modelName,
        accuracy: performance.accuracy,
        responseTime: performance.responseTime,
        successRate: performance.successRate,
        userRating: userFeedback.rating,
        userComments: userFeedback.comments,
        reportedIssues: userFeedback.issues,
        cpuUsage: systemMetrics.cpu,
        memoryUsage: systemMetrics.memory,
        throughput: systemMetrics.throughput,
        timestamp: new Date().toISOString()
      };
      
      await aiMetricsService.logModelPerformance(modelName, feedbackData);
      
      res.json({ 
        success: true, 
        message: 'Model feedback collected',
        feedbackId: `feedback_${Date.now()}`
      });
    } catch (error) {
      console.error('Error collecting model feedback:', error);
      res.status(500).json({ error: 'Failed to collect model feedback' });
    }
  });

  // Bulk data export for AI training
  app.get('/api/data-collection/export/:dataType', async (req, res) => {
    try {
      const { dataType } = req.params;
      const { startDate, endDate, format = 'json' } = req.query;
      
      // This would typically query database for training data
      const exportData = {
        dataType,
        dateRange: { start: startDate, end: endDate },
        format,
        recordCount: Math.floor(Math.random() * 10000), // Placeholder
        exportedAt: new Date().toISOString(),
        message: 'Data export prepared for AI model training'
      };
      
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting training data:', error);
      res.status(500).json({ error: 'Failed to export training data' });
    }
  });

  // Real-time data streaming for live AI training
  app.get('/api/data-collection/live-stream/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Set up SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      
      // Send initial data
      res.write(`data: ${JSON.stringify({
        type: 'connection',
        userId,
        timestamp: new Date().toISOString(),
        message: 'Live data stream connected'
      })}\n\n`);
      
      // Set up interval for live data
      const interval = setInterval(() => {
        const liveData = {
          type: 'live_metrics',
          userId,
          metrics: {
            activeUsers: Math.floor(Math.random() * 100),
            aiRequests: Math.floor(Math.random() * 50),
            systemLoad: Math.random() * 100
          },
          timestamp: new Date().toISOString()
        };
        
        res.write(`data: ${JSON.stringify(liveData)}\n\n`);
      }, 5000);
      
      // Clean up on client disconnect
      req.on('close', () => {
        clearInterval(interval);
      });
      
    } catch (error) {
      console.error('Error setting up live data stream:', error);
      res.status(500).json({ error: 'Failed to set up live data stream' });
    }
  });
}

export default router;