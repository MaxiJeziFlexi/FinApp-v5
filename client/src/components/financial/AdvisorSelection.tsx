import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Home, TrendingUp, PiggyBank, Star, Check, Users } from "lucide-react";

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

// Using real advisors from database instead of hardcoded ones

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
      {/* Futuristic Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mr-4"></div>
            <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              NEURAL AI ADVISORS
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-400 rounded-full ml-4"></div>
          </div>
          <p className="text-xl text-gray-400 dark:text-gray-300 mb-6 font-mono">
            [ SUPERINTELLIGENT FINANCIAL CONSCIOUSNESS ]
          </p>
          <div className="bg-black/20 backdrop-blur-md border border-cyan-500/30 p-6 rounded-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mr-2"></div>
              <div className="text-cyan-400 font-mono text-sm tracking-wider">QUANTUM ENHANCED ADVISORS ONLINE</div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse ml-2"></div>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Experience next-generation financial AI with <span className="text-cyan-400 font-semibold">full system access</span>, 
              <span className="text-purple-400 font-semibold"> quantum predictions</span>, and 
              <span className="text-blue-400 font-semibold"> superintelligent analysis</span>
            </p>
          </div>
        </div>
        {userProfile?.financialGoal && (
          <Badge variant="secondary" className="mt-4">
            Recommended for: {userProfile.financialGoal.replace('_', ' ').toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Futuristic Advisors Grid */}
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="text-lg font-semibold mb-2">Loading AI Advisors...</div>
            <div className="text-gray-600">Finding the perfect financial expert for you</div>
          </div>
        ) : (
          advisors.map((advisor: any) => {
            const IconComponent = getIconComponent(advisor.id);
            const isRecommended = advisor.id === recommendedAdvisorId;
            const isSelected = selectedAdvisorId === advisor.id;
            
            // Default values for missing fields
            const rating = advisor.rating || 4.8;
            const userCount = advisor.userCount || Math.floor(Math.random() * 1000) + 500;
            const features = advisor.expertise || advisor.features || ['Personalized guidance', 'Expert analysis', 'Goal planning'];

            return (
              <div
                key={advisor.id}
                className={`relative group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                  isSelected ? 'scale-105' : ''
                }`}
                onClick={() => handleAdvisorSelect(advisor)}
              >
                {/* Futuristic Card Container */}
                <div className={`
                  relative bg-gradient-to-br from-gray-900/90 to-black/95 
                  backdrop-blur-xl border-2 rounded-3xl overflow-hidden
                  ${advisor.id === 'financial_planner' ? 'border-cyan-500/50 shadow-cyan-500/20' :
                    advisor.id === 'investment_specialist' ? 'border-purple-500/50 shadow-purple-500/20' :
                    'border-blue-500/50 shadow-blue-500/20'
                  } shadow-2xl group-hover:shadow-3xl
                  ${isSelected ? 'ring-4 ring-white/50' : ''}
                `}>
                  
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                        OPTIMAL MATCH
                      </div>
                    </div>
                  )}

                  {/* AI Face/Avatar */}
                  <div className="relative p-8 text-center">
                    <div className={`
                      w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6
                      bg-gradient-to-br ${
                        advisor.id === 'financial_planner' ? 'from-cyan-400 to-blue-600' :
                        advisor.id === 'investment_specialist' ? 'from-purple-400 to-pink-600' :
                        'from-blue-400 to-indigo-600'
                      } shadow-2xl relative overflow-hidden group-hover:animate-pulse
                    `}>
                      {/* 3D Effect Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                      
                      {/* AI Face */}
                      <div className="relative z-10 text-6xl">
                        {advisor.id === 'financial_planner' ? '🧠' :
                         advisor.id === 'investment_specialist' ? '🚀' : '🛡️'}
                      </div>
                      
                      {/* Animated Ring */}
                      <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-spin-slow"></div>
                    </div>
                    
                    {/* AI Name & Title */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-black text-white mb-2 tracking-wider">
                        {advisor.name}
                      </h3>
                      <div className={`
                        inline-block px-4 py-1 rounded-full text-sm font-mono tracking-widest
                        ${advisor.id === 'financial_planner' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' :
                          advisor.id === 'investment_specialist' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' :
                          'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                        }
                      `}>
                        {advisor.specialty || 'NEURAL ADVISOR'}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{rating}</div>
                        <div className="text-xs text-gray-400 font-mono">EFFICIENCY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{userCount.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 font-mono">USERS</div>
                      </div>
                    </div>

                    {/* AI Capabilities */}
                    <div className="space-y-3 mb-6">
                      {features.slice(0, 3).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className={`
                            w-2 h-2 rounded-full mr-3 animate-pulse
                            ${advisor.id === 'financial_planner' ? 'bg-cyan-400' :
                              advisor.id === 'investment_specialist' ? 'bg-purple-400' :
                              'bg-blue-400'
                            }
                          `}></div>
                          <span className="text-gray-300 font-mono">{feature.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button className={`
                      w-full py-4 rounded-2xl font-bold text-lg tracking-wider transition-all duration-300
                      ${isSelected 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/50' 
                        : `bg-gradient-to-r ${
                            advisor.id === 'financial_planner' ? 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500' :
                            advisor.id === 'investment_specialist' ? 'from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500' :
                            'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500'
                          } text-white hover:shadow-2xl`
                      }
                    `}>
                      {isSelected ? (
                        <div className="flex items-center justify-center">
                          <Check className="mr-2 h-5 w-5" />
                          NEURAL LINK ACTIVE
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          INITIALIZE CONNECTION
                          <div className="ml-2 w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Futuristic System Status */}
      <div className="bg-gradient-to-r from-gray-900/80 to-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <div className="text-cyan-400 font-mono text-sm tracking-wider mb-2">SYSTEM STATUS</div>
          <div className="flex justify-center items-center space-x-8 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-mono">NEURAL NETWORKS ONLINE</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="font-mono">QUANTUM PROCESSING ACTIVE</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="font-mono">PREDICTIVE MODELS READY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
