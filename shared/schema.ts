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
  uuid,
  date,
  numeric
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with modern authentication and premium features
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(), // Made nullable for social auth
  username: varchar("username", { length: 100 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  dateOfBirth: timestamp("date_of_birth"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  occupation: varchar("occupation", { length: 100 }),
  
  // User role and permissions
  role: varchar("role", { enum: ['user', 'moderator', 'admin'] }).default('user'),
  
  // Social authentication providers
  googleId: varchar("google_id", { length: 255 }),
  facebookId: varchar("facebook_id", { length: 255 }),
  githubId: varchar("github_id", { length: 255 }),
  discordId: varchar("discord_id", { length: 255 }),
  
  // Premium subscription fields
  subscriptionTier: varchar("subscription_tier", { enum: ['free', 'pro', 'max'] }).default('free'),
  subscriptionStatus: varchar("subscription_status", { enum: ['active', 'cancelled', 'expired'] }).default('active'),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  
  // API usage tracking
  apiUsageThisMonth: decimal("api_usage_this_month", { precision: 10, scale: 4 }).default('0'),
  apiUsageResetDate: timestamp("api_usage_reset_date").defaultNow(),
  
  // User preferences and settings
  preferences: jsonb("preferences").default({
    theme: 'system',
    language: 'en',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analyticsOptOut: false
    },
    aiSettings: {
      preferredAdvisorType: 'general',
      riskTolerance: 'moderate',
      learningStyle: 'visual'
    }
  }),
  
  // Verification and security
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  accountStatus: varchar("account_status", { enum: ['active', 'suspended', 'pending'] }).default('pending'),
  
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
  message: text("message").notNull(),
  sender: varchar("sender", { enum: ['user', 'advisor'] }).notNull(),
  messageType: varchar("message_type", { enum: ['text', 'image', 'file', 'system'] }).default('text'),
  metadata: jsonb("metadata").default({}),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }),
  importance: varchar("importance", { enum: ['low', 'medium', 'high'] }).default('medium'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Decision tree progress tracking
export const decisionTreeProgress = pgTable("decision_tree_progress", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  advisorId: varchar("advisor_id", { length: 50 }).references(() => advisors.id).notNull(),
  treeType: varchar("tree_type", { length: 100 }).notNull(), // investment, savings, debt, etc.
  currentNode: varchar("current_node", { length: 100 }).notNull(),
  progress: integer("progress").default(0),
  responses: jsonb("responses").default([]),
  recommendations: jsonb("recommendations").default([]),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievements system
export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // learning, engagement, milestones
  type: varchar("type", { enum: ['bronze', 'silver', 'gold', 'platinum'] }).notNull(),
  criteria: jsonb("criteria").notNull(),
  points: integer("points").default(0),
  icon: varchar("icon", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  achievementId: varchar("achievement_id", { length: 255 }).references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
});

// Learning analytics for AI improvement
export const learningAnalytics = pgTable("learning_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventData: jsonb("event_data").default({}),
  sessionContext: jsonb("session_context").default({}),
  timestamp: timestamp("timestamp").defaultNow(),
  processingStatus: varchar("processing_status", { enum: ['pending', 'processed', 'failed'] }).default('pending'),
});

// Subscription plans configuration
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  interval: varchar("interval", { enum: ['month', 'year'] }).notNull(),
  features: jsonb("features").default([]),
  apiLimit: decimal("api_limit", { precision: 10, scale: 4 }), // In dollars
  maxAdvisorAccess: integer("max_advisor_access").default(1),
  decisionTreeAccess: boolean("decision_tree_access").default(false),
  isActive: boolean("is_active").default(true),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User behavior patterns for AI learning
export const behaviorPatterns = pgTable("behavior_patterns", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  patternType: varchar("pattern_type", { length: 100 }).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  data: jsonb("data").default({}),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isValid: boolean("is_valid").default(true),
});

// AI model performance tracking
export const aiModelPerformance = pgTable("ai_model_performance", {
  id: varchar("id", { length: 255 }).primaryKey(),
  modelVersion: varchar("model_version", { length: 50 }).notNull(),
  requestType: varchar("request_type", { length: 100 }).notNull(),
  responseTime: integer("response_time"), // in milliseconds
  tokenCount: integer("token_count"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  successRate: decimal("success_rate", { precision: 5, scale: 4 }),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}),
});

// User activity log for compliance and analytics
export const userActivityLog = pgTable("user_activity_log", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  success: boolean("success").default(true),
  metadata: jsonb("metadata").default({}),
});

// Education content for structured learning
export const educationContent = pgTable("education_content", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { enum: ['article', 'video', 'interactive', 'quiz'] }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { enum: ['beginner', 'intermediate', 'advanced'] }).notNull(),
  content: text("content"),
  metadata: jsonb("metadata").default({}),
  estimatedTime: integer("estimated_time"), // in minutes
  prerequisites: jsonb("prerequisites").default([]),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verification codes for email/phone verification
export const verificationCodes = pgTable("verification_codes", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  type: varchar("type", { enum: ['email', 'phone', 'password_reset'] }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  attempts: integer("attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bank Accounts Table - stores connected bank accounts via Plaid
export const bankAccounts = pgTable("bank_accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  plaidAccessToken: varchar("plaid_access_token", { length: 500 }).notNull(),
  plaidAccountId: varchar("plaid_account_id", { length: 255 }).notNull(),
  plaidItemId: varchar("plaid_item_id", { length: 255 }).notNull(),
  institutionId: varchar("institution_id", { length: 255 }),
  institutionName: varchar("institution_name", { length: 255 }),
  accountName: varchar("account_name", { length: 255 }),
  accountType: varchar("account_type", { length: 100 }), // checking, savings, credit, investment
  accountSubtype: varchar("account_subtype", { length: 100 }),
  mask: varchar("mask", { length: 10 }), // last 4 digits
  availableBalance: decimal("available_balance", { precision: 12, scale: 2 }),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }),
  isoCurrencyCode: varchar("iso_currency_code", { length: 3 }).default('USD'),
  isActive: boolean("is_active").default(true),
  lastSyncDate: timestamp("last_sync_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bank Transactions Table - stores transaction data from Plaid
export const bankTransactions = pgTable("bank_transactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  accountId: varchar("account_id", { length: 255 }).notNull().references(() => bankAccounts.id),
  plaidTransactionId: varchar("plaid_transaction_id", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  isoCurrencyCode: varchar("iso_currency_code", { length: 3 }).default('USD'),
  date: date("date").notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  merchantName: varchar("merchant_name", { length: 255 }),
  
  // Transaction categorization
  primaryCategory: varchar("primary_category", { length: 100 }),
  detailedCategory: varchar("detailed_category", { length: 100 }),
  confidenceLevel: varchar("confidence_level", { length: 50 }),
  
  // Location data
  locationData: jsonb("location_data"),
  
  // Payment metadata
  paymentChannel: varchar("payment_channel", { length: 100 }), // online, in store, etc
  paymentMethod: varchar("payment_method", { length: 100 }), // card, ach, etc
  
  // Account-specific info
  accountOwner: varchar("account_owner", { length: 255 }),
  pending: boolean("pending").default(false),
  
  // AI Analysis fields
  aiCategory: varchar("ai_category", { length: 100 }),
  aiInsights: jsonb("ai_insights"),
  educationalTags: text("educational_tags").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bank Connection Status - track Plaid link status
export const bankConnections = pgTable("bank_connections", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  plaidItemId: varchar("plaid_item_id", { length: 255 }).notNull().unique(),
  institutionId: varchar("institution_id", { length: 255 }),
  institutionName: varchar("institution_name", { length: 255 }),
  status: varchar("status", { enum: ['connected', 'requires_update', 'error', 'disconnected'] }).default('connected'),
  lastError: varchar("last_error", { length: 500 }),
  consentExpiresAt: timestamp("consent_expires_at"),
  lastSuccessfulUpdate: timestamp("last_successful_update").defaultNow(),
  updateFrequency: varchar("update_frequency", { length: 50 }).default('daily'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  sessions: many(advisorSessions),
  messages: many(chatMessages),
  achievements: many(userAchievements),
  analytics: many(learningAnalytics),
  behaviors: many(behaviorPatterns),
  activities: many(userActivityLog),
  verificationCodes: many(verificationCodes),
  bankAccounts: many(bankAccounts),
  bankTransactions: many(bankTransactions),
  bankConnections: many(bankConnections),
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

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Advisor = typeof advisors.$inferSelect;
export type NewAdvisor = typeof advisors.$inferInsert;
export type AdvisorSession = typeof advisorSessions.$inferSelect;
export type NewAdvisorSession = typeof advisorSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type DecisionTreeProgress = typeof decisionTreeProgress.$inferSelect;
export type NewDecisionTreeProgress = typeof decisionTreeProgress.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type LearningAnalytics = typeof learningAnalytics.$inferSelect;
export type NewLearningAnalytics = typeof learningAnalytics.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type BehaviorPattern = typeof behaviorPatterns.$inferSelect;
export type NewBehaviorPattern = typeof behaviorPatterns.$inferInsert;
export type AIModelPerformance = typeof aiModelPerformance.$inferSelect;
export type NewAIModelPerformance = typeof aiModelPerformance.$inferInsert;
export type UserActivityLog = typeof userActivityLog.$inferSelect;
export type NewUserActivityLog = typeof userActivityLog.$inferInsert;
export type EducationContent = typeof educationContent.$inferSelect;
export type NewEducationContent = typeof educationContent.$inferInsert;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type NewVerificationCode = typeof verificationCodes.$inferInsert;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;
export type BankTransaction = typeof bankTransactions.$inferSelect;
export type NewBankTransaction = typeof bankTransactions.$inferInsert;
export type BankConnection = typeof bankConnections.$inferSelect;
export type NewBankConnection = typeof bankConnections.$inferInsert;

// Insert schemas with validation
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

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDecisionTreeProgressSchema = createInsertSchema(decisionTreeProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningAnalyticsSchema = createInsertSchema(learningAnalytics).omit({
  id: true,
  timestamp: true,
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({
  id: true,
  createdAt: true,
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertDecisionTreeProgress = z.infer<typeof insertDecisionTreeProgressSchema>;
export type InsertLearningAnalytics = z.infer<typeof insertLearningAnalyticsSchema>;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;