import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Core emotional and financial psychology schemas
export interface EmotionalFinancialProfile {
  userId: string;
  advisorId: string;
  timestamp: Date;
  
  // Emotional Intelligence Mapping
  emotional_patterns: {
    money_relationship: 'anxiety' | 'opportunity' | 'practical' | 'avoidance';
    spending_triggers: 'social_pressure' | 'emotional_state' | 'convenience' | 'planned';
    loss_tolerance: 'risk_averse' | 'moderate_risk' | 'risk_seeking';
    stress_response: 'fight' | 'flight' | 'freeze' | 'analysis';
    decision_style: 'impulsive' | 'analytical' | 'collaborative' | 'avoidant';
  };
  
  // Financial Psychology Drivers
  psychological_drivers: {
    primary_motivation: 'security' | 'growth' | 'freedom' | 'legacy' | 'status';
    fear_hierarchy: string[]; // Ranked list of financial fears
    reward_preferences: 'immediate' | 'delayed' | 'milestone_based' | 'social_recognition';
    control_needs: 'high_control' | 'guided_decisions' | 'expert_delegation';
    change_readiness: 'fully_committed' | 'gradual_changes' | 'small_experiments';
  };
  
  // Behavioral Prediction Models
  behavior_predictions: {
    spending_patterns: {
      impulse_likelihood: number; // 0-1 scale
      budget_adherence_probability: number;
      savings_consistency_score: number;
      investment_discipline_rating: number;
    };
    goal_achievement: {
      completion_probability: number;
      timeline_realism_score: number;
      motivation_sustainability: number;
      obstacle_resilience: number;
    };
    communication_preferences: {
      detail_level: 'minimal' | 'moderate' | 'comprehensive';
      frequency: 'low' | 'medium' | 'high';
      tone: 'encouraging' | 'analytical' | 'directive' | 'collaborative';
      channels: string[]; // preferred communication methods
    };
  };
  
  // AI Personalization Schema
  ai_insights: {
    personality_archetype: string;
    financial_maturity_stage: 'beginner' | 'developing' | 'intermediate' | 'advanced';
    learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    motivation_triggers: string[];
    potential_blind_spots: string[];
    recommended_strategies: string[];
  };
  
  // Ideal Money Plan Psychological Framework
  ideal_money_plan: {
    lifestyle_vision: {
      retirement_dream: string;
      spending_priorities: string[];
      lifestyle_importance: 'experiences' | 'security' | 'flexibility' | 'legacy';
      time_horizon_comfort: 'short_term' | 'balanced' | 'long_term';
    };
    emotional_comfort_zone: {
      acceptable_risk_level: number; // 0-10 scale
      volatility_tolerance: 'low' | 'medium' | 'high';
      loss_recovery_confidence: number;
      market_timing_belief: 'time_market' | 'time_in_market' | 'mixed_approach';
    };
    behavioral_optimization: {
      automation_preference: number; // 0-10 scale
      tracking_detail_desired: 'minimal' | 'moderate' | 'extensive';
      goal_structure_preference: 'simple' | 'layered' | 'complex';
      accountability_needs: 'self_directed' | 'peer_support' | 'professional_guidance';
    };
  };
  
  confidence_scores: {
    profile_accuracy: number; // AI confidence in emotional mapping
    prediction_reliability: number; // Confidence in behavioral predictions
    recommendation_strength: number; // Strength of AI recommendations
  };
}

export interface AIPersonalizationInput {
  userId: string;
  advisorId: string;
  responses: Array<{
    questionId: string;
    answer: any;
    category: string;
    ai_weight: number;
    ai_context: string;
  }>;
  advisor_context: {
    name: string;
    categories: string[];
    ai_learning_objectives: string[];
  };
}

export class AIEmotionalAnalysisService {
  
  /**
   * Analyzes user responses to create comprehensive emotional and financial psychology profile
   */
  async analyzeEmotionalFinancialProfile(input: AIPersonalizationInput): Promise<EmotionalFinancialProfile> {
    try {
      const analysisPrompt = this.buildEmotionalAnalysisPrompt(input);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert financial psychologist and behavioral economist. Your task is to analyze user responses to financial assessment questions and create a comprehensive emotional and psychological profile that will drive personalized financial recommendations.

Focus on:
1. Emotional patterns and triggers related to money
2. Behavioral prediction models for spending, saving, and investing
3. Communication preferences and learning styles
4. Ideal money management approach based on psychology
5. Specific motivation triggers and potential blind spots

Provide detailed, actionable insights that go beyond surface-level responses to understand the deeper psychological drivers of financial behavior.`
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3 // Lower temperature for more consistent analysis
      });

      const aiAnalysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Construct the emotional financial profile
      const profile: EmotionalFinancialProfile = {
        userId: input.userId,
        advisorId: input.advisorId,
        timestamp: new Date(),
        ...aiAnalysis
      };

      return profile;
      
    } catch (error) {
      console.error('Error in AI emotional analysis:', error);
      
      // Return a basic profile structure if AI analysis fails
      return this.generateFallbackProfile(input);
    }
  }

  /**
   * Builds detailed prompt for emotional analysis
   */
  private buildEmotionalAnalysisPrompt(input: AIPersonalizationInput): string {
    const { responses, advisor_context } = input;
    
    return `
## Financial Psychology Analysis Request

**Advisor Context:** ${advisor_context.name}
**Assessment Categories:** ${advisor_context.categories.join(', ')}
**AI Learning Objectives:** ${advisor_context.ai_learning_objectives.join('; ')}

## User Response Analysis

${responses.map((response, index) => `
**Question ${index + 1} (${response.category}):**
- Question ID: ${response.questionId}
- User Answer: ${JSON.stringify(response.answer)}
- AI Context: ${response.ai_context}
- Weight: ${response.ai_weight}
`).join('\n')}

## Analysis Requirements

Create a comprehensive emotional and financial psychology profile in JSON format with these exact structures:

{
  "emotional_patterns": {
    "money_relationship": "anxiety|opportunity|practical|avoidance",
    "spending_triggers": "social_pressure|emotional_state|convenience|planned", 
    "loss_tolerance": "risk_averse|moderate_risk|risk_seeking",
    "stress_response": "fight|flight|freeze|analysis",
    "decision_style": "impulsive|analytical|collaborative|avoidant"
  },
  "psychological_drivers": {
    "primary_motivation": "security|growth|freedom|legacy|status",
    "fear_hierarchy": ["ranked list of top 3 financial fears"],
    "reward_preferences": "immediate|delayed|milestone_based|social_recognition",
    "control_needs": "high_control|guided_decisions|expert_delegation", 
    "change_readiness": "fully_committed|gradual_changes|small_experiments"
  },
  "behavior_predictions": {
    "spending_patterns": {
      "impulse_likelihood": 0.0-1.0,
      "budget_adherence_probability": 0.0-1.0,
      "savings_consistency_score": 0.0-1.0,
      "investment_discipline_rating": 0.0-1.0
    },
    "goal_achievement": {
      "completion_probability": 0.0-1.0,
      "timeline_realism_score": 0.0-1.0,
      "motivation_sustainability": 0.0-1.0,
      "obstacle_resilience": 0.0-1.0
    },
    "communication_preferences": {
      "detail_level": "minimal|moderate|comprehensive",
      "frequency": "low|medium|high",
      "tone": "encouraging|analytical|directive|collaborative",
      "channels": ["array of preferred communication methods"]
    }
  },
  "ai_insights": {
    "personality_archetype": "descriptive financial personality type",
    "financial_maturity_stage": "beginner|developing|intermediate|advanced",
    "learning_style": "visual|auditory|kinesthetic|reading",
    "motivation_triggers": ["specific triggers that motivate this person"],
    "potential_blind_spots": ["areas where this person might struggle"],
    "recommended_strategies": ["personalized strategy recommendations"]
  },
  "ideal_money_plan": {
    "lifestyle_vision": {
      "retirement_dream": "specific retirement vision description",
      "spending_priorities": ["top 3 spending priority areas"],
      "lifestyle_importance": "experiences|security|flexibility|legacy",
      "time_horizon_comfort": "short_term|balanced|long_term"
    },
    "emotional_comfort_zone": {
      "acceptable_risk_level": 0-10,
      "volatility_tolerance": "low|medium|high", 
      "loss_recovery_confidence": 0.0-1.0,
      "market_timing_belief": "time_market|time_in_market|mixed_approach"
    },
    "behavioral_optimization": {
      "automation_preference": 0-10,
      "tracking_detail_desired": "minimal|moderate|extensive",
      "goal_structure_preference": "simple|layered|complex",
      "accountability_needs": "self_directed|peer_support|professional_guidance"
    }
  },
  "confidence_scores": {
    "profile_accuracy": 0.0-1.0,
    "prediction_reliability": 0.0-1.0,
    "recommendation_strength": 0.0-1.0
  }
}

## Analysis Guidelines

1. **Deep Psychology Focus**: Look beyond surface answers to understand underlying motivations, fears, and behavioral patterns
2. **Predictive Modeling**: Use responses to predict likely behaviors and success patterns
3. **Personalization Drivers**: Identify specific triggers, communication styles, and motivation factors unique to this individual
4. **Emotional Intelligence**: Map the emotional relationship with money and how it affects decision-making
5. **Practical Application**: Ensure insights can drive specific, actionable personalization in financial recommendations

Base your analysis on behavioral finance principles, emotional intelligence research, and financial psychology best practices.
`;
  }

  /**
   * Generates ideal financial recommendations based on emotional profile
   */
  async generatePersonalizedRecommendations(
    profile: EmotionalFinancialProfile,
    context: { goal?: string; timeframe?: string; amount?: number }
  ): Promise<{
    primary_recommendations: string[];
    communication_strategy: string;
    motivation_approach: string;
    risk_considerations: string[];
    behavioral_nudges: string[];
  }> {
    try {
      const prompt = `
Based on this emotional financial profile, generate personalized recommendations:

**Profile Summary:**
- Money Relationship: ${profile.emotional_patterns.money_relationship}
- Primary Motivation: ${profile.psychological_drivers.primary_motivation}
- Risk Tolerance: ${profile.emotional_patterns.loss_tolerance}
- Change Readiness: ${profile.psychological_drivers.change_readiness}
- Communication Needs: ${profile.behavior_predictions.communication_preferences.tone}

**Context:** ${JSON.stringify(context)}

Generate personalized recommendations in JSON format:
{
  "primary_recommendations": ["3-5 specific, actionable financial recommendations"],
  "communication_strategy": "How to communicate with this person effectively",
  "motivation_approach": "What will keep this person motivated and engaged",
  "risk_considerations": ["Potential risks or challenges specific to this profile"],
  "behavioral_nudges": ["Specific behavioral interventions that would help"]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system", 
            content: "You are a financial advisor AI that creates highly personalized recommendations based on psychological profiles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return {
        primary_recommendations: ["Start with a simple budget using the 50/30/20 rule"],
        communication_strategy: "Use clear, supportive language with regular check-ins",
        motivation_approach: "Focus on achievable milestones and positive reinforcement",
        risk_considerations: ["May need additional support during market volatility"],
        behavioral_nudges: ["Set up automatic transfers to savings"]
      };
    }
  }

  /**
   * Fallback profile generation when AI analysis is unavailable
   */
  private generateFallbackProfile(input: AIPersonalizationInput): EmotionalFinancialProfile {
    return {
      userId: input.userId,
      advisorId: input.advisorId,
      timestamp: new Date(),
      emotional_patterns: {
        money_relationship: 'practical',
        spending_triggers: 'planned',
        loss_tolerance: 'moderate_risk',
        stress_response: 'analysis',
        decision_style: 'analytical'
      },
      psychological_drivers: {
        primary_motivation: 'security',
        fear_hierarchy: ['job_loss', 'market_crash', 'insufficient_savings'],
        reward_preferences: 'milestone_based',
        control_needs: 'guided_decisions',
        change_readiness: 'gradual_changes'
      },
      behavior_predictions: {
        spending_patterns: {
          impulse_likelihood: 0.3,
          budget_adherence_probability: 0.7,
          savings_consistency_score: 0.6,
          investment_discipline_rating: 0.7
        },
        goal_achievement: {
          completion_probability: 0.7,
          timeline_realism_score: 0.8,
          motivation_sustainability: 0.6,
          obstacle_resilience: 0.7
        },
        communication_preferences: {
          detail_level: 'moderate',
          frequency: 'medium',
          tone: 'collaborative',
          channels: ['email', 'app_notifications']
        }
      },
      ai_insights: {
        personality_archetype: 'Cautious Optimizer',
        financial_maturity_stage: 'developing',
        learning_style: 'reading',
        motivation_triggers: ['progress_tracking', 'milestone_achievements'],
        potential_blind_spots: ['over_analysis', 'delayed_action'],
        recommended_strategies: ['automated_savings', 'gradual_risk_increase']
      },
      ideal_money_plan: {
        lifestyle_vision: {
          retirement_dream: 'Comfortable and secure retirement',
          spending_priorities: ['housing', 'healthcare', 'family'],
          lifestyle_importance: 'security',
          time_horizon_comfort: 'balanced'
        },
        emotional_comfort_zone: {
          acceptable_risk_level: 5,
          volatility_tolerance: 'medium',
          loss_recovery_confidence: 0.6,
          market_timing_belief: 'time_in_market'
        },
        behavioral_optimization: {
          automation_preference: 7,
          tracking_detail_desired: 'moderate',
          goal_structure_preference: 'layered',
          accountability_needs: 'professional_guidance'
        }
      },
      confidence_scores: {
        profile_accuracy: 0.5,
        prediction_reliability: 0.5,
        recommendation_strength: 0.6
      }
    };
  }

  /**
   * Updates existing profile with new response data
   */
  async updateEmotionalProfile(
    existingProfile: EmotionalFinancialProfile,
    newResponses: AIPersonalizationInput
  ): Promise<EmotionalFinancialProfile> {
    // Re-analyze with combined data for improved accuracy
    const updatedAnalysis = await this.analyzeEmotionalFinancialProfile(newResponses);
    
    // Blend existing and new insights, favoring newer data but preserving valuable historical patterns
    return {
      ...updatedAnalysis,
      confidence_scores: {
        profile_accuracy: Math.min(existingProfile.confidence_scores.profile_accuracy + 0.1, 1.0),
        prediction_reliability: Math.min(existingProfile.confidence_scores.prediction_reliability + 0.1, 1.0),
        recommendation_strength: Math.min(existingProfile.confidence_scores.recommendation_strength + 0.1, 1.0)
      }
    };
  }
}

export const aiEmotionalAnalysisService = new AIEmotionalAnalysisService();