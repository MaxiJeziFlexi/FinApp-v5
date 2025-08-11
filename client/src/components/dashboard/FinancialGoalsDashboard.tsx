import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  Home, 
  Target,
  DollarSign,
  Calendar,
  User,
  ChevronRight
} from "lucide-react";

interface FinancialGoalsDashboardProps {
  userId: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  percentage: number;
  color: string;
  icon: any;
}

export default function FinancialGoalsDashboard({ userId }: FinancialGoalsDashboardProps) {
  const [completionPercentage] = useState(0); // Start at 0% for new users

  // Sample goals data based on the screenshot
  const goals: Goal[] = [
    {
      id: "emergency_fund",
      title: "Emergency Fund",
      description: "Build safety net",
      current: 0,
      target: 6000,
      percentage: 0,
      color: "bg-green-500",
      icon: PiggyBank
    },
    {
      id: "debt_payoff",
      title: "Debt Payoff", 
      description: "Pay off debts",
      current: 0,
      target: 15000,
      percentage: 0,
      color: "bg-orange-500",
      icon: CreditCard
    },
    {
      id: "investment",
      title: "Investment",
      description: "Grow wealth",
      current: 0,
      target: 10000,
      percentage: 0,
      color: "bg-blue-500",
      icon: TrendingUp
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to Your Financial Journey
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Let's start by understanding your financial goals and situation
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Profile Setup */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Completion</span>
                <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={completionPercentage} className="h-3 mb-4" />
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-3">Primary Financial Goal</h3>
                  
                  <Button
                    variant="outline"
                    className="w-full p-4 h-auto justify-start border-2 hover:border-blue-500"
                  >
                    <div className="flex items-center space-x-3">
                      <PiggyBank className="w-5 h-5 text-gray-600" />
                      <div className="text-left">
                        <div className="font-medium">Emergency Fund</div>
                        <div className="text-sm text-gray-500">Build safety net</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full p-4 h-auto justify-start border-2 hover:border-blue-500"
                  >
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-gray-600" />
                      <div className="text-left">
                        <div className="font-medium">Home Purchase</div>
                        <div className="text-sm text-gray-500">Save for house</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full p-4 h-auto justify-start border-2 hover:border-blue-500"
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <div className="text-left">
                        <div className="font-medium">Debt Reduction</div>
                        <div className="text-sm text-gray-500">Pay off debts</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full p-4 h-auto justify-start border-2 hover:border-blue-500"
                  >
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-gray-600" />
                      <div className="text-left">
                        <div className="font-medium">Retirement</div>
                        <div className="text-sm text-gray-500">Long-term savings</div>
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeframe</label>
                    <Button variant="outline" className="w-full justify-between">
                      Select timeframe
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Income</label>
                    <Button variant="outline" className="w-full justify-between">
                      Select income range
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Savings</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Goals Visualization */}
        <div className="space-y-6">
          {/* Your Goals Visualization */}
          <Card className="bg-gray-50 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-blue-600">Your Goals Visualization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal) => {
                const IconComponent = goal.icon;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{goal.title}</span>
                      </div>
                      <span className="text-sm font-semibold">${goal.target.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={goal.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>${goal.current.toLocaleString()}</span>
                        <span>{goal.percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Ready to Unlock Achievement */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Ready to Unlock</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Complete setup to earn your first achievement!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next? */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className="text-sm">Choose your AI financial advisor</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-60">
                  <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="text-sm">Complete personalized assessment</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-60">
                  <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span className="text-sm">Start AI-powered conversations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}