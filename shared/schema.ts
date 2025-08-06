import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles table for financial information
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  financialGoal: varchar("financial_goal", { length: 100 }).notNull(), // emergency_fund, debt_reduction, home_purchase, retirement
  timeframe: varchar("timeframe", { length: 50 }).notNull(), // short, medium, long
  monthlyIncome: varchar("monthly_income", { length: 50 }).notNull(),
  currentSavings: varchar("current_savings", { length: 50 }),
  targetAmount: varchar("target_amount", { length: 50 }),
  onboardingComplete: boolean("onboarding_complete").default(false),
  isPremium: boolean("is_premium").default(false),
  progress: integer("progress").default(0),
  consents: jsonb("consents").default({}),
  financialData: jsonb("financial_data").default([]),
  achievements: jsonb("achievements").default([]),
  learningStyle: varchar("learning_style", { length: 50 }), // visual, auditory, kinesthetic, reading
  behaviorPatterns: jsonb("behavior_patterns").default({}),
  riskTolerance: varchar("risk_tolerance", { length: 20 }), // conservative, moderate, aggressive
  financialLiteracyScore: integer("financial_literacy_score").default(0),
  engagementMetrics: jsonb("engagement_metrics").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial advisors
export const advisors = pgTable("advisors", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: text("specialty").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  initialMessage: text("initial_message"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('4.5'),
  userCount: integer("user_count").default(0),
  features: jsonb("features").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat sessions
export const advisorSessions = pgTable("advisor_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  advisorId: varchar("advisor_id", { length: 50 }).references(() => advisors.id).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).references(() => advisorSessions.id).notNull(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  advisorId: varchar("advisor_id", { length: 50 }).references(() => advisors.id).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // user, assistant, system
  content: text("content").notNull(),
  sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  modelUsed: varchar("model_used", { length: 50 }),
  responseTimeMs: integer("response_time_ms"),
  metadata: jsonb("metadata").default({}),
  emotionalTone: varchar("emotional_tone", { length: 20 }),
  topicTags: jsonb("topic_tags").default([]),
  learningObjectives: jsonb("learning_objectives").default([]),
  comprehensionScore: integer("comprehension_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Decision tree progress
export const decisionTreeProgress = pgTable("decision_tree_progress", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  advisorId: varchar("advisor_id", { length: 50 }).references(() => advisors.id).notNull(),
  decisionPath: jsonb("decision_path").default([]),
  currentStep: integer("current_step").default(0),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0),
  finalRecommendation: jsonb("final_recommendation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  points: integer("points").default(0),
  category: varchar("category", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  achievementId: varchar("achievement_id", { length: 50 }).references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Learning Analytics
export const learningAnalytics = pgTable("learning_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  sessionId: varchar("session_id", { length: 255 }),
  eventType: varchar("event_type", { length: 100 }).notNull(), // page_view, interaction, completion
  eventData: jsonb("event_data").default({}),
  timeSpent: integer("time_spent"), // in seconds
  interactionCount: integer("interaction_count").default(0),
  completionRate: integer("completion_rate"), // percentage
  difficultyLevel: varchar("difficulty_level", { length: 20 }),
  learningPath: varchar("learning_path", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Behavioral Patterns
export const behaviorPatterns = pgTable("behavior_patterns", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  patternType: varchar("pattern_type", { length: 100 }).notNull(), // engagement, learning_style, risk_preference
  patternData: jsonb("pattern_data").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  predictiveScore: integer("predictive_score"), // 0-100
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// AI Model Performance
export const aiModelPerformance = pgTable("ai_model_performance", {
  id: varchar("id", { length: 255 }).primaryKey(),
  modelVersion: varchar("model_version", { length: 100 }).notNull(),
  promptType: varchar("prompt_type", { length: 100 }), // financial_advice, education, support
  requestData: jsonb("request_data").notNull(),
  responseData: jsonb("response_data").notNull(),
  userFeedback: integer("user_feedback"), // 1-5 rating
  responseTime: integer("response_time_ms"),
  tokenUsage: integer("token_usage"),
  accuracy: decimal("accuracy", { precision: 3, scale: 2 }),
  relevanceScore: integer("relevance_score"), // 0-100
  userEngagement: jsonb("user_engagement").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Education Content
export const educationContent = pgTable("education_content", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // article, video, interactive, quiz
  category: varchar("category", { length: 100 }).notNull(),
  difficultyLevel: varchar("difficulty_level", { length: 20 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}),
  tags: jsonb("tags").default([]),
  prerequisites: jsonb("prerequisites").default([]),
  learningObjectives: jsonb("learning_objectives").default([]),
  estimatedDuration: integer("estimated_duration"), // in minutes
  interactionCount: integer("interaction_count").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  completionRate: integer("completion_rate").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  sessions: many(advisorSessions),
  messages: many(chatMessages),
  decisionProgress: many(decisionTreeProgress),
  userAchievements: many(userAchievements),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const advisorsRelations = relations(advisors, ({ many }) => ({
  sessions: many(advisorSessions),
  messages: many(chatMessages),
  decisionProgress: many(decisionTreeProgress),
}));

export const advisorSessionsRelations = relations(advisorSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [advisorSessions.userId],
    references: [users.id],
  }),
  advisor: one(advisors, {
    fields: [advisorSessions.advisorId],
    references: [advisors.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(advisorSessions, {
    fields: [chatMessages.sessionId],
    references: [advisorSessions.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  advisor: one(advisors, {
    fields: [chatMessages.advisorId],
    references: [advisors.id],
  }),
}));

export const decisionTreeProgressRelations = relations(decisionTreeProgress, ({ one }) => ({
  user: one(users, {
    fields: [decisionTreeProgress.userId],
    references: [users.id],
  }),
  advisor: one(advisors, {
    fields: [decisionTreeProgress.advisorId],
    references: [advisors.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const learningAnalyticsRelations = relations(learningAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [learningAnalytics.userId],
    references: [users.id],
  }),
}));

export const behaviorPatternsRelations = relations(behaviorPatterns, ({ one }) => ({
  user: one(users, {
    fields: [behaviorPatterns.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdvisorSchema = createInsertSchema(advisors).omit({
  createdAt: true,
});

export const insertAdvisorSessionSchema = createInsertSchema(advisorSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDecisionTreeProgressSchema = createInsertSchema(decisionTreeProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Advisor = typeof advisors.$inferSelect;
export type InsertAdvisor = z.infer<typeof insertAdvisorSchema>;
export type AdvisorSession = typeof advisorSessions.$inferSelect;
export type InsertAdvisorSession = z.infer<typeof insertAdvisorSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type DecisionTreeProgress = typeof decisionTreeProgress.$inferSelect;
export type InsertDecisionTreeProgress = z.infer<typeof insertDecisionTreeProgressSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type LearningAnalytics = typeof learningAnalytics.$inferSelect;
export type InsertLearningAnalytics = typeof learningAnalytics.$inferInsert;
export type BehaviorPattern = typeof behaviorPatterns.$inferSelect;
export type InsertBehaviorPattern = typeof behaviorPatterns.$inferInsert;
export type AIModelPerformance = typeof aiModelPerformance.$inferSelect;
export type InsertAIModelPerformance = typeof aiModelPerformance.$inferInsert;
export type EducationContent = typeof educationContent.$inferSelect;
export type InsertEducationContent = typeof educationContent.$inferInsert;
