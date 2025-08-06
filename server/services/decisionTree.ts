export interface DecisionOption {
  id: string;
  value: string;
  title: string;
  description: string;
  icon?: string;
  consequences?: string;
  nextStep?: number;
}

export interface DecisionQuestion {
  id: string;
  question: string;
  description: string;
  step: number;
  options: DecisionOption[];
}

export interface DecisionTreeDefinition {
  advisorId: string;
  questions: DecisionQuestion[];
  totalSteps: number;
}

export interface FinalRecommendation {
  title: string;
  summary: string;
  recommendations: string[];
  actionSteps: Array<{
    step: number;
    action: string;
    timeline: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  projections?: {
    timeToGoal?: string;
    monthlySavings?: number;
    totalInterestSaved?: number;
  };
}

export class DecisionTreeService {
  private decisionTrees: Record<string, DecisionTreeDefinition> = {
    budget_planner: {
      advisorId: 'budget_planner',
      totalSteps: 4,
      questions: [
        {
          id: 'emergency_current',
          question: 'How much do you currently have in emergency savings?',
          description: 'Emergency funds should cover 3-6 months of expenses',
          step: 0,
          options: [
            {
              id: 'none',
              value: '0',
              title: 'No Emergency Fund',
              description: 'I don\'t have any emergency savings yet',
              consequences: 'High priority to start building emergency fund'
            },
            {
              id: 'partial',
              value: '1-2_months',
              title: '$1,000 - $3,000',
              description: 'I have some emergency savings but not enough',
              consequences: 'Continue building to reach 3-6 months of expenses'
            },
            {
              id: 'adequate',
              value: '3-6_months',
              title: '$5,000+',
              description: 'I have 3+ months of expenses saved',
              consequences: 'Good foundation, focus on optimization'
            }
          ]
        },
        {
          id: 'monthly_expenses',
          question: 'What are your average monthly expenses?',
          description: 'Include rent, utilities, food, transportation, and other necessities',
          step: 1,
          options: [
            {
              id: 'low',
              value: '2000',
              title: '$1,500 - $2,500',
              description: 'Lower monthly expenses'
            },
            {
              id: 'medium',
              value: '3500',
              title: '$2,500 - $4,500',
              description: 'Moderate monthly expenses'
            },
            {
              id: 'high',
              value: '6000',
              title: '$4,500+',
              description: 'Higher monthly expenses'
            }
          ]
        },
        {
          id: 'savings_capacity',
          question: 'How much can you realistically save monthly?',
          description: 'Consider your current income and fixed expenses',
          step: 2,
          options: [
            {
              id: 'minimal',
              value: '200',
              title: '$100 - $300',
              description: 'Conservative savings approach'
            },
            {
              id: 'moderate',
              value: '500',
              title: '$300 - $700',
              description: 'Moderate savings plan'
            },
            {
              id: 'aggressive',
              value: '1000',
              title: '$700+',
              description: 'Aggressive savings strategy'
            }
          ]
        },
        {
          id: 'timeline',
          question: 'What\'s your timeline for building emergency fund?',
          description: 'Consider your financial priorities and goals',
          step: 3,
          options: [
            {
              id: 'fast',
              value: '6_months',
              title: '6 Months',
              description: 'Priority goal, willing to sacrifice other spending'
            },
            {
              id: 'steady',
              value: '12_months',
              title: '1 Year',
              description: 'Steady progress while maintaining lifestyle'
            },
            {
              id: 'gradual',
              value: '24_months',
              title: '2 Years',
              description: 'Gradual approach with minimal lifestyle changes'
            }
          ]
        }
      ]
    },

    debt_expert: {
      advisorId: 'debt_expert',
      totalSteps: 4,
      questions: [
        {
          id: 'debt_total',
          question: 'What\'s your total debt amount?',
          description: 'Include credit cards, personal loans, and other non-mortgage debt',
          step: 0,
          options: [
            {
              id: 'low',
              value: '5000',
              title: 'Under $10,000',
              description: 'Lower debt burden'
            },
            {
              id: 'medium',
              value: '20000',
              title: '$10,000 - $30,000',
              description: 'Moderate debt burden'
            },
            {
              id: 'high',
              value: '40000',
              title: '$30,000+',
              description: 'Higher debt burden requiring aggressive strategy'
            }
          ]
        },
        {
          id: 'interest_rates',
          question: 'What\'s the average interest rate on your debt?',
          description: 'Consider credit cards, loans, and other debt',
          step: 1,
          options: [
            {
              id: 'low_interest',
              value: '8',
              title: 'Under 10%',
              description: 'Lower interest rates'
            },
            {
              id: 'medium_interest',
              value: '18',
              title: '10% - 25%',
              description: 'Moderate to high interest rates'
            },
            {
              id: 'high_interest',
              value: '28',
              title: '25%+',
              description: 'Very high interest rates - urgent priority'
            }
          ]
        },
        {
          id: 'payment_strategy',
          question: 'Which debt payment strategy appeals to you?',
          description: 'Choose based on your personality and motivation style',
          step: 2,
          options: [
            {
              id: 'avalanche',
              value: 'avalanche',
              title: 'Avalanche Method',
              description: 'Pay highest interest rates first (saves most money)'
            },
            {
              id: 'snowball',
              value: 'snowball',
              title: 'Snowball Method',
              description: 'Pay smallest balances first (builds momentum)'
            },
            {
              id: 'hybrid',
              value: 'hybrid',
              title: 'Hybrid Approach',
              description: 'Combination strategy based on situation'
            }
          ]
        },
        {
          id: 'extra_payment',
          question: 'How much extra can you allocate monthly toward debt payments?',
          description: 'Beyond minimum payments, based on your budget analysis',
          step: 3,
          options: [
            {
              id: 'conservative',
              value: '300',
              title: '$200 - $500',
              description: 'Conservative approach with steady progress'
            },
            {
              id: 'aggressive',
              value: '750',
              title: '$500 - $1,000',
              description: 'Aggressive strategy for faster freedom'
            },
            {
              id: 'maximum',
              value: '1200',
              title: '$1,000+',
              description: 'Maximum intensity debt elimination'
            }
          ]
        }
      ]
    },

    savings_strategist: {
      advisorId: 'savings_strategist',
      totalSteps: 4,
      questions: [
        {
          id: 'savings_goal',
          question: 'What\'s your primary savings goal?',
          description: 'Choose your main financial objective',
          step: 0,
          options: [
            {
              id: 'home_purchase',
              value: 'home_purchase',
              title: 'Home Purchase',
              description: 'Saving for down payment and closing costs'
            },
            {
              id: 'major_purchase',
              value: 'major_purchase',
              title: 'Major Purchase',
              description: 'Car, vacation, or other significant expense'
            },
            {
              id: 'investment',
              value: 'investment',
              title: 'Investment Portfolio',
              description: 'Building wealth through investments'
            }
          ]
        },
        {
          id: 'target_amount',
          question: 'What\'s your target savings amount?',
          description: 'The total amount you need to save for your goal',
          step: 1,
          options: [
            {
              id: 'moderate',
              value: '25000',
              title: '$10,000 - $40,000',
              description: 'Moderate savings goal'
            },
            {
              id: 'substantial',
              value: '75000',
              title: '$40,000 - $100,000',
              description: 'Substantial savings goal'
            },
            {
              id: 'major',
              value: '150000',
              title: '$100,000+',
              description: 'Major long-term savings goal'
            }
          ]
        },
        {
          id: 'risk_tolerance',
          question: 'What\'s your investment risk tolerance?',
          description: 'How comfortable are you with market fluctuations?',
          step: 2,
          options: [
            {
              id: 'conservative',
              value: 'conservative',
              title: 'Conservative',
              description: 'Prefer safety, minimal risk of loss'
            },
            {
              id: 'moderate',
              value: 'moderate',
              title: 'Moderate',
              description: 'Balanced approach, some risk for growth'
            },
            {
              id: 'aggressive',
              value: 'aggressive',
              title: 'Aggressive',
              description: 'Higher risk for potentially higher returns'
            }
          ]
        },
        {
          id: 'monthly_savings',
          question: 'How much can you save monthly?',
          description: 'Realistic amount you can consistently save',
          step: 3,
          options: [
            {
              id: 'modest',
              value: '500',
              title: '$300 - $700',
              description: 'Modest but consistent savings'
            },
            {
              id: 'substantial',
              value: '1200',
              title: '$700 - $1,500',
              description: 'Substantial monthly savings'
            },
            {
              id: 'aggressive',
              value: '2000',
              title: '$1,500+',
              description: 'Aggressive savings rate'
            }
          ]
        }
      ]
    },

    retirement_advisor: {
      advisorId: 'retirement_advisor',
      totalSteps: 4,
      questions: [
        {
          id: 'current_age',
          question: 'What\'s your current age?',
          description: 'This helps determine your retirement timeline and strategy',
          step: 0,
          options: [
            {
              id: 'young',
              value: '25',
              title: '20s - 30s',
              description: 'Long-term horizon, high growth potential'
            },
            {
              id: 'middle',
              value: '45',
              title: '40s - 50s',
              description: 'Medium-term horizon, balanced approach'
            },
            {
              id: 'approaching',
              value: '58',
              title: '55+',
              description: 'Short-term horizon, conservative approach'
            }
          ]
        },
        {
          id: 'retirement_goal',
          question: 'What\'s your retirement lifestyle goal?',
          description: 'Consider your desired standard of living in retirement',
          step: 1,
          options: [
            {
              id: 'basic',
              value: 'basic',
              title: 'Basic Needs',
              description: 'Cover essential expenses, modest lifestyle'
            },
            {
              id: 'comfortable',
              value: 'comfortable',
              title: 'Comfortable Lifestyle',
              description: 'Maintain current lifestyle, some extras'
            },
            {
              id: 'luxury',
              value: 'luxury',
              title: 'Luxury Retirement',
              description: 'Premium lifestyle, travel, hobbies'
            }
          ]
        },
        {
          id: 'current_retirement_savings',
          question: 'How much do you currently have saved for retirement?',
          description: 'Include 401(k), IRA, and other retirement accounts',
          step: 2,
          options: [
            {
              id: 'minimal',
              value: '10000',
              title: 'Under $25,000',
              description: 'Just getting started'
            },
            {
              id: 'moderate',
              value: '75000',
              title: '$25,000 - $150,000',
              description: 'Making progress'
            },
            {
              id: 'substantial',
              value: '300000',
              title: '$150,000+',
              description: 'Well on track'
            }
          ]
        },
        {
          id: 'monthly_contribution',
          question: 'How much can you contribute monthly to retirement?',
          description: 'Include employer matches and personal contributions',
          step: 3,
          options: [
            {
              id: 'basic',
              value: '500',
              title: '$300 - $700',
              description: 'Basic retirement savings'
            },
            {
              id: 'recommended',
              value: '1000',
              title: '$700 - $1,300',
              description: 'Recommended savings rate'
            },
            {
              id: 'aggressive',
              value: '1800',
              title: '$1,300+',
              description: 'Aggressive retirement planning'
            }
          ]
        }
      ]
    }
  };

  getQuestion(advisorId: string, step: number): DecisionQuestion | null {
    const tree = this.decisionTrees[advisorId];
    if (!tree) return null;

    return tree.questions.find(q => q.step === step) || null;
  }

  getDecisionTree(advisorId: string): DecisionTreeDefinition | null {
    return this.decisionTrees[advisorId] || null;
  }

  async processDecisionStep(advisorId: string, step: number, currentPath: any[]): Promise<DecisionOption[]> {
    const question = this.getQuestion(advisorId, step);
    if (!question) return [];

    return question.options;
  }

  isDecisionTreeComplete(advisorId: string, decisionPath: any[]): boolean {
    const tree = this.decisionTrees[advisorId];
    if (!tree) return false;

    return decisionPath.length >= tree.totalSteps;
  }

  getProgressPercentage(advisorId: string, currentStep: number): number {
    const tree = this.decisionTrees[advisorId];
    if (!tree) return 0;

    return Math.round((currentStep / tree.totalSteps) * 100);
  }

  async generateReport(advisorId: string, decisionPath: any[], userProfile: any): Promise<FinalRecommendation> {
    const tree = this.decisionTrees[advisorId];
    if (!tree) {
      throw new Error('Invalid advisor ID');
    }

    // Generate specific recommendations based on advisor type and decisions
    switch (advisorId) {
      case 'budget_planner':
        return this.generateBudgetPlannerReport(decisionPath, userProfile);
      case 'debt_expert':
        return this.generateDebtExpertReport(decisionPath, userProfile);
      case 'savings_strategist':
        return this.generateSavingsStrategistReport(decisionPath, userProfile);
      case 'retirement_advisor':
        return this.generateRetirementAdvisorReport(decisionPath, userProfile);
      default:
        throw new Error('Unknown advisor type');
    }
  }

  private generateBudgetPlannerReport(decisionPath: any[], userProfile: any): FinalRecommendation {
    const emergencyStatus = decisionPath[0]?.value || 'none';
    const monthlyExpenses = parseInt(decisionPath[1]?.value || '3000');
    const savingsCapacity = parseInt(decisionPath[2]?.value || '300');
    const timeline = decisionPath[3]?.value || '12_months';

    const targetEmergencyFund = monthlyExpenses * 6;
    const monthsToGoal = Math.ceil(targetEmergencyFund / savingsCapacity);

    return {
      title: 'Emergency Fund & Budget Plan',
      summary: `Based on your responses, I recommend building a $${targetEmergencyFund.toLocaleString()} emergency fund over ${monthsToGoal} months by saving $${savingsCapacity} monthly.`,
      recommendations: [
        `Build emergency fund to cover 6 months of expenses ($${targetEmergencyFund.toLocaleString()})`,
        `Set up automatic transfer of $${savingsCapacity} monthly to high-yield savings account`,
        'Track expenses using budgeting app or spreadsheet',
        'Review and optimize monthly expenses to increase savings rate',
        'Keep emergency fund in easily accessible, FDIC-insured account'
      ],
      actionSteps: [
        {
          step: 1,
          action: 'Open high-yield savings account for emergency fund',
          timeline: 'This week',
          priority: 'high'
        },
        {
          step: 2,
          action: `Set up automatic transfer of $${savingsCapacity} monthly`,
          timeline: 'Next week',
          priority: 'high'
        },
        {
          step: 3,
          action: 'Install budgeting app and track expenses for 30 days',
          timeline: 'This month',
          priority: 'medium'
        },
        {
          step: 4,
          action: 'Review budget and identify additional savings opportunities',
          timeline: 'Month 2',
          priority: 'medium'
        }
      ],
      projections: {
        timeToGoal: `${monthsToGoal} months`,
        monthlySavings: savingsCapacity
      }
    };
  }

  private generateDebtExpertReport(decisionPath: any[], userProfile: any): FinalRecommendation {
    const debtTotal = parseInt(decisionPath[0]?.value || '15000');
    const avgInterestRate = parseInt(decisionPath[1]?.value || '18');
    const strategy = decisionPath[2]?.value || 'avalanche';
    const extraPayment = parseInt(decisionPath[3]?.value || '500');

    const monthsToPayoff = Math.ceil(debtTotal / extraPayment);
    const interestSaved = Math.round(debtTotal * (avgInterestRate / 100) * 0.3);

    return {
      title: 'Debt Elimination Strategy',
      summary: `Using the ${strategy} method with $${extraPayment} extra monthly payments, you'll be debt-free in approximately ${monthsToPayoff} months and save $${interestSaved.toLocaleString()} in interest.`,
      recommendations: [
        `Focus on ${strategy === 'avalanche' ? 'highest interest rate debts first' : 'smallest balances first'}`,
        `Allocate $${extraPayment} extra monthly toward debt payments`,
        'Consolidate high-interest debt if beneficial',
        'Negotiate with creditors for lower interest rates',
        'Avoid taking on new debt during payoff period'
      ],
      actionSteps: [
        {
          step: 1,
          action: 'List all debts with balances, rates, and minimum payments',
          timeline: 'This week',
          priority: 'high'
        },
        {
          step: 2,
          action: `Order debts by ${strategy === 'avalanche' ? 'interest rate (highest first)' : 'balance (smallest first)'}`,
          timeline: 'This week',
          priority: 'high'
        },
        {
          step: 3,
          action: 'Set up automatic extra payment to priority debt',
          timeline: 'Next week',
          priority: 'high'
        },
        {
          step: 4,
          action: 'Contact creditors to negotiate lower rates',
          timeline: 'Month 1',
          priority: 'medium'
        }
      ],
      projections: {
        timeToGoal: `${monthsToPayoff} months`,
        monthlySavings: extraPayment,
        totalInterestSaved: interestSaved
      }
    };
  }

  private generateSavingsStrategistReport(decisionPath: any[], userProfile: any): FinalRecommendation {
    const goal = decisionPath[0]?.value || 'home_purchase';
    const targetAmount = parseInt(decisionPath[1]?.value || '50000');
    const riskTolerance = decisionPath[2]?.value || 'moderate';
    const monthlySavings = parseInt(decisionPath[3]?.value || '1000');

    const monthsToGoal = Math.ceil(targetAmount / monthlySavings);

    return {
      title: `${goal.replace('_', ' ').toUpperCase()} Savings Plan`,
      summary: `To reach your $${targetAmount.toLocaleString()} goal, save $${monthlySavings} monthly for ${monthsToGoal} months using a ${riskTolerance} investment approach.`,
      recommendations: [
        `Save $${monthlySavings} monthly toward $${targetAmount.toLocaleString()} goal`,
        `Use ${riskTolerance} investment strategy based on your risk tolerance`,
        'Maximize tax-advantaged accounts when applicable',
        'Consider dollar-cost averaging for market investments',
        'Review and adjust strategy quarterly'
      ],
      actionSteps: [
        {
          step: 1,
          action: 'Open appropriate savings/investment account',
          timeline: 'This week',
          priority: 'high'
        },
        {
          step: 2,
          action: `Set up automatic monthly transfer of $${monthlySavings}`,
          timeline: 'Next week',
          priority: 'high'
        },
        {
          step: 3,
          action: `Implement ${riskTolerance} investment allocation`,
          timeline: 'Month 1',
          priority: 'medium'
        },
        {
          step: 4,
          action: 'Schedule quarterly portfolio review',
          timeline: 'Month 3',
          priority: 'low'
        }
      ],
      projections: {
        timeToGoal: `${monthsToGoal} months`,
        monthlySavings: monthlySavings
      }
    };
  }

  private generateRetirementAdvisorReport(decisionPath: any[], userProfile: any): FinalRecommendation {
    const age = parseInt(decisionPath[0]?.value || '35');
    const lifestyle = decisionPath[1]?.value || 'comfortable';
    const currentSavings = parseInt(decisionPath[2]?.value || '50000');
    const monthlyContribution = parseInt(decisionPath[3]?.value || '1000');

    const yearsToRetirement = 65 - age;
    const projectedSavings = currentSavings + (monthlyContribution * 12 * yearsToRetirement * 1.07); // Assuming 7% annual return

    return {
      title: 'Retirement Planning Strategy',
      summary: `Contributing $${monthlyContribution} monthly for ${yearsToRetirement} years could result in approximately $${Math.round(projectedSavings).toLocaleString()} for your ${lifestyle} retirement lifestyle.`,
      recommendations: [
        `Contribute $${monthlyContribution} monthly to retirement accounts`,
        'Maximize employer 401(k) match if available',
        'Consider Roth IRA for tax diversification',
        'Increase contribution rate by 1% annually',
        'Review asset allocation based on age and risk tolerance'
      ],
      actionSteps: [
        {
          step: 1,
          action: 'Verify 401(k) contribution and employer match',
          timeline: 'This week',
          priority: 'high'
        },
        {
          step: 2,
          action: `Increase contribution to $${monthlyContribution} monthly`,
          timeline: 'Next paycheck',
          priority: 'high'
        },
        {
          step: 3,
          action: 'Open IRA account if not already available',
          timeline: 'Month 1',
          priority: 'medium'
        },
        {
          step: 4,
          action: 'Schedule annual contribution increase',
          timeline: 'Next year',
          priority: 'low'
        }
      ],
      projections: {
        timeToGoal: `${yearsToRetirement} years`,
        monthlySavings: monthlyContribution
      }
    };
  }
}

export const decisionTreeService = new DecisionTreeService();
