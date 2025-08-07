import { 
  users, 
  userProfiles,
  advisors,
  advisorSessions,
  chatMessages,
  decisionTreeProgress,
  achievements,
  userAchievements,
  bankAccounts,
  bankTransactions,
  bankConnections,
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
  type NewBankConnection
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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
          role: 'admin',
          accountStatus: 'active',
          subscriptionTier: 'max',
          subscriptionStatus: 'active',
        } : {
          id: userId,
          username: `guest_${userId.substring(0, 20)}`,
          email: `${userId}@guest.local`,
          role: 'user',
          accountStatus: 'pending',
          subscriptionTier: 'free',
          subscriptionStatus: 'expired',
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
    
    if (existing) {
      const [updated] = await db
        .update(decisionTreeProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(eq(decisionTreeProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const progressWithId = {
        ...progress,
        id: progress.id || generateId('progress')
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
}

export const storage = new DatabaseStorage();
