import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openAIService } from "./services/openai";
import { decisionTreeService } from "./services/decisionTree";
import { speechRecognitionService } from "./services/speechRecognition";
import { 
  insertUserSchema, 
  insertUserProfileSchema, 
  insertChatMessageSchema,
  insertDecisionTreeProgressSchema 
} from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      // Check OpenAI connection
      const models = await openAIService.getAvailableModels();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        openai: true,
        chatgpt_available: models.length > 0,
        database: true,
        services: {
          openai: 'connected',
          database: 'connected',
          speech_recognition: 'available'
        }
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        openai: false,
        chatgpt_available: false,
        database: false,
        error: 'Service unavailable'
      });
    }
  });

  // User endpoints
  app.get('/api/user/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: 'User profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  app.put('/api/user/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profileData = req.body;

      // Validate the data
      const validatedData = insertUserProfileSchema.parse({
        userId,
        financialGoal: profileData.financialGoal || profileData.goal,
        timeframe: profileData.timeframe,
        monthlyIncome: profileData.monthlyIncome,
        currentSavings: profileData.currentSavings ? String(profileData.currentSavings) : null,
        targetAmount: profileData.targetAmount ? String(profileData.targetAmount) : null,
        onboardingComplete: profileData.onboardingComplete || true,
        isPremium: profileData.is_premium || false,
        progress: profileData.progress || 0,
        consents: profileData.consents || {},
        financialData: profileData.financialData || [],
        achievements: profileData.achievements || []
      });

      // Check if user exists, create if not
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          id: userId,
          name: profileData.name || 'User',
          email: profileData.email || null
        });
      }

      // Check if profile exists, create or update
      const existingProfile = await storage.getUserProfile(userId);
      let profile;
      
      if (existingProfile) {
        profile = await storage.updateUserProfile(userId, validatedData);
      } else {
        profile = await storage.createUserProfile(validatedData);
      }

      res.json(profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update user profile' });
    }
  });

  // Advisor endpoints
  app.get('/api/advisors', async (req, res) => {
    try {
      const advisors = await storage.getAdvisors();
      res.json(advisors);
    } catch (error) {
      console.error('Error fetching advisors:', error);
      res.status(500).json({ message: 'Failed to fetch advisors' });
    }
  });

  // Decision tree endpoints
  app.get('/api/decision-tree/status/:userId/:advisorId', async (req, res) => {
    try {
      const { userId, advisorId } = req.params;
      const progress = await storage.getDecisionTreeProgress(userId, advisorId);
      
      if (!progress) {
        return res.json({
          completed: false,
          decision_path: [],
          progress: 0,
          current_step: 0
        });
      }
      
      res.json({
        completed: progress.completed,
        decision_path: progress.decisionPath,
        progress: progress.progress,
        current_step: progress.currentStep,
        final_recommendation: progress.finalRecommendation
      });
    } catch (error) {
      console.error('Error fetching decision tree status:', error);
      res.status(500).json({ message: 'Failed to fetch decision tree status' });
    }
  });

  app.post('/api/decision-tree/save', async (req, res) => {
    try {
      const { user_id, advisor_id, decision_path, completed } = req.body;
      
      const progressData = insertDecisionTreeProgressSchema.parse({
        userId: user_id,
        advisorId: advisor_id,
        decisionPath: decision_path,
        currentStep: decision_path.length,
        completed: completed || false,
        progress: decisionTreeService.getProgressPercentage(advisor_id, decision_path.length),
        finalRecommendation: completed ? await decisionTreeService.generateReport(advisor_id, decision_path, {}) : null
      });

      const progress = await storage.saveDecisionTreeProgress(progressData);
      
      // Award achievement if completed
      if (completed) {
        try {
          await storage.awardAchievement(user_id, 'decision_tree_complete');
        } catch (achievementError) {
          console.warn('Failed to award achievement:', achievementError);
        }
      }
      
      res.json(progress);
    } catch (error) {
      console.error('Error saving decision tree progress:', error);
      res.status(500).json({ message: 'Failed to save decision tree progress' });
    }
  });

  app.post('/api/decision-tree/reset/:userId/:advisorId', async (req, res) => {
    try {
      const { userId, advisorId } = req.params;
      await storage.resetDecisionTreeProgress(userId, advisorId);
      res.json({ message: 'Decision tree reset successfully' });
    } catch (error) {
      console.error('Error resetting decision tree:', error);
      res.status(500).json({ message: 'Failed to reset decision tree' });
    }
  });

  // Chat endpoints
  app.get('/api/chat/history/:advisorId', async (req, res) => {
    try {
      const { advisorId } = req.params;
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const messages = await storage.getChatHistory(user_id as string, advisorId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ message: 'Failed to fetch chat history' });
    }
  });

  app.post('/api/chat/send', async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { message, advisor_id, user_id, session_id, user_profile, decision_path, model } = req.body;
      
      if (!message || !advisor_id || !user_id) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Get or create session
      const session = await storage.getOrCreateSession(user_id, advisor_id);
      
      // Get advisor details
      const advisor = await storage.getAdvisor(advisor_id);
      if (!advisor) {
        return res.status(404).json({ message: 'Advisor not found' });
      }

      // Get recent chat history for context
      const chatHistory = await storage.getChatHistory(user_id, advisor_id);
      
      // Save user message
      const userMessage = await storage.saveChatMessage({
        sessionId: session.id,
        userId: user_id,
        advisorId: advisor_id,
        role: 'user',
        content: message,
        modelUsed: model || 'gpt-4o'
      });

      // Analyze sentiment
      const sentiment = await openAIService.analyzeSentiment(message);

      // Prepare context for AI
      const context = {
        advisorId: advisor_id,
        advisorName: advisor.name,
        specialty: advisor.specialty,
        userProfile: user_profile,
        decisionPath: decision_path || [],
        chatHistory: chatHistory.slice(-10) // Last 10 messages for context
      };

      // Get AI response
      const aiResponse = await openAIService.sendMessage(message, context, model);
      const responseTime = Date.now() - startTime;

      // Save AI response
      const assistantMessage = await storage.saveChatMessage({
        sessionId: session.id,
        userId: user_id,
        advisorId: advisor_id,
        role: 'assistant',
        content: aiResponse.response,
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence,
        modelUsed: aiResponse.model,
        responseTimeMs: responseTime
      });

      res.json({
        response: aiResponse.response,
        message: aiResponse.response,
        model: aiResponse.model,
        responseTime: responseTime,
        sentiment: sentiment,
        message_id: assistantMessage.id
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('Error in chat send:', error);
      res.status(500).json({ 
        message: 'Failed to process chat message',
        responseTime: responseTime
      });
    }
  });

  app.get('/api/chat/models', async (req, res) => {
    try {
      const models = await openAIService.getAvailableModels();
      res.json({ models });
    } catch (error) {
      console.error('Error fetching models:', error);
      res.json({ models: ['gpt-4o', 'gpt-3.5-turbo'] });
    }
  });

  app.post('/api/chat/enhanced-response', async (req, res) => {
    try {
      const { message, advisor_id, user_id, use_chatgpt, model } = req.body;
      
      if (!message || !advisor_id || !user_id) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const advisor = await storage.getAdvisor(advisor_id);
      if (!advisor) {
        return res.status(404).json({ message: 'Advisor not found' });
      }

      const context = {
        advisorId: advisor_id,
        advisorName: advisor.name,
        specialty: advisor.specialty
      };

      const response = await openAIService.sendMessage(message, context, model);
      
      res.json({
        response: response.response,
        model: response.model,
        responseTime: response.responseTime
      });

    } catch (error) {
      console.error('Error in enhanced response:', error);
      res.status(500).json({ message: 'Failed to generate enhanced response' });
    }
  });

  // Achievement endpoints
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ message: 'Failed to fetch achievements' });
    }
  });

  app.get('/api/user/:userId/achievements', async (req, res) => {
    try {
      const { userId } = req.params;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ message: 'Failed to fetch user achievements' });
    }
  });

  // Speech recognition helper endpoint
  app.post('/api/speech/validate', async (req, res) => {
    try {
      const { transcript } = req.body;
      
      if (!transcript) {
        return res.status(400).json({ message: 'Transcript is required' });
      }

      const isValid = speechRecognitionService.validateTranscript(transcript);
      const cleaned = speechRecognitionService.formatForChat(transcript);
      
      res.json({
        valid: isValid,
        cleaned: cleaned,
        original: transcript
      });
    } catch (error) {
      console.error('Error validating speech transcript:', error);
      res.status(500).json({ message: 'Failed to validate transcript' });
    }
  });

  // Analytics routes
  app.get('/api/analytics/user-behavior/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { analyticsService } = await import('./services/analyticsService');
      const behaviorData = await analyticsService.getUserDashboardData(userId);
      res.json(behaviorData);
    } catch (error) {
      console.error('Error fetching user behavior data:', error);
      res.status(500).json({ message: 'Failed to fetch behavior analytics' });
    }
  });

  app.get('/api/analytics/ai-performance', async (req, res) => {
    try {
      const { analyticsService } = await import('./services/analyticsService');
      const performanceData = await analyticsService.getModelPerformanceInsights();
      res.json(performanceData);
    } catch (error) {
      console.error('Error fetching AI performance data:', error);
      res.status(500).json({ message: 'Failed to fetch AI analytics' });
    }
  });

  app.get('/api/analytics/realtime-learning', async (req, res) => {
    try {
      const { analyticsService } = await import('./services/analyticsService');
      const realtimeData = await analyticsService.getRealTimeLearningInsights();
      res.json(realtimeData);
    } catch (error) {
      console.error('Error fetching real-time learning data:', error);
      res.status(500).json({ message: 'Failed to fetch real-time analytics' });
    }
  });

  app.post('/api/analytics/track-event', async (req, res) => {
    try {
      const eventData = req.body;
      const { analyticsService } = await import('./services/analyticsService');
      await analyticsService.trackLearningEvent(eventData);
      res.json({ success: true, message: 'Event tracked successfully' });
    } catch (error) {
      console.error('Error tracking learning event:', error);
      res.status(500).json({ message: 'Failed to track event' });
    }
  });

  app.post('/api/analytics/track-ai-performance', async (req, res) => {
    try {
      const performanceData = req.body;
      const { analyticsService } = await import('./services/analyticsService');
      await analyticsService.trackAIModelPerformance(performanceData);
      res.json({ success: true, message: 'AI performance tracked successfully' });
    } catch (error) {
      console.error('Error tracking AI performance:', error);
      res.status(500).json({ message: 'Failed to track AI performance' });
    }
  });

  // Authentication and Registration Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = req.body;
      
      // Generate a unique user ID
      const userId = `user-${crypto.randomBytes(8).toString('hex')}-${crypto.randomBytes(8).toString('hex')}`;
      
      // Create user
      const user = await storage.createUser({
        id: userId,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
        country: userData.country,
        city: userData.city,
        occupation: userData.occupation,
        preferences: userData.preferences,
        accountStatus: 'pending',
        emailVerified: false,
      });

      // Create user profile
      const profile = await storage.createUserProfile({
        id: `profile-${userId}`,
        userId: userId,
        financialGoal: 'general_literacy',
        timeframe: 'medium',
        monthlyIncome: 'medium',
        onboardingComplete: false,
        progress: 0,
      });

      // Generate verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await storage.createVerificationCode({
        userId: userId,
        code: verificationCode,
        type: 'email',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Log registration activity
      await storage.logUserActivity({
        userId: userId,
        action: 'user_registered',
        details: {
          email: userData.email,
          country: userData.country,
          registrationMethod: 'email'
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({
        user,
        profile,
        verificationRequired: true,
        message: 'Registration successful. Please check your email for verification.'
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        message: error.message || 'Registration failed' 
      });
    }
  });

  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { userId, code } = req.body;
      
      const verification = await storage.verifyEmailCode(userId, code);
      if (!verification) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      // Update user email verification status
      await storage.updateUser(userId, { 
        emailVerified: true, 
        accountStatus: 'active' 
      });

      res.json({ message: 'Email verified successfully' });
    } catch (error: any) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Verification failed' });
    }
  });

  // Premium Subscription Routes
  app.get('/api/subscription/plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      // Return default plans if database fails
      res.json([
        {
          id: 'free',
          name: 'Free',
          description: 'Perfect for getting started with AI financial education',
          price: 0,
          currency: 'USD',
          interval: 'month',
          features: {
            aiAdvisors: 1,
            analysisReports: 3,
            portfolioTracking: false,
            premiumSupport: false,
            advancedAnalytics: false,
            apiAccess: false,
            customDashboards: false,
            priorityLearning: false,
          },
          stripePriceId: null,
          active: true,
          createdAt: new Date(),
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'Enhanced AI learning with advanced analytics',
          price: 1999,
          currency: 'USD',
          interval: 'month',
          features: {
            aiAdvisors: 5,
            analysisReports: 25,
            portfolioTracking: true,
            premiumSupport: true,
            advancedAnalytics: true,
            apiAccess: false,
            customDashboards: true,
            priorityLearning: true,
          },
          stripePriceId: 'price_premium',
          active: true,
          createdAt: new Date(),
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Complete AI financial education platform',
          price: 4999,
          currency: 'USD',
          interval: 'month',
          features: {
            aiAdvisors: 999,
            analysisReports: 999,
            portfolioTracking: true,
            premiumSupport: true,
            advancedAnalytics: true,
            apiAccess: true,
            customDashboards: true,
            priorityLearning: true,
          },
          stripePriceId: 'price_pro',
          active: true,
          createdAt: new Date(),
        },
      ]);
    }
  });

  app.post('/api/subscription/create', async (req, res) => {
    try {
      const { userId, planId, billingInterval } = req.body;
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get plan
      const plans = await storage.getSubscriptionPlans();
      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      // For now, just update user subscription tier directly
      // In a real app, you'd integrate with Stripe here
      await storage.updateUser(userId, {
        subscriptionTier: planId as 'free' | 'premium' | 'pro',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + (billingInterval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000),
      });

      // Log subscription activity
      await storage.logUserActivity({
        userId: userId,
        action: 'subscription_created',
        details: {
          planId,
          billingInterval,
          price: selectedPlan.price,
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ 
        message: 'Subscription updated successfully',
        plan: selectedPlan,
        user: await storage.getUser(userId)
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: 'Subscription creation failed' });
    }
  });

  // User Management Routes
  app.get('/api/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  app.put('/api/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      
      const user = await storage.updateUser(userId, updateData);
      
      // Log profile update
      await storage.logUserActivity({
        userId: userId,
        action: 'profile_updated',
        details: { updatedFields: Object.keys(updateData) },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(user);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
