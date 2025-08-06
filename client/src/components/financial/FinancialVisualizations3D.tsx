import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, PieChart, BarChart3, Activity, Brain } from "lucide-react";

interface Financial3DData {
  savingsGoal: number;
  currentSavings: number;
  monthlyIncome: number;
  expenses: Array<{ category: string; amount: number; color: string }>;
  projections: Array<{ month: string; value: number }>;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  learningProgress: number;
  engagementScore: number;
}

export function FinancialVisualizations3D({ data }: { data: Financial3DData }) {
  const [activeView, setActiveView] = useState<'portfolio' | 'goals' | 'learning'>('portfolio');
  const [animationPhase, setAnimationPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Simulated 3D visualization using CSS transforms and animations
  const render3DChart = () => {
    const progress = (data.currentSavings / data.savingsGoal) * 100;
    const rotateY = animationPhase * 0.5;
    const scale = 1 + Math.sin(animationPhase * 0.05) * 0.05;

    return (
      <div className="relative w-full h-96 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        {/* 3D Financial Globe */}
        <div 
          className="relative w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-green-400 shadow-2xl"
          style={{
            transform: `rotateY(${rotateY}deg) scale(${scale})`,
            background: `conic-gradient(from ${animationPhase}deg, #3b82f6, #8b5cf6, #10b981, #f59e0b, #ef4444, #3b82f6)`,
            filter: 'drop-shadow(0 25px 50px rgba(59, 130, 246, 0.3))'
          }}
        >
          {/* Progress Rings */}
          <div className="absolute inset-4 rounded-full border-4 border-white/30 flex items-center justify-center">
            <div className="absolute inset-4 rounded-full border-2 border-white/20 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-3xl font-bold">{Math.round(progress)}%</div>
                <div className="text-sm opacity-80">Goal Progress</div>
                <div className="text-xs mt-2">
                  ${data.currentSavings.toLocaleString()} / ${data.savingsGoal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Data Points */}
          {data.expenses.map((expense, index) => (
            <div
              key={expense.category}
              className="absolute w-3 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: expense.color,
                top: `${20 + Math.sin((animationPhase + index * 60) * Math.PI / 180) * 30 + 30}%`,
                left: `${20 + Math.cos((animationPhase + index * 60) * Math.PI / 180) * 30 + 30}%`,
                boxShadow: `0 0 20px ${expense.color}`,
                animation: `float ${2 + index * 0.5}s ease-in-out infinite`
              }}
            />
          ))}
        </div>

        {/* Interactive Data Labels */}
        <div className="absolute top-4 left-4 space-y-2">
          <Badge variant="secondary" className="bg-white/90 text-blue-600">
            <Brain className="w-4 h-4 mr-1" />
            AI Learning: {data.learningProgress}%
          </Badge>
          <Badge variant="secondary" className="bg-white/90 text-purple-600">
            <Activity className="w-4 h-4 mr-1" />
            Engagement: {data.engagementScore}
          </Badge>
        </div>
      </div>
    );
  };

  // Advanced Learning Analytics 3D Visualization
  const renderLearning3D = () => {
    return (
      <div className="relative w-full h-96 flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Neural Network Style Connections */}
          <svg className="absolute w-full h-full opacity-30" viewBox="0 0 400 300">
            {Array.from({ length: 20 }).map((_, i) => (
              <g key={i}>
                <circle
                  cx={50 + (i % 5) * 80}
                  cy={50 + Math.floor(i / 5) * 60}
                  r="4"
                  fill="#10b981"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
                {i < 15 && (
                  <line
                    x1={50 + (i % 5) * 80}
                    y1={50 + Math.floor(i / 5) * 60}
                    x2={50 + ((i + 1) % 5) * 80}
                    y2={50 + Math.floor((i + 1) / 5) * 60}
                    stroke="#10b981"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Central Learning Hub */}
          <div className="relative z-10 text-center">
            <div 
              className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-2xl mb-4"
              style={{
                transform: `rotate(${animationPhase}deg)`,
                filter: 'drop-shadow(0 10px 30px rgba(16, 185, 129, 0.4))'
              }}
            >
              <Brain className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Learning Engine</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Analyzing your financial behavior patterns
            </p>
            
            {/* Learning Metrics */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.learningProgress}%</div>
                <div className="text-xs text-gray-600">Knowledge Retention</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.engagementScore}</div>
                <div className="text-xs text-gray-600">Engagement Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Portfolio 3D Visualization
  const renderPortfolio3D = () => {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 3D Portfolio Pie Chart */}
          <div className="relative w-72 h-72">
            {data.expenses.map((expense, index) => {
              const angle = (index / data.expenses.length) * 360;
              const nextAngle = ((index + 1) / data.expenses.length) * 360;
              const percentage = (expense.amount / data.monthlyIncome) * 100;
              
              return (
                <div
                  key={expense.category}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from ${angle}deg, ${expense.color} ${angle}deg, transparent ${nextAngle}deg)`,
                    transform: `translateZ(${index * 10}px) rotateX(${Math.sin(animationPhase * 0.02) * 10}deg)`,
                    filter: `drop-shadow(0 ${index * 2}px ${index * 4}px ${expense.color}40)`
                  }}
                >
                  <div
                    className="absolute text-xs font-semibold text-white p-1 rounded"
                    style={{
                      top: `${50 + Math.sin((angle + (nextAngle - angle) / 2) * Math.PI / 180) * 35}%`,
                      left: `${50 + Math.cos((angle + (nextAngle - angle) / 2) * Math.PI / 180) * 35}%`,
                      backgroundColor: expense.color,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {expense.category}
                    <br />
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
            
            {/* Center Info */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-full text-center">
                <PieChart className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-semibold">Monthly Budget</div>
                <div className="text-xs text-gray-600">${data.monthlyIncome.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            FinApp 3D Financial Visualizations
            <Badge variant="outline" className="ml-2">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Portfolio 3D
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goals 3D
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Learning
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Interactive Portfolio Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  3D visualization of your spending patterns and budget allocation
                </p>
              </div>
              {renderPortfolio3D()}
            </TabsContent>
            
            <TabsContent value="goals" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Financial Goals Progress</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time 3D tracking of your financial objectives
                </p>
              </div>
              {render3DChart()}
            </TabsContent>
            
            <TabsContent value="learning" className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">AI Learning Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced behavioral analysis and learning pattern recognition
                </p>
              </div>
              {renderLearning3D()}
            </TabsContent>
          </Tabs>
          
          {/* Real-time Data Stream */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Real-time Data Collection Active</span>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              <div className="text-xs text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <Progress value={85} className="mt-2 h-2" />
            <p className="text-xs text-gray-600 mt-1">
              Collecting behavioral data to improve AI model accuracy • Privacy Protected
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}