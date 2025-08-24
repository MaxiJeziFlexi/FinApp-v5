CREATE TABLE "achievements" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"type" varchar NOT NULL,
	"criteria" jsonb NOT NULL,
	"points" integer DEFAULT 0,
	"icon" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "advisor_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advisor_id" varchar(50) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "advisors" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"specialty" text NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(100) NOT NULL,
	"initial_message" text,
	"rating" numeric(3, 2) DEFAULT '4.5',
	"user_count" integer DEFAULT 0,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_emotional_profiles" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advisor_id" varchar(50) NOT NULL,
	"money_relationship" varchar,
	"spending_triggers" varchar,
	"loss_tolerance" varchar,
	"stress_response" varchar,
	"decision_style" varchar,
	"primary_motivation" varchar,
	"fear_hierarchy" jsonb DEFAULT '[]'::jsonb,
	"reward_preferences" varchar,
	"control_needs" varchar,
	"change_readiness" varchar,
	"behavior_predictions" jsonb DEFAULT '{}'::jsonb,
	"personality_archetype" varchar(255),
	"financial_maturity_stage" varchar,
	"learning_style" varchar,
	"motivation_triggers" jsonb DEFAULT '[]'::jsonb,
	"potential_blind_spots" jsonb DEFAULT '[]'::jsonb,
	"recommended_strategies" jsonb DEFAULT '[]'::jsonb,
	"ideal_money_plan" jsonb DEFAULT '{}'::jsonb,
	"profile_accuracy" numeric(3, 2) DEFAULT '0.5',
	"prediction_reliability" numeric(3, 2) DEFAULT '0.5',
	"recommendation_strength" numeric(3, 2) DEFAULT '0.5',
	"analysis_version" varchar(50) DEFAULT '1.0',
	"raw_data" jsonb DEFAULT '{}'::jsonb,
	"processing_status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_insights" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advisor_id" varchar(50) NOT NULL,
	"profile_id" varchar(255),
	"insight_type" varchar NOT NULL,
	"category" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"communication_strategy" text,
	"motivation_approach" text,
	"risk_considerations" jsonb DEFAULT '[]'::jsonb,
	"behavioral_nudges" jsonb DEFAULT '[]'::jsonb,
	"confidence" numeric(3, 2) DEFAULT '0.5',
	"impact" varchar DEFAULT 'medium',
	"priority" varchar DEFAULT 'medium',
	"user_rating" integer,
	"user_feedback" text,
	"was_useful" boolean,
	"response_time" integer,
	"token_usage" integer,
	"processing_cost" numeric(10, 6),
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_interaction_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"advisor_type" varchar(100),
	"message_id" varchar(255),
	"user_input" text,
	"ai_response" text,
	"response_time" integer,
	"token_usage" integer,
	"cost" numeric(10, 6),
	"user_satisfaction" integer,
	"helpfulness" integer,
	"accuracy" integer,
	"follow_up_questions" integer DEFAULT 0,
	"actions_taken" jsonb,
	"sentiment_analysis" jsonb,
	"intent_recognition" jsonb,
	"personalization_factors" jsonb,
	"improvement_suggestions" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_model_performance" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"model_version" varchar(50) NOT NULL,
	"request_type" varchar(100) NOT NULL,
	"response_time" integer,
	"token_count" integer,
	"cost" numeric(10, 6),
	"success_rate" numeric(5, 4),
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"action_steps" jsonb NOT NULL,
	"expected_impact" text,
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(50) DEFAULT 'new',
	"completed_at" timestamp,
	"dismissed_at" timestamp,
	"deep_link" varchar(500),
	"automation_available" boolean DEFAULT false,
	"valid_until" timestamp,
	"schedule_for" timestamp,
	"view_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"plaid_access_token" varchar(500) NOT NULL,
	"plaid_account_id" varchar(255) NOT NULL,
	"plaid_item_id" varchar(255) NOT NULL,
	"institution_id" varchar(255),
	"institution_name" varchar(255),
	"account_name" varchar(255),
	"account_type" varchar(100),
	"account_subtype" varchar(100),
	"mask" varchar(10),
	"available_balance" numeric(12, 2),
	"current_balance" numeric(12, 2),
	"iso_currency_code" varchar(3) DEFAULT 'USD',
	"is_active" boolean DEFAULT true,
	"last_sync_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bank_connections" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"plaid_item_id" varchar(255) NOT NULL,
	"institution_id" varchar(255),
	"institution_name" varchar(255),
	"status" varchar DEFAULT 'connected',
	"last_error" varchar(500),
	"consent_expires_at" timestamp,
	"last_successful_update" timestamp DEFAULT now(),
	"update_frequency" varchar(50) DEFAULT 'daily',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bank_connections_plaid_item_id_unique" UNIQUE("plaid_item_id")
);
--> statement-breakpoint
CREATE TABLE "bank_transactions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"plaid_transaction_id" varchar(255) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"iso_currency_code" varchar(3) DEFAULT 'USD',
	"date" date NOT NULL,
	"name" varchar(500) NOT NULL,
	"merchant_name" varchar(255),
	"primary_category" varchar(100),
	"detailed_category" varchar(100),
	"confidence_level" varchar(50),
	"location_data" jsonb,
	"payment_channel" varchar(100),
	"payment_method" varchar(100),
	"account_owner" varchar(255),
	"pending" boolean DEFAULT false,
	"ai_category" varchar(100),
	"ai_insights" jsonb,
	"educational_tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bank_transactions_plaid_transaction_id_unique" UNIQUE("plaid_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "behavior_patterns" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"pattern_type" varchar(100) NOT NULL,
	"confidence" numeric(3, 2),
	"data" jsonb DEFAULT '{}'::jsonb,
	"last_updated" timestamp DEFAULT now(),
	"is_valid" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"budget_type" varchar(50) DEFAULT 'monthly',
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"category_limits" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"total_budget_cents" integer DEFAULT 0 NOT NULL,
	"alert_thresholds" jsonb DEFAULT '{"warning":80,"danger":100}'::jsonb,
	"is_active" boolean DEFAULT true,
	"auto_rollover" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cashflow_predictions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"prediction_date" date NOT NULL,
	"prediction_type" varchar(50) NOT NULL,
	"predicted_balance_cents" integer NOT NULL,
	"confidence_level" numeric(5, 2),
	"expected_income_cents" integer DEFAULT 0,
	"expected_expenses_cents" integer DEFAULT 0,
	"recurring_transactions" jsonb DEFAULT '[]'::jsonb,
	"model_version" varchar(50),
	"factors" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advisor_id" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"sender" varchar NOT NULL,
	"message_type" varchar DEFAULT 'text',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"sentiment_score" numeric(3, 2),
	"importance" varchar DEFAULT 'medium',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_engagement_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"engagement_type" varchar(100),
	"content_id" varchar(255),
	"content_type" varchar(100),
	"engagement_quality" numeric(5, 2),
	"time_spent" integer,
	"reaction_type" varchar(50),
	"sharing_behavior" jsonb,
	"influence_score" numeric(5, 2),
	"network_effects" jsonb,
	"topic_affinity" jsonb,
	"expertise_level" varchar(50),
	"helpfulness_rating" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"debt_name" varchar(255) NOT NULL,
	"debt_type" varchar(50) NOT NULL,
	"creditor_name" varchar(255),
	"original_balance_cents" integer NOT NULL,
	"current_balance_cents" integer NOT NULL,
	"minimum_payment_cents" integer NOT NULL,
	"interest_rate" numeric(5, 4) NOT NULL,
	"payment_due_date" integer NOT NULL,
	"payment_strategy" varchar(50) DEFAULT 'minimum',
	"target_payment_cents" integer,
	"payoff_date" date,
	"total_interest_cents" integer,
	"is_active" boolean DEFAULT true,
	"linked_account_id" varchar(255),
	"last_payment_date" date,
	"last_payment_amount_cents" integer,
	"alerts_enabled" boolean DEFAULT true,
	"alert_days_before" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "decision_tree_progress" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advisor_id" varchar(50) NOT NULL,
	"tree_type" varchar(100) NOT NULL,
	"current_node" varchar(100) NOT NULL,
	"progress" integer DEFAULT 0,
	"responses" jsonb DEFAULT '[]'::jsonb,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "decision_tree_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advisor_id" varchar(50) NOT NULL,
	"session_status" varchar DEFAULT 'active',
	"current_question_id" varchar(100),
	"total_questions" integer DEFAULT 0,
	"answered_questions" integer DEFAULT 0,
	"progress_percentage" numeric(5, 2) DEFAULT '0',
	"started_at" timestamp DEFAULT now(),
	"last_activity_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"time_spent" integer,
	"emotional_profile_generated" boolean DEFAULT false,
	"insights_generated" boolean DEFAULT false,
	"recommendations_ready" boolean DEFAULT false,
	"session_data" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "education_content" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" varchar NOT NULL,
	"category" varchar(100) NOT NULL,
	"difficulty" varchar NOT NULL,
	"content" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"estimated_time" integer,
	"prerequisites" jsonb DEFAULT '[]'::jsonb,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "error_tracking_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"error_type" varchar(100),
	"error_code" varchar(50),
	"error_message" text,
	"stack_trace" text,
	"page_path" varchar(500),
	"user_agent" text,
	"reproduction_steps" jsonb,
	"user_impact" varchar(100),
	"frequency" integer DEFAULT 1,
	"resolved" boolean DEFAULT false,
	"resolution_time" integer,
	"workaround_provided" boolean DEFAULT false,
	"user_feedback" text,
	"automatic_recovery" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"flag_name" varchar(100) NOT NULL,
	"enabled" boolean DEFAULT false,
	"value" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_data_collection" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"data_type" varchar(100) NOT NULL,
	"data_source" varchar(100),
	"original_data" jsonb NOT NULL,
	"processed_data" jsonb,
	"confidence" numeric(5, 2),
	"verified" boolean DEFAULT false,
	"category" varchar(100),
	"subcategory" varchar(100),
	"amount" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"reporting_period" varchar(50),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"ai_insights" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_goals" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"goal_type" varchar(50) NOT NULL,
	"target_amount_cents" integer NOT NULL,
	"current_amount_cents" integer DEFAULT 0,
	"target_date" date,
	"start_date" date DEFAULT now(),
	"auto_contribution_cents" integer DEFAULT 0,
	"linked_account_id" varchar(255),
	"milestones" jsonb DEFAULT '[]'::jsonb,
	"priority" integer DEFAULT 1,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gamification_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"game_element" varchar(100),
	"action_type" varchar(100),
	"points_earned" integer DEFAULT 0,
	"level_achieved" integer,
	"badges_unlocked" jsonb,
	"challenge_completed" varchar(255),
	"difficulty_level" integer,
	"time_to_complete" integer,
	"motivation_impact" integer,
	"engagement_boost" numeric(5, 2),
	"social_sharing" boolean DEFAULT false,
	"competitive_ranking" integer,
	"achievement_metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jarvis_ai_conversations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"message_id" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"message_type" varchar(50),
	"tool_calls" jsonb,
	"function_results" jsonb,
	"code_snippets" jsonb,
	"data_queries" jsonb,
	"system_actions" jsonb,
	"metadata" jsonb,
	"tokens" integer,
	"cost" numeric(10, 4),
	"processing_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jarvis_ai_knowledge" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"category" varchar(100),
	"subcategory" varchar(100),
	"title" varchar(255),
	"description" text,
	"content" jsonb,
	"source_type" varchar(50),
	"confidence" numeric(5, 2),
	"usage_count" integer DEFAULT 0,
	"last_used_at" timestamp,
	"tags" jsonb,
	"related_files" jsonb,
	"related_functions" jsonb,
	"related_data" jsonb,
	"examples" jsonb,
	"version" varchar(50) DEFAULT '1.0',
	"deprecated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jarvis_ai_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"session_type" varchar(50),
	"session_name" varchar(255),
	"permissions" jsonb,
	"status" varchar(50) DEFAULT 'active',
	"goals" jsonb,
	"context" jsonb,
	"task_queue" jsonb,
	"completed_tasks" jsonb,
	"ai_model" varchar(100) DEFAULT 'gpt-4o',
	"learning_data" jsonb,
	"performance_metrics" jsonb,
	"code_changes" jsonb,
	"data_changes" jsonb,
	"system_access" jsonb,
	"error_log" jsonb,
	"success_metrics" jsonb,
	"created_at" timestamp DEFAULT now(),
	"last_active_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "jarvis_ai_tasks" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"parent_task_id" varchar(255),
	"task_type" varchar(100),
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(50) DEFAULT 'pending',
	"title" varchar(255),
	"description" text,
	"requirements" jsonb,
	"constraints" jsonb,
	"expected_output" jsonb,
	"actual_output" jsonb,
	"progress" integer DEFAULT 0,
	"estimated_time" integer,
	"actual_time" integer,
	"dependencies" jsonb,
	"resources" jsonb,
	"tools_used" jsonb,
	"code_changes" jsonb,
	"data_changes" jsonb,
	"test_results" jsonb,
	"quality_score" numeric(5, 2),
	"user_feedback" jsonb,
	"learnings" jsonb,
	"errors" jsonb,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jarvis_ai_training" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"training_type" varchar(100),
	"data_source" varchar(100),
	"input_data" jsonb,
	"expected_output" jsonb,
	"actual_output" jsonb,
	"model_parameters" jsonb,
	"accuracy" numeric(5, 2),
	"loss" numeric(10, 6),
	"epochs" integer,
	"validation_score" numeric(5, 2),
	"training_duration" integer,
	"memory_usage" integer,
	"cpu_usage" numeric(5, 2),
	"improvements" jsonb,
	"knowledge_gained" jsonb,
	"applications_found" jsonb,
	"patterns" jsonb,
	"insights" jsonb,
	"recommendations" jsonb,
	"status" varchar(50) DEFAULT 'in_progress',
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "learning_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_data" jsonb DEFAULT '{}'::jsonb,
	"session_context" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now(),
	"processing_status" varchar DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "page_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255),
	"user_id" varchar(255),
	"page_path" varchar(500) NOT NULL,
	"page_title" varchar(255),
	"timestamp" timestamp DEFAULT now(),
	"time_on_page" integer,
	"scroll_depth" numeric(5, 2),
	"click_count" integer DEFAULT 0,
	"exit_page" boolean DEFAULT false,
	"load_time" integer,
	"performance_metrics" jsonb,
	"heatmap_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "personalized_decision_tree_responses" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"advisor_id" varchar(50) NOT NULL,
	"question_id" varchar(100) NOT NULL,
	"answer" jsonb NOT NULL,
	"confidence" numeric(3, 2) DEFAULT '1.0',
	"additional_data" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now(),
	"session_id" varchar(255),
	"ai_context" text,
	"ai_weight" numeric(3, 2) DEFAULT '1.0'
);
--> statement-breakpoint
CREATE TABLE "predictive_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"prediction_type" varchar(100),
	"model_version" varchar(50),
	"input_features" jsonb,
	"prediction" jsonb,
	"confidence" numeric(5, 2),
	"time_horizon" integer,
	"actual_outcome" jsonb,
	"accuracy" numeric(5, 2),
	"business_value" numeric(10, 2),
	"action_recommendations" jsonb,
	"risk_factors" jsonb,
	"monitoring_metrics" jsonb,
	"feedback_loop" jsonb,
	"created_at" timestamp DEFAULT now(),
	"validated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "recurring_transactions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"amount_cents" integer NOT NULL,
	"category_id" varchar(255),
	"frequency" varchar(50) NOT NULL,
	"interval" integer DEFAULT 1,
	"start_date" date NOT NULL,
	"end_date" date,
	"next_due_date" date NOT NULL,
	"last_processed_date" date,
	"auto_create" boolean DEFAULT false,
	"reminder_days_before" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reporting_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"report_type" varchar(100),
	"report_category" varchar(100),
	"generation_time" integer,
	"data_points_included" integer,
	"time_range" jsonb,
	"filters" jsonb,
	"customizations" jsonb,
	"export_format" varchar(50),
	"download_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"view_time" integer,
	"user_rating" integer,
	"feedback" text,
	"actions_taken" jsonb,
	"business_impact" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"interval" varchar NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"api_limit" numeric(10, 4),
	"max_advisor_access" integer DEFAULT 1,
	"decision_tree_access" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"stripe_price_id" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tool_usage_analytics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"tool_name" varchar(100) NOT NULL,
	"feature_name" varchar(100),
	"session_id" varchar(255),
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"time_spent" integer,
	"actions_performed" integer DEFAULT 0,
	"input_data" jsonb,
	"output_data" jsonb,
	"completion_status" varchar(50),
	"user_satisfaction" integer,
	"error_count" integer DEFAULT 0,
	"help_requested" boolean DEFAULT false,
	"sharing_behavior" jsonb,
	"conversion_metrics" jsonb
);
--> statement-breakpoint
CREATE TABLE "transaction_categories" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"name" varchar(100) NOT NULL,
	"parent_id" varchar(255),
	"color" varchar(7) DEFAULT '#3B82F6',
	"icon" varchar(50),
	"budgetable" boolean DEFAULT true,
	"is_income" boolean DEFAULT false,
	"order_index" integer DEFAULT 0,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'PLN',
	"transaction_date" date NOT NULL,
	"description" varchar(500) NOT NULL,
	"merchant_name" varchar(255),
	"category_id" varchar(255),
	"subcategory_id" varchar(255),
	"user_category_override" varchar(100),
	"import_hash" varchar(255),
	"import_source" varchar(100),
	"external_id" varchar(255),
	"transaction_type" varchar(50),
	"status" varchar(50) DEFAULT 'completed',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"ai_category_confidence" numeric(5, 2),
	"ai_processed" boolean DEFAULT false,
	"anomaly_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "transactions_import_hash_unique" UNIQUE("import_hash")
);
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"counter_type" varchar(50) NOT NULL,
	"count" integer DEFAULT 0,
	"reset_date" timestamp DEFAULT now(),
	"max_limit" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"account_type" varchar(50) NOT NULL,
	"institution_name" varchar(255),
	"account_number" varchar(255),
	"current_balance_cents" integer DEFAULT 0 NOT NULL,
	"available_balance_cents" integer,
	"currency" varchar(3) DEFAULT 'PLN',
	"is_active" boolean DEFAULT true,
	"last_synced" timestamp,
	"sync_status" varchar(50) DEFAULT 'active',
	"plaid_account_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"achievement_id" varchar(255) NOT NULL,
	"unlocked_at" timestamp DEFAULT now(),
	"progress" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_activity_log" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"ip_address" varchar(45),
	"user_agent" text,
	"timestamp" timestamp DEFAULT now(),
	"success" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "user_interaction_events" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255),
	"user_id" varchar(255),
	"event_type" varchar(100) NOT NULL,
	"event_category" varchar(100),
	"event_action" varchar(100),
	"event_label" varchar(255),
	"element_id" varchar(255),
	"element_class" varchar(255),
	"element_text" text,
	"page_path" varchar(500),
	"coordinates" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb,
	"conversion_value" numeric(10, 2),
	"funnel_step" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"financial_goal" varchar(100) NOT NULL,
	"timeframe" varchar(50) NOT NULL,
	"monthly_income" varchar(50) NOT NULL,
	"current_savings" varchar(50),
	"target_amount" varchar(50),
	"onboarding_complete" boolean DEFAULT false,
	"is_premium" boolean DEFAULT false,
	"progress" integer DEFAULT 0,
	"consents" jsonb DEFAULT '{}'::jsonb,
	"financial_data" jsonb DEFAULT '[]'::jsonb,
	"achievements" jsonb DEFAULT '[]'::jsonb,
	"learning_style" varchar(50),
	"behavior_patterns" jsonb DEFAULT '{}'::jsonb,
	"risk_tolerance" varchar(20),
	"financial_literacy_score" integer DEFAULT 0,
	"engagement_metrics" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"session_token" varchar(255),
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"duration" integer,
	"pages_visited" integer DEFAULT 0,
	"actions_performed" integer DEFAULT 0,
	"device_type" varchar(100),
	"browser" varchar(100),
	"operating_system" varchar(100),
	"screen_resolution" varchar(50),
	"ip_address" varchar(45),
	"geolocation" jsonb,
	"referrer" text,
	"exit_page" varchar(500),
	"bounce_rate" numeric(5, 2),
	"engagement_score" integer,
	"conversion_events" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"username" varchar(100),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"profile_image_url" varchar(500),
	"phone_number" varchar(20),
	"date_of_birth" timestamp,
	"country" varchar(100),
	"city" varchar(100),
	"occupation" varchar(100),
	"password_hash" varchar(255),
	"session_token" varchar(255),
	"last_login" timestamp,
	"role" varchar DEFAULT 'FREE',
	"system_role" varchar DEFAULT 'USER',
	"onboarding_completed" boolean DEFAULT false,
	"google_id" varchar(255),
	"facebook_id" varchar(255),
	"github_id" varchar(255),
	"discord_id" varchar(255),
	"subscription_tier" varchar DEFAULT 'FREE',
	"subscription_status" varchar DEFAULT 'active',
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"api_usage_this_month" numeric(10, 4) DEFAULT '0',
	"api_usage_reset_date" timestamp DEFAULT now(),
	"jarvis_permissions" jsonb DEFAULT '{"codeModification":false,"databaseAccess":false,"aiTraining":false,"systemAdmin":false,"fullAccess":false}'::jsonb,
	"preferences" jsonb DEFAULT '{"theme":"system","language":"en","currency":"USD","notifications":{"email":true,"push":true,"sms":false,"marketing":false},"privacy":{"profileVisibility":"private","dataSharing":false,"analyticsOptOut":false},"aiSettings":{"preferredAdvisorType":"general","riskTolerance":"moderate","learningStyle":"visual"}}'::jsonb,
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"two_factor_enabled" boolean DEFAULT false,
	"account_status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"code" varchar(10) NOT NULL,
	"type" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false,
	"attempts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "advisor_sessions" ADD CONSTRAINT "advisor_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advisor_sessions" ADD CONSTRAINT "advisor_sessions_advisor_id_advisors_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_emotional_profiles" ADD CONSTRAINT "ai_emotional_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_emotional_profiles" ADD CONSTRAINT "ai_emotional_profiles_advisor_id_advisors_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_advisor_id_advisors_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_profile_id_ai_emotional_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."ai_emotional_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interaction_analytics" ADD CONSTRAINT "ai_interaction_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interaction_analytics" ADD CONSTRAINT "ai_interaction_analytics_session_id_advisor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."advisor_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interaction_analytics" ADD CONSTRAINT "ai_interaction_analytics_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_account_id_bank_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavior_patterns" ADD CONSTRAINT "behavior_patterns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cashflow_predictions" ADD CONSTRAINT "cashflow_predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_advisor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."advisor_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_advisor_id_advisors_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_engagement_analytics" ADD CONSTRAINT "community_engagement_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_linked_account_id_user_accounts_id_fk" FOREIGN KEY ("linked_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_tree_progress" ADD CONSTRAINT "decision_tree_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_tree_progress" ADD CONSTRAINT "decision_tree_progress_advisor_id_advisors_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_tree_sessions" ADD CONSTRAINT "decision_tree_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_tree_sessions" ADD CONSTRAINT "decision_tree_sessions_advisor_id_advisors_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_tracking_analytics" ADD CONSTRAINT "error_tracking_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_tracking_analytics" ADD CONSTRAINT "error_tracking_analytics_session_id_user_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_data_collection" ADD CONSTRAINT "financial_data_collection_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_goals" ADD CONSTRAINT "financial_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_goals" ADD CONSTRAINT "financial_goals_linked_account_id_user_accounts_id_fk" FOREIGN KEY ("linked_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_analytics" ADD CONSTRAINT "gamification_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jarvis_ai_conversations" ADD CONSTRAINT "jarvis_ai_conversations_session_id_jarvis_ai_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."jarvis_ai_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jarvis_ai_sessions" ADD CONSTRAINT "jarvis_ai_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jarvis_ai_tasks" ADD CONSTRAINT "jarvis_ai_tasks_session_id_jarvis_ai_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."jarvis_ai_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_analytics" ADD CONSTRAINT "learning_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_analytics" ADD CONSTRAINT "page_analytics_session_id_user_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_analytics" ADD CONSTRAINT "page_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personalized_decision_tree_responses" ADD CONSTRAINT "personalized_decision_tree_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personalized_decision_tree_responses" ADD CONSTRAINT "personalized_decision_tree_responses_advisor_id_advisors_id_fk" FOREIGN KEY ("advisor_id") REFERENCES "public"."advisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictive_analytics" ADD CONSTRAINT "predictive_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_account_id_user_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporting_analytics" ADD CONSTRAINT "reporting_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_usage_analytics" ADD CONSTRAINT "tool_usage_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_usage_analytics" ADD CONSTRAINT "tool_usage_analytics_session_id_user_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_parent_id_transaction_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."transaction_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_user_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interaction_events" ADD CONSTRAINT "user_interaction_events_session_id_user_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interaction_events" ADD CONSTRAINT "user_interaction_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cashflow_user_prediction_idx" ON "cashflow_predictions" USING btree ("user_id","prediction_date");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "transactions_user_date_idx" ON "transactions" USING btree ("user_id","transaction_date");--> statement-breakpoint
CREATE INDEX "transactions_hash_idx" ON "transactions" USING btree ("import_hash");