// utils/decisionTreeService.js
// Service for handling decision tree logic and flow

class DecisionTreeService {
  constructor() {
    this.decisionTrees = {
      investment_specialist: [
        {
          step: 0,
          question: "What is your primary investment goal?",
          description: "Choose the strategy that best matches your financial situation.",
          options: [
            {
              id: "growth",
              value: "growth",
              title: "Capital Growth",
              description: "Focus on long-term wealth building through appreciation",
              icon: "📈",
              recommended: "For younger investors"
            },
            {
              id: "income",
              value: "income",
              title: "Income Generation",
              description: "Generate regular income through dividends and interest",
              icon: "💰",
              recommended: "For retirees"
            },
            {
              id: "balanced",
              value: "balanced",
              title: "Balanced Approach",
              description: "Combination of growth and income strategies",
              icon: "⚖️",
              recommended: "For most investors"
            }
          ]
        },
        {
          step: 1,
          question: "What is your risk tolerance?",
          description: "Determine how much market volatility you can comfortably handle.",
          options: [
            {
              id: "conservative",
              value: "low",
              title: "Conservative",
              description: "Prefer stable returns with minimal risk",
              icon: "🛡️",
              recommended: "Capital preservation"
            },
            {
              id: "moderate",
              value: "medium",
              title: "Moderate",
              description: "Accept some risk for better potential returns",
              icon: "📊",
              recommended: "Balanced approach"
            },
            {
              id: "aggressive",
              value: "high",
              title: "Aggressive",
              description: "Willing to accept high risk for maximum growth",
              icon: "🚀",
              recommended: "Maximum growth"
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
              title: "1-3 years",
              description: "Short-term goals and liquidity needs",
              icon: "⏰",
              recommended: "Conservative investments"
            },
            {
              id: "medium_term",
              value: "medium",
              title: "3-10 years",
              description: "Medium-term financial goals",
              icon: "📅",
              recommended: "Balanced portfolio"
            },
            {
              id: "long_term",
              value: "long",
              title: "10+ years",
              description: "Long-term wealth building",
              icon: "🌱",
              recommended: "Growth focused"
            }
          ]
        }
      ],
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
              description: "Basic emergency fund for essential situations",
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
              description: "Set up automatic transfer to savings account",
              icon: "🔄",
              recommended: "Most effective method"
            },
            {
              id: "percentage_based",
              value: "percentage",
              title: "Percentage of income",
              description: "Save a fixed percentage of each paycheck",
              icon: "📊",
              recommended: "For variable income"
            },
            {
              id: "manual_savings",
              value: "manual",
              title: "Manual saving",
              description: "Decide when and how much to save yourself",
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
              id: "savings_account",
              value: "savings",
              title: "Savings account",
              description: "Safe, with interest, easy access",
              icon: "🏦",
              recommended: "Best choice"
            },
            {
              id: "money_market",
              value: "market",
              title: "Money market fund",
              description: "Higher interest, slightly less liquidity",
              icon: "📈",
              recommended: "For larger amounts"
            },
            {
              id: "mixed_approach",
              value: "mixed",
              title: "Mixed approach",
              description: "Part in account, part in funds",
              icon: "⚖️",
              recommended: "For advanced users"
            }
          ]
        }
      ],
      savings_strategist: [
        {
          step: 0,
          question: "What is your time horizon for buying real estate?",
          description: "Determine when you plan to buy to choose the right strategy.",
          options: [
            {
              id: "short_term",
              value: "short",
              title: "1-2 years",
              description: "Short-term purchase plan",
              icon: "⚡",
              recommended: "Conservative strategy"
            },
            {
              id: "medium_term",
              value: "medium",
              title: "3-5 years",
              description: "Medium-term investment plan",
              icon: "🎯",
              recommended: "Most popular"
            },
            {
              id: "long_term",
              value: "long",
              title: "5+ years",
              description: "Long-term capital building strategy",
              icon: "🌱",
              recommended: "Maximize returns"
            }
          ]
        },
        {
          step: 1,
          question: "What is your investment risk tolerance?",
          description: "Determine how much investment risk you can accept.",
          options: [
            {
              id: "low_risk",
              value: "conservative",
              title: "Low - CDs and bonds",
              description: "Safe instruments with guaranteed returns",
              icon: "🛡️",
              recommended: "For short terms"
            },
            {
              id: "medium_risk",
              value: "moderate",
              title: "Medium - mixed funds",
              description: "Combination of safety and growth",
              icon: "⚖️",
              recommended: "Optimal solution"
            },
            {
              id: "high_risk",
              value: "aggressive",
              title: "High - stocks and ETFs",
              description: "Maximize potential profit",
              icon: "🚀",
              recommended: "For long terms"
            }
          ]
        },
        {
          step: 2,
          question: "How much can you save monthly?",
          description: "Set a realistic amount you can systematically save.",
          options: [
            {
              id: "small_amount",
              value: "small",
              title: "$200-500",
              description: "Beginning saver",
              icon: "🌱",
              recommended: "Good start"
            },
            {
              id: "medium_amount",
              value: "medium",
              title: "$500-1500",
              description: "Medium savings capacity",
              icon: "💪",
              recommended: "Solid foundation"
            },
            {
              id: "large_amount",
              value: "large",
              title: "$1500+",
              description: "High savings capacity",
              icon: "💎",
              recommended: "Fast goal"
            }
          ]
        }
      ],
      execution_expert: [
        {
          step: 0,
          question: "What is your debt repayment strategy?",
          description: "Choose the method that will be psychologically and financially best for you.",
          options: [
            {
              id: "debt_avalanche",
              value: "avalanche",
              title: "Avalanche method",
              description: "Pay off highest interest rate debts first",
              icon: "🏔️",
              recommended: "Mathematically optimal"
            },
            {
              id: "debt_snowball",
              value: "snowball",
              title: "Snowball method",
              description: "Pay off smallest debts first",
              icon: "⚪",
              recommended: "Psychologically motivating"
            },
            {
              id: "debt_consolidation",
              value: "consolidation",
              title: "Debt consolidation",
              description: "Combine all debts into one loan",
              icon: "🔗",
              recommended: "For multiple debts"
            }
          ]
        },
        {
          step: 1,
          question: "How much can you allocate monthly for debt repayment?",
          description: "Determine realistic amount above minimum payments.",
          options: [
            {
              id: "minimal_extra",
              value: "minimal",
              title: "$100-250 extra",
              description: "Minimal additional payment",
              icon: "🐌",
              recommended: "Steady pace"
            },
            {
              id: "moderate_extra",
              value: "moderate",
              title: "$250-750 extra",
              description: "Moderate additional payment",
              icon: "🚶",
              recommended: "Good balance"
            },
            {
              id: "aggressive_extra",
              value: "aggressive",
              title: "$750+ extra",
              description: "Aggressive repayment",
              icon: "🏃",
              recommended: "Fast debt freedom"
            }
          ]
        },
        {
          step: 2,
          question: "Can you increase your income?",
          description: "Additional income sources can significantly accelerate repayment.",
          options: [
            {
              id: "no_extra_income",
              value: "current",
              title: "Current income only",
              description: "Focus on optimizing expenses",
              icon: "💼",
              recommended: "Cost cutting plan"
            },
            {
              id: "side_hustle",
              value: "side",
              title: "Side work/freelancing",
              description: "Can take on additional work",
              icon: "💪",
              recommended: "Additional source"
            },
            {
              id: "asset_sale",
              value: "assets",
              title: "Sell unnecessary items",
              description: "Can sell part of assets",
              icon: "🏷️",
              recommended: "One-time boost"
            }
          ]
        }
      ],
      optimization_advisor: [
        {
          step: 0,
          question: "At what age do you plan to retire?",
          description: "Determine target retirement age to plan strategy.",
          options: [
            {
              id: "early_retirement",
              value: "early",
              title: "Before age 60",
              description: "Early retirement requires aggressive savings",
              icon: "🌅",
              recommended: "High requirements"
            },
            {
              id: "standard_retirement",
              value: "standard",
              title: "60-67 years old",
              description: "Standard retirement age",
              icon: "⏰",
              recommended: "Typical plan"
            },
            {
              id: "late_retirement",
              value: "late",
              title: "After age 67",
              description: "Longer work, lower savings requirements",
              icon: "🌇",
              recommended: "Lower risk"
            }
          ]
        },
        {
          step: 1,
          question: "What portion of current income do you want to maintain in retirement?",
          description: "Determine target lifestyle level in retirement.",
          options: [
            {
              id: "basic_needs",
              value: "basic",
              title: "50-60% of current income",
              description: "Basic living needs",
              icon: "🏠",
              recommended: "Minimum requirements"
            },
            {
              id: "comfortable_life",
              value: "comfortable",
              title: "70-80% of current income",
              description: "Comfortable retirement life",
              icon: "🌞",
              recommended: "Optimal goal"
            },
            {
              id: "luxury_life",
              value: "luxury",
              title: "90-100% of current income",
              description: "Maintain full standard of living",
              icon: "💎",
              recommended: "High ambitions"
            }
          ]
        },
        {
          step: 2,
          question: "What retirement instruments do you prefer?",
          description: "Choose the best tools for building retirement capital.",
          options: [
            {
              id: "conservative_approach",
              value: "conservative",
              title: "401(k) + bonds",
              description: "Safe, traditional retirement planning",
              icon: "🏛️",
              recommended: "Low risk"
            },
            {
              id: "balanced_approach",
              value: "balanced",
              title: "401(k) + IRA + index funds",
              description: "Balanced retirement portfolio",
              icon: "📊",
              recommended: "Optimal diversification"
            },
            {
              id: "aggressive_approach",
              value: "aggressive",
              title: "401(k) + IRA + individual stocks",
              description: "Maximum growth potential",
              icon: "🚀",
              recommended: "High growth"
            }
          ]
        }
      ]
    };
  }

  getQuestion(advisorId, step) {
    const tree = this.decisionTrees[advisorId];
    if (!tree || step >= tree.length) {
      return null;
    }
    return tree[step];
  }

  getProgressPercentage(advisorId, currentStep) {
    const tree = this.decisionTrees[advisorId];
    if (!tree) return 0;
    return Math.round(((currentStep + 1) / tree.length) * 100);
  }

  isDecisionTreeComplete(advisorId, responses) {
    const tree = this.decisionTrees[advisorId];
    if (!tree) return false;
    return responses.length >= tree.length;
  }

  generateRecommendations(advisorId, responses) {
    const recommendations = {
      title: "Personalized Financial Recommendation",
      summary: "Based on your responses, here's your customized financial plan.",
      recommendations: [],
      actionSteps: []
    };

    // Generate recommendations based on advisor type and responses
    switch (advisorId) {
      case 'investment_specialist':
        recommendations.recommendations = [
          "Build diversified portfolio based on your risk tolerance",
          "Consider tax-advantaged accounts like 401(k) and IRA",
          "Rebalance portfolio quarterly",
          "Review and adjust strategy annually"
        ];
        recommendations.actionSteps = [
          {
            step: 1,
            action: "Open investment account",
            timeline: "Next 7 days",
            priority: "high"
          },
          {
            step: 2,
            action: "Set up automatic monthly investments",
            timeline: "Next 14 days",
            priority: "high"
          }
        ];
        break;

      case 'budget_planner':
        recommendations.recommendations = [
          "Build emergency fund as first priority",
          "Track all expenses for better budgeting",
          "Automate savings to ensure consistency",
          "Review budget monthly"
        ];
        recommendations.actionSteps = [
          {
            step: 1,
            action: "Open high-yield savings account",
            timeline: "Next 3 days",
            priority: "high"
          },
          {
            step: 2,
            action: "Set up automatic transfers",
            timeline: "Next 7 days",
            priority: "high"
          }
        ];
        break;

      case 'savings_strategist':
        recommendations.recommendations = [
          "Choose appropriate savings vehicles for timeline",
          "Consider house down payment assistance programs",
          "Factor in closing costs and moving expenses",
          "Get pre-approved for mortgage"
        ];
        break;

      case 'execution_expert':
        recommendations.recommendations = [
          "Follow chosen debt repayment strategy consistently",
          "Avoid taking on new debt",
          "Consider debt consolidation if beneficial",
          "Celebrate milestones to stay motivated"
        ];
        break;

      case 'optimization_advisor':
        recommendations.recommendations = [
          "Maximize employer 401(k) match",
          "Contribute to IRA for additional tax benefits",
          "Consider Roth conversions in low-income years",
          "Plan for healthcare costs in retirement"
        ];
        break;

      default:
        recommendations.recommendations = [
          "Continue building financial knowledge",
          "Set clear financial goals",
          "Review progress regularly",
          "Adjust strategy as needed"
        ];
    }

    return recommendations;
  }

  async processInteractiveChallenge(advisorId, step, userResponse) {
    const question = this.getQuestion(advisorId, step);
    if (!question) {
      throw new Error('Invalid step or advisor');
    }

    // Process the response and return next step or completion
    const nextStep = step + 1;
    const nextQuestion = this.getQuestion(advisorId, nextStep);
    
    if (nextQuestion) {
      return {
        success: true,
        nextStep: nextStep,
        question: nextQuestion,
        progress: this.getProgressPercentage(advisorId, nextStep),
        isComplete: false
      };
    } else {
      // Decision tree complete
      const responses = [userResponse]; // In real implementation, collect all responses
      const recommendations = this.generateRecommendations(advisorId, responses);
      
      return {
        success: true,
        isComplete: true,
        progress: 100,
        recommendations: recommendations
      };
    }
  }
}

// Export singleton instance
const decisionTreeService = new DecisionTreeService();
module.exports = { decisionTreeService };