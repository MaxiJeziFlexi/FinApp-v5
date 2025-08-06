import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Home, TrendingUp, PiggyBank, Star, Check, Users } from "lucide-react";

interface AdvisorSelectionProps {
  userProfile: any;
  onAdvisorSelect: (advisor: any) => void;
}

interface Advisor {
  id: string;
  name: string;
  specialty: string;
  description: string;
  icon: string;
  rating: number;
  userCount: number;
  features: string[];
}

const defaultAdvisors: Advisor[] = [
  {
    id: 'budget_planner',
    name: 'Budget Planner',
    specialty: 'Emergency funds & expense management specialist',
    description: 'Expert in building emergency funds, tracking expenses, and optimizing monthly budgets for financial stability.',
    icon: 'calculator',
    rating: 4.9,
    userCount: 1234,
    features: ['Emergency fund planning', 'Monthly budget optimization', 'Expense tracking strategies']
  },
  {
    id: 'savings_strategist',
    name: 'Savings Strategist',
    specialty: 'Home purchase & major goal savings expert',
    description: 'Specializes in savings strategies for major purchases like homes and long-term wealth building.',
    icon: 'home',
    rating: 4.8,
    userCount: 956,
    features: ['Home buying strategies', 'Down payment planning', 'Investment growth plans']
  },
  {
    id: 'debt_expert',
    name: 'Debt Reduction Expert',
    specialty: 'Debt elimination & credit improvement specialist',
    description: 'Focused on debt consolidation, payment optimization, and credit score improvement strategies.',
    icon: 'trending-up',
    rating: 5.0,
    userCount: 2156,
    features: ['Debt consolidation plans', 'Credit score improvement', 'Payment optimization']
  },
  {
    id: 'retirement_advisor',
    name: 'Retirement Advisor',
    specialty: 'Long-term wealth & retirement planning expert',
    description: 'Expert in retirement planning, 401(k) optimization, and long-term investment strategies.',
    icon: 'piggy-bank',
    rating: 4.7,
    userCount: 789,
    features: ['401(k) optimization', 'Investment portfolio review', 'Retirement timeline planning']
  }
];

export default function AdvisorSelection({ userProfile, onAdvisorSelect }: AdvisorSelectionProps) {
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string | null>(null);

  // In a real app, this would fetch from the API
  const { data: advisors = defaultAdvisors } = useQuery({
    queryKey: ['/api/advisors'],
    retry: false,
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'calculator': return Calculator;
      case 'home': return Home;
      case 'trending-up': return TrendingUp;
      case 'piggy-bank': return PiggyBank;
      default: return Calculator;
    }
  };

  const getRecommendedAdvisor = () => {
    if (!userProfile?.financialGoal) return null;
    
    const goalToAdvisor: Record<string, string> = {
      'emergency_fund': 'budget_planner',
      'home_purchase': 'savings_strategist',
      'debt_reduction': 'debt_expert',
      'retirement': 'retirement_advisor'
    };
    
    return goalToAdvisor[userProfile.financialGoal];
  };

  const recommendedAdvisorId = getRecommendedAdvisor();

  const handleAdvisorSelect = (advisor: Advisor) => {
    setSelectedAdvisorId(advisor.id);
    onAdvisorSelect(advisor);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">Choose Your AI Financial Advisor</h2>
        <p className="text-muted-foreground text-lg">
          Select the specialist who best matches your financial goals
        </p>
        {userProfile?.financialGoal && (
          <Badge variant="secondary" className="mt-4">
            Recommended for: {userProfile.financialGoal.replace('_', ' ').toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Advisors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {advisors.map((advisor) => {
          const IconComponent = getIconComponent(advisor.icon);
          const isRecommended = advisor.id === recommendedAdvisorId;
          const isSelected = selectedAdvisorId === advisor.id;

          return (
            <Card
              key={advisor.id}
              className={`advisor-card cursor-pointer transition-all duration-300 relative ${
                isRecommended ? 'border-2 border-primary shadow-xl scale-105' : ''
              } ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleAdvisorSelect(advisor)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-accent text-accent-foreground font-bold">
                    RECOMMENDED
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  advisor.id === 'budget_planner' ? 'bg-green-100 text-green-600' :
                  advisor.id === 'savings_strategist' ? 'bg-blue-100 text-blue-600' :
                  advisor.id === 'debt_expert' ? 'bg-orange-100 text-orange-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                
                <CardTitle className="text-xl font-bold">{advisor.name}</CardTitle>
                <CardDescription className="text-sm mb-4">
                  {advisor.specialty}
                </CardDescription>
                
                {/* Rating */}
                <div className="flex justify-center items-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(advisor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {advisor.rating} ({advisor.userCount.toLocaleString()} users)
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                {/* Features */}
                <div className="space-y-2 mb-6">
                  {advisor.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-muted-foreground">
                      <Check className={`w-4 h-4 mr-2 ${
                        advisor.id === 'budget_planner' ? 'text-green-500' :
                        advisor.id === 'savings_strategist' ? 'text-blue-500' :
                        advisor.id === 'debt_expert' ? 'text-orange-500' :
                        'text-purple-500'
                      }`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className={`w-full transition-all duration-300 ${
                    advisor.id === 'budget_planner' ? 'bg-green-600 hover:bg-green-700' :
                    advisor.id === 'savings_strategist' ? 'bg-blue-600 hover:bg-blue-700' :
                    advisor.id === 'debt_expert' ? 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg' :
                    'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
                  onClick={() => handleAdvisorSelect(advisor)}
                >
                  Start Consultation
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>AI-Powered Advice</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Personalized Recommendations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Expert Financial Knowledge</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
