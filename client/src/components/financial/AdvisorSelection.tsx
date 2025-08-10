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
  description: string;
  expertise?: string[];
  personality?: string;
  responseStyle?: string;
  specialty?: string;
  rating?: number;
  userCount?: number;
  features?: string[];
}

// Using real advisors from database instead of hardcoded ones

export default function AdvisorSelection({ userProfile, onAdvisorSelect }: AdvisorSelectionProps) {
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string | null>(null);

  // Fetch real advisors from database
  const { data: advisors = [], isLoading } = useQuery({
    queryKey: ['/api/advisors'],
    retry: false,
  });

  const getIconComponent = (advisorId: string) => {
    switch (advisorId) {
      case 'financial_planner': return Calculator;
      case 'investment_specialist': return TrendingUp;
      case 'risk_analyst': return PiggyBank;
      default: return Calculator;
    }
  };

  const getRecommendedAdvisor = () => {
    if (!userProfile?.financialGoal) return null;
    
    const goalToAdvisor: Record<string, string> = {
      'emergency_fund': 'financial_planner',
      'home_purchase': 'financial_planner', 
      'debt_reduction': 'financial_planner',
      'retirement': 'retirement_specialist',
      'investment': 'investment_specialist',
      'tax_optimization': 'tax_strategist',
      'risk_management': 'risk_analyst'
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
        <h2 className="text-3xl font-bold text-primary mb-2">🚀 AI Advisors - Jak Jarvis na Sterydach</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Wybierz swojego superinteligentnego doradcy finansowego z pełnym dostępem do aplikacji
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
          <Badge variant="outline" className="mb-2 text-sm font-semibold">
            🔥 PREMIUM AI TECHNOLOGY
          </Badge>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Nasze AI Advisory to nie zwykłe chatboty - to zaawansowane systemy z dostępem do całej aplikacji, 
            analizy predykcyjnej i możliwościami jak JARVIS ze sterydami!
          </p>
        </div>
        {userProfile?.financialGoal && (
          <Badge variant="secondary" className="mt-4">
            Recommended for: {userProfile.financialGoal.replace('_', ' ').toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Advisors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="text-lg font-semibold mb-2">Loading AI Advisors...</div>
            <div className="text-gray-600">Finding the perfect financial expert for you</div>
          </div>
        ) : (
          advisors.map((advisor) => {
            const IconComponent = getIconComponent(advisor.id);
            const isRecommended = advisor.id === recommendedAdvisorId;
            const isSelected = selectedAdvisorId === advisor.id;
            
            // Default values for missing fields
            const rating = advisor.rating || 4.8;
            const userCount = advisor.userCount || Math.floor(Math.random() * 1000) + 500;
            const features = advisor.expertise || advisor.features || ['Personalized guidance', 'Expert analysis', 'Goal planning'];

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
                    advisor.id === 'financial_planner' ? 'bg-green-100 text-green-600' :
                    advisor.id === 'investment_specialist' ? 'bg-blue-100 text-blue-600' :
                    advisor.id === 'tax_strategist' ? 'bg-orange-100 text-orange-600' :
                    advisor.id === 'risk_analyst' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  <CardTitle className="text-xl font-bold">{advisor.name}</CardTitle>
                  <CardDescription className="text-sm mb-4">
                    {advisor.description}
                  </CardDescription>
                  
                  {/* Rating */}
                  <div className="flex justify-center items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {rating} ({userCount.toLocaleString()} users)
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground">
                        <Check className={`w-4 h-4 mr-2 ${
                          advisor.id === 'financial_planner' ? 'text-green-500' :
                          advisor.id === 'investment_specialist' ? 'text-blue-500' :
                          advisor.id === 'tax_strategist' ? 'text-orange-500' :
                          advisor.id === 'risk_analyst' ? 'text-purple-500' :
                          'text-yellow-500'
                        }`} />
                        <span className="capitalize">{feature.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full transition-all duration-300 ${
                      advisor.id === 'financial_planner' ? 'bg-green-600 hover:bg-green-700' :
                      advisor.id === 'investment_specialist' ? 'bg-blue-600 hover:bg-blue-700' :
                      advisor.id === 'tax_strategist' ? 'bg-orange-600 hover:bg-orange-700' :
                      advisor.id === 'risk_analyst' ? 'bg-purple-600 hover:bg-purple-700' :
                      'bg-gradient-to-r from-primary to-secondary hover:shadow-lg'
                    } text-white`}
                    onClick={() => handleAdvisorSelect(advisor)}
                  >
                    Start Consultation
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
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
