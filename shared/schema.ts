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
  numeric,
  index
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
  
  // Authentication and security
  passwordHash: varchar("password_hash", { length: 255 }),
  sessionToken: varchar("session_token", { length: 255 }),
  lastLogin: timestamp("last_login"),
  
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
  
  // Admin permissions for Jarvis AI
  jarvisPermissions: jsonb("jarvis_permissions").default({
    codeModification: false,
    databaseAccess: false,
    aiTraining: false,
    systemAdmin: false,
    fullAccess: false
  }),
  
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

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

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

// Personalized Decision Tree Responses
export const personalizedDecisionTreeResponses = pgTable("personalized_decision_tree_responses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  advisorId: varchar("advisor_id", { length: 50 }).references(() => advisors.id).notNull(),
  questionId: varchar("question_id", { length: 100 }).notNull(),
  answer: jsonb("answer").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default('1.0'),
  additionalData: jsonb("additional_data").default({}),
  timestamp: timestamp("timestamp").defaultNow(),
  sessionId: varchar("session_id", { length: 255 }),
  aiContext: text("ai_context"),
  aiWeight: decimal("ai_weight", { precision: 3, scale: 2 }).default('1.0'),
});

// AI Emotional Financial Profiles
export const aiEmotionalProfiles = pgTable("ai_emotional_profiles", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  advisorId: varchar("advisor_id", { length: 50 }).references(() => advisors.id).notNull(),
  
  // Emotional Intelligence Mapping
  moneyRelationship: varchar("money_relationship", { enum: ['anxiety', 'opportunity', 'practical', 'avoidance'] }),
  spendingTriggers: varchar("spending_triggers", { enum: ['social_pressure', 'emotional_state', 'convenience', 'planned'] }),
  lossTolerance: varchar("loss_tolerance", { enum: ['risk_averse', 'moderate_risk', 'risk_seeking'] }),
  stressResponse: varchar("stress_response", { enum: ['fight', 'flight', 'freeze', 'analysis'] }),
  decisionStyle: varchar("decision_style", { enum: ['impulsive', 'analytical', 'collaborative', 'avoidant'] }),
  
  // Financial Psychology Drivers
  primaryMotivation: varchar("primary_motivation", { enum: ['security', 'growth', 'freedom', 'legacy', 'status'] }),
  fearHierarchy: jsonb("fear_hierarchy").default([]),
  rewardPreferences: varchar("reward_preferences", { enum: ['immediate', 'delayed', 'milestone_based', 'social_recognition'] }),
  controlNeeds: varchar("control_needs", { enum: ['high_control', 'guided_decisions', 'expert_delegation'] }),
  changeReadiness: varchar("change_readiness", { enum: ['fully_committed', 'gradual_changes', 'small_experiments'] }),
  
  // Behavioral Prediction Models
  behaviorPredictions: jsonb("behavior_predictions").default({}),
  
  // AI Insights and Recommendations
  personalityArchetype: varchar("personality_archetype", { length: 255 }),
  financialMaturityStage: varchar("financial_maturity_stage", { enum: ['beginner', 'developing', 'intermediate', 'advanced'] }),
  learningStyle: varchar("learning_style", { enum: ['visual', 'auditory', 'kinesthetic', 'reading'] }),
  motivationTriggers: jsonb("motivation_triggers").default([]),
  potentialBlindSpots: jsonb("potential_blind_spots").default([]),
  recommendedStrategies: jsonb("recommended_strategies").default([]),
  
  // Ideal Money Plan
  idealMoneyPlan: jsonb("ideal_money_plan").default({}),
  
  // Confidence Scores
  profileAccuracy: decimal("profile_accuracy", { precision: 3, scale: 2 }).default('0.5'),
  predictionReliability: decimal("prediction_reliability", { precision: 3, scale: 2 }).default('0.5'),
  recommendationStrength: decimal("recommendation_strength", { precision: 3, scale: 2 }).default('0.5'),
  
  // Metadata
  analysisVersion: varchar("analysis_version", { length: 50 }).default('1.0'),
  rawData: jsonb("raw_data").default({}),
  processingStatus: varchar("processing_status", { enum: ['pending', 'processed', 'failed', 'updated'] }).default('pending'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Generated Insights and Recommendations
export const aiInsights = pgTable("ai_insights", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  advisorId: varchar("advisor_id", { length: 50 }).references(() => advisors.id).notNull(),
  profileId: varchar("profile_id", { length: 255 }).references(() => aiEmotionalProfiles.id),
  
  insightType: varchar("insight_type", { enum: ['behavioral', 'emotional', 'financial', 'recommendation', 'warning'] }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  // Personalization Data
  communicationStrategy: text("communication_strategy"),
  motivationApproach: text("motivation_approach"),
  riskConsiderations: jsonb("risk_considerations").default([]),
  behavioralNudges: jsonb("behavioral_nudges").default([]),
  
  // Confidence and Metrics
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default('0.5'),
  impact: varchar("impact", { enum: ['low', 'medium', 'high'] }).default('medium'),
  priority: varchar("priority", { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium'),
  
  // User Feedback
  userRating: integer("user_rating"), // 1-5 stars
  userFeedback: text("user_feedback"),
  wasUseful: boolean("was_useful"),
  
  // AI Performance Tracking
  responseTime: integer("response_time"), // milliseconds
  tokenUsage: integer("token_usage"),
  processingCost: decimal("processing_cost", { precision: 10, scale: 6 }),
  
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Decision Tree Session Management
export const decisionTreeSessions = pgTable("decision_tree_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  advisorId: varchar("advisor_id", { length: 50 }).references(() => advisors.id).notNull(),
  
  sessionStatus: varchar("session_status", { enum: ['active', 'completed', 'abandoned', 'paused'] }).default('active'),
  currentQuestionId: varchar("current_question_id", { length: 100 }),
  totalQuestions: integer("total_questions").default(0),
  answeredQuestions: integer("answered_questions").default(0),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).default('0'),
  
  // Session Analytics
  startedAt: timestamp("started_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // seconds
  
  // AI Processing Results
  emotionalProfileGenerated: boolean("emotional_profile_generated").default(false),
  insightsGenerated: boolean("insights_generated").default(false),
  recommendationsReady: boolean("recommendations_ready").default(false),
  
  sessionData: jsonb("session_data").default({}),
  metadata: jsonb("metadata").default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export type UpsertUser = typeof users.$inferInsert;
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

// Enhanced Analytics Tables for Comprehensive Data Collection
export const userSessions = pgTable("user_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  sessionToken: varchar("session_token", { length: 255 }).unique(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  pagesVisited: integer("pages_visited").default(0),
  actionsPerformed: integer("actions_performed").default(0),
  deviceType: varchar("device_type", { length: 100 }),
  browser: varchar("browser", { length: 100 }),
  operatingSystem: varchar("operating_system", { length: 100 }),
  screenResolution: varchar("screen_resolution", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  geolocation: jsonb("geolocation"),
  referrer: text("referrer"),
  exitPage: varchar("exit_page", { length: 500 }),
  bounceRate: numeric("bounce_rate", { precision: 5, scale: 2 }),
  engagementScore: integer("engagement_score"),
  conversionEvents: jsonb("conversion_events").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pageAnalytics = pgTable("page_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).references(() => userSessions.id),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  pagePath: varchar("page_path", { length: 500 }).notNull(),
  pageTitle: varchar("page_title", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow(),
  timeOnPage: integer("time_on_page"), // in seconds
  scrollDepth: numeric("scroll_depth", { precision: 5, scale: 2 }), // percentage
  clickCount: integer("click_count").default(0),
  exitPage: boolean("exit_page").default(false),
  loadTime: integer("load_time"), // in milliseconds
  performanceMetrics: jsonb("performance_metrics"),
  heatmapData: jsonb("heatmap_data"),
});

export const userInteractionEvents = pgTable("user_interaction_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).references(() => userSessions.id),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  eventType: varchar("event_type", { length: 100 }).notNull(), // click, hover, scroll, form_submit, etc.
  eventCategory: varchar("event_category", { length: 100 }), // financial_tool, navigation, learning, etc.
  eventAction: varchar("event_action", { length: 100 }),
  eventLabel: varchar("event_label", { length: 255 }),
  elementId: varchar("element_id", { length: 255 }),
  elementClass: varchar("element_class", { length: 255 }),
  elementText: text("element_text"),
  pagePath: varchar("page_path", { length: 500 }),
  coordinates: jsonb("coordinates"), // x, y coordinates for clicks
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
  conversionValue: numeric("conversion_value", { precision: 10, scale: 2 }),
  funnelStep: varchar("funnel_step", { length: 100 }),
});

export const financialDataCollection = pgTable("financial_data_collection", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  dataType: varchar("data_type", { length: 100 }).notNull(), // income, expenses, assets, liabilities, goals
  dataSource: varchar("data_source", { length: 100 }), // manual_input, bank_sync, ai_inference, import
  originalData: jsonb("original_data").notNull(),
  processedData: jsonb("processed_data"),
  confidence: numeric("confidence", { precision: 5, scale: 2 }), // 0-100
  verified: boolean("verified").default(false),
  category: varchar("category", { length: 100 }),
  subcategory: varchar("subcategory", { length: 100 }),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default('USD'),
  reportingPeriod: varchar("reporting_period", { length: 50 }), // monthly, quarterly, yearly
  tags: jsonb("tags").default([]),
  aiInsights: jsonb("ai_insights"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FinApp MVP Pro Core - Budget & Cashflow Automation Tables

// User Accounts (bank accounts, credit cards, etc.)
export const userAccounts = pgTable("user_accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // checking, savings, credit_card, investment
  institutionName: varchar("institution_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 255 }), // encrypted
  currentBalance: integer("current_balance_cents").notNull().default(0), // stored as cents
  availableBalance: integer("available_balance_cents"),
  currency: varchar("currency", { length: 3 }).default('PLN'),
  isActive: boolean("is_active").default(true),
  lastSynced: timestamp("last_synced"),
  syncStatus: varchar("sync_status", { length: 50 }).default('active'), // active, error, disconnected
  plaidAccountId: varchar("plaid_account_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Transactions Table (with amounts as integers in cents)
export const transactions = pgTable("transactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  accountId: varchar("account_id", { length: 255 }).references(() => userAccounts.id).notNull(),
  
  // Core transaction data
  amountCents: integer("amount_cents").notNull(), // Amount in cents/groszy
  currency: varchar("currency", { length: 3 }).default('PLN'),
  transactionDate: date("transaction_date").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  merchantName: varchar("merchant_name", { length: 255 }),
  
  // Categorization
  categoryId: varchar("category_id", { length: 255 }),
  subcategoryId: varchar("subcategory_id", { length: 255 }),
  userCategoryOverride: varchar("user_category_override", { length: 100 }),
  
  // Import and deduplication
  importHash: varchar("import_hash", { length: 255 }).unique(), // for idempotent imports
  importSource: varchar("import_source", { length: 100 }), // csv, bank_api, manual
  externalId: varchar("external_id", { length: 255 }), // from bank API
  
  // Transaction metadata
  transactionType: varchar("transaction_type", { length: 50 }), // debit, credit, transfer
  status: varchar("status", { length: 50 }).default('completed'), // pending, completed, cancelled
  tags: jsonb("tags").default([]),
  notes: text("notes"),
  
  // AI processing
  aiCategoryConfidence: numeric("ai_category_confidence", { precision: 5, scale: 2 }),
  aiProcessed: boolean("ai_processed").default(false),
  anomalyScore: numeric("anomaly_score", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userDateIdx: index("transactions_user_date_idx").on(table.userId, table.transactionDate),
  hashIdx: index("transactions_hash_idx").on(table.importHash),
}));

// Transaction Categories (hierarchical)
export const transactionCategories = pgTable("transaction_categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id), // null for global categories
  name: varchar("name", { length: 100 }).notNull(),
  parentId: varchar("parent_id", { length: 255 }).references(() => transactionCategories.id),
  color: varchar("color", { length: 7 }).default('#3B82F6'), // hex color
  icon: varchar("icon", { length: 50 }),
  budgetable: boolean("budgetable").default(true),
  isIncome: boolean("is_income").default(false),
  orderIndex: integer("order_index").default(0),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Budgets
export const budgets = pgTable("budgets", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  budgetType: varchar("budget_type", { length: 50 }).default('monthly'), // monthly, weekly, yearly
  
  // Budget period
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  
  // Budget allocation (per category)
  categoryLimits: jsonb("category_limits").notNull().default({}), // {categoryId: amountCents}
  totalBudgetCents: integer("total_budget_cents").notNull().default(0),
  
  // Alert settings
  alertThresholds: jsonb("alert_thresholds").default({
    warning: 80, // percentage
    danger: 100
  }),
  
  // Status and metadata
  isActive: boolean("is_active").default(true),
  autoRollover: boolean("auto_rollover").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Goals (savings targets, debt payoff, etc.)
export const financialGoals = pgTable("financial_goals", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  
  // Goal details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // savings, debt_payoff, investment, emergency_fund
  
  // Target and progress
  targetAmountCents: integer("target_amount_cents").notNull(),
  currentAmountCents: integer("current_amount_cents").default(0),
  
  // Timeline
  targetDate: date("target_date"),
  startDate: date("start_date").defaultNow(),
  
  // Automation settings
  autoContributionCents: integer("auto_contribution_cents").default(0), // monthly auto-transfer
  linkedAccountId: varchar("linked_account_id", { length: 255 }).references(() => userAccounts.id),
  
  // Progress tracking
  milestones: jsonb("milestones").default([]), // [{amount: number, date: string, achieved: boolean}]
  priority: integer("priority").default(1), // 1-5 scale
  
  // Status
  status: varchar("status", { length: 50 }).default('active'), // active, paused, completed, cancelled
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Debt Tracking (credit cards, loans, etc.)
export const debts = pgTable("debts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  
  // Debt details
  debtName: varchar("debt_name", { length: 255 }).notNull(),
  debtType: varchar("debt_type", { length: 50 }).notNull(), // credit_card, student_loan, mortgage, personal_loan
  creditorName: varchar("creditor_name", { length: 255 }),
  
  // Financial details
  originalBalanceCents: integer("original_balance_cents").notNull(),
  currentBalanceCents: integer("current_balance_cents").notNull(),
  minimumPaymentCents: integer("minimum_payment_cents").notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 4 }).notNull(), // as decimal (0.1995 for 19.95%)
  
  // Payment schedule
  paymentDueDate: integer("payment_due_date").notNull(), // day of month (1-31)
  paymentStrategy: varchar("payment_strategy", { length: 50 }).default('minimum'), // minimum, snowball, avalanche
  targetPaymentCents: integer("target_payment_cents"),
  
  // Payoff projections
  payoffDate: date("payoff_date"),
  totalInterestCents: integer("total_interest_cents"),
  
  // Status and tracking
  isActive: boolean("is_active").default(true),
  linkedAccountId: varchar("linked_account_id", { length: 255 }).references(() => userAccounts.id),
  lastPaymentDate: date("last_payment_date"),
  lastPaymentAmountCents: integer("last_payment_amount_cents"),
  
  // Alerts
  alertsEnabled: boolean("alerts_enabled").default(true),
  alertDaysBefore: integer("alert_days_before").default(3),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cashflow Predictions & Analytics
export const cashflowPredictions = pgTable("cashflow_predictions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  
  // Prediction details
  predictionDate: date("prediction_date").notNull(),
  predictionType: varchar("prediction_type", { length: 50 }).notNull(), // daily, weekly, monthly, end_of_month
  
  // Predicted values
  predictedBalanceCents: integer("predicted_balance_cents").notNull(),
  confidenceLevel: numeric("confidence_level", { precision: 5, scale: 2 }), // 0-100
  
  // Supporting data
  expectedIncomeCents: integer("expected_income_cents").default(0),
  expectedExpensesCents: integer("expected_expenses_cents").default(0),
  recurringTransactions: jsonb("recurring_transactions").default([]),
  
  // Model metadata
  modelVersion: varchar("model_version", { length: 50 }),
  factors: jsonb("factors"), // what influenced the prediction
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userPredictionIdx: index("cashflow_user_prediction_idx").on(table.userId, table.predictionDate),
}));

// AI Insights & Recommendations
export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  
  // Recommendation details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // budget, debt, savings, spending, investment
  
  // Action items
  actionSteps: jsonb("action_steps").notNull(), // [{step: string, completed: boolean, link?: string}]
  expectedImpact: text("expected_impact"),
  priority: varchar("priority", { length: 20 }).default('medium'), // low, medium, high, urgent
  
  // Implementation tracking
  status: varchar("status", { length: 50 }).default('new'), // new, viewed, in_progress, completed, dismissed
  completedAt: timestamp("completed_at"),
  dismissedAt: timestamp("dismissed_at"),
  
  // Deep links and automation
  deepLink: varchar("deep_link", { length: 500 }), // link to relevant app section
  automationAvailable: boolean("automation_available").default(false),
  
  // Validity and scheduling
  validUntil: timestamp("valid_until"),
  scheduleFor: timestamp("schedule_for"), // when to show this recommendation
  
  // Analytics
  viewCount: integer("view_count").default(0),
  clickCount: integer("click_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recurring Transactions (subscriptions, bills, income)
export const recurringTransactions = pgTable("recurring_transactions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  accountId: varchar("account_id", { length: 255 }).references(() => userAccounts.id).notNull(),
  
  // Transaction details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  amountCents: integer("amount_cents").notNull(),
  categoryId: varchar("category_id", { length: 255 }),
  
  // Recurrence pattern
  frequency: varchar("frequency", { length: 50 }).notNull(), // daily, weekly, monthly, quarterly, yearly
  interval: integer("interval").default(1), // every N periods
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // null for indefinite
  
  // Next occurrence
  nextDueDate: date("next_due_date").notNull(),
  lastProcessedDate: date("last_processed_date"),
  
  // Automation
  autoCreate: boolean("auto_create").default(false), // automatically create transactions
  reminderDaysBefore: integer("reminder_days_before").default(1),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const toolUsageAnalytics = pgTable("tool_usage_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  toolName: varchar("tool_name", { length: 100 }).notNull(),
  featureName: varchar("feature_name", { length: 100 }),
  sessionId: varchar("session_id", { length: 255 }).references(() => userSessions.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  timeSpent: integer("time_spent"), // in seconds
  actionsPerformed: integer("actions_performed").default(0),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  completionStatus: varchar("completion_status", { length: 50 }), // completed, abandoned, error
  userSatisfaction: integer("user_satisfaction"), // 1-5 scale
  errorCount: integer("error_count").default(0),
  helpRequested: boolean("help_requested").default(false),
  sharingBehavior: jsonb("sharing_behavior"),
  conversionMetrics: jsonb("conversion_metrics"),
});

export const aiInteractionAnalytics = pgTable("ai_interaction_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }).references(() => advisorSessions.id),
  advisorType: varchar("advisor_type", { length: 100 }),
  messageId: varchar("message_id", { length: 255 }).references(() => chatMessages.id),
  userInput: text("user_input"),
  aiResponse: text("ai_response"),
  responseTime: integer("response_time"), // in milliseconds
  tokenUsage: integer("token_usage"),
  cost: numeric("cost", { precision: 10, scale: 6 }),
  userSatisfaction: integer("user_satisfaction"), // 1-5 scale
  helpfulness: integer("helpfulness"), // 1-5 scale
  accuracy: integer("accuracy"), // 1-5 scale
  followUpQuestions: integer("follow_up_questions").default(0),
  actionsTaken: jsonb("actions_taken"),
  sentimentAnalysis: jsonb("sentiment_analysis"),
  intentRecognition: jsonb("intent_recognition"),
  personalizationFactors: jsonb("personalization_factors"),
  improvementSuggestions: text("improvement_suggestions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityEngagementAnalytics = pgTable("community_engagement_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  engagementType: varchar("engagement_type", { length: 100 }), // post, comment, like, share, view
  contentId: varchar("content_id", { length: 255 }),
  contentType: varchar("content_type", { length: 100 }),
  engagementQuality: numeric("engagement_quality", { precision: 5, scale: 2 }),
  timeSpent: integer("time_spent"), // in seconds
  reactionType: varchar("reaction_type", { length: 50 }),
  sharingBehavior: jsonb("sharing_behavior"),
  influenceScore: numeric("influence_score", { precision: 5, scale: 2 }),
  networkEffects: jsonb("network_effects"),
  topicAffinity: jsonb("topic_affinity"),
  expertiseLevel: varchar("expertise_level", { length: 50 }),
  helpfulnessRating: integer("helpfulness_rating"), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
});

export const gamificationAnalytics = pgTable("gamification_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  gameElement: varchar("game_element", { length: 100 }), // points, badges, leaderboard, challenges
  actionType: varchar("action_type", { length: 100 }),
  pointsEarned: integer("points_earned").default(0),
  levelAchieved: integer("level_achieved"),
  badgesUnlocked: jsonb("badges_unlocked"),
  challengeCompleted: varchar("challenge_completed", { length: 255 }),
  difficultyLevel: integer("difficulty_level"),
  timeToComplete: integer("time_to_complete"), // in seconds
  motivationImpact: integer("motivation_impact"), // 1-5 scale
  engagementBoost: numeric("engagement_boost", { precision: 5, scale: 2 }),
  socialSharing: boolean("social_sharing").default(false),
  competitiveRanking: integer("competitive_ranking"),
  achievementMetadata: jsonb("achievement_metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const errorTrackingAnalytics = pgTable("error_tracking_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }).references(() => userSessions.id),
  errorType: varchar("error_type", { length: 100 }),
  errorCode: varchar("error_code", { length: 50 }),
  errorMessage: text("error_message"),
  stackTrace: text("stack_trace"),
  pagePath: varchar("page_path", { length: 500 }),
  userAgent: text("user_agent"),
  reproductionSteps: jsonb("reproduction_steps"),
  userImpact: varchar("user_impact", { length: 100 }), // low, medium, high, critical
  frequency: integer("frequency").default(1),
  resolved: boolean("resolved").default(false),
  resolutionTime: integer("resolution_time"), // in minutes
  workaroundProvided: boolean("workaround_provided").default(false),
  userFeedback: text("user_feedback"),
  automaticRecovery: boolean("automatic_recovery").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const reportingAnalytics = pgTable("reporting_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  reportType: varchar("report_type", { length: 100 }),
  reportCategory: varchar("report_category", { length: 100 }),
  generationTime: integer("generation_time"), // in milliseconds
  dataPointsIncluded: integer("data_points_included"),
  timeRange: jsonb("time_range"),
  filters: jsonb("filters"),
  customizations: jsonb("customizations"),
  exportFormat: varchar("export_format", { length: 50 }),
  downloadCount: integer("download_count").default(0),
  shareCount: integer("share_count").default(0),
  viewTime: integer("view_time"), // in seconds
  userRating: integer("user_rating"), // 1-5 scale
  feedback: text("feedback"),
  actionsTaken: jsonb("actions_taken"),
  businessImpact: jsonb("business_impact"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictiveAnalytics = pgTable("predictive_analytics", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  predictionType: varchar("prediction_type", { length: 100 }), // financial_goal, behavior, risk, opportunity
  modelVersion: varchar("model_version", { length: 50 }),
  inputFeatures: jsonb("input_features"),
  prediction: jsonb("prediction"),
  confidence: numeric("confidence", { precision: 5, scale: 2 }), // 0-100
  timeHorizon: integer("time_horizon"), // prediction window in days
  actualOutcome: jsonb("actual_outcome"),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
  businessValue: numeric("business_value", { precision: 10, scale: 2 }),
  actionRecommendations: jsonb("action_recommendations"),
  riskFactors: jsonb("risk_factors"),
  monitoringMetrics: jsonb("monitoring_metrics"),
  feedbackLoop: jsonb("feedback_loop"),
  createdAt: timestamp("created_at").defaultNow(),
  validatedAt: timestamp("validated_at"),
});

// Jarvis AI Assistant System Tables
export const jarvisAiSessions = pgTable("jarvis_ai_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  sessionType: varchar("session_type", { length: 50 }), // development, training, admin, analytics
  sessionName: varchar("session_name", { length: 255 }),
  permissions: jsonb("permissions"), // specific permissions for this session
  status: varchar("status", { length: 50 }).default('active'), // active, paused, completed, terminated
  goals: jsonb("goals"), // what the user wants to accomplish
  context: jsonb("context"), // current application context and state
  taskQueue: jsonb("task_queue"), // queue of pending tasks
  completedTasks: jsonb("completed_tasks"), // history of completed tasks
  aiModel: varchar("ai_model", { length: 100 }).default('gpt-4o'),
  learningData: jsonb("learning_data"), // accumulated learning about the app
  performanceMetrics: jsonb("performance_metrics"),
  codeChanges: jsonb("code_changes"), // track all code modifications
  dataChanges: jsonb("data_changes"), // track all data modifications
  systemAccess: jsonb("system_access"), // what parts of system Jarvis has accessed
  errorLog: jsonb("error_log"), // track any errors or issues
  successMetrics: jsonb("success_metrics"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const jarvisAiConversations = pgTable("jarvis_ai_conversations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).references(() => jarvisAiSessions.id).notNull(),
  messageId: varchar("message_id", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // user, assistant, system
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 50 }), // command, query, response, status, error, success
  toolCalls: jsonb("tool_calls"), // AI tool calls made
  functionResults: jsonb("function_results"), // results from function calls
  codeSnippets: jsonb("code_snippets"), // any code in the message
  dataQueries: jsonb("data_queries"), // any database queries made
  systemActions: jsonb("system_actions"), // system-level actions performed
  metadata: jsonb("metadata"), // additional message metadata
  tokens: integer("tokens"), // token count for this message
  cost: numeric("cost", { precision: 10, scale: 4 }), // estimated cost
  processingTime: integer("processing_time"), // time to process in ms
  createdAt: timestamp("created_at").defaultNow(),
});

export const jarvisAiKnowledge = pgTable("jarvis_ai_knowledge", {
  id: varchar("id", { length: 255 }).primaryKey(),
  category: varchar("category", { length: 100 }), // codebase, api, database, user_patterns, business_logic
  subcategory: varchar("subcategory", { length: 100 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  content: jsonb("content"), // the actual knowledge content
  sourceType: varchar("source_type", { length: 50 }), // learned, trained, manual, discovered
  confidence: numeric("confidence", { precision: 5, scale: 2 }), // 0-100 confidence in this knowledge
  usageCount: integer("usage_count").default(0), // how often this knowledge is referenced
  lastUsedAt: timestamp("last_used_at"),
  tags: jsonb("tags"), // searchable tags
  relatedFiles: jsonb("related_files"), // files this knowledge relates to
  relatedFunctions: jsonb("related_functions"), // functions this knowledge relates to
  relatedData: jsonb("related_data"), // data structures this knowledge relates to
  examples: jsonb("examples"), // usage examples
  version: varchar("version", { length: 50 }).default('1.0'),
  deprecatedAt: timestamp("deprecated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jarvisAiTasks = pgTable("jarvis_ai_tasks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).references(() => jarvisAiSessions.id).notNull(),
  parentTaskId: varchar("parent_task_id", { length: 255 }), // for subtasks
  taskType: varchar("task_type", { length: 100 }), // code_modification, data_analysis, training, debugging, feature_development
  priority: varchar("priority", { length: 20 }).default('medium'), // low, medium, high, critical
  status: varchar("status", { length: 50 }).default('pending'), // pending, in_progress, completed, failed, cancelled
  title: varchar("title", { length: 255 }),
  description: text("description"),
  requirements: jsonb("requirements"), // detailed task requirements
  constraints: jsonb("constraints"), // limitations or constraints
  expectedOutput: jsonb("expected_output"), // what the result should look like
  actualOutput: jsonb("actual_output"), // actual result
  progress: integer("progress").default(0), // 0-100 completion percentage
  estimatedTime: integer("estimated_time"), // estimated time in minutes
  actualTime: integer("actual_time"), // actual time taken in minutes
  dependencies: jsonb("dependencies"), // what this task depends on
  resources: jsonb("resources"), // files, APIs, data needed
  toolsUsed: jsonb("tools_used"), // which tools were used
  codeChanges: jsonb("code_changes"), // code modifications made
  dataChanges: jsonb("data_changes"), // data changes made
  testResults: jsonb("test_results"), // testing outcomes
  qualityScore: numeric("quality_score", { precision: 5, scale: 2 }), // 0-100 quality assessment
  userFeedback: jsonb("user_feedback"), // user feedback on the task
  learnings: jsonb("learnings"), // what was learned from this task
  errors: jsonb("errors"), // any errors encountered
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jarvisAiTraining = pgTable("jarvis_ai_training", {
  id: varchar("id", { length: 255 }).primaryKey(),
  trainingType: varchar("training_type", { length: 100 }), // codebase_analysis, user_behavior, performance_optimization, feature_patterns
  dataSource: varchar("data_source", { length: 100 }), // code, logs, user_interactions, analytics, system_metrics
  inputData: jsonb("input_data"), // training input data
  expectedOutput: jsonb("expected_output"), // expected training outcomes
  actualOutput: jsonb("actual_output"), // actual training results
  modelParameters: jsonb("model_parameters"), // training parameters used
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }), // training accuracy
  loss: numeric("loss", { precision: 10, scale: 6 }), // training loss
  epochs: integer("epochs"), // training epochs completed
  validationScore: numeric("validation_score", { precision: 5, scale: 2 }),
  trainingDuration: integer("training_duration"), // training time in minutes
  memoryUsage: integer("memory_usage"), // memory used in MB
  cpuUsage: numeric("cpu_usage", { precision: 5, scale: 2 }), // CPU usage percentage
  improvements: jsonb("improvements"), // improvements made to the model
  knowledgeGained: jsonb("knowledge_gained"), // new knowledge acquired
  applicationsFound: jsonb("applications_found"), // practical applications discovered
  patterns: jsonb("patterns"), // patterns identified
  insights: jsonb("insights"), // insights gained
  recommendations: jsonb("recommendations"), // recommendations for the system
  status: varchar("status", { length: 50 }).default('in_progress'), // in_progress, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Jarvis AI insert schemas  
export const insertJarvisAiSessionSchema = createInsertSchema(jarvisAiSessions).omit({
  createdAt: true,
  lastActiveAt: true,
});

export const insertJarvisAiConversationSchema = createInsertSchema(jarvisAiConversations).omit({
  createdAt: true,
});

export const insertJarvisAiKnowledgeSchema = createInsertSchema(jarvisAiKnowledge).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertJarvisAiTaskSchema = createInsertSchema(jarvisAiTasks).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertJarvisAiTrainingSchema = createInsertSchema(jarvisAiTraining).omit({
  createdAt: true,
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertDecisionTreeProgress = z.infer<typeof insertDecisionTreeProgressSchema>;
export type InsertLearningAnalytics = z.infer<typeof insertLearningAnalyticsSchema>;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;

// Jarvis AI types
export type JarvisAiSession = typeof jarvisAiSessions.$inferSelect;
export type InsertJarvisAiSession = z.infer<typeof insertJarvisAiSessionSchema>;
export type JarvisAiConversation = typeof jarvisAiConversations.$inferSelect;
export type InsertJarvisAiConversation = z.infer<typeof insertJarvisAiConversationSchema>;
export type JarvisAiKnowledge = typeof jarvisAiKnowledge.$inferSelect;
export type InsertJarvisAiKnowledge = z.infer<typeof insertJarvisAiKnowledgeSchema>;
export type JarvisAiTask = typeof jarvisAiTasks.$inferSelect;
export type InsertJarvisAiTask = z.infer<typeof insertJarvisAiTaskSchema>;
export type JarvisAiTraining = typeof jarvisAiTraining.$inferSelect;
export type InsertJarvisAiTraining = z.infer<typeof insertJarvisAiTrainingSchema>;