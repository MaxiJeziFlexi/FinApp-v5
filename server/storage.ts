import { 
  users, 
  userProfiles,
  onboardingProgress,
  agentContext,
  advisors,
  advisorSessions,
  chatMessages,
  decisionTreeProgress,
  achievements,
  userAchievements,
  bankAccounts,
  bankTransactions,
  bankConnections,
  jarvisAiSessions,
  jarvisAiConversations,
  jarvisAiKnowledge,
  jarvisAiTasks,
  jarvisAiTraining,
  personalizedDecisionTreeResponses,
  aiEmotionalProfiles,
  aiInsights,
  decisionTreeSessions,
  userInteractionEvents,
  userSessions,
  featureFlags,
  usageCounters,
  type User, 
  type InsertUser,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Advisor,
  type NewAdvisor,
  type AdvisorSession,
  type NewAdvisorSession,
  type ChatMessage,
  type InsertChatMessage,
  type DecisionTreeProgress,
  type InsertDecisionTreeProgress,
  type Achievement,
  type UserAchievement,
  type NewUserAchievement,
  type BankAccount,
  type NewBankAccount,
  type BankTransaction,
  type NewBankTransaction,
  type BankConnection,
  type NewBankConnection,
  type JarvisAiSession,
  type InsertJarvisAiSession,
  type JarvisAiConversation,
  type InsertJarvisAiConversation,
  type JarvisAiKnowledge,
  type InsertJarvisAiKnowledge,
  type JarvisAiTask,
  type InsertJarvisAiTask,
  type JarvisAiTraining,
  type InsertJarvisAiTraining,
  type FeatureFlag,
  type InsertFeatureFlag,
  type UsageCounter,
  type InsertUsageCounter,
  type UserRole
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

// Utility function to generate unique IDs
function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Advisor operations
  getAdvisors(): Promise<Advisor[]>;
  getAdvisor(id: string): Promise<Advisor | undefined>;
  createAdvisor(advisor: NewAdvisor): Promise<Advisor>;
  
  // Session operations
  getOrCreateSession(userId: string, advisorId: string): Promise<AdvisorSession>;
  getSession(sessionId: string): Promise<AdvisorSession | undefined>;
  
  // Advisor session operations for new advisor service
  createAdvisorSession(session: any): Promise<any>;
  getAdvisorSession(sessionId: string): Promise<any>;
  updateAdvisorSession(session: any): Promise<any>;
  getUserAdvisorSessions(userId: string): Promise<any[]>;
  
  // Chat message operations
  getChatHistory(userId: string, advisorId: string): Promise<ChatMessage[]>;
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Decision tree operations
  getDecisionTreeProgress(userId: string, advisorId: string): Promise<DecisionTreeProgress | undefined>;
  saveDecisionTreeProgress(progress: InsertDecisionTreeProgress): Promise<DecisionTreeProgress>;
  updateDecisionTreeProgress(userId: string, advisorId: string, updates: Partial<InsertDecisionTreeProgress>): Promise<DecisionTreeProgress>;
  resetDecisionTreeProgress(userId: string, advisorId: string): Promise<void>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: string): Promise<UserAchievement>;

  // Authentication and verification
  createVerificationCode(verification: any): Promise<any>;
  verifyEmailCode(userId: string, code: string): Promise<boolean>;
  logUserActivity(activity: any): Promise<void>;

  // Bank operations
  createBankAccount(account: any): Promise<BankAccount>;
  getBankAccount(accountId: string): Promise<BankAccount | undefined>;
  getUserBankAccounts(userId: string): Promise<BankAccount[]>;
  updateBankAccount(accountId: string, updates: any): Promise<BankAccount>;
  
  createBankTransaction(transaction: any): Promise<BankTransaction>;
  getBankTransaction(transactionId: string): Promise<BankTransaction | undefined>;
  getBankTransactionByPlaidId(plaidTransactionId: string): Promise<BankTransaction | undefined>;
  getUserBankTransactions(userId: string, limit?: number): Promise<BankTransaction[]>;
  getAccountTransactions(accountId: string, limit?: number): Promise<BankTransaction[]>;
  
  createBankConnection(connection: any): Promise<BankConnection>;
  getBankConnection(connectionId: string): Promise<BankConnection | undefined>;
  getBankConnectionByItemId(itemId: string): Promise<BankConnection | undefined>;
  updateBankConnection(connectionId: string, updates: any): Promise<BankConnection>;

  // Subscription operations
  getSubscriptionPlans(): Promise<any[]>;
  createSubscriptionPlan(plan: any): Promise<any>;

  // Jarvis AI operations
  createJarvisSession(session: InsertJarvisAiSession): Promise<JarvisAiSession>;
  getJarvisSession(sessionId: string): Promise<JarvisAiSession | undefined>;
  getUserJarvisSessions(userId: string): Promise<JarvisAiSession[]>;
  updateJarvisSession(sessionId: string, updates: Partial<InsertJarvisAiSession>): Promise<JarvisAiSession>;
  
  createJarvisConversation(conversation: InsertJarvisAiConversation): Promise<JarvisAiConversation>;
  getJarvisConversations(sessionId: string): Promise<JarvisAiConversation[]>;
  
  createJarvisKnowledge(knowledge: InsertJarvisAiKnowledge): Promise<JarvisAiKnowledge>;
  getJarvisKnowledge(category?: string): Promise<JarvisAiKnowledge[]>;
  updateJarvisKnowledge(knowledgeId: string, updates: Partial<InsertJarvisAiKnowledge>): Promise<JarvisAiKnowledge>;
  
  createJarvisTask(task: InsertJarvisAiTask): Promise<JarvisAiTask>;
  getJarvisTasks(sessionId: string): Promise<JarvisAiTask[]>;
  updateJarvisTask(taskId: string, updates: Partial<InsertJarvisAiTask>): Promise<JarvisAiTask>;
  
  createJarvisTraining(training: InsertJarvisAiTraining): Promise<JarvisAiTraining>;
  getJarvisTraining(): Promise<JarvisAiTraining[]>;
  updateJarvisTraining(trainingId: string, updates: Partial<InsertJarvisAiTraining>): Promise<JarvisAiTraining>;
  
  // Decision Tree Response operations
  saveDecisionTreeResponse(userId: string, advisorId: string, questionId: string, answer: any, additionalData?: any): Promise<void>;
  getUserDecisionTreeResponses(userId: string, advisorId: string): Promise<any[]>;
  
  // AI Emotional Profile operations
  saveEmotionalProfile(profile: any): Promise<void>;
  getEmotionalProfile(userId: string, advisorId: string): Promise<any | undefined>;
  
  // AI Insights operations
  saveAIInsights(insights: any): Promise<void>;
  getUserAIInsights(userId: string, advisorId: string): Promise<any[]>;
  
  // Analytics and Heat Map operations
  createInteractionEvent(event: any): Promise<any>;
  getInteractionEvents(): Promise<any[]>;
  
  // RBAC operations
  getUserFeatures(userId: string): Promise<Record<string, boolean>>;
  setFeatureFlag(userId: string, flagName: string, enabled: boolean, value?: any): Promise<FeatureFlag>;
  getUserUsageCounter(userId: string, counterType: string): Promise<UsageCounter | undefined>;
  incrementUsageCounter(userId: string, counterType: string): Promise<UsageCounter>;
  resetUsageCounters(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser & { id?: string }): Promise<User> {
    const userWithId = {
      ...insertUser,
      id: insertUser.id || generateId('user')
    };
    const [user] = await db.insert(users).values(userWithId).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile & { id?: string }): Promise<UserProfile> {
    const profileWithId = {
      ...profile,
      id: profile.id || generateId('profile')
    };
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profileWithId)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Advisor operations
  async getAdvisors(): Promise<Advisor[]> {
    return await db
      .select()
      .from(advisors)
      .where(eq(advisors.isActive, true))
      .orderBy(asc(advisors.name));
  }

  async getAdvisor(id: string): Promise<Advisor | undefined> {
    const [advisor] = await db
      .select()
      .from(advisors)
      .where(eq(advisors.id, id));
    return advisor;
  }

  async createAdvisor(advisor: NewAdvisor): Promise<Advisor> {
    const [newAdvisor] = await db
      .insert(advisors)
      .values(advisor)
      .returning();
    return newAdvisor;
  }

  // Session operations
  async getOrCreateSession(userId: string, advisorId: string): Promise<AdvisorSession> {
    // Ensure user exists first
    await this.ensureUserExists(userId);
    
    // Check for existing active session
    const [existingSession] = await db
      .select()
      .from(advisorSessions)
      .where(
        and(
          eq(advisorSessions.userId, userId),
          eq(advisorSessions.advisorId, advisorId),
          eq(advisorSessions.isActive, true)
        )
      );

    if (existingSession) {
      return existingSession;
    }

    // Create new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [newSession] = await db
      .insert(advisorSessions)
      .values({
        id: generateId('session'),
        userId,
        advisorId,
        sessionId,
        isActive: true,
      })
      .returning();

    return newSession;
  }

  // Helper method to ensure user exists
  private async ensureUserExists(userId: string): Promise<void> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!existingUser) {
      try {
        // Check if this is an admin user ID
        const isAdminUser = userId.startsWith('admin-') || userId === 'admin-user';
        
        const userData = isAdminUser ? {
          id: userId,
          username: `admin_${userId.substring(0, 20)}`,
          email: `${userId}@admin.local`,
          name: 'Admin User',
          role: 'admin' as const,
          accountStatus: 'active',
          subscriptionTier: 'max' as const,
          subscriptionStatus: 'active' as const,
        } : {
          id: userId,
          username: `guest_${userId.substring(0, 20)}`,
          email: `${userId}@guest.local`,
          role: 'user' as const,
          accountStatus: 'pending',
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'expired' as const,
        };

        await db
          .insert(users)
          .values(userData)
          .onConflictDoNothing();
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }
  }

  async getSession(sessionId: string): Promise<AdvisorSession | undefined> {
    const [session] = await db
      .select()
      .from(advisorSessions)
      .where(eq(advisorSessions.sessionId, sessionId));
    return session;
  }

  // Chat message operations
  async getChatHistory(userId: string, advisorId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.userId, userId),
          eq(chatMessages.advisorId, advisorId)
        )
      )
      .orderBy(asc(chatMessages.createdAt));
  }

  async saveChatMessage(message: InsertChatMessage & { id?: string }): Promise<ChatMessage> {
    // Ensure user exists first
    if (message.userId) {
      await this.ensureUserExists(message.userId);
    }
    
    const messageWithId = {
      ...message,
      id: message.id || generateId('msg')
    };
    const [newMessage] = await db
      .insert(chatMessages)
      .values(messageWithId)
      .returning();
    return newMessage;
  }

  // Decision tree operations
  async getDecisionTreeProgress(userId: string, advisorId: string): Promise<DecisionTreeProgress | undefined> {
    const [progress] = await db
      .select()
      .from(decisionTreeProgress)
      .where(
        and(
          eq(decisionTreeProgress.userId, userId),
          eq(decisionTreeProgress.advisorId, advisorId)
        )
      )
      .orderBy(desc(decisionTreeProgress.updatedAt));
    return progress;
  }

  async saveDecisionTreeProgress(progress: InsertDecisionTreeProgress & { id?: string }): Promise<DecisionTreeProgress> {
    const existing = await this.getDecisionTreeProgress(progress.userId, progress.advisorId);
    
    // Clean and ensure all numeric fields are proper integers
    const cleanProgress = {
      ...progress,
      progress: Math.round(Number(progress.progress || 0))
    };
    
    console.log('Saving progress with cleaned values:', {
      ...cleanProgress,
      responses: 'json array',
      recommendations: 'json object'
    });
    
    if (existing) {
      const [updated] = await db
        .update(decisionTreeProgress)
        .set({ ...cleanProgress, updatedAt: new Date() })
        .where(eq(decisionTreeProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const progressWithId = {
        ...cleanProgress,
        id: cleanProgress.id || generateId('progress')
      };
      const [newProgress] = await db
        .insert(decisionTreeProgress)
        .values(progressWithId)
        .returning();
      return newProgress;
    }
  }

  async updateDecisionTreeProgress(userId: string, advisorId: string, updates: Partial<InsertDecisionTreeProgress>): Promise<DecisionTreeProgress> {
    const [updated] = await db
      .update(decisionTreeProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(decisionTreeProgress.userId, userId),
          eq(decisionTreeProgress.advisorId, advisorId)
        )
      )
      .returning();
    return updated;
  }

  async resetDecisionTreeProgress(userId: string, advisorId: string): Promise<void> {
    await db
      .delete(decisionTreeProgress)
      .where(
        and(
          eq(decisionTreeProgress.userId, userId),
          eq(decisionTreeProgress.advisorId, advisorId)
        )
      );
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(asc(achievements.category), asc(achievements.name));
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    // Check if user already has this achievement
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );

    if (existing) {
      return existing;
    }

    const [newAchievement] = await db
      .insert(userAchievements)
      .values({
        id: generateId('achievement'),
        userId,
        achievementId,
      })
      .returning();

    return newAchievement;
  }
  // Authentication and verification methods
  async createVerificationCode(verification: any): Promise<any> {
    try {
      // For now, store verification codes in memory
      // In production, you'd store these in the database
      return { id: generateId('verify'), ...verification };
    } catch (error) {
      console.error('Error creating verification code:', error);
      throw new Error('Failed to create verification code');
    }
  }

  async verifyEmailCode(userId: string, code: string): Promise<boolean> {
    try {
      // For now, accept any 6-character code
      // In production, you'd verify against stored codes
      return code.length === 6;
    } catch (error) {
      console.error('Error verifying email code:', error);
      return false;
    }
  }

  async logUserActivity(activity: any): Promise<void> {
    try {
      // For now, just log to console
      // In production, you'd store in the database
      console.log('User activity:', activity);
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }

  // Subscription methods
  async getSubscriptionPlans(): Promise<any[]> {
    try {
      return [
        {
          id: 'free',
          name: 'Free',
          description: 'Perfect for getting started with AI financial education',
          price: 0,
          currency: 'USD',
          interval: 'month',
          apiLimit: 0.20, // $0.20 API limit
          features: {
            aiAdvisors: 1,
            analysisReports: 3,
            portfolioTracking: false,
            premiumSupport: false,
            advancedAnalytics: false,
            apiAccess: false,
            customDashboards: false,
            priorityLearning: false,
            multiLanguage: false,
            legalAI: false,
            bankIntegration: false,
          },
          stripePriceId: null,
          active: true,
          createdAt: new Date(),
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Advanced AI financial education with premium features',
          price: 20,
          currency: 'USD',
          interval: 'month',
          apiLimit: 1.30, // 65% of $2 = $1.30 API limit
          features: {
            aiAdvisors: 5,
            analysisReports: 25,
            portfolioTracking: true,
            premiumSupport: true,
            advancedAnalytics: true,
            apiAccess: true,
            customDashboards: true,
            priorityLearning: true,
            multiLanguage: true,
            legalAI: true,
            bankIntegration: true,
          },
          stripePriceId: 'price_pro_monthly',
          active: true,
          createdAt: new Date(),
        },
        {
          id: 'max',
          name: 'Max',
          description: 'Ultimate AI financial education experience with unlimited access',
          price: 80,
          currency: 'USD',
          interval: 'month',
          apiLimit: 5.00, // Up to $5 API limit
          features: {
            aiAdvisors: 'unlimited',
            analysisReports: 'unlimited',
            portfolioTracking: true,
            premiumSupport: true,
            advancedAnalytics: true,
            apiAccess: true,
            customDashboards: true,
            priorityLearning: true,
            multiLanguage: true,
            legalAI: true,
            bankIntegration: true,
            personalAdvisor: true,
            whiteLabel: true,
            apiIntegration: true,
          },
          stripePriceId: 'price_max_monthly',
          active: true,
          createdAt: new Date(),
        }
      ];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw new Error('Failed to fetch subscription plans');
    }
  }

  async createSubscriptionPlan(plan: any): Promise<any> {
    try {
      // For now, just return the plan with an ID
      return { id: generateId('plan'), ...plan };
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw new Error('Failed to create subscription plan');
    }
  }

  // Bank operations
  async createBankAccount(account: NewBankAccount): Promise<BankAccount> {
    const [newAccount] = await db
      .insert(bankAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async getBankAccount(accountId: string): Promise<BankAccount | undefined> {
    const [account] = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, accountId));
    return account;
  }

  async getUserBankAccounts(userId: string): Promise<BankAccount[]> {
    return await db
      .select()
      .from(bankAccounts)
      .where(and(eq(bankAccounts.userId, userId), eq(bankAccounts.isActive, true)))
      .orderBy(desc(bankAccounts.createdAt));
  }

  async updateBankAccount(accountId: string, updates: Partial<NewBankAccount>): Promise<BankAccount> {
    const [updated] = await db
      .update(bankAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bankAccounts.id, accountId))
      .returning();
    return updated;
  }

  async createBankTransaction(transaction: NewBankTransaction): Promise<BankTransaction> {
    const [newTransaction] = await db
      .insert(bankTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getBankTransaction(transactionId: string): Promise<BankTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.id, transactionId));
    return transaction;
  }

  async getBankTransactionByPlaidId(plaidTransactionId: string): Promise<BankTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.plaidTransactionId, plaidTransactionId));
    return transaction;
  }

  async getUserBankTransactions(userId: string, limit = 50): Promise<BankTransaction[]> {
    return await db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.userId, userId))
      .orderBy(desc(bankTransactions.date))
      .limit(limit);
  }

  async getAccountTransactions(accountId: string, limit = 50): Promise<BankTransaction[]> {
    return await db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.accountId, accountId))
      .orderBy(desc(bankTransactions.date))
      .limit(limit);
  }

  async createBankConnection(connection: NewBankConnection): Promise<BankConnection> {
    const [newConnection] = await db
      .insert(bankConnections)
      .values(connection)
      .returning();
    return newConnection;
  }

  async getBankConnection(connectionId: string): Promise<BankConnection | undefined> {
    const [connection] = await db
      .select()
      .from(bankConnections)
      .where(eq(bankConnections.id, connectionId));
    return connection;
  }

  async getBankConnectionByItemId(itemId: string): Promise<BankConnection | undefined> {
    const [connection] = await db
      .select()
      .from(bankConnections)
      .where(eq(bankConnections.plaidItemId, itemId));
    return connection;
  }

  async updateBankConnection(connectionId: string, updates: Partial<NewBankConnection>): Promise<BankConnection> {
    const [updated] = await db
      .update(bankConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bankConnections.id, connectionId))
      .returning();
    return updated;
  }

  // Advisor session methods for new advisor service (in-memory for now)
  private advisorSessionsMap: Map<string, any> = new Map();

  async createAdvisorSession(session: any): Promise<any> {
    this.advisorSessionsMap.set(session.id, session);
    return session;
  }

  async getAdvisorSession(sessionId: string): Promise<any> {
    return this.advisorSessionsMap.get(sessionId) || null;
  }

  async updateAdvisorSession(session: any): Promise<any> {
    this.advisorSessionsMap.set(session.id, session);
    return session;
  }

  async getUserAdvisorSessions(userId: string): Promise<any[]> {
    return Array.from(this.advisorSessionsMap.values()).filter(session => session.userId === userId);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).limit(100); // Limit for performance
  }

  // Jarvis AI operations
  async createJarvisSession(session: InsertJarvisAiSession): Promise<JarvisAiSession> {
    const [newSession] = await db
      .insert(jarvisAiSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getJarvisSession(sessionId: string): Promise<JarvisAiSession | undefined> {
    const [session] = await db
      .select()
      .from(jarvisAiSessions)
      .where(eq(jarvisAiSessions.id, sessionId));
    return session;
  }

  async getUserJarvisSessions(userId: string): Promise<JarvisAiSession[]> {
    return await db
      .select()
      .from(jarvisAiSessions)
      .where(eq(jarvisAiSessions.userId, userId))
      .orderBy(desc(jarvisAiSessions.createdAt));
  }

  async updateJarvisSession(sessionId: string, updates: Partial<InsertJarvisAiSession>): Promise<JarvisAiSession> {
    const [updated] = await db
      .update(jarvisAiSessions)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(jarvisAiSessions.id, sessionId))
      .returning();
    return updated;
  }

  async createJarvisConversation(conversation: InsertJarvisAiConversation): Promise<JarvisAiConversation> {
    const [newConversation] = await db
      .insert(jarvisAiConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getJarvisConversations(sessionId: string): Promise<JarvisAiConversation[]> {
    return await db
      .select()
      .from(jarvisAiConversations)
      .where(eq(jarvisAiConversations.sessionId, sessionId))
      .orderBy(asc(jarvisAiConversations.createdAt));
  }

  async createJarvisKnowledge(knowledge: InsertJarvisAiKnowledge): Promise<JarvisAiKnowledge> {
    const [newKnowledge] = await db
      .insert(jarvisAiKnowledge)
      .values(knowledge)
      .returning();
    return newKnowledge;
  }

  async getJarvisKnowledge(category?: string): Promise<JarvisAiKnowledge[]> {
    const query = db.select().from(jarvisAiKnowledge);
    
    if (category) {
      return await query.where(eq(jarvisAiKnowledge.category, category));
    }
    
    return await query.orderBy(desc(jarvisAiKnowledge.lastUsedAt));
  }

  async updateJarvisKnowledge(knowledgeId: string, updates: Partial<InsertJarvisAiKnowledge>): Promise<JarvisAiKnowledge> {
    const [updated] = await db
      .update(jarvisAiKnowledge)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jarvisAiKnowledge.id, knowledgeId))
      .returning();
    return updated;
  }

  async createJarvisTask(task: InsertJarvisAiTask): Promise<JarvisAiTask> {
    const [newTask] = await db
      .insert(jarvisAiTasks)
      .values(task)
      .returning();
    return newTask;
  }

  async getJarvisTasks(sessionId: string): Promise<JarvisAiTask[]> {
    return await db
      .select()
      .from(jarvisAiTasks)
      .where(eq(jarvisAiTasks.sessionId, sessionId))
      .orderBy(desc(jarvisAiTasks.createdAt));
  }

  async updateJarvisTask(taskId: string, updates: Partial<InsertJarvisAiTask>): Promise<JarvisAiTask> {
    const [updated] = await db
      .update(jarvisAiTasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jarvisAiTasks.id, taskId))
      .returning();
    return updated;
  }

  async createJarvisTraining(training: InsertJarvisAiTraining): Promise<JarvisAiTraining> {
    const [newTraining] = await db
      .insert(jarvisAiTraining)
      .values(training)
      .returning();
    return newTraining;
  }

  async getJarvisTraining(): Promise<JarvisAiTraining[]> {
    return await db
      .select()
      .from(jarvisAiTraining)
      .orderBy(desc(jarvisAiTraining.createdAt));
  }

  async updateJarvisTraining(trainingId: string, updates: Partial<InsertJarvisAiTraining>): Promise<JarvisAiTraining> {
    const [updated] = await db
      .update(jarvisAiTraining)
      .set(updates)
      .where(eq(jarvisAiTraining.id, trainingId))
      .returning();
    return updated;
  }

  // Decision Tree Response operations
  async saveDecisionTreeResponse(userId: string, advisorId: string, questionId: string, answer: any, additionalData?: any): Promise<void> {
    await db.insert(personalizedDecisionTreeResponses).values({
      id: generateId('response'),
      userId,
      advisorId,
      questionId,
      answer,
      additionalData: additionalData || {},
      timestamp: new Date(),
    });
  }

  async getUserDecisionTreeResponses(userId: string, advisorId: string): Promise<any[]> {
    return await db
      .select()
      .from(personalizedDecisionTreeResponses)
      .where(and(
        eq(personalizedDecisionTreeResponses.userId, userId),
        eq(personalizedDecisionTreeResponses.advisorId, advisorId)
      ));
  }

  // AI Emotional Profile operations
  async saveEmotionalProfile(profile: any): Promise<void> {
    await db.insert(aiEmotionalProfiles).values({
      id: generateId('profile'),
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getEmotionalProfile(userId: string, advisorId: string): Promise<any | undefined> {
    const [profile] = await db
      .select()
      .from(aiEmotionalProfiles)
      .where(and(
        eq(aiEmotionalProfiles.userId, userId),
        eq(aiEmotionalProfiles.advisorId, advisorId)
      ))
      .orderBy(desc(aiEmotionalProfiles.createdAt))
      .limit(1);
    return profile;
  }

  // AI Insights operations
  async saveAIInsights(insights: any): Promise<void> {
    await db.insert(aiInsights).values({
      id: generateId('insight'),
      ...insights,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getUserAIInsights(userId: string, advisorId: string): Promise<any[]> {
    return await db
      .select()
      .from(aiInsights)
      .where(and(
        eq(aiInsights.userId, userId),
        eq(aiInsights.advisorId, advisorId),
        eq(aiInsights.isActive, true)
      ))
      .orderBy(desc(aiInsights.createdAt));
  }

  // Analytics and Heat Map operations
  async createInteractionEvent(event: any): Promise<any> {
    // Ensure user session exists first to avoid FK constraint errors
    if (event.session_id && event.user_id) {
      await this.getOrCreateUserSession(event.user_id, event.session_id);
    }
    
    const [created] = await db.insert(userInteractionEvents).values({
      id: generateId('event'),
      sessionId: event.session_id,
      userId: event.user_id,
      eventType: event.event_type,
      eventCategory: event.event_category || 'general',
      eventAction: event.event_action || 'click',
      eventLabel: event.element_text ? String(event.element_text).substring(0, 255) : null,
      elementId: event.element_id ? String(event.element_id).substring(0, 255) : null,
      elementClass: event.element_class ? String(event.element_class).substring(0, 255) : null,
      elementText: event.element_text ? String(event.element_text) : null,
      pagePath: event.page_url ? String(event.page_url).substring(0, 500) : null,
      coordinates: event.click_position,
      timestamp: event.timestamp,
      metadata: event.metadata
    }).returning();
    return created;
  }

  async getInteractionEvents(): Promise<any[]> {
    return await db.select().from(userInteractionEvents);
  }

  // User session management for analytics
  async getOrCreateUserSession(userId: string, sessionId: string): Promise<any> {
    // Check if session exists
    const [existingSession] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId));
    
    if (existingSession) {
      return existingSession;
    }
    
    // Create new session
    const [newSession] = await db
      .insert(userSessions)
      .values({
        id: sessionId,
        userId: userId || 'anonymous',
        sessionToken: `token_${sessionId}`,
        startTime: new Date(),
        createdAt: new Date()
      })
      .returning();
    
    return newSession;
  }

  // RBAC operations
  async getUserFeatures(userId: string): Promise<Record<string, boolean>> {
    const user = await this.getUser(userId);
    if (!user) return {};
    
    const userRole = user.role as UserRole;
    const permissions = require("@shared/schema").ROLE_PERMISSIONS[userRole] || [];
    
    // Convert permissions to feature flags format
    const features: Record<string, boolean> = {
      dashboard_access: permissions.includes('dashboard:read') || permissions.includes('*'),
      profile_access: permissions.includes('profile:read') || permissions.includes('*'),
      viz3d_access: permissions.includes('viz3d:read') || permissions.includes('*'),
      transactions_import_basic: permissions.includes('transactions:import_limited') || permissions.includes('*'),
      transactions_import_unlimited: permissions.includes('transactions:import_unlimited') || permissions.includes('*'),
      advice_advanced: permissions.includes('advice:advanced') || permissions.includes('*'),
      advice_personalized: permissions.includes('advice:personalized') || permissions.includes('*'),
      chat_limited: permissions.includes('chat:limited') || permissions.includes('*'),
      chat_unlimited: permissions.includes('chat:unlimited') || permissions.includes('*'),
      analytics_basic: permissions.includes('analytics:basic') || permissions.includes('*'),
      analytics_advanced: permissions.includes('analytics:advanced') || permissions.includes('*'),
      export_csv_limited: permissions.includes('export:csv_limited') || permissions.includes('*'),
      export_full: permissions.includes('export:full') || permissions.includes('*'),
      admin_access: permissions.includes('*')
    };
    
    return features;
  }

  async setFeatureFlag(userId: string, flagName: string, enabled: boolean, value?: any): Promise<FeatureFlag> {
    const [flag] = await db.insert(featureFlags).values({
      id: generateId('flag'),
      userId,
      flagName,
      enabled,
      value: value || null
    }).onConflictDoUpdate({
      target: [featureFlags.userId, featureFlags.flagName],
      set: { enabled, value: value || null, updatedAt: new Date() }
    }).returning();
    return flag;
  }

  async getUserUsageCounter(userId: string, counterType: string): Promise<UsageCounter | undefined> {
    const [counter] = await db
      .select()
      .from(usageCounters)
      .where(and(
        eq(usageCounters.userId, userId),
        eq(usageCounters.counterType, counterType)
      ));
    return counter;
  }

  async incrementUsageCounter(userId: string, counterType: string): Promise<UsageCounter> {
    const user = await this.getUser(userId);
    const userRole = user?.role as UserRole || 'FREE';
    
    // Define limits per role
    const LIMITS: Record<UserRole, Record<string, number>> = {
      FREE: { transactions_import: 500, chat_messages: 10, export_requests: 5 },
      PRO: { transactions_import: 10000, chat_messages: 100, export_requests: 50 },
      MAX_PRO: { transactions_import: -1, chat_messages: 500, export_requests: -1 },
      ADMIN: { transactions_import: -1, chat_messages: -1, export_requests: -1 }
    };
    
    const maxLimit = LIMITS[userRole][counterType] || 0;
    
    // Try to get existing counter
    let counter = await this.getUserUsageCounter(userId, counterType);
    
    if (!counter) {
      // Create new counter
      const [newCounter] = await db.insert(usageCounters).values({
        id: generateId('counter'),
        userId,
        counterType,
        count: 1,
        maxLimit
      }).returning();
      return newCounter;
    }
    
    // Check if reset is needed (monthly reset)
    const now = new Date();
    const resetDate = counter.resetDate ? new Date(counter.resetDate) : new Date();
    const shouldReset = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear();
    
    if (shouldReset) {
      const [resetCounter] = await db
        .update(usageCounters)
        .set({
          count: 1,
          resetDate: now,
          updatedAt: now
        })
        .where(eq(usageCounters.id, counter.id))
        .returning();
      return resetCounter;
    }
    
    // Increment existing counter
    const [updatedCounter] = await db
      .update(usageCounters)
      .set({
        count: (counter.count || 0) + 1,
        updatedAt: now
      })
      .where(eq(usageCounters.id, counter.id))
      .returning();
    
    return updatedCounter;
  }

  async resetUsageCounters(userId: string): Promise<void> {
    await db
      .update(usageCounters)
      .set({
        count: 0,
        resetDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(usageCounters.userId, userId));
  }

  // Agent context methods
  async createAgentContext(data: any): Promise<void> {
    try {
      await this.db.insert(agentContext).values(data);
    } catch (error) {
      console.error('Error creating agent context:', error);
      throw error;
    }
  }

  async getAgentContext(userId: string): Promise<any> {
    try {
      const context = await this.db
        .select()
        .from(agentContext)
        .where(eq(agentContext.userId, userId))
        .orderBy(desc(agentContext.createdAt))
        .limit(1);
      
      return context[0] || null;
    } catch (error) {
      console.error('Error getting agent context:', error);
      return null;
    }
  }

  // Reset user usage counters (for testing)
  async resetUsageCounters(userId: string): Promise<void> {
    await db
      .delete(usageCounters)
      .where(eq(usageCounters.userId, userId));
  }
}

export const storage = new DatabaseStorage();
