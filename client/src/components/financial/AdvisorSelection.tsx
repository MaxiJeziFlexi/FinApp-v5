import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Calculator, TrendingUp, PiggyBank, Star, Users } from "lucide-react";

interface AdvisorSelectionProps {
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

export default function AdvisorSelection({ onAdvisorSelect }: AdvisorSelectionProps) {
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

  const handleAdvisorSelect = (advisor: Advisor) => {
    setSelectedAdvisorId(advisor.id);
    onAdvisorSelect(advisor);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading AI Advisors...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your AI Financial Advisor</h2>
        <p className="text-gray-600 text-lg">
          Select an AI advisor that matches your financial goals and personality
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advisors.length > 0 ? advisors.map((advisor: Advisor) => {
          const IconComponent = getIconComponent(advisor.id);
          const isSelected = selectedAdvisorId === advisor.id;

          return (
            <Card 
              key={advisor.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleAdvisorSelect(advisor)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{advisor.name}</CardTitle>
                      {advisor.specialty && (
                        <Badge variant="outline" className="text-xs">
                          {advisor.specialty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {advisor.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{advisor.rating}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  {advisor.description}
                </CardDescription>
                
                {advisor.expertise && advisor.expertise.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {advisor.expertise.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {advisor.expertise.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{advisor.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {advisor.userCount && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="w-4 h-4 mr-1" />
                    {advisor.userCount.toLocaleString()} users helped
                  </div>
                )}

                <Button 
                  className={`w-full ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvisorSelect(advisor);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select Advisor'}
                </Button>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500">No advisors available at the moment</div>
            <p className="text-sm text-gray-400 mt-2">Please try again later</p>
          </div>
        )}
      </div>
      
      {selectedAdvisorId && (
        <div className="text-center mt-8">
          <p className="text-green-600 font-medium">
            Great choice! Your selected advisor is ready to help you.
          </p>
        </div>
      )}
    </div>
  );
}