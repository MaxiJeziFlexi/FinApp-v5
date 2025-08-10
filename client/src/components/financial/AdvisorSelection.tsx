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
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Futuristic Header with Neural Effects */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full mr-4"></div>
            <div className="text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              AI FINANCIAL ADVISORS
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-indigo-600 to-purple-400 rounded-full ml-4"></div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 font-mono">
            [ INTELLIGENT FINANCIAL CONSCIOUSNESS ]
          </p>
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-blue-500/30 p-6 rounded-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mr-2"></div>
              <div className="text-blue-600 font-mono text-sm tracking-wider">ADVANCED AI ADVISORS ONLINE</div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse ml-2"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              Experience next-generation financial AI with <span className="text-blue-500 font-semibold">full system access</span>, 
              <span className="text-indigo-500 font-semibold"> advanced predictions</span>, and 
              <span className="text-purple-500 font-semibold"> intelligent analysis</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3D Futuristic Advisor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {advisors.length > 0 ? advisors.map((advisor: Advisor) => {
          const IconComponent = getIconComponent(advisor.id);
          const isSelected = selectedAdvisorId === advisor.id;

          // Generate advisor-specific colors from app theme
          const getAdvisorColors = (advisorId: string) => {
            switch (advisorId) {
              case 'financial_planner':
                return {
                  primary: 'from-blue-400 to-blue-600',
                  secondary: 'from-blue-500/20 to-blue-600/30',
                  accent: 'border-blue-500/40',
                  glow: 'shadow-blue-500/25'
                };
              case 'investment_specialist':
                return {
                  primary: 'from-indigo-400 to-indigo-600',
                  secondary: 'from-indigo-500/20 to-indigo-600/30',
                  accent: 'border-indigo-500/40',
                  glow: 'shadow-indigo-500/25'
                };
              case 'risk_analyst':
                return {
                  primary: 'from-purple-400 to-purple-600',
                  secondary: 'from-purple-500/20 to-purple-600/30',
                  accent: 'border-purple-500/40',
                  glow: 'shadow-purple-500/25'
                };
              default:
                return {
                  primary: 'from-blue-400 to-blue-600',
                  secondary: 'from-blue-500/20 to-blue-600/30',
                  accent: 'border-blue-500/40',
                  glow: 'shadow-blue-500/25'
                };
            }
          };

          const colors = getAdvisorColors(advisor.id);

          return (
            <div
              key={advisor.id}
              className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                isSelected ? 'scale-105' : ''
              }`}
              onClick={() => handleAdvisorSelect(advisor)}
            >
              <Card className={`
                relative overflow-hidden bg-gradient-to-br from-white/10 to-gray-900/20 backdrop-blur-md
                border ${colors.accent} ${colors.glow} shadow-2xl
                hover:shadow-3xl transition-all duration-500 animate-floating
                ${isSelected ? `ring-2 ring-offset-2 ring-blue-400 ${colors.glow}` : ''}
              `}>
                {/* Neural Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.secondary}`}></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]"></div>
                </div>

                <CardHeader className="relative z-10 pb-4">
                  {/* 3D Moving Face Avatar */}
                  <div className="flex items-center justify-center mb-4">
                    <div className={`
                      relative w-24 h-24 rounded-full bg-gradient-to-br ${colors.primary}
                      shadow-lg ${colors.glow} transform transition-all duration-700
                      group-hover:rotate-y-12 group-hover:scale-110
                      border-2 border-white/20
                    `}>
                      {/* 3D Face Rings */}
                      <div className="absolute inset-2 rounded-full border border-white/30 animate-pulse"></div>
                      <div className="absolute inset-4 rounded-full border border-white/20 animate-ping"></div>
                      
                      {/* Moving Neural Dots */}
                      <div className="absolute top-2 left-2 w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white/60 rounded-full animate-bounce delay-150"></div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/60 rounded-full animate-bounce delay-300"></div>
                      
                      {/* Center Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-white drop-shadow-lg transform transition-all duration-500 group-hover:scale-110" />
                      </div>

                      {/* Orbital Rings */}
                      <div className="absolute -inset-1 border border-white/10 rounded-full animate-spin-slow"></div>
                      <div className="absolute -inset-2 border border-white/5 rounded-full animate-reverse-spin"></div>
                      
                      {/* Neural Energy Effect */}
                      <div className="absolute inset-0 rounded-full animate-neural-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                    </div>
                  </div>

                  {/* Advisor Name with Neural Effect */}
                  <div className="text-center">
                    <CardTitle className={`text-xl font-bold bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent mb-2`}>
                      {advisor.name}
                    </CardTitle>
                    {advisor.specialty && (
                      <Badge variant="outline" className={`text-xs border-blue-400/50 text-blue-400 bg-blue-500/10`}>
                        {advisor.specialty}
                      </Badge>
                    )}
                  </div>

                  {/* Neural Status Indicator */}
                  <div className="flex items-center justify-center mt-3">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 bg-gradient-to-r ${colors.primary} rounded-full animate-pulse`}></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">NEURAL LINK ACTIVE</span>
                      <div className={`w-2 h-2 bg-gradient-to-r ${colors.primary} rounded-full animate-pulse delay-500`}></div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                  <CardDescription className="text-gray-700 dark:text-gray-300 mb-4 text-center">
                    {advisor.description}
                  </CardDescription>
                  
                  {advisor.expertise && advisor.expertise.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 text-center">Neural Capabilities:</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {advisor.expertise.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-400/30">
                            {skill}
                          </Badge>
                        ))}
                        {advisor.expertise.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-400/30">
                            +{advisor.expertise.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {advisor.userCount && (
                    <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Users className="w-4 h-4 mr-1" />
                      {advisor.userCount.toLocaleString()} minds enhanced
                    </div>
                  )}

                  <Button 
                    className={`
                      w-full font-semibold transition-all duration-300
                      ${isSelected 
                        ? `bg-gradient-to-r ${colors.primary} text-white shadow-lg ${colors.glow} transform scale-105` 
                        : `bg-gradient-to-r from-gray-700 to-gray-900 hover:${colors.primary.replace('to-', 'via-')} text-white hover:shadow-lg hover:${colors.glow}`
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdvisorSelect(advisor);
                    }}
                  >
                    {isSelected ? (
                      <div className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                        NEURAL LINK ESTABLISHED
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-2"></div>
                      </div>
                    ) : (
                      'INITIATE NEURAL CONNECTION'
                    )}
                  </Button>
                </CardContent>

                {/* Floating Neural Particles */}
                {isSelected && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                    <div className="absolute top-8 right-6 w-1 h-1 bg-indigo-400 rounded-full animate-ping delay-200"></div>
                    <div className="absolute bottom-6 left-8 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-400"></div>
                    <div className="absolute bottom-4 right-4 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-600"></div>
                  </div>
                )}
              </Card>
            </div>
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