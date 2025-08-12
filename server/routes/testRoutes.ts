import type { Express } from "express";
import { storage } from "../storage";
import { UserRole } from "@shared/schema";

/**
 * Test routes for RBAC security testing - ONLY for development/testing
 * These routes help create test users and verify RBAC functionality
 */
export function registerTestRoutes(app: Express) {
  // Only enable in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Create test users with different RBAC tiers
  app.post('/api/test/create-users', async (req, res) => {
    try {
      const { users } = req.body;
      const createdUsers = [];

      for (const userData of users) {
        const user = await storage.createUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.id,
          role: userData.role as UserRole,
          subscriptionTier: userData.subscriptionTier as UserRole,
          accountStatus: 'active',
          emailVerified: true,
        });

        // Create user profile
        await storage.createUserProfile({
          userId: user.id,
          financialGoal: 'general',
          timeframe: 'medium',
          monthlyIncome: '5000',
          onboardingComplete: true,
          isPremium: userData.role !== 'FREE'
        });

        createdUsers.push({
          id: user.id,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          email: user.email
        });
      }

      res.json({ 
        message: 'Test users created successfully',
        users: createdUsers
      });
    } catch (error) {
      console.error('Error creating test users:', error);
      res.status(500).json({ message: 'Failed to create test users', error: error.message });
    }
  });

  // Get test user tokens (simplified for testing)
  app.post('/api/test/get-tokens', async (req, res) => {
    try {
      const { userIds } = req.body;
      const tokens = {};

      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (user) {
          // Generate simple test token (in real app, use proper JWT)
          const testToken = Buffer.from(JSON.stringify({
            sub: userId,
            role: user.role,
            email: user.email,
            iat: Math.floor(Date.now() / 1000)
          })).toString('base64');
          
          tokens[userId] = testToken;
        }
      }

      res.json({ tokens });
    } catch (error) {
      console.error('Error generating test tokens:', error);
      res.status(500).json({ message: 'Failed to generate test tokens', error: error.message });
    }
  });

  // Reset usage counters for testing quotas
  app.post('/api/test/reset-quotas/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.resetUsageCounters(userId);
      res.json({ message: 'Usage counters reset successfully', userId });
    } catch (error) {
      console.error('Error resetting quotas:', error);
      res.status(500).json({ message: 'Failed to reset quotas', error: error.message });
    }
  });

  // Check current quota usage
  app.get('/api/test/quota-status/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const counters = await Promise.all([
        storage.getUserUsageCounter(userId, 'transactions_import'),
        storage.getUserUsageCounter(userId, 'chat_messages'),
        storage.getUserUsageCounter(userId, 'export_requests')
      ]);

      const quotaStatus = {
        transactions_import: counters[0] ? {
          current: counters[0].count,
          limit: counters[0].maxLimit,
          resetDate: counters[0].resetDate
        } : null,
        chat_messages: counters[1] ? {
          current: counters[1].count,
          limit: counters[1].maxLimit,
          resetDate: counters[1].resetDate
        } : null,
        export_requests: counters[2] ? {
          current: counters[2].count,
          limit: counters[2].maxLimit,
          resetDate: counters[2].resetDate
        } : null
      };

      res.json({ userId, quotaStatus });
    } catch (error) {
      console.error('Error checking quota status:', error);
      res.status(500).json({ message: 'Failed to check quota status', error: error.message });
    }
  });

  // Simulate user session for testing (bypasses real auth)
  app.post('/api/test/simulate-session', async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Test user not found' });
      }

      // Set test session (in memory for testing)
      req.session.userId = userId;
      req.session.user = {
        id: userId,
        role: user.role,
        email: user.email
      };

      res.json({ 
        message: 'Test session created',
        userId,
        role: user.role,
        sessionId: req.session.id
      });
    } catch (error) {
      console.error('Error creating test session:', error);
      res.status(500).json({ message: 'Failed to create test session', error: error.message });
    }
  });

  // Test RBAC permissions for a specific user
  app.get('/api/test/permissions/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Test user not found' });
      }

      const features = await storage.getUserFeatures(userId);
      
      res.json({
        userId,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        features,
        permissions: require("@shared/schema").ROLE_PERMISSIONS[user.role as UserRole] || []
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
      res.status(500).json({ message: 'Failed to check permissions', error: error.message });
    }
  });

  console.log('🧪 Test routes registered for RBAC security testing');
}