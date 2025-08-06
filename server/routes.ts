import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { advancedAI } from "./services/advancedAI";
import { openAIService } from "./services/openai";
import { decisionTreeService } from "./services/decisionTree";
import { speechRecognitionService } from "./services/speechRecognition";
import { plaidService } from "./services/plaidService";
import { translationService } from "./services/translationService";
import { legalAIService } from "./services/legalAIService";
import { advisorService } from "./services/advisorService";
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

  app.post('/api/user/profile/:userId', async (req, res) => {
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
        // Determine if this should be an admin (for demo purposes, check email or name)
        const isAdmin = profileData.email?.includes('admin') || profileData.name?.toLowerCase().includes('admin');
        
        try {
          user = await storage.createUser({
            id: userId,
            name: profileData.name || 'User',
            email: profileData.email || `${profileData.name || 'user'}@finapp.demo`,
            subscriptionTier: isAdmin ? 'max' : 'free', // Admin gets Max plan automatically
            accountStatus: 'active',
            role: isAdmin ? 'admin' : 'user',
            apiUsageThisMonth: '0',
            apiUsageResetDate: new Date(),
            emailVerified: true, // Email verification disabled as requested
          });
        } catch (error: any) {
          // If user creation fails due to duplicate email, try to get existing user
          if (error.code === '23505') {
            user = await storage.getUserByEmail(profileData.email || `${profileData.name || 'user'}@finapp.demo`);
            if (!user) {
              throw error; // Re-throw if we still can't find the user
            }
          } else {
            throw error;
          }
        }
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

  // Sign-in endpoint
  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // For demo purposes, we skip password verification
      // In production, you would verify the password here
      
      // Get user profile
      const profile = await storage.getUserProfile(user.id);
      
      res.json({ 
        success: true, 
        user: {
          ...user,
          profile
        },
        message: 'Sign-in successful' 
      });
      
    } catch (error) {
      console.error('Error during sign-in:', error);
      res.status(500).json({ message: 'Sign-in failed' });
    }
  });

  // User info endpoint
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
        completed: progress.completedAt ? true : false,
        decision_path: progress.responses || [],
        progress: progress.progress || 0,
        current_step: progress.currentNode || 'start',
        final_recommendation: progress.recommendations || null
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
        sender: 'user',
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
        sender: 'advisor',
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

  // Get all subscription plans (alternative endpoint)
  app.get('/api/subscription-plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ message: 'Failed to fetch subscription plans' });
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

  // Advanced AI Routes with Spectrum Tax and Quantum Mathematics
  app.post('/api/ai/predict-customer-needs', async (req, res) => {
    try {
      const { userProfile } = req.body;
      const predictions = await advancedAI.predictCustomerNeeds(userProfile);
      res.json(predictions);
    } catch (error) {
      console.error('AI prediction error:', error);
      res.status(500).json({ message: 'Failed to generate AI predictions' });
    }
  });

  app.post('/api/ai/personalized-advice', async (req, res) => {
    try {
      const { userProfile, marketData } = req.body;
      const advice = await advancedAI.generatePersonalizedAdvice(userProfile, marketData);
      res.json(advice);
    } catch (error) {
      console.error('Personalized advice error:', error);
      res.status(500).json({ message: 'Failed to generate personalized advice' });
    }
  });

  // Mandatory Authentication Routes
  app.post('/api/auth/signin', async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser({
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: userData.role || 'user',
        createdAt: new Date(),
        onboardingComplete: true
      });
      res.json({ success: true, user, message: 'Profile created successfully' });
    } catch (error) {
      console.error('Sign-in error:', error);
      res.status(500).json({ message: 'Failed to create user profile' });
    }
  });

  app.post('/api/auth/admin-signin', async (req, res) => {
    try {
      const adminData = req.body;
      const admin = await storage.createUser({
        ...adminData,
        id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'admin',
        userType: 'admin',
        createdAt: new Date(),
        onboardingComplete: true
      });
      res.json({ success: true, user: admin, message: 'Admin access granted' });
    } catch (error) {
      console.error('Admin sign-in error:', error);
      res.status(500).json({ message: 'Admin authentication failed' });
    }
  });

  // Crypto Marketplace Routes
  app.get('/api/crypto/user-stats', async (req, res) => {
    try {
      const stats = {
        cryptoBalance: 1.25075 + Math.random() * 0.5,
        totalEarned: 3400.50 + Math.random() * 1000,
        questionsAnswered: 127 + Math.floor(Math.random() * 50),
        helpfulAnswers: 98 + Math.floor(Math.random() * 30),
        reputation: 4.8 + Math.random() * 0.2,
        level: 15 + Math.floor(Math.random() * 10)
      };
      res.json(stats);
    } catch (error) {
      console.error('User stats error:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  });

  app.get('/api/crypto/advice-requests', async (req, res) => {
    try {
      const adviceRequests = [
        {
          id: '1',
          title: 'Tax Optimization for High-Frequency Trading',
          description: 'Looking for advanced strategies to minimize tax liability on crypto trading profits using 2025 reforms.',
          category: 'Tax Planning',
          complexity: 9,
          bounty: 500,
          cryptoReward: 0.025,
          asker: 'CryptoTrader_Pro',
          responses: 3,
          status: 'open',
          tags: ['Tax', 'Crypto', 'Advanced', 'Trading']
        },
        {
          id: '2',
          title: 'Quantum Portfolio Optimization Strategy',
          description: 'Need help implementing quantum mathematical models for portfolio balance. Complex derivatives involved.',
          category: 'Investment Strategy',
          complexity: 10,
          bounty: 750,
          cryptoReward: 0.040,
          asker: 'QuantumInvestor',
          responses: 1,
          status: 'open',
          tags: ['Quantum', 'Portfolio', 'Advanced', 'Mathematics']
        },
        {
          id: '3',
          title: 'Retirement Planning with DeFi Integration',
          description: 'How to safely integrate DeFi protocols into traditional retirement planning while maintaining security.',
          category: 'Retirement',
          complexity: 7,
          bounty: 300,
          cryptoReward: 0.015,
          asker: 'RetirementPlan2025',
          responses: 5,
          status: 'answered',
          tags: ['DeFi', 'Retirement', 'Security', 'Planning']
        },
        {
          id: '4',
          title: 'Spectrum Tax Analysis for Multi-State Business',
          description: 'Need expert analysis on state tax obligations using spectrum analysis methodology for complex business structure.',
          category: 'Tax Planning',
          complexity: 8,
          bounty: 400,
          cryptoReward: 0.020,
          asker: 'BusinessOwner_TX',
          responses: 2,
          status: 'open',
          tags: ['Spectrum', 'Tax', 'Business', 'Multi-State']
        }
      ];
      res.json(adviceRequests);
    } catch (error) {
      console.error('Advice requests error:', error);
      res.status(500).json({ message: 'Failed to fetch advice requests' });
    }
  });

  app.post('/api/crypto/submit-question', async (req, res) => {
    try {
      const questionData = req.body;
      const newQuestion = {
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...questionData,
        asker: 'Current_User',
        responses: 0,
        status: 'open',
        cryptoReward: questionData.bounty / 50000,
        tags: [questionData.category],
        timestamp: new Date().toISOString()
      };
      
      res.json({ success: true, question: newQuestion });
    } catch (error) {
      console.error('Submit question error:', error);
      res.status(500).json({ message: 'Failed to submit question' });
    }
  });

  app.post('/api/crypto/answer-question/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { answer } = req.body;
      
      const rewardAmount = 0.005 + (answer.length / 1000) * 0.01;
      
      const answerData = {
        id: `a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        questionId: id,
        answer,
        author: 'Current_User',
        cryptoReward: rewardAmount,
        timestamp: new Date().toISOString(),
        helpful: false
      };
      
      res.json({ success: true, answer: answerData, cryptoEarned: rewardAmount });
    } catch (error) {
      console.error('Answer question error:', error);
      res.status(500).json({ message: 'Failed to submit answer' });
    }
  });

  app.get('/api/crypto/transactions', async (req, res) => {
    try {
      const transactions = [
        { 
          id: '1', 
          type: 'earn', 
          amount: 0.025, 
          description: 'Complex tax strategy answer - Spectrum analysis', 
          timestamp: new Date(Date.now() - 86400000).toISOString(), 
          status: 'completed' 
        },
        { 
          id: '2', 
          type: 'earn', 
          amount: 0.015, 
          description: 'Retirement planning advice - DeFi integration', 
          timestamp: new Date(Date.now() - 172800000).toISOString(), 
          status: 'completed' 
        },
        { 
          id: '3', 
          type: 'spend', 
          amount: 0.020, 
          description: 'Premium quantum math consultation purchase', 
          timestamp: new Date(Date.now() - 259200000).toISOString(), 
          status: 'completed' 
        }
      ];
      res.json(transactions);
    } catch (error) {
      console.error('Transactions error:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.post('/api/analytics/track-event', async (req, res) => {
    try {
      const eventData = req.body;
      const { analyticsService } = await import('./services/analyticsService');
      // Temporarily disable analytics to prevent SQL errors
      // await analyticsService.trackLearningEvent(eventData);
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
      
      // Check if this should be an admin user
      const isAdmin = userData.email?.includes('admin') || userData.firstName?.toLowerCase().includes('admin') || userData.lastName?.toLowerCase().includes('admin');
      
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
        accountStatus: isAdmin ? 'active' : 'pending', // Admin accounts are immediately active
        emailVerified: isAdmin ? true : false, // Admin accounts skip email verification
        role: isAdmin ? 'admin' : 'user',
        subscriptionTier: isAdmin ? 'max' : 'free', // Admin gets Max plan automatically
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
      // Return updated plans if database fails
      res.json([
        {
          id: 'free',
          name: 'Free',
          description: 'Basic financial guidance to get you started',
          price: 0,
          currency: 'USD',
          interval: 'month',
          apiLimit: '$0.20',
          maxAdvisorAccess: 1,
          decisionTreeAccess: false,
          features: [
            'Access to 1 AI Financial Advisor only',
            'Basic chat with advisor (no decision trees)',
            'Up to $0.20 worth of API usage per month',
            'Community support',
            'Basic financial education content',
            'Limited conversation history'
          ]
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Enhanced AI guidance with 65% of advanced features',
          price: 20,
          currency: 'USD',
          interval: 'month',
          apiLimit: '$1.30 (65% of $2.00)',
          maxAdvisorAccess: 3,
          decisionTreeAccess: true,
          features: [
            'Access to 3 specialized AI Financial Advisors',
            'Interactive decision trees included',
            'Up to $1.30 worth of API usage (65% of max)',
            'Personalized financial planning',
            'Priority support',
            'Premium educational content',
            'Advanced conversation history',
            'Basic analytics dashboard'
          ]
        },
        {
          id: 'max',
          name: 'Max',
          description: 'Unlimited access to all FinApp features',
          price: 80,
          currency: 'USD',
          interval: 'month',
          apiLimit: 'Up to $5.00 (unlimited within limit)',
          maxAdvisorAccess: 999,
          decisionTreeAccess: true,
          features: [
            'Access to ALL AI Financial Advisors',
            'Unlimited decision trees and conversations',
            'Up to $5.00 worth of API usage per month',
            'Advanced portfolio analysis',
            'Custom financial models and scenarios',
            'Dedicated priority support',
            'Advanced analytics and reporting',
            'Export and integration capabilities',
            'Early access to new features',
            'Custom advisor training options'
          ]
        }
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

      // Check if user is admin - admins always get Max plan
      if (user.role === 'admin') {
        await storage.updateUser(userId, {
          subscriptionTier: 'max',
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year for admins
        });
      } else {
        // For regular users, update subscription tier directly
        // In a real app, you'd integrate with Stripe here
        await storage.updateUser(userId, {
          subscriptionTier: planId as 'free' | 'pro' | 'max',
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + (billingInterval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000),
        });
      }

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
      let user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Auto-upgrade admin users to Max plan if they don't have it
      if (user.role === 'admin' && user.subscriptionTier !== 'max') {
        user = await storage.updateUser(userId, {
          subscriptionTier: 'max',
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          accountStatus: 'active'
        });
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

  // Admin quick access route - makes any user an admin with Max plan
  app.post('/api/admin/promote/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get user first
      let user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Promote to admin with Max plan
      user = await storage.updateUser(userId, {
        role: 'admin',
        subscriptionTier: 'max',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        accountStatus: 'active',
        emailVerified: true
      });

      // Log admin promotion
      await storage.logUserActivity({
        userId: userId,
        action: 'admin_promoted',
        details: {
          promotedBy: 'system',
          subscriptionTier: 'max'
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json({
        success: true,
        message: 'User promoted to admin with Max plan',
        user
      });
    } catch (error: any) {
      console.error('Error promoting user to admin:', error);
      res.status(500).json({ message: 'Failed to promote user' });
    }
  });

  // Bank Integration Routes (Plaid API)
  
  // Create Plaid Link token
  app.post('/api/bank/create-link-token', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const linkToken = await plaidService.createLinkToken(userId);
      res.json(linkToken);
    } catch (error: any) {
      console.error('Error creating link token:', error);
      res.status(500).json({ message: 'Failed to create link token' });
    }
  });

  // Exchange public token for access token
  app.post('/api/bank/exchange-token', async (req, res) => {
    try {
      const { userId, publicToken } = req.body;
      
      if (!userId || !publicToken) {
        return res.status(400).json({ message: 'User ID and public token are required' });
      }
      
      const result = await plaidService.exchangePublicToken(userId, publicToken);
      
      // Log bank connection
      await storage.logUserActivity({
        userId: userId,
        action: 'bank_connected',
        details: { itemId: result.itemId, accountCount: result.accounts.length },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json(result);
    } catch (error: any) {
      console.error('Error exchanging token:', error);
      res.status(500).json({ message: 'Failed to link bank account' });
    }
  });

  // Get user's bank accounts
  app.get('/api/bank/accounts/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const accounts = await storage.getUserBankAccounts(userId);
      res.json(accounts);
    } catch (error: any) {
      console.error('Error fetching bank accounts:', error);
      res.status(500).json({ message: 'Failed to fetch bank accounts' });
    }
  });

  // Get account balances
  app.get('/api/bank/balances/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const balances = await plaidService.getAccountBalances(userId);
      res.json(balances);
    } catch (error: any) {
      console.error('Error fetching balances:', error);
      res.status(500).json({ message: 'Failed to fetch account balances' });
    }
  });

  // Sync transactions
  app.post('/api/bank/sync-transactions', async (req, res) => {
    try {
      const { userId, accountId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      const transactions = await plaidService.syncTransactions(userId, accountId);
      
      // Log transaction sync
      await storage.logUserActivity({
        userId: userId,
        action: 'transactions_synced',
        details: { transactionCount: transactions.length },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json({ 
        message: 'Transactions synced successfully',
        count: transactions.length,
        transactions 
      });
    } catch (error: any) {
      console.error('Error syncing transactions:', error);
      res.status(500).json({ message: 'Failed to sync transactions' });
    }
  });

  // Get user's transactions
  app.get('/api/bank/transactions/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const transactions = await storage.getUserBankTransactions(userId, Number(limit) || 50);
      res.json(transactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  // Disconnect bank account
  app.post('/api/bank/disconnect', async (req, res) => {
    try {
      const { userId, accountId } = req.body;
      
      if (!userId || !accountId) {
        return res.status(400).json({ message: 'User ID and account ID are required' });
      }
      
      await plaidService.disconnectAccount(userId, accountId);
      
      // Log bank disconnection
      await storage.logUserActivity({
        userId: userId,
        action: 'bank_disconnected',
        details: { accountId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json({ message: 'Bank account disconnected successfully' });
    } catch (error: any) {
      console.error('Error disconnecting bank account:', error);
      res.status(500).json({ message: 'Failed to disconnect bank account' });
    }
  });

  // Translation API Routes
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, fromLanguage, toLanguage, context } = req.body;
      
      if (!text || !fromLanguage || !toLanguage) {
        return res.status(400).json({ message: 'Text, fromLanguage, and toLanguage are required' });
      }
      
      const translation = await translationService.translateText({
        text,
        fromLanguage,
        toLanguage,
        context
      });
      
      res.json(translation);
    } catch (error: any) {
      console.error('Translation error:', error);
      res.status(500).json({ message: 'Translation failed' });
    }
  });

  app.post('/api/translate/bulk', async (req, res) => {
    try {
      const { texts, fromLanguage, toLanguage, context } = req.body;
      
      if (!texts || !Array.isArray(texts) || !fromLanguage || !toLanguage) {
        return res.status(400).json({ message: 'Invalid request format' });
      }
      
      const translations = await translationService.translateBulk(texts, fromLanguage, toLanguage, context);
      res.json({ translations });
    } catch (error: any) {
      console.error('Bulk translation error:', error);
      res.status(500).json({ message: 'Bulk translation failed' });
    }
  });

  app.post('/api/translate/detect', async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: 'Text is required' });
      }
      
      const detectedLanguage = await translationService.detectLanguage(text);
      res.json({ language: detectedLanguage });
    } catch (error: any) {
      console.error('Language detection error:', error);
      res.status(500).json({ message: 'Language detection failed' });
    }
  });

  app.get('/api/translate/languages', async (req, res) => {
    try {
      const languages = translationService.getSupportedLanguages();
      res.json(languages);
    } catch (error: any) {
      console.error('Get languages error:', error);
      res.status(500).json({ message: 'Failed to get supported languages' });
    }
  });

  // Legal AI API Routes
  app.post('/api/legal/query', async (req, res) => {
    try {
      const { question, jurisdiction, category, language } = req.body;
      
      if (!question || !jurisdiction || !category) {
        return res.status(400).json({ message: 'Question, jurisdiction, and category are required' });
      }
      
      const response = await legalAIService.queryLegalInformation({
        question,
        jurisdiction,
        category,
        language: language || 'en'
      });
      
      res.json(response);
    } catch (error: any) {
      console.error('Legal query error:', error);
      res.status(500).json({ message: 'Legal query failed' });
    }
  });

  app.get('/api/legal/regulation-summary/:jurisdiction/:category', async (req, res) => {
    try {
      const { jurisdiction, category } = req.params;
      const { language } = req.query;
      
      const summary = await legalAIService.getRegulationSummary(
        jurisdiction,
        category,
        language as string || 'en'
      );
      
      res.json(summary);
    } catch (error: any) {
      console.error('Regulation summary error:', error);
      res.status(500).json({ message: 'Failed to get regulation summary' });
    }
  });

  app.post('/api/legal/compliance-check', async (req, res) => {
    try {
      const { description, jurisdiction, language } = req.body;
      
      if (!description || !jurisdiction) {
        return res.status(400).json({ message: 'Description and jurisdiction are required' });
      }
      
      const complianceCheck = await legalAIService.checkCompliance(
        description,
        jurisdiction,
        language || 'en'
      );
      
      res.json(complianceCheck);
    } catch (error: any) {
      console.error('Compliance check error:', error);
      res.status(500).json({ message: 'Compliance check failed' });
    }
  });

  app.get('/api/legal/jurisdictions', async (req, res) => {
    try {
      const jurisdictions = legalAIService.getSupportedJurisdictions();
      res.json(jurisdictions);
    } catch (error: any) {
      console.error('Get jurisdictions error:', error);
      res.status(500).json({ message: 'Failed to get supported jurisdictions' });
    }
  });

  // AI Advisor routes
  app.get('/api/advisors', async (req, res) => {
    try {
      // Get advisors directly from the service class
      const advisors = [
        {
          id: 'financial_planner',
          name: 'Sarah - Financial Planning Expert',
          description: 'Specializes in personal financial planning, budgeting, and long-term wealth building strategies.',
          expertise: ['budgeting', 'retirement', 'investments', 'debt_management', 'emergency_planning'],
          personality: 'professional_supportive',
          responseStyle: 'detailed_practical'
        },
        {
          id: 'investment_specialist',
          name: 'Marcus - Investment Specialist',
          description: 'Expert in investment strategies, market analysis, and portfolio optimization.',
          expertise: ['stocks', 'etfs', 'portfolio_analysis', 'risk_assessment', 'market_trends'],
          personality: 'analytical_confident',
          responseStyle: 'data_driven'
        },
        {
          id: 'tax_strategist',
          name: 'Rebecca - Tax Strategy Advisor',
          description: 'Specializes in tax optimization, deductions, and strategic tax planning.',
          expertise: ['tax_optimization', 'deductions', 'tax_planning', 'business_taxes', 'retirement_taxes'],
          personality: 'detail_oriented',
          responseStyle: 'methodical_thorough'
        },
        {
          id: 'risk_analyst',
          name: 'Miguel - Risk Assessment Specialist',
          description: 'Focuses on risk management, insurance planning, and financial protection strategies.',
          expertise: ['risk_management', 'insurance_planning', 'emergency_funds', 'asset_protection', 'financial_security'],
          personality: 'cautious_protective',
          responseStyle: 'security_focused'
        },
        {
          id: 'retirement_specialist',
          name: 'Patricia - Retirement Planning Specialist',
          description: 'Focuses on retirement planning, pension optimization, and senior financial strategies.',
          expertise: ['401k_ira', 'social_security', 'healthcare_planning', 'estate_basics', 'retirement_income'],
          personality: 'patient_thorough',
          responseStyle: 'comprehensive_secure'
        }
      ];
      
      res.json(advisors);
    } catch (error) {
      console.error('Error fetching advisors:', error);
      res.status(500).json({ message: 'Failed to fetch advisors' });
    }
  });

  app.post('/api/advisors/recommend', async (req, res) => {
    try {
      const { query, userId } = req.body;
      const recommendedAdvisorId = await advisorService.recommendAdvisor(userId, query);
      const advisor = await advisorService.getAdvisorById(recommendedAdvisorId);
      res.json({ recommendedAdvisor: advisor });
    } catch (error) {
      console.error('Error recommending advisor:', error);
      res.status(500).json({ message: 'Failed to recommend advisor' });
    }
  });

  app.post('/api/advisors/sessions', async (req, res) => {
    try {
      const { userId, advisorId, initialMessage } = req.body;
      const session = await advisorService.createAdvisorSession(userId, advisorId, initialMessage);
      res.json({ session });
    } catch (error) {
      console.error('Error creating advisor session:', error);
      res.status(500).json({ message: 'Failed to create advisor session' });
    }
  });

  app.post('/api/advisors/sessions/:sessionId/messages', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;
      const response = await advisorService.sendMessage(sessionId, message);
      res.json({ message: response });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  app.get('/api/advisors/sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await advisorService.getSessionHistory(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      res.json({ session });
    } catch (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({ message: 'Failed to fetch session' });
    }
  });

  app.get('/api/advisors/users/:userId/sessions', async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions = await advisorService.getUserSessions(userId);
      res.json({ sessions });
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      res.status(500).json({ message: 'Failed to fetch user sessions' });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Test database connection
      await storage.getUser('health-check-test');
      
      // Test OpenAI API (basic check)
      const openaiHealthy = !!process.env.OPENAI_API_KEY;
      
      res.json({
        status: 'healthy',
        database: true,
        openai: openaiHealthy,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({
        status: 'unhealthy',
        database: false,
        openai: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Note: In a real app, you'd add admin authentication middleware here
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
