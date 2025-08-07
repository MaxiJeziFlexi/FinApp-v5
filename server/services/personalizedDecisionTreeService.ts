import { storage } from '../storage';
import crypto from 'crypto';
import { aiEmotionalAnalysisService, type AIPersonalizationInput } from './aiEmotionalAnalysisService';

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
      name: 'Personal Budget Discovery',
      description: 'Discover your financial personality and create a budget that works with your lifestyle',
      categories: ['emotional_spending', 'priorities', 'habits', 'goals', 'mindset'],
      ai_learning_objectives: [
        'Map emotional spending triggers and patterns',
        'Identify core financial values and priorities',
        'Understand money mindset and psychological drivers',
        'Assess financial discipline and behavioral tendencies',
        'Build personalized motivation and communication strategy'
      ],
      questions: [
        {
          id: 'money_feeling',
          question: 'When you think about money, what\'s your first emotion?',
          description: 'Your gut reaction reveals your money mindset',
          type: 'single_choice',
          category: 'emotional_spending',
          options: [
            {
              id: 'excited',
              value: 'opportunity',
              title: 'Excited & Optimistic',
              description: 'Money represents opportunities and freedom',
              ai_weight: 1.0
            },
            {
              id: 'stressed',
              value: 'anxiety',
              title: 'Stressed & Worried',
              description: 'Money feels overwhelming and stressful',
              ai_weight: 0.9
            },
            {
              id: 'neutral',
              value: 'practical',
              title: 'Calm & Practical',
              description: 'Money is just a tool to manage',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Core emotional relationship with money determines communication style and motivation triggers'
        },
        {
          id: 'spending_trigger',
          question: 'What usually makes you spend money you hadn\'t planned to spend?',
          description: 'Understanding your triggers helps build better defenses',
          type: 'single_choice',
          category: 'emotional_spending',
          options: [
            {
              id: 'social',
              value: 'social_pressure',
              title: 'Social Situations',
              description: 'Friends, family, or social pressure influences spending',
              ai_weight: 1.0
            },
            {
              id: 'emotional',
              value: 'emotional_state',
              title: 'Emotional States',
              description: 'Stress, celebration, or mood changes trigger spending',
              ai_weight: 0.9
            },
            {
              id: 'convenience',
              value: 'convenience',
              title: 'Convenience & Impulse',
              description: 'Easy access or attractive deals lead to purchases',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Identifies primary behavioral spending triggers for personalized budgeting strategies'
        },
        {
          id: 'money_priority',
          question: 'If you had extra $500 right now, what would you most want to do with it?',
          description: 'This reveals your true financial priorities',
          type: 'single_choice',
          category: 'priorities',
          options: [
            {
              id: 'security',
              value: 'security',
              title: 'Save for Security',
              description: 'Build emergency fund or pay down debt',
              ai_weight: 1.0
            },
            {
              id: 'growth',
              value: 'growth',
              title: 'Invest for Growth',
              description: 'Put it in investments or retirement account',
              ai_weight: 0.9
            },
            {
              id: 'experience',
              value: 'experience',
              title: 'Spend on Experience',
              description: 'Travel, education, or meaningful purchases',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Core financial priority that drives all budgeting and saving recommendations'
        },
        {
          id: 'budgeting_style',
          question: 'What\'s your ideal approach to managing your money?',
          description: 'Different styles work for different personalities',
          type: 'single_choice',
          category: 'habits',
          options: [
            {
              id: 'detailed',
              value: 'detailed_tracker',
              title: 'Detailed Tracker',
              description: 'Track every expense and category precisely',
              ai_weight: 1.0
            },
            {
              id: 'simple',
              value: 'simple_rules',
              title: 'Simple Rules',
              description: 'Follow easy rules like 50/30/20 without detailed tracking',
              ai_weight: 0.9
            },
            {
              id: 'automated',
              value: 'automated',
              title: 'Set & Forget',
              description: 'Automate everything and check in occasionally',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Budgeting personality determines which systems and tools will actually be used'
        },
        {
          id: 'money_mindset',
          question: 'Complete this sentence: "Money is..."',
          description: 'Your core belief about money shapes all financial decisions',
          type: 'single_choice',
          category: 'mindset',
          options: [
            {
              id: 'tool',
              value: 'tool',
              title: 'A Tool for Freedom',
              description: 'Money enables choices and experiences',
              ai_weight: 1.0
            },
            {
              id: 'security',
              value: 'security',
              title: 'Security and Safety',
              description: 'Money provides protection and peace of mind',
              ai_weight: 0.9
            },
            {
              id: 'challenge',
              value: 'challenge',
              title: 'A Necessary Challenge',
              description: 'Money is complex but manageable with effort',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Fundamental money mindset drives motivation, goals, and preferred communication approach'
        }
      ]
    },

    investment_specialist: {
      advisorId: 'investment_specialist',
      name: 'Investment Psychology Profile',
      description: 'Discover your investment personality and build a strategy that matches your emotional comfort zone',
      categories: ['risk_psychology', 'time_perspective', 'loss_reaction', 'opportunity_view', 'investment_values'],
      ai_learning_objectives: [
        'Map emotional response to market volatility and losses',
        'Understand time horizon psychology and patience levels', 
        'Identify fear vs greed decision-making patterns',
        'Assess learning style and information processing preferences',
        'Build personalized investment communication and motivation strategy'
      ],
      questions: [
        {
          id: 'market_reaction',
          question: 'You check your investment account and see it\'s down 15% this month. Your immediate thought is:',
          description: 'Your gut reaction reveals your true risk psychology',
          type: 'single_choice',
          category: 'risk_psychology',
          options: [
            {
              id: 'panic',
              value: 'risk_averse',
              title: '"I need to sell before it gets worse"',
              description: 'Focus on preventing further losses',
              ai_weight: 1.0
            },
            {
              id: 'rational',
              value: 'moderate_risk',
              title: '"This is normal market volatility"',
              description: 'Stay calm and stick to the plan',
              ai_weight: 0.9
            },
            {
              id: 'opportunity',
              value: 'risk_seeking',
              title: '"Great, everything is on sale now"',
              description: 'See downturns as buying opportunities',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Emotional response to losses predicts actual investment behavior better than stated risk tolerance'
        },
        {
          id: 'time_horizon',
          question: 'When do you imagine you might need this money?',
          description: 'Your time perspective shapes every investment decision',
          type: 'single_choice',
          category: 'time_perspective',
          options: [
            {
              id: 'soon',
              value: 'short_term',
              title: 'Within 5 years',
              description: 'For a house, car, or major purchase',
              ai_weight: 1.0
            },
            {
              id: 'later',
              value: 'medium_term',
              title: '5-15 years from now',
              description: 'For kids\' college or mid-life goals',
              ai_weight: 0.9
            },
            {
              id: 'retirement',
              value: 'long_term',
              title: 'For retirement (15+ years)',
              description: 'Long-term wealth building',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Time horizon determines appropriate risk level and investment strategy'
        },
        {
          id: 'loss_comfort',
          question: 'What\'s the biggest loss you could handle without losing sleep?',
          description: 'This reveals your true emotional comfort zone',
          type: 'single_choice',
          category: 'loss_reaction',
          options: [
            {
              id: 'minimal',
              value: 'loss_averse',
              title: 'Less than 5% of my money',
              description: 'I need stability and predictability',
              ai_weight: 1.0
            },
            {
              id: 'moderate',
              value: 'moderate_loss',
              title: '10-20% loss is manageable',
              description: 'I understand investing involves ups and downs',
              ai_weight: 0.9
            },
            {
              id: 'high',
              value: 'loss_comfortable',
              title: 'I can handle 30%+ swings',
              description: 'I focus on long-term growth over short-term comfort',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Actual loss tolerance determines sustainable investment strategy'
        },
        {
          id: 'success_vision',
          question: 'Your investment account has grown significantly. What would success mean to you?',
          description: 'Your definition of success guides all investment choices',
          type: 'single_choice',
          category: 'opportunity_view',
          options: [
            {
              id: 'security',
              value: 'security_focused',
              title: 'Financial security and peace of mind',
              description: 'Knowing I\'m protected and can sleep well',
              ai_weight: 1.0
            },
            {
              id: 'growth',
              value: 'growth_focused',
              title: 'Building serious wealth over time',
              description: 'Maximizing returns and compounding growth',
              ai_weight: 0.9
            },
            {
              id: 'freedom',
              value: 'freedom_focused',
              title: 'Freedom to make different life choices',
              description: 'Having options to change careers or lifestyle',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Success definition determines investment goals and risk/reward preferences'
        },
        {
          id: 'learning_style',
          question: 'How do you prefer to learn about investing?',
          description: 'Your learning style shapes how we\'ll communicate with you',
          type: 'single_choice',
          category: 'investment_values',
          options: [
            {
              id: 'simple',
              value: 'simple_approach',
              title: 'Keep it simple and automated',
              description: 'Just tell me what to do, I trust the system',
              ai_weight: 1.0
            },
            {
              id: 'guided',
              value: 'guided_learning',
              title: 'Explain the basics but guide my decisions',
              description: 'I want to understand but prefer expert guidance',
              ai_weight: 0.9
            },
            {
              id: 'detailed',
              value: 'detailed_control',
              title: 'Give me data and let me decide',
              description: 'I want to understand everything and stay in control',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Learning preference determines communication style and level of detail needed'
        }
      ]
    },

    retirement_specialist: {
      advisorId: 'retirement_specialist',
      name: 'Retirement Dreams & Reality Check',
      description: 'Explore your retirement vision and create a personalized path to get there',
      categories: ['retirement_vision', 'current_preparation', 'lifestyle_priorities', 'time_urgency', 'legacy_values'],
      ai_learning_objectives: [
        'Understand retirement lifestyle aspirations and fears',
        'Assess current savings psychology and habits',
        'Map time pressure and urgency emotions',
        'Identify family and legacy motivations',
        'Build personalized retirement savings motivation system'
      ],
      questions: [
        {
          id: 'retirement_dream',
          question: 'When you imagine retirement, what excites you most?',
          description: 'Your retirement vision drives all planning decisions',
          type: 'single_choice',
          category: 'retirement_vision',
          options: [
            {
              id: 'freedom',
              value: 'freedom_lifestyle',
              title: 'Freedom to do what I want',
              description: 'Travel, hobbies, no schedule or obligations',
              ai_weight: 1.0
            },
            {
              id: 'security',
              value: 'security_focused',
              title: 'Financial security and stability',
              description: 'No financial stress, predictable income',
              ai_weight: 0.9
            },
            {
              id: 'purpose',
              value: 'purpose_driven',
              title: 'Meaningful work and contribution',
              description: 'Volunteering, part-time work, helping others',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Primary retirement motivation determines savings strategy and communication approach'
        },
        {
          id: 'savings_reality',
          question: 'How do you honestly feel about your current retirement savings?',
          description: 'Your emotional relationship with savings affects planning',
          type: 'single_choice',
          category: 'current_preparation',
          options: [
            {
              id: 'behind',
              value: 'behind_anxious',
              title: 'Behind and worried',
              description: 'I haven\'t saved enough and feel stressed about it',
              ai_weight: 1.0
            },
            {
              id: 'okay',
              value: 'making_progress',
              title: 'Making progress, could do better',
              description: 'I\'m saving something but know I need to do more',
              ai_weight: 0.9
            },
            {
              id: 'confident',
              value: 'on_track',
              title: 'On track and feeling good',
              description: 'I\'m saving consistently and feel confident',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Current savings confidence affects motivation strategy and urgency messaging'
        },
        {
          id: 'lifestyle_priority',
          question: 'In retirement, what matters most to your happiness?',
          description: 'Your priorities determine how much you need to save',
          type: 'single_choice',
          category: 'lifestyle_priorities',
          options: [
            {
              id: 'experiences',
              value: 'experience_rich',
              title: 'Rich experiences and adventures',
              description: 'Travel, dining, entertainment, and new experiences',
              ai_weight: 1.0
            },
            {
              id: 'comfort',
              value: 'comfortable_living',
              title: 'Comfortable home and simple pleasures',
              description: 'Nice home, good healthcare, time with family',
              ai_weight: 0.9
            },
            {
              id: 'independence',
              value: 'self_sufficient',
              title: 'Complete independence',
              description: 'Never being a burden, handling any emergency',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Lifestyle priorities determine retirement income needs and savings targets'
        },
        {
          id: 'time_feeling',
          question: 'When you think about time until retirement, you feel:',
          description: 'Your time perception affects savings urgency',
          type: 'single_choice',
          category: 'time_urgency',
          options: [
            {
              id: 'rushed',
              value: 'time_pressure',
              title: 'Rushed - not enough time to save',
              description: 'Worried there isn\'t enough time to catch up',
              ai_weight: 1.0
            },
            {
              id: 'motivated',
              value: 'motivated_action',
              title: 'Motivated - ready to take action',
              description: 'Energized to make changes and save more',
              ai_weight: 0.9
            },
            {
              id: 'comfortable',
              value: 'time_comfort',
              title: 'Comfortable - have time to plan',
              description: 'Feel like there\'s plenty of time to figure it out',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Time urgency perception determines messaging tone and action steps'
        },
        {
          id: 'legacy_importance',
          question: 'How important is leaving money to family or causes you care about?',
          description: 'Legacy goals affect how much you need to save',
          type: 'single_choice',
          category: 'legacy_values',
          options: [
            {
              id: 'essential',
              value: 'legacy_focused',
              title: 'Very important - it\'s part of my purpose',
              description: 'I want to leave a meaningful financial legacy',
              ai_weight: 1.0
            },
            {
              id: 'nice',
              value: 'legacy_bonus',
              title: 'Nice if possible, but not essential',
              description: 'I\'d like to leave something if there\'s extra',
              ai_weight: 0.9
            },
            {
              id: 'minimal',
              value: 'spend_it_all',
              title: 'Plan to spend it all and enjoy retirement',
              description: 'I want to use my money for my own retirement',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Legacy priorities affect retirement savings targets and withdrawal strategies'
        }
      ]
    },

    financial_planner: {
      advisorId: 'financial_planner',
      name: 'Life Goals Financial Mapping',
      description: 'Connect your life dreams to a financial roadmap that actually works for you',
      categories: ['life_priorities', 'money_challenges', 'goal_timeline', 'success_definition', 'change_readiness'],
      ai_learning_objectives: [
        'Map life goals to financial priorities and emotional drivers',
        'Understand financial stress points and behavioral blockers',
        'Assess goal-setting psychology and achievement patterns',
        'Identify success metrics and milestone preferences',
        'Evaluate readiness for financial behavior change'
      ],
      questions: [
        {
          id: 'biggest_goal',
          question: 'What\'s the most important life goal that money could help you achieve?',
          description: 'Your biggest dream drives all other financial planning',
          type: 'single_choice',
          category: 'life_priorities',
          options: [
            {
              id: 'security',
              value: 'financial_security',
              title: 'Complete financial security',
              description: 'Never worry about money or emergencies again',
              ai_weight: 1.0
            },
            {
              id: 'experience',
              value: 'life_experiences',
              title: 'Amazing life experiences',
              description: 'Travel, adventures, and meaningful experiences',
              ai_weight: 0.9
            },
            {
              id: 'family',
              value: 'family_support',
              title: 'Supporting my family\'s dreams',
              description: 'Kids\' education, family home, caring for parents',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Primary life goal determines all financial planning priorities and motivation strategies'
        },
        {
          id: 'biggest_challenge',
          question: 'What\'s your biggest challenge with managing money right now?',
          description: 'Identifying obstacles helps us build solutions',
          type: 'single_choice',
          category: 'money_challenges',
          options: [
            {
              id: 'knowledge',
              value: 'lack_knowledge',
              title: 'I don\'t know what I should be doing',
              description: 'Overwhelmed by options and conflicting advice',
              ai_weight: 1.0
            },
            {
              id: 'discipline',
              value: 'lack_discipline',
              title: 'I know what to do but struggle to stick with it',
              description: 'Consistency and follow-through are my challenges',
              ai_weight: 0.9
            },
            {
              id: 'income',
              value: 'insufficient_income',
              title: 'There just isn\'t enough money to go around',
              description: 'My income barely covers necessities',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Primary financial challenge determines solution approach and support needed'
        },
        {
          id: 'timeline_preference',
          question: 'How do you prefer to think about your financial goals?',
          description: 'Your planning style shapes how we\'ll work together',
          type: 'single_choice',
          category: 'goal_timeline',
          options: [
            {
              id: 'immediate',
              value: 'short_term_focus',
              title: 'Focus on this year\'s goals',
              description: 'I like quick wins and immediate improvements',
              ai_weight: 1.0
            },
            {
              id: 'balanced',
              value: 'balanced_timeline',
              title: 'Balance short and long-term goals',
              description: 'Mix of immediate needs and future planning',
              ai_weight: 0.9
            },
            {
              id: 'longterm',
              value: 'long_term_focus',
              title: 'Think decades ahead',
              description: 'I\'m comfortable with long-term planning and delayed gratification',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Time preference determines goal-setting approach and milestone frequency'
        },
        {
          id: 'success_feeling',
          question: 'You\'ll know your financial plan is working when you feel:',
          description: 'Success means different things to different people',
          type: 'single_choice',
          category: 'success_definition',
          options: [
            {
              id: 'calm',
              value: 'peace_of_mind',
              title: 'Calm and in control',
              description: 'No financial stress, everything handled automatically',
              ai_weight: 1.0
            },
            {
              id: 'excited',
              value: 'progress_excitement',
              title: 'Excited about progress',
              description: 'Seeing growth and hitting milestones regularly',
              ai_weight: 0.9
            },
            {
              id: 'proud',
              value: 'achievement_pride',
              title: 'Proud of what I\'ve accomplished',
              description: 'Building something meaningful and substantial',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Success definition determines milestone tracking and celebration strategies'
        },
        {
          id: 'change_readiness',
          question: 'How ready are you to make significant changes to your financial habits?',
          description: 'Honest self-assessment helps us pace the changes',
          type: 'single_choice',
          category: 'change_readiness',
          options: [
            {
              id: 'ready',
              value: 'fully_committed',
              title: 'Fully committed - ready for big changes',
              description: 'I\'m motivated and ready to do whatever it takes',
              ai_weight: 1.0
            },
            {
              id: 'cautious',
              value: 'gradual_changes',
              title: 'Prefer gradual, manageable changes',
              description: 'I want to improve but need to go slow',
              ai_weight: 0.9
            },
            {
              id: 'testing',
              value: 'small_experiments',
              title: 'Want to test small changes first',
              description: 'Let me try a few things and see how they work',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Change readiness determines pace of recommendations and implementation strategy'
        }
      ]
    },

    risk_analyst: {
      advisorId: 'risk_analyst',
      name: 'Financial Risk & Protection Profile',
      description: 'Understand your relationship with financial risk and build protection strategies',
      categories: ['risk_awareness', 'protection_priorities', 'worry_triggers', 'control_preferences', 'safety_values'],
      ai_learning_objectives: [
        'Map financial fears and anxiety triggers',
        'Understand protection vs growth mindset balance',
        'Assess control needs and decision-making preferences',
        'Identify family protection motivations',
        'Build personalized risk management communication approach'
      ],
      questions: [
        {
          id: 'risk_worry',
          question: 'What financial risk keeps you awake at night?',
          description: 'Your biggest fear shapes your protection priorities',
          type: 'single_choice',
          category: 'risk_awareness',
          options: [
            {
              id: 'job_loss',
              value: 'income_loss',
              title: 'Losing my job or income',
              description: 'What if I can\'t earn money anymore?',
              ai_weight: 1.0
            },
            {
              id: 'market_crash',
              value: 'investment_loss',
              title: 'Market crash wiping out my savings',
              description: 'What if my investments lose all their value?',
              ai_weight: 0.9
            },
            {
              id: 'health_costs',
              value: 'health_emergency',
              title: 'Major health emergency costs',
              description: 'What if I can\'t afford medical care?',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Primary financial fear determines protection strategy focus and urgency'
        },
        {
          id: 'protection_approach',
          question: 'When it comes to protecting your money, you prefer to:',
          description: 'Your protection style guides risk management choices',
          type: 'single_choice',
          category: 'protection_priorities',
          options: [
            {
              id: 'insurance_heavy',
              value: 'insurance_focused',
              title: 'Buy insurance for everything',
              description: 'I want comprehensive coverage and guarantees',
              ai_weight: 1.0
            },
            {
              id: 'diversification',
              value: 'diversification_focused',
              title: 'Spread risk across many investments',
              description: 'Don\'t put all eggs in one basket approach',
              ai_weight: 0.9
            },
            {
              id: 'cash_safety',
              value: 'cash_focused',
              title: 'Keep plenty of cash available',
              description: 'Cash is king, liquidity provides security',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Protection preference determines recommended risk management tools and strategies'
        },
        {
          id: 'worry_trigger',
          question: 'What makes you most anxious about your financial future?',
          description: 'Understanding anxiety helps build targeted solutions',
          type: 'single_choice',
          category: 'worry_triggers',
          options: [
            {
              id: 'uncertainty',
              value: 'unknown_future',
              title: 'Not knowing what\'s coming',
              description: 'The uncertainty and unpredictability stress me out',
              ai_weight: 1.0
            },
            {
              id: 'inadequacy',
              value: 'not_enough',
              title: 'Not having enough saved',
              description: 'Worry that I haven\'t prepared enough',
              ai_weight: 0.9
            },
            {
              id: 'burden',
              value: 'family_burden',
              title: 'Being a burden on family',
              description: 'Don\'t want to create financial stress for loved ones',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Anxiety triggers determine communication tone and reassurance strategies needed'
        },
        {
          id: 'control_need',
          question: 'How much control do you need over your financial decisions?',
          description: 'Your control preferences shape planning approaches',
          type: 'single_choice',
          category: 'control_preferences',
          options: [
            {
              id: 'full_control',
              value: 'high_control',
              title: 'I want to understand and approve everything',
              description: 'No financial decisions without my knowledge and consent',
              ai_weight: 1.0
            },
            {
              id: 'guided_control',
              value: 'guided_decisions',
              title: 'Guide my decisions but let me choose',
              description: 'I want expert advice but final say on choices',
              ai_weight: 0.9
            },
            {
              id: 'trust_experts',
              value: 'expert_delegation',
              title: 'Trust experts to handle the details',
              description: 'Set the goals, let professionals handle implementation',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Control needs determine level of involvement and decision-making process'
        },
        {
          id: 'safety_priority',
          question: 'What does "financial safety" mean to you?',
          description: 'Your safety definition guides all risk management decisions',
          type: 'single_choice',
          category: 'safety_values',
          options: [
            {
              id: 'predictability',
              value: 'predictable_income',
              title: 'Predictable income I can count on',
              description: 'Knowing exactly what money I\'ll have each month',
              ai_weight: 1.0
            },
            {
              id: 'cushion',
              value: 'large_cushion',
              title: 'Large cushion for any emergency',
              description: 'Enough savings to handle any crisis',
              ai_weight: 0.9
            },
            {
              id: 'flexibility',
              value: 'options_flexibility',
              title: 'Multiple options and backup plans',
              description: 'Various income sources and financial strategies',
              ai_weight: 0.8
            }
          ],
          validation: { required: true },
          ai_context: 'Safety definition determines appropriate risk management products and strategies'
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