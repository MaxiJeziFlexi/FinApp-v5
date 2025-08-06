import { 
  users, 
  userProfiles,
  advisors,
  advisorSessions,
  chatMessages,
  decisionTreeProgress,
  achievements,
  userAchievements,
  type User, 
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Advisor,
  type InsertAdvisor,
  type AdvisorSession,
  type InsertAdvisorSession,
  type ChatMessage,
  type InsertChatMessage,
  type DecisionTreeProgress,
  type InsertDecisionTreeProgress,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement
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
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Advisor operations
  getAdvisors(): Promise<Advisor[]>;
  getAdvisor(id: string): Promise<Advisor | undefined>;
  createAdvisor(advisor: InsertAdvisor): Promise<Advisor>;
  
  // Session operations
  getOrCreateSession(userId: string, advisorId: string): Promise<AdvisorSession>;
  getSession(sessionId: string): Promise<AdvisorSession | undefined>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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

  async createAdvisor(advisor: InsertAdvisor): Promise<Advisor> {
    const [newAdvisor] = await db
      .insert(advisors)
      .values(advisor)
      .returning();
    return newAdvisor;
  }

  // Session operations
  async getOrCreateSession(userId: string, advisorId: string): Promise<AdvisorSession> {
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
      .orderBy(asc(achievements.category), asc(achievements.title));
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));
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
}

export const storage = new DatabaseStorage();
