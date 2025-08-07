import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  MessageCircle, 
  DollarSign, 
  Rocket, 
  Flame,
  Calculator,
  Home,
  TrendingUp,
  PiggyBank,
  Settings
} from "lucide-react";

interface DecisionTreeViewProps {
  advisor: any;
  userId: string;
  userProfile: any;
  onComplete: () => void;
  onBackToAdvisors: () => void;
}

interface DecisionOption {
  id: string;
  value: string;
  title: string;
  description: string;
  consequences?: string;
}

interface DecisionStep {
  step: number;
  selection: string;
  value: string;
  title: string;
  description: string;
  timestamp: string;
}

interface FinalRecommendation {
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

interface TreeStatus {
  completed?: boolean;
  final_recommendation?: FinalRecommendation;
  decision_path?: DecisionStep[];
  current_step?: number;
  progress?: number;
}

export default function DecisionTreeView({ 
  advisor, 
  userId, 
  userProfile, 
  onComplete, 
  onBackToAdvisors 
}: DecisionTreeViewProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [decisionPath, setDecisionPath] = useState<DecisionStep[]>([]);
  const [currentOptions, setCurrentOptions] = useState<DecisionOption[]>([]);
  const [progressValue, setProgressValue] = useState(0);
  const [finalRecommendation, setFinalRecommendation] = useState<FinalRecommendation | null>(null);
  const [isTreeComplete, setIsTreeComplete] = useState(false);

  // Fetch current decision tree status
  const { data: treeStatus, refetch: refetchStatus } = useQuery<TreeStatus>({
    queryKey: ['/api/decision-tree/status', userId, advisor?.id],
    enabled: !!advisor?.id && !!userId,
  });

  // Save decision tree progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/decision-tree/save', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.completed && data.finalRecommendation) {
        setFinalRecommendation(data.finalRecommendation);
        setIsTreeComplete(true);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/decision-tree/status', userId, advisor?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize decision tree
  useEffect(() => {
    if (treeStatus && advisor) {
      if (treeStatus.completed) {
        setIsTreeComplete(true);
        setFinalRecommendation(treeStatus.final_recommendation || null);
        setDecisionPath(treeStatus.decision_path || []);
        setProgressValue(100);
      } else {
        setDecisionPath(treeStatus.decision_path || []);
        setCurrentStep(treeStatus.current_step || 0);
        setProgressValue(treeStatus.progress || 0);
        loadCurrentStepOptions(treeStatus.current_step || 0);
      }
    }
  }, [treeStatus, advisor]);

  const loadCurrentStepOptions = (step: number) => {
    // Define decision tree options based on advisor type
    const decisionTrees: Record<string, DecisionOption[][]> = {
      budget_planner: [
        [
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
        ],
        [
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
        ],
        [
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
        ],
        [
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
      ],
      debt_expert: [
        [
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
        ],
        [
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
        ],
        [
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
        ],
        [
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
      ],
      savings_strategist: [
        [
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
        ],
        [
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
        ],
        [
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
        ],
        [
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
      ],
      retirement_advisor: [
        [
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
        ],
        [
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
        ],
        [
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
        ],
        [
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
      ]
    };

    const advisorOptions = decisionTrees[advisor?.id];
    if (advisorOptions && advisorOptions[step]) {
      setCurrentOptions(advisorOptions[step]);
    }
  };

  const getStepTitle = (step: number) => {
    const titles: Record<string, string[]> = {
      budget_planner: [
        'How much do you currently have in emergency savings?',
        'What are your average monthly expenses?',
        'How much can you realistically save monthly?',
        'What\'s your timeline for building emergency fund?'
      ],
      debt_expert: [
        'What\'s your total debt amount?',
        'What\'s the average interest rate on your debt?',
        'Which debt payment strategy appeals to you?',
        'How much extra can you allocate monthly toward debt payments?'
      ],
      savings_strategist: [
        'What\'s your primary savings goal?',
        'What\'s your target savings amount?',
        'What\'s your investment risk tolerance?',
        'How much can you save monthly?'
      ],
      retirement_advisor: [
        'What\'s your current age?',
        'What\'s your retirement lifestyle goal?',
        'How much do you currently have saved for retirement?',
        'How much can you contribute monthly to retirement?'
      ]
    };

    return titles[advisor?.id]?.[step] || 'Decision Step';
  };

  const getStepDescription = (step: number) => {
    const descriptions: Record<string, string[]> = {
      budget_planner: [
        'Emergency funds should cover 3-6 months of expenses',
        'Include rent, utilities, food, transportation, and other necessities',
        'Consider your current income and fixed expenses',
        'Consider your financial priorities and goals'
      ],
      debt_expert: [
        'Include credit cards, personal loans, and other non-mortgage debt',
        'Consider credit cards, loans, and other debt',
        'Choose based on your personality and motivation style',
        'Beyond minimum payments, based on your budget analysis'
      ],
      savings_strategist: [
        'Choose your main financial objective',
        'The total amount you need to save for your goal',
        'How comfortable are you with market fluctuations?',
        'Realistic amount you can consistently save'
      ],
      retirement_advisor: [
        'This helps determine your retirement timeline and strategy',
        'Consider your desired standard of living in retirement',
        'Include 401(k), IRA, and other retirement accounts',
        'Include employer matches and personal contributions'
      ]
    };

    return descriptions[advisor?.id]?.[step] || 'Make your selection below';
  };

  const handleOptionSelect = (option: DecisionOption) => {
    const newDecision: DecisionStep = {
      step: currentStep,
      selection: option.id,
      value: option.value,
      title: option.title,
      description: option.description,
      timestamp: new Date().toISOString()
    };

    const newPath = [...decisionPath, newDecision];
    setDecisionPath(newPath);

    const totalSteps = 4;
    const isComplete = newPath.length >= totalSteps;
    const newProgress = Math.round((newPath.length / totalSteps) * 100);
    
    setProgressValue(newProgress);

    // Save progress
    saveProgressMutation.mutate({
      user_id: userId,
      advisor_id: advisor.id,
      decision_path: newPath,
      completed: isComplete
    });

    if (isComplete) {
      setIsTreeComplete(true);
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      loadCurrentStepOptions(nextStep);
    }
  };

  const handlePreviousStep = () => {
    if (decisionPath.length === 0) return;

    const newPath = decisionPath.slice(0, -1);
    setDecisionPath(newPath);
    
    const previousStep = Math.max(0, currentStep - 1);
    setCurrentStep(previousStep);
    setProgressValue(Math.round((newPath.length / 4) * 100));
    
    loadCurrentStepOptions(previousStep);
    setIsTreeComplete(false);
    setFinalRecommendation(null);
  };

  const getAdvisorIcon = () => {
    switch (advisor?.id) {
      case 'budget_planner': return Calculator;
      case 'savings_strategist': return Home;
      case 'debt_expert': return TrendingUp;
      case 'retirement_advisor': return PiggyBank;
      default: return Calculator;
    }
  };

  const getOptionIcon = (option: DecisionOption) => {
    if (advisor?.id === 'debt_expert' && currentStep === 3) {
      if (option.id === 'conservative') return DollarSign;
      if (option.id === 'aggressive') return Rocket;
      if (option.id === 'maximum') return Flame;
    }
    return DollarSign;
  };

  const renderStepProgress = () => {
    const steps = ['Debt Overview', 'Payment Strategy', 'Budget Adjustment', 'Final Plan'];
    
    return (
      <div className="flex items-center space-x-4 mb-6">
        {steps.map((stepName, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < currentStep ? 'bg-green-500 text-white' :
              index === currentStep ? 'bg-primary text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span className={`text-sm font-medium ${
              index < currentStep ? 'text-green-600' :
              index === currentStep ? 'text-primary' :
              'text-muted-foreground'
            }`}>
              {stepName}
            </span>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-border min-w-8" />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isTreeComplete && finalRecommendation) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <Check className="text-white text-xl" />
              </div>
              <div>
                <CardTitle className="text-2xl text-primary">{finalRecommendation.title}</CardTitle>
                <CardDescription>Your personalized financial plan is ready</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              Consultation Complete
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Summary */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
              <p className="text-muted-foreground">{finalRecommendation.summary}</p>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {finalRecommendation.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Action Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {finalRecommendation.actionSteps.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        action.priority === 'high' ? 'bg-red-100 text-red-700' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {action.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.action}</p>
                        <p className="text-xs text-muted-foreground">{action.timeline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projections */}
          {finalRecommendation.projections && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 text-center">
                  {finalRecommendation.projections.timeToGoal && (
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {finalRecommendation.projections.timeToGoal}
                      </div>
                      <div className="text-sm text-muted-foreground">Time to Goal</div>
                    </div>
                  )}
                  {finalRecommendation.projections.monthlySavings && (
                    <div>
                      <div className="text-2xl font-bold text-secondary">
                        ${finalRecommendation.projections.monthlySavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Monthly Progress</div>
                    </div>
                  )}
                  {finalRecommendation.projections.totalInterestSaved && (
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${finalRecommendation.projections.totalInterestSaved.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Interest Saved</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onComplete}
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
              size="lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start AI Chat Session
            </Button>
            <Button 
              variant="outline" 
              onClick={onBackToAdvisors}
              size="lg"
            >
              Choose Different Advisor
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const AdvisorIconComponent = getAdvisorIcon();

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <AdvisorIconComponent className="text-white text-xl" />
            </div>
            <div>
              <CardTitle className="text-2xl text-primary">{advisor?.name} Consultation</CardTitle>
              <CardDescription>Let's analyze your situation to create the perfect plan</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Progress</div>
            <div className="flex items-center space-x-2">
              <Progress value={progressValue} className="w-32 h-2" />
              <span className="text-sm font-semibold text-primary">{progressValue}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Step Progress for certain advisors */}
        {advisor?.id === 'debt_expert' && renderStepProgress()}

        {/* Current Question */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Step {currentStep + 1}: {getStepTitle(currentStep)}
          </h3>
          <p className="text-muted-foreground mb-6">{getStepDescription(currentStep)}</p>
          
          {/* Options */}
          <div className="grid md:grid-cols-3 gap-4">
            {currentOptions.map((option) => {
              const OptionIcon = getOptionIcon(option);
              return (
                <Card
                  key={option.id}
                  className="decision-node cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  onClick={() => handleOptionSelect(option)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        advisor?.id === 'budget_planner' ? 'bg-green-100 text-green-600' :
                        advisor?.id === 'savings_strategist' ? 'bg-blue-100 text-blue-600' :
                        advisor?.id === 'debt_expert' ? 'bg-orange-100 text-orange-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <OptionIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{option.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                        {option.consequences && (
                          <Badge variant="secondary" className="text-xs">
                            {option.consequences}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={currentStep > 0 ? handlePreviousStep : onBackToAdvisors}
            disabled={saveProgressMutation.isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep > 0 ? 'Previous Step' : 'Back to Advisors'}
          </Button>

          {saveProgressMutation.isPending && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Saving progress...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
