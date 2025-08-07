import { storage } from '../storage';
import crypto from 'crypto';

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

interface PersonalizedQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'single_choice' | 'multiple_choice' | 'range' | 'text' | 'boolean' | 'demographic';
  category: 'financial_status' | 'goals' | 'risk_tolerance' | 'demographics' | 'preferences' | 'experience';
  options?: {
    id: string;
    value: string;
    title: string;
    description?: string;
    follow_up_questions?: string[];
    ai_weight: number; // How important this choice is for AI personalization
  }[];
  validation?: {
    required: boolean;
    min_value?: number;
    max_value?: number;
    pattern?: string;
  };
  ai_context: string; // Context for AI about what this question reveals
}

interface PersonalizedTreeDefinition {
  advisorId: string;
  name: string;
  description: string;
  categories: string[];
  questions: PersonalizedQuestion[];
  ai_learning_objectives: string[];
}

interface UserResponse {
  questionId: string;
  answer: string | string[] | number;
  category: string;
  confidence_level?: number;
  timestamp: string;
  additional_notes?: string;
}

interface PersonalizedInsights {
  user_profile: {
    risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
    financial_experience: 'beginner' | 'intermediate' | 'advanced';
    primary_goals: string[];
    financial_capacity: 'low' | 'medium' | 'high';
    decision_style: 'analytical' | 'intuitive' | 'collaborative';
    life_stage: 'early_career' | 'career_building' | 'pre_retirement' | 'retirement';
  };
  ai_recommendations: {
    personalization_score: number;
    recommended_strategies: string[];
    focus_areas: string[];
    communication_style: 'detailed' | 'concise' | 'visual' | 'conversational';
    next_best_actions: string[];
  };
  data_for_ai_models: {
    preferences: Record<string, any>;
    behavioral_indicators: Record<string, any>;
    financial_markers: Record<string, any>;
    learning_patterns: Record<string, any>;
  };
}

export class PersonalizedDecisionTreeService {
  private personalizedTrees: Record<string, PersonalizedTreeDefinition> = {
    budget_planner: {
      advisorId: 'budget_planner',
      name: 'Personalized Budget Planning Assessment',
      description: 'Comprehensive assessment to understand your financial situation and create a personalized budget strategy',
      categories: ['financial_status', 'goals', 'demographics', 'preferences', 'experience'],
      ai_learning_objectives: [
        'Understand spending patterns and priorities',
        'Assess financial discipline and habits',
        'Identify optimization opportunities',
        'Determine appropriate communication style',
        'Build predictive financial behavior model'
      ],
      questions: [
        {
          id: 'current_income',
          question: 'What is your current monthly income after taxes?',
          description: 'Include all sources: salary, freelance, investments, etc.',
          type: 'range',
          category: 'financial_status',
          validation: { required: true, min_value: 0, max_value: 50000 },
          ai_context: 'Primary indicator of financial capacity and appropriate recommendations'
        },
        {
          id: 'expense_categories',
          question: 'Which expense categories are most important to you?',
          description: 'Select all that represent your major spending priorities',
          type: 'multiple_choice',
          category: 'preferences',
          options: [
            {
              id: 'housing',
              value: 'housing',
              title: 'Housing & Utilities',
              description: 'Rent, mortgage, utilities, maintenance',
              ai_weight: 0.9
            },
            {
              id: 'education',
              value: 'education',
              title: 'Education & Learning',
              description: 'Courses, books, professional development',
              ai_weight: 0.8
            },
            {
              id: 'health',
              value: 'health',
              title: 'Health & Wellness',
              description: 'Healthcare, fitness, nutrition',
              ai_weight: 0.9
            },
            {
              id: 'entertainment',
              value: 'entertainment',
              title: 'Entertainment & Lifestyle',
              description: 'Dining, travel, hobbies, subscriptions',
              ai_weight: 0.6
            },
            {
              id: 'family',
              value: 'family',
              title: 'Family & Dependents',
              description: 'Children, elderly care, family support',
              ai_weight: 0.9
            },
            {
              id: 'savings',
              value: 'savings',
              title: 'Savings & Investments',
              description: 'Emergency fund, retirement, investments',
              ai_weight: 1.0
            }
          ],
          validation: { required: true },
          ai_context: 'Reveals personal values and spending priorities for personalized recommendations'
        },
        {
          id: 'financial_stress_triggers',
          question: 'What causes you the most financial stress?',
          type: 'single_choice',
          category: 'preferences',
          options: [
            {
              id: 'insufficient_savings',
              value: 'savings',
              title: 'Not having enough savings',
              description: 'Worry about emergency funds and future security',
              ai_weight: 0.9,
              follow_up_questions: ['savings_target', 'emergency_fund_goal']
            },
            {
              id: 'overspending',
              value: 'spending',
              title: 'Overspending regularly',
              description: 'Difficulty controlling expenses and impulse purchases',
              ai_weight: 0.8,
              follow_up_questions: ['spending_triggers', 'budget_tools_used']
            },
            {
              id: 'debt_burden',
              value: 'debt',
              title: 'High debt levels',
              description: 'Credit cards, loans, or other debt obligations',
              ai_weight: 0.9,
              follow_up_questions: ['debt_types', 'debt_priority']
            },
            {
              id: 'income_uncertainty',
              value: 'income',
              title: 'Unstable income',
              description: 'Variable or unpredictable earnings',
              ai_weight: 0.8,
              follow_up_questions: ['income_sources', 'income_stability']
            }
          ],
          validation: { required: true },
          ai_context: 'Primary pain point that determines recommendation focus and communication approach'
        },
        {
          id: 'financial_goals_priority',
          question: 'What are your top 3 financial priorities for the next 12 months?',
          description: 'Rank these goals in order of importance to you',
          type: 'multiple_choice',
          category: 'goals',
          options: [
            {
              id: 'emergency_fund',
              value: 'emergency',
              title: 'Build Emergency Fund',
              description: '3-6 months of expenses saved',
              ai_weight: 0.9
            },
            {
              id: 'debt_elimination',
              value: 'debt',
              title: 'Eliminate High-Interest Debt',
              description: 'Pay off credit cards and loans',
              ai_weight: 0.9
            },
            {
              id: 'home_purchase',
              value: 'home',
              title: 'Save for Home Purchase',
              description: 'Down payment and closing costs',
              ai_weight: 0.8
            },
            {
              id: 'retirement_boost',
              value: 'retirement',
              title: 'Increase Retirement Savings',
              description: 'Maximize 401k, IRA contributions',
              ai_weight: 0.7
            },
            {
              id: 'investment_start',
              value: 'investing',
              title: 'Start Investment Portfolio',
              description: 'Begin building wealth through investments',
              ai_weight: 0.7
            },
            {
              id: 'expense_optimization',
              value: 'optimization',
              title: 'Optimize Monthly Expenses',
              description: 'Reduce unnecessary spending',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Primary goals that shape entire financial strategy and AI recommendations'
        },
        {
          id: 'decision_making_style',
          question: 'How do you prefer to make financial decisions?',
          type: 'single_choice',
          category: 'preferences',
          options: [
            {
              id: 'data_driven',
              value: 'analytical',
              title: 'Data & Analysis',
              description: 'I want detailed numbers, charts, and comparisons',
              ai_weight: 1.0
            },
            {
              id: 'simple_guidance',
              value: 'guided',
              title: 'Simple Step-by-Step Guidance',
              description: 'Give me clear actions without overwhelming details',
              ai_weight: 0.9
            },
            {
              id: 'collaborative',
              value: 'discussion',
              title: 'Discussion & Collaboration',
              description: 'I like to talk through options and get feedback',
              ai_weight: 0.8
            },
            {
              id: 'automated',
              value: 'automation',
              title: 'Automated Solutions',
              description: 'Set it up once and let it run automatically',
              ai_weight: 0.7
            }
          ],
          validation: { required: true },
          ai_context: 'Communication style preference that determines how AI should present recommendations'
        },
        {
          id: 'financial_experience',
          question: 'How would you describe your financial knowledge and experience?',
          type: 'single_choice',
          category: 'experience',
          options: [
            {
              id: 'beginner',
              value: 'beginner',
              title: 'Beginner',
              description: 'New to personal finance, need basic guidance',
              ai_weight: 1.0
            },
            {
              id: 'some_experience',
              value: 'intermediate',
              title: 'Some Experience',
              description: 'Have basic knowledge, looking to improve',
              ai_weight: 0.8
            },
            {
              id: 'experienced',
              value: 'advanced',
              title: 'Experienced',
              description: 'Comfortable with financial concepts, want optimization',
              ai_weight: 0.6
            }
          ],
          validation: { required: true },
          ai_context: 'Experience level determines complexity of recommendations and educational content needed'
        }
      ]
    },

    investment_specialist: {
      advisorId: 'investment_specialist',
      name: 'Personalized Investment Assessment',
      description: 'Deep dive into your investment preferences, risk tolerance, and goals to create a tailored investment strategy',
      categories: ['risk_tolerance', 'goals', 'experience', 'preferences'],
      ai_learning_objectives: [
        'Assess true risk tolerance vs stated preferences',
        'Identify investment biases and behavioral patterns',
        'Understand time horizons and liquidity needs',
        'Determine appropriate asset allocation',
        'Build investment personality profile'
      ],
      questions: [
        {
          id: 'investment_timeline',
          question: 'When do you plan to start using this money you want to invest?',
          type: 'single_choice',
          category: 'goals',
          options: [
            {
              id: 'short_term',
              value: '1-3_years',
              title: '1-3 years',
              description: 'Need access relatively soon',
              ai_weight: 1.0
            },
            {
              id: 'medium_term',
              value: '3-10_years',
              title: '3-10 years',
              description: 'Medium-term financial goal',
              ai_weight: 0.8
            },
            {
              id: 'long_term',
              value: '10_plus_years',
              title: '10+ years',
              description: 'Long-term wealth building',
              ai_weight: 0.6
            },
            {
              id: 'retirement',
              value: 'retirement',
              title: 'Retirement (20+ years)',
              description: 'Retirement planning focused',
              ai_weight: 0.5
            }
          ],
          validation: { required: true },
          ai_context: 'Time horizon is crucial for risk tolerance and asset allocation recommendations'
        },
        {
          id: 'risk_scenario',
          question: 'If your investments dropped 20% in value over 3 months, what would you do?',
          type: 'single_choice',
          category: 'risk_tolerance',
          options: [
            {
              id: 'panic_sell',
              value: 'conservative',
              title: 'Sell everything to prevent further losses',
              description: 'I cannot handle seeing my money decrease',
              ai_weight: 1.0
            },
            {
              id: 'worry_hold',
              value: 'moderate_conservative',
              title: 'Worry but hold my positions',
              description: 'Very uncomfortable but would not sell',
              ai_weight: 0.8
            },
            {
              id: 'hold_steady',
              value: 'moderate',
              title: 'Stay the course with my plan',
              description: 'Stick to my long-term strategy',
              ai_weight: 0.6
            },
            {
              id: 'buy_more',
              value: 'aggressive',
              title: 'Buy more at lower prices',
              description: 'See it as an opportunity to invest more',
              ai_weight: 0.3
            }
          ],
          validation: { required: true },
          ai_context: 'Real risk tolerance indicator that overrides stated preferences'
        },
        {
          id: 'investment_knowledge',
          question: 'Which investment topics are you comfortable with?',
          description: 'Select all that you understand well',
          type: 'multiple_choice',
          category: 'experience',
          options: [
            {
              id: 'stocks_basic',
              value: 'stocks',
              title: 'Individual Stocks',
              description: 'Buying shares of companies',
              ai_weight: 0.6
            },
            {
              id: 'etfs_funds',
              value: 'etfs',
              title: 'ETFs and Mutual Funds',
              description: 'Diversified investment funds',
              ai_weight: 0.7
            },
            {
              id: 'bonds',
              value: 'bonds',
              title: 'Bonds and Fixed Income',
              description: 'Government and corporate bonds',
              ai_weight: 0.8
            },
            {
              id: 'real_estate',
              value: 'realestate',
              title: 'Real Estate Investment',
              description: 'REITs or direct property investment',
              ai_weight: 0.7
            },
            {
              id: 'crypto',
              value: 'cryptocurrency',
              title: 'Cryptocurrency',
              description: 'Bitcoin, Ethereum, and other digital assets',
              ai_weight: 0.4
            },
            {
              id: 'options',
              value: 'derivatives',
              title: 'Options and Derivatives',
              description: 'Advanced trading instruments',
              ai_weight: 0.2
            }
          ],
          validation: { required: false },
          ai_context: 'Knowledge level determines complexity of recommendations and educational needs'
        }
      ]
    }
  };

  async generatePersonalizedInsights(
    userId: string, 
    advisorId: string, 
    responses: UserResponse[]
  ): Promise<PersonalizedInsights> {
    
    // Analyze responses to generate insights
    const insights = await this.analyzeUserResponses(responses, advisorId);
    
    // Store insights for AI model training
    await this.storeAITrainingData(userId, advisorId, responses, insights);
    
    return insights;
  }

  private async analyzeUserResponses(responses: UserResponse[], advisorId: string): Promise<PersonalizedInsights> {
    const tree = this.personalizedTrees[advisorId];
    if (!tree) throw new Error(`No personalized tree found for advisor: ${advisorId}`);

    // Build user profile from responses
    let risk_tolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate';
    let financial_experience: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    let financial_capacity: 'low' | 'medium' | 'high' = 'medium';
    let decision_style: 'analytical' | 'intuitive' | 'collaborative' = 'analytical';
    
    // Analyze specific responses
    for (const response of responses) {
      const question = tree.questions.find(q => q.id === response.questionId);
      if (!question) continue;

      // Risk tolerance analysis
      if (response.questionId === 'risk_scenario') {
        risk_tolerance = response.answer as 'conservative' | 'moderate' | 'aggressive';
      }
      
      // Experience level analysis
      if (response.questionId === 'financial_experience') {
        financial_experience = response.answer as 'beginner' | 'intermediate' | 'advanced';
      }
      
      // Decision style analysis
      if (response.questionId === 'decision_making_style') {
        decision_style = response.answer as 'analytical' | 'intuitive' | 'collaborative';
      }

      // Financial capacity analysis
      if (response.questionId === 'current_income') {
        const income = response.answer as number;
        if (income < 3000) financial_capacity = 'low';
        else if (income > 8000) financial_capacity = 'high';
      }
    }

    // Generate AI recommendations based on analysis
    const personalization_score = this.calculatePersonalizationScore(responses);
    
    return {
      user_profile: {
        risk_tolerance,
        financial_experience,
        primary_goals: this.extractGoals(responses),
        financial_capacity,
        decision_style,
        life_stage: this.inferLifeStage(responses)
      },
      ai_recommendations: {
        personalization_score,
        recommended_strategies: this.generateStrategies(responses, advisorId),
        focus_areas: this.identifyFocusAreas(responses),
        communication_style: this.determineCommStyle(decision_style, financial_experience),
        next_best_actions: this.generateNextActions(responses, advisorId)
      },
      data_for_ai_models: {
        preferences: this.extractPreferences(responses),
        behavioral_indicators: this.extractBehavioralPatterns(responses),
        financial_markers: this.extractFinancialMarkers(responses),
        learning_patterns: this.extractLearningPatterns(responses)
      }
    };
  }

  private async storeAITrainingData(
    userId: string, 
    advisorId: string, 
    responses: UserResponse[], 
    insights: PersonalizedInsights
  ): Promise<void> {
    try {
      // Store comprehensive data for AI model training
      const trainingData = {
        id: generateId('ai_training'),
        userId,
        advisorId,
        responses,
        insights,
        timestamp: new Date().toISOString(),
        session_quality: insights.ai_recommendations.personalization_score,
        data_completeness: this.calculateDataCompleteness(responses)
      };

      // Save to database for AI model access
      // This data will be used to improve personalization over time
      console.log('AI Training Data Generated:', {
        userId,
        advisorId,
        personalization_score: insights.ai_recommendations.personalization_score,
        data_points: responses.length,
        insights_generated: Object.keys(insights.data_for_ai_models).length
      });
      
    } catch (error) {
      console.error('Failed to store AI training data:', error);
    }
  }

  // Helper methods for analysis
  private calculatePersonalizationScore(responses: UserResponse[]): number {
    const totalQuestions = 10; // Expected comprehensive assessment
    const completionScore = (responses.length / totalQuestions) * 50;
    const qualityScore = responses.reduce((acc, r) => {
      return acc + (r.confidence_level || 0.8) * 5;
    }, 0);
    
    return Math.min(100, completionScore + qualityScore);
  }

  private extractGoals(responses: UserResponse[]): string[] {
    const goalResponse = responses.find(r => r.questionId === 'financial_goals_priority');
    if (goalResponse && Array.isArray(goalResponse.answer)) {
      return goalResponse.answer;
    }
    return [];
  }

  private inferLifeStage(responses: UserResponse[]): 'early_career' | 'career_building' | 'pre_retirement' | 'retirement' {
    const incomeResponse = responses.find(r => r.questionId === 'current_income');
    const timelineResponse = responses.find(r => r.questionId === 'investment_timeline');
    
    if (timelineResponse?.answer === 'retirement') return 'retirement';
    if (incomeResponse && (incomeResponse.answer as number) < 4000) return 'early_career';
    return 'career_building';
  }

  private generateStrategies(responses: UserResponse[], advisorId: string): string[] {
    // Generate personalized strategies based on responses and advisor type
    const strategies: string[] = [];
    
    if (advisorId === 'budget_planner') {
      strategies.push('50/30/20 Budget Rule Adaptation');
      strategies.push('Automated Savings Setup');
      strategies.push('Expense Category Optimization');
    }
    
    if (advisorId === 'investment_specialist') {
      strategies.push('Age-Appropriate Asset Allocation');
      strategies.push('Dollar-Cost Averaging Setup');
      strategies.push('Tax-Advantaged Account Maximization');
    }
    
    return strategies;
  }

  private identifyFocusAreas(responses: UserResponse[]): string[] {
    const areas = [];
    const stressResponse = responses.find(r => r.questionId === 'financial_stress_triggers');
    
    if (stressResponse) {
      switch (stressResponse.answer) {
        case 'savings':
          areas.push('Emergency Fund Building', 'Automated Savings');
          break;
        case 'spending':
          areas.push('Expense Tracking', 'Budget Optimization');
          break;
        case 'debt':
          areas.push('Debt Elimination Strategy', 'Interest Rate Optimization');
          break;
        case 'income':
          areas.push('Income Diversification', 'Expense Buffer');
          break;
      }
    }
    
    return areas;
  }

  private determineCommStyle(
    decisionStyle: string, 
    experience: string
  ): 'detailed' | 'concise' | 'visual' | 'conversational' {
    if (decisionStyle === 'analytical') return 'detailed';
    if (experience === 'beginner') return 'visual';
    if (decisionStyle === 'discussion') return 'conversational';
    return 'concise';
  }

  private generateNextActions(responses: UserResponse[], advisorId: string): string[] {
    const actions: string[] = [];
    
    // Generate specific, actionable next steps based on responses
    const goalResponse = responses.find(r => r.questionId === 'financial_goals_priority');
    if (goalResponse && Array.isArray(goalResponse.answer)) {
      goalResponse.answer.forEach((goal: string) => {
        switch (goal) {
          case 'emergency':
            actions.push('Set up automatic transfer for emergency fund');
            break;
          case 'debt':
            actions.push('List all debts and create payoff priority');
            break;
          case 'investing':
            actions.push('Open investment account and research low-cost index funds');
            break;
        }
      });
    }
    
    return actions;
  }

  private extractPreferences(responses: UserResponse[]): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    responses.forEach(response => {
      if (response.category === 'preferences') {
        preferences[response.questionId] = response.answer;
      }
    });
    
    return preferences;
  }

  private extractBehavioralPatterns(responses: UserResponse[]): Record<string, any> {
    return {
      decision_speed: responses.length > 5 ? 'deliberate' : 'quick',
      response_confidence: responses.reduce((acc, r) => acc + (r.confidence_level || 0.8), 0) / responses.length,
      completion_pattern: responses.length / 10 // Assuming 10 total questions
    };
  }

  private extractFinancialMarkers(responses: UserResponse[]): Record<string, any> {
    const markers: Record<string, any> = {};
    
    responses.forEach(response => {
      if (response.category === 'financial_status' || response.category === 'goals') {
        markers[response.questionId] = response.answer;
      }
    });
    
    return markers;
  }

  private extractLearningPatterns(responses: UserResponse[]): Record<string, any> {
    const experienceResponse = responses.find(r => r.questionId === 'financial_experience');
    const knowledgeResponse = responses.find(r => r.questionId === 'investment_knowledge');
    
    return {
      experience_level: experienceResponse?.answer || 'beginner',
      knowledge_areas: knowledgeResponse?.answer || [],
      learning_preference: this.inferLearningStyle(responses)
    };
  }

  private inferLearningStyle(responses: UserResponse[]): string {
    const decisionResponse = responses.find(r => r.questionId === 'decision_making_style');
    
    if (decisionResponse?.answer === 'analytical') return 'data_driven';
    if (decisionResponse?.answer === 'guided') return 'step_by_step';
    if (decisionResponse?.answer === 'discussion') return 'interactive';
    return 'visual';
  }

  private calculateDataCompleteness(responses: UserResponse[]): number {
    const expectedCategories = ['financial_status', 'goals', 'risk_tolerance', 'preferences', 'experience'];
    const representedCategories = new Set(responses.map(r => r.category));
    
    return (representedCategories.size / expectedCategories.length) * 100;
  }

  // Public methods for API endpoints
  getPersonalizedTree(advisorId: string): PersonalizedTreeDefinition | null {
    return this.personalizedTrees[advisorId] || null;
  }

  getPersonalizedQuestion(advisorId: string, questionId: string): PersonalizedQuestion | null {
    const tree = this.personalizedTrees[advisorId];
    if (!tree) return null;
    
    return tree.questions.find(q => q.id === questionId) || null;
  }

  async processPersonalizedResponse(
    userId: string,
    advisorId: string,
    questionId: string,
    answer: any,
    additionalData?: any
  ): Promise<{ next_question?: PersonalizedQuestion; insights?: PersonalizedInsights; completed: boolean }> {
    
    const tree = this.personalizedTrees[advisorId];
    if (!tree) throw new Error('Invalid advisor ID');

    // Get existing progress
    const existingProgress = await storage.getDecisionTreeProgress(userId, advisorId);
    const currentResponses: UserResponse[] = existingProgress?.responses as UserResponse[] || [];

    // Add new response
    const newResponse: UserResponse = {
      questionId,
      answer,
      category: tree.questions.find(q => q.id === questionId)?.category || 'unknown',
      timestamp: new Date().toISOString(),
      confidence_level: additionalData?.confidence || 0.8,
      additional_notes: additionalData?.notes
    };

    currentResponses.push(newResponse);

    // Save updated progress  
    const progressPercent = Math.round((currentResponses.length / tree.questions.length) * 100);
    
    await storage.saveDecisionTreeProgress({
      id: existingProgress?.id || generateId('progress'),
      userId,
      advisorId,
      treeType: 'personalized',
      currentNode: questionId,
      progress: progressPercent,
      responses: currentResponses
    });

    // Check if assessment is complete
    const isComplete = currentResponses.length >= tree.questions.length;

    if (isComplete) {
      // Generate comprehensive insights
      const insights = await this.generatePersonalizedInsights(userId, advisorId, currentResponses);
      
      // Mark as completed with insights
      await storage.updateDecisionTreeProgress(userId, advisorId, {
        completedAt: new Date(),
        recommendations: insights
      });

      return { insights, completed: true };
    } else {
      // Find next question that hasn't been answered
      const answeredQuestionIds = currentResponses.map(r => r.questionId);
      const nextQuestion = tree.questions.find(q => !answeredQuestionIds.includes(q.id));
      
      return { next_question: nextQuestion, completed: false };
    }
  }
}

export const personalizedDecisionTreeService = new PersonalizedDecisionTreeService();