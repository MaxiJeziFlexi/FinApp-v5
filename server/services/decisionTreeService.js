// utils/decisionTreeService.js
// Service for handling decision tree logic and flow

class DecisionTreeService {
  constructor() {
    this.decisionTrees = {
      budget_planner: [
        {
          step: 0,
          question: "What is your priority in building an emergency fund?",
          description: "Choose the strategy that best fits your financial situation.",
          options: [
            {
              id: "three_months",
              value: "three",
              title: "3 months of expenses",
              description: "Basic emergency fund for the most important situations",
              icon: "🛡️",
              recommended: "For people with stable income"
            },
            {
              id: "six_months",
              value: "six",
              title: "6 months of expenses",
              description: "Medium emergency fund providing greater security",
              icon: "🏦",
              recommended: "For most people"
            },
            {
              id: "twelve_months",
              value: "twelve",
              title: "12 months of expenses",
              description: "Extended fund for long-term problems",
              icon: "💎",
              recommended: "For people with unstable income"
            }
          ]
        },
        {
          step: 1,
          question: "How do you want to save for your emergency fund?",
          description: "Choose the saving method that will work best for you.",
          options: [
            {
              id: "automatic_transfer",
              value: "automatic",
              title: "Automatic transfers",
              description: "Set up a fixed transfer to savings account",
              icon: "🔄",
              recommended: "Most effective method"
            },
            {
              id: "percentage_based",
              value: "percentage",
              title: "Percentage of income",
              description: "Save a fixed percentage of each income",
              icon: "📊",
              recommended: "For variable incomes"
            },
            {
              id: "manual_savings",
              value: "manual",
              title: "Manual saving",
              description: "You decide when and how much to save",
              icon: "✋",
              recommended: "Requires discipline"
            }
          ]
        },
        {
          step: 2,
          question: "Where do you want to keep your emergency fund?",
          description: "Choose the best place to store your savings.",
          options: [
            {
              id: "high_yield_savings",
              value: "high_yield",
              title: "High-yield savings account",
              description: "Easy access with competitive interest rates",
              icon: "💰",
              recommended: "Best balance of access and return"
            },
            {
              id: "money_market",
              value: "money_market",
              title: "Money market account",
              description: "Higher interest with limited monthly transactions",
              icon: "📈",
              recommended: "For larger emergency funds"
            },
            {
              id: "checking_account",
              value: "checking",
              title: "Regular checking account",
              description: "Immediate access but lower interest",
              icon: "🏧",
              recommended: "Only for small amounts"
            }
          ]
        }
      ],
      investment_specialist: [
        {
          step: 0,
          question: "What is your primary investment goal?",
          description: "Understanding your goal helps us create the right strategy.",
          options: [
            {
              id: "retirement_planning",
              value: "retirement",
              title: "Retirement Planning",
              description: "Building wealth for long-term retirement security",
              icon: "🏖️",
              recommended: "For long-term wealth building"
            },
            {
              id: "wealth_building",
              value: "wealth",
              title: "General Wealth Building",
              description: "Growing your money for future opportunities",
              icon: "📈",
              recommended: "For medium to long-term growth"
            },
            {
              id: "income_generation",
              value: "income",
              title: "Income Generation",
              description: "Creating regular income from investments",
              icon: "💵",
              recommended: "For current income needs"
            }
          ]
        },
        {
          step: 1,
          question: "What is your risk tolerance?",
          description: "This helps determine the right investment mix for you.",
          options: [
            {
              id: "conservative",
              value: "conservative",
              title: "Conservative",
              description: "Prefer stability over growth, minimal risk",
              icon: "🛡️",
              recommended: "Capital preservation focus"
            },
            {
              id: "moderate",
              value: "moderate",
              title: "Moderate",
              description: "Balanced approach between growth and stability",
              icon: "⚖️",
              recommended: "Most common approach"
            },
            {
              id: "aggressive",
              value: "aggressive",
              title: "Aggressive",
              description: "Willing to accept higher risk for greater returns",
              icon: "🚀",
              recommended: "For maximum growth potential"
            }
          ]
        },
        {
          step: 2,
          question: "What is your investment timeline?",
          description: "Your time horizon affects the best investment strategy.",
          options: [
            {
              id: "short_term",
              value: "short",
              title: "Short-term (1-3 years)",
              description: "Need money relatively soon",
              icon: "⏰",
              recommended: "Focus on preservation"
            },
            {
              id: "medium_term",
              value: "medium",
              title: "Medium-term (3-10 years)",
              description: "Moderate time to grow investments",
              icon: "📅",
              recommended: "Balanced growth approach"
            },
            {
              id: "long_term",
              value: "long",
              title: "Long-term (10+ years)",
              description: "Long time horizon for maximum growth",
              icon: "🏔️",
              recommended: "Maximum growth potential"
            }
          ]
        }
      ],
      tax_specialist: [
        {
          step: 0,
          question: "What is your primary tax optimization goal?",
          description: "Let's identify the best tax strategy for your situation.",
          options: [
            {
              id: "reduce_current_taxes",
              value: "reduce_current",
              title: "Reduce Current Year Taxes",
              description: "Lower this year's tax burden",
              icon: "📉",
              recommended: "For immediate tax relief"
            },
            {
              id: "long_term_strategy",
              value: "long_term",
              title: "Long-term Tax Strategy",
              description: "Optimize taxes over many years",
              icon: "📊",
              recommended: "For sustained tax efficiency"
            },
            {
              id: "retirement_tax_planning",
              value: "retirement_tax",
              title: "Retirement Tax Planning",
              description: "Minimize taxes in retirement",
              icon: "🏖️",
              recommended: "For retirement preparation"
            }
          ]
        },
        {
          step: 1,
          question: "What is your current income level?",
          description: "Income level affects which tax strategies work best.",
          options: [
            {
              id: "low_income",
              value: "low",
              title: "Under $50,000",
              description: "Focus on tax credits and deductions",
              icon: "🎯",
              recommended: "Maximize credits and deductions"
            },
            {
              id: "medium_income",
              value: "medium",
              title: "$50,000 - $150,000",
              description: "Balance between credits and tax-advantaged accounts",
              icon: "⚖️",
              recommended: "Most tax optimization strategies apply"
            },
            {
              id: "high_income",
              value: "high",
              title: "Over $150,000",
              description: "Advanced strategies and high-income planning",
              icon: "📈",
              recommended: "Complex optimization strategies"
            }
          ]
        },
        {
          step: 2,
          question: "Do you have access to employer retirement plans?",
          description: "Employer plans offer excellent tax advantages.",
          options: [
            {
              id: "have_401k",
              value: "yes_401k",
              title: "Yes, 401(k) with matching",
              description: "Employer matches some contributions",
              icon: "🎁",
              recommended: "Maximize employer match first"
            },
            {
              id: "have_401k_no_match",
              value: "yes_no_match",
              title: "Yes, 401(k) without matching",
              description: "Have 401(k) but no employer match",
              icon: "📦",
              recommended: "Consider IRA options too"
            },
            {
              id: "no_employer_plan",
              value: "no_plan",
              title: "No employer retirement plan",
              description: "Need to rely on personal accounts",
              icon: "🏠",
              recommended: "Focus on IRAs and personal strategies"
            }
          ]
        }
      ],
      retirement_specialist: [
        {
          step: 0,
          question: "When do you plan to retire?",
          description: "Your retirement timeline affects the best strategy.",
          options: [
            {
              id: "early_retirement",
              value: "early",
              title: "Early Retirement (50-62)",
              description: "Retire before traditional retirement age",
              icon: "🌅",
              recommended: "Need aggressive saving strategy"
            },
            {
              id: "traditional_retirement",
              value: "traditional",
              title: "Traditional Retirement (62-67)",
              description: "Retire at traditional retirement age",
              icon: "🏖️",
              recommended: "Most common retirement timeline"
            },
            {
              id: "late_retirement",
              value: "late",
              title: "Late Retirement (67+)",
              description: "Continue working past traditional age",
              icon: "💼",
              recommended: "Maximize Social Security benefits"
            }
          ]
        },
        {
          step: 1,
          question: "What is your current retirement savings status?",
          description: "This helps us understand where you're starting from.",
          options: [
            {
              id: "just_starting",
              value: "starting",
              title: "Just Getting Started",
              description: "Little to no retirement savings yet",
              icon: "🌱",
              recommended: "Focus on building foundation"
            },
            {
              id: "on_track",
              value: "on_track",
              title: "On Track",
              description: "Have some savings but need optimization",
              icon: "🎯",
              recommended: "Optimize existing strategy"
            },
            {
              id: "behind",
              value: "behind",
              title: "Behind on Savings",
              description: "Need to catch up on retirement savings",
              icon: "⚡",
              recommended: "Aggressive catch-up strategy"
            }
          ]
        },
        {
          step: 2,
          question: "What type of retirement lifestyle do you envision?",
          description: "Your desired lifestyle affects how much you need to save.",
          options: [
            {
              id: "modest_lifestyle",
              value: "modest",
              title: "Modest Lifestyle",
              description: "Simple, comfortable retirement",
              icon: "🏡",
              recommended: "70-80% of current income"
            },
            {
              id: "comfortable_lifestyle",
              value: "comfortable",
              title: "Comfortable Lifestyle",
              description: "Maintain current standard of living",
              icon: "🏠",
              recommended: "80-100% of current income"
            },
            {
              id: "luxury_lifestyle",
              value: "luxury",
              title: "Luxury Lifestyle",
              description: "Enhanced lifestyle with travel and hobbies",
              icon: "✈️",
              recommended: "100%+ of current income"
            }
          ]
        }
      ],
      insurance_specialist: [
        {
          step: 0,
          question: "What type of insurance coverage are you most concerned about?",
          description: "Let's prioritize your insurance needs.",
          options: [
            {
              id: "life_insurance",
              value: "life",
              title: "Life Insurance",
              description: "Protect your family's financial future",
              icon: "👨‍👩‍👧‍👦",
              recommended: "Essential for breadwinners"
            },
            {
              id: "health_insurance",
              value: "health",
              title: "Health Insurance",
              description: "Protect against medical expenses",
              icon: "🏥",
              recommended: "Critical for everyone"
            },
            {
              id: "disability_insurance",
              value: "disability",
              title: "Disability Insurance",
              description: "Protect your ability to earn income",
              icon: "🛡️",
              recommended: "Often overlooked but important"
            }
          ]
        },
        {
          step: 1,
          question: "What is your family situation?",
          description: "Family status affects insurance needs significantly.",
          options: [
            {
              id: "single_no_dependents",
              value: "single",
              title: "Single, No Dependents",
              description: "Only responsible for yourself",
              icon: "👤",
              recommended: "Focus on health and disability"
            },
            {
              id: "married_no_children",
              value: "married_no_kids",
              title: "Married, No Children",
              description: "Responsible for spouse",
              icon: "👫",
              recommended: "Life insurance becomes important"
            },
            {
              id: "married_with_children",
              value: "married_with_kids",
              title: "Married with Children",
              description: "Full family to protect",
              icon: "👨‍👩‍👧‍👦",
              recommended: "Comprehensive coverage needed"
            }
          ]
        },
        {
          step: 2,
          question: "What is your current health status?",
          description: "Health affects insurance options and premiums.",
          options: [
            {
              id: "excellent_health",
              value: "excellent",
              title: "Excellent Health",
              description: "No health issues, very active",
              icon: "💪",
              recommended: "Qualify for best rates"
            },
            {
              id: "good_health",
              value: "good",
              title: "Good Health",
              description: "Generally healthy with minor issues",
              icon: "👍",
              recommended: "Standard rates available"
            },
            {
              id: "health_concerns",
              value: "concerns",
              title: "Some Health Concerns",
              description: "Chronic conditions or health issues",
              icon: "⚕️",
              recommended: "May need specialized coverage"
            }
          ]
        }
      ]
    };

    this.advisorTypes = {
      'budget_planner': {
        name: 'Sarah - Budget Planning Specialist',
        specialty: 'Emergency funds and budgeting strategies',
        experience: '8 years',
        description: 'Expert in helping clients build strong financial foundations through smart budgeting and emergency fund strategies.'
      },
      'investment_specialist': {
        name: 'Marcus - Investment Specialist',
        specialty: 'Portfolio management and investment strategies',
        experience: '12 years',
        description: 'Specializes in creating personalized investment portfolios aligned with client goals and risk tolerance.'
      },
      'tax_specialist': {
        name: 'Jennifer - Tax Optimization Expert',
        specialty: 'Tax planning and optimization strategies',
        experience: '15 years',
        description: 'Helps clients minimize tax burden through legal strategies and smart financial planning.'
      },
      'retirement_specialist': {
        name: 'David - Retirement Planning Advisor',
        specialty: 'Retirement planning and income strategies',
        experience: '20 years',
        description: 'Guides clients through comprehensive retirement planning from early career to retirement income.'
      },
      'insurance_specialist': {
        name: 'Lisa - Insurance & Protection Advisor',
        specialty: 'Risk management and insurance planning',
        experience: '10 years',
        description: 'Protects client families and assets through comprehensive insurance and risk management strategies.'
      }
    };

    this.userSessions = new Map();
  }

  // Initialize a new decision tree session for a user
  startSession(userId, advisorType) {
    const sessionId = `session_${userId}_${Date.now()}`;
    const session = {
      sessionId,
      userId,
      advisorType,
      currentStep: 0,
      responses: [],
      startTime: new Date(),
      isComplete: false
    };

    this.userSessions.set(sessionId, session);
    return session;
  }

  // Get current step for a session
  getCurrentStep(sessionId) {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const tree = this.decisionTrees[session.advisorType];
    if (!tree || session.currentStep >= tree.length) {
      return null;
    }

    return {
      ...tree[session.currentStep],
      progress: ((session.currentStep + 1) / tree.length) * 100,
      sessionId: sessionId,
      advisor: this.advisorTypes[session.advisorType]
    };
  }

  // Process user response and move to next step
  processResponse(sessionId, response) {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Save the response
    session.responses.push({
      step: session.currentStep,
      response: response,
      timestamp: new Date()
    });

    // Move to next step
    session.currentStep++;

    const tree = this.decisionTrees[session.advisorType];
    
    // Check if we've completed the decision tree
    if (session.currentStep >= tree.length) {
      session.isComplete = true;
      session.completionTime = new Date();
      
      // Generate final recommendations
      const recommendations = this.generateRecommendations(session);
      session.recommendations = recommendations;
      
      return {
        isComplete: true,
        recommendations: recommendations,
        progress: 100,
        sessionId: sessionId
      };
    }

    // Return next step
    return this.getCurrentStep(sessionId);
  }

  // Generate final recommendations based on user responses
  generateRecommendations(session) {
    const responses = session.responses;
    const advisorType = session.advisorType;
    
    switch (advisorType) {
      case 'budget_planner':
        return this.generateBudgetRecommendations(responses);
      case 'investment_specialist':
        return this.generateInvestmentRecommendations(responses);
      case 'tax_specialist':
        return this.generateTaxRecommendations(responses);
      case 'retirement_specialist':
        return this.generateRetirementRecommendations(responses);
      case 'insurance_specialist':
        return this.generateInsuranceRecommendations(responses);
      default:
        return {
          title: 'General Financial Recommendations',
          summary: 'Based on your responses, here are some general recommendations.',
          actionItems: [
            'Continue building your financial knowledge',
            'Review your financial goals regularly',
            'Consider working with a financial advisor'
          ]
        };
    }
  }

  generateBudgetRecommendations(responses) {
    const emergencyGoal = responses[0]?.response?.value;
    const savingMethod = responses[1]?.response?.value;
    const storageLocation = responses[2]?.response?.value;

    return {
      title: 'Your Personalized Budget & Emergency Fund Plan',
      summary: `Based on your goal of building ${emergencyGoal === 'three' ? '3 months' : emergencyGoal === 'six' ? '6 months' : '12 months'} of expenses using ${savingMethod === 'automatic' ? 'automatic transfers' : savingMethod === 'percentage' ? 'percentage-based saving' : 'manual saving'}.`,
      actionItems: [
        `Set up ${emergencyGoal === 'three' ? '3-month' : emergencyGoal === 'six' ? '6-month' : '12-month'} emergency fund goal`,
        savingMethod === 'automatic' ? 'Set up automatic monthly transfers' : savingMethod === 'percentage' ? 'Allocate 10-20% of income to emergency fund' : 'Create disciplined saving schedule',
        storageLocation === 'high_yield' ? 'Open high-yield savings account' : storageLocation === 'money_market' ? 'Consider money market account' : 'Keep easily accessible in checking',
        'Review and adjust monthly budget',
        'Track progress toward emergency fund goal'
      ],
      timeline: '3-12 months to fully fund',
      priority: 'High - Foundation of financial security'
    };
  }

  generateInvestmentRecommendations(responses) {
    const goal = responses[0]?.response?.value;
    const riskTolerance = responses[1]?.response?.value;
    const timeline = responses[2]?.response?.value;

    const allocation = this.getRecommendedAllocation(riskTolerance, timeline);

    return {
      title: 'Your Personalized Investment Strategy',
      summary: `${goal === 'retirement' ? 'Retirement-focused' : goal === 'wealth' ? 'Wealth-building' : 'Income-generating'} strategy with ${riskTolerance} risk profile for ${timeline === 'short' ? 'short-term' : timeline === 'medium' ? 'medium-term' : 'long-term'} goals.`,
      actionItems: [
        `Allocate ${allocation.stocks}% to stock investments`,
        `Allocate ${allocation.bonds}% to bond investments`,
        `Consider ${allocation.alternatives}% in alternatives (REITs, commodities)`,
        timeline === 'long' ? 'Focus on low-cost index funds' : 'Consider more liquid investments',
        'Rebalance portfolio annually',
        'Increase contributions over time'
      ],
      expectedReturn: riskTolerance === 'aggressive' ? '8-12% annually' : riskTolerance === 'moderate' ? '6-8% annually' : '4-6% annually',
      timeline: timeline === 'short' ? '1-3 years' : timeline === 'medium' ? '3-10 years' : '10+ years',
      priority: 'High - Wealth building essential'
    };
  }

  generateTaxRecommendations(responses) {
    const goal = responses[0]?.response?.value;
    const income = responses[1]?.response?.value;
    const employerPlan = responses[2]?.response?.value;

    return {
      title: 'Your Tax Optimization Strategy',
      summary: `${goal === 'reduce_current' ? 'Immediate tax reduction' : goal === 'long_term' ? 'Long-term tax strategy' : 'Retirement tax planning'} for ${income === 'low' ? 'lower' : income === 'medium' ? 'middle' : 'higher'} income bracket.`,
      actionItems: [
        employerPlan === 'yes_401k' ? 'Maximize employer 401(k) match immediately' : 'Open and fund IRA',
        income === 'high' ? 'Consider Roth IRA conversion strategies' : 'Focus on traditional tax-deferred accounts',
        'Utilize HSA if available (triple tax advantage)',
        goal === 'reduce_current' ? 'Maximize current year deductions' : 'Plan multi-year tax strategies',
        'Consider tax-loss harvesting for investments',
        'Review tax-efficient investment locations'
      ],
      potentialSavings: income === 'high' ? '$5,000-15,000 annually' : income === 'medium' ? '$2,000-8,000 annually' : '$500-3,000 annually',
      timeline: goal === 'reduce_current' ? 'This tax year' : 'Multi-year strategy',
      priority: 'High - Immediate financial impact'
    };
  }

  generateRetirementRecommendations(responses) {
    const retirementAge = responses[0]?.response?.value;
    const savingsStatus = responses[1]?.response?.value;
    const lifestyle = responses[2]?.response?.value;

    const incomeReplacement = lifestyle === 'modest' ? '70-80%' : lifestyle === 'comfortable' ? '80-100%' : '100%+';

    return {
      title: 'Your Retirement Planning Strategy',
      summary: `${retirementAge === 'early' ? 'Early retirement' : retirementAge === 'traditional' ? 'Traditional retirement' : 'Late retirement'} plan for ${lifestyle} lifestyle requiring ${incomeReplacement} income replacement.`,
      actionItems: [
        savingsStatus === 'starting' ? 'Start with 10-15% savings rate' : savingsStatus === 'behind' ? 'Implement catch-up contributions' : 'Optimize current strategy',
        retirementAge === 'early' ? 'Plan for bridge strategies before age 59.5' : 'Maximize Social Security benefits',
        'Diversify retirement account types (401k, IRA, Roth)',
        lifestyle === 'luxury' ? 'Target 25-30x annual expenses' : lifestyle === 'comfortable' ? 'Target 20-25x annual expenses' : 'Target 15-20x annual expenses',
        'Create retirement income withdrawal strategy',
        'Plan for healthcare costs in retirement'
      ],
      targetSavingsRate: savingsStatus === 'behind' ? '20-30% of income' : savingsStatus === 'starting' ? '15-20% of income' : '10-15% of income',
      timeline: retirementAge === 'early' ? '15-25 years' : retirementAge === 'traditional' ? '20-35 years' : '35+ years',
      priority: 'Critical - Time-sensitive goal'
    };
  }

  generateInsuranceRecommendations(responses) {
    const coverageType = responses[0]?.response?.value;
    const familySituation = responses[1]?.response?.value;
    const healthStatus = responses[2]?.response?.value;

    return {
      title: 'Your Insurance & Protection Strategy',
      summary: `${coverageType === 'life' ? 'Life insurance' : coverageType === 'health' ? 'Health insurance' : 'Disability insurance'} planning for ${familySituation === 'single' ? 'single individual' : familySituation === 'married_no_kids' ? 'married couple' : 'family with children'}.`,
      actionItems: [
        familySituation === 'married_with_kids' ? 'Priority: Term life insurance 10-12x annual income' : familySituation === 'married_no_kids' ? 'Consider life insurance 5-8x annual income' : 'Focus on disability and health coverage',
        coverageType === 'health' ? 'Maximize HSA contributions if available' : 'Ensure adequate health coverage',
        'Consider disability insurance (60-70% income replacement)',
        healthStatus === 'excellent' ? 'Lock in coverage while healthy' : healthStatus === 'concerns' ? 'Work with specialized agents' : 'Standard coverage available',
        'Review coverage annually as life changes',
        'Consider umbrella liability policy if high net worth'
      ],
      coverageAmount: familySituation === 'married_with_kids' ? '$500K-2M+ life insurance' : familySituation === 'married_no_kids' ? '$250K-1M life insurance' : 'Focus on disability/health',
      timeline: 'Immediate - Protection gaps are risky',
      priority: 'High - Protect against catastrophic loss'
    };
  }

  getRecommendedAllocation(riskTolerance, timeline) {
    if (riskTolerance === 'aggressive' && timeline === 'long') {
      return { stocks: 90, bonds: 5, alternatives: 5 };
    } else if (riskTolerance === 'aggressive') {
      return { stocks: 80, bonds: 15, alternatives: 5 };
    } else if (riskTolerance === 'moderate' && timeline === 'long') {
      return { stocks: 70, bonds: 25, alternatives: 5 };
    } else if (riskTolerance === 'moderate') {
      return { stocks: 60, bonds: 30, alternatives: 10 };
    } else if (riskTolerance === 'conservative' && timeline === 'long') {
      return { stocks: 50, bonds: 45, alternatives: 5 };
    } else {
      return { stocks: 30, bonds: 60, alternatives: 10 };
    }
  }

  // Get all available advisor types
  getAdvisorTypes() {
    return Object.keys(this.advisorTypes).map(key => ({
      id: key,
      ...this.advisorTypes[key]
    }));
  }

  // Get session details
  getSession(sessionId) {
    return this.userSessions.get(sessionId);
  }

  // Clean up old sessions (can be called periodically)
  cleanupOldSessions(maxAgeHours = 24) {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    
    for (const [sessionId, session] of this.userSessions.entries()) {
      if (session.startTime < cutoffTime) {
        this.userSessions.delete(sessionId);
      }
    }
  }
}

export default DecisionTreeService;