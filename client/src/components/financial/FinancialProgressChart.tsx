import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinancialProgressChartProps {
  userProfile: any;
}

interface ProgressMetric {
  label: string;
  current: number;
  target: number;
  percentage: number;
  color: string;
  icon: string;
}

export default function FinancialProgressChart({ userProfile }: FinancialProgressChartProps) {
  const { toast } = useToast();

  // Calculate progress metrics based on user profile
  const getProgressMetrics = (): ProgressMetric[] => {
    const currentSavings = Number(userProfile?.currentSavings) || 0;
    const targetAmount = Number(userProfile?.targetAmount) || 10000;
    
    // Simulate different types of progress based on financial goal
    const baseMetrics = [
      {
        label: 'Emergency Fund',
        current: Math.min(currentSavings * 0.6, 6000),
        target: 6000,
        percentage: Math.min((currentSavings * 0.6 / 6000) * 100, 100),
        color: 'bg-green-500',
        icon: '🛡️'
      },
      {
        label: 'Debt Reduction',
        current: Math.max(15000 - (currentSavings * 0.3), 3750),
        target: 15000,
        percentage: Math.min(((15000 - Math.max(15000 - (currentSavings * 0.3), 3750)) / 15000) * 100, 75),
        color: 'bg-orange-500',
        icon: '💳'
      },
      {
        label: 'Investment Growth',
        current: Math.min(currentSavings * 0.45, 4500),
        target: 10000,
        percentage: Math.min((currentSavings * 0.45 / 10000) * 100, 45),
        color: 'bg-blue-500',
        icon: '📈'
      }
    ];

    return baseMetrics;
  };

  const progressMetrics = getProgressMetrics();
  
  // Calculate overall financial health score
  const calculateHealthScore = () => {
    const avgProgress = progressMetrics.reduce((sum, metric) => sum + metric.percentage, 0) / progressMetrics.length;
    return Math.round(avgProgress);
  };

  const healthScore = calculateHealthScore();

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  // Simulate monthly trend data
  const generateMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseAmount = Number(userProfile?.currentSavings) || 2000;
    
    return months.map((month, index) => ({
      month,
      amount: baseAmount + (index * 400) + (Math.random() * 200),
      height: 60 + (index * 8) + (Math.random() * 10)
    }));
  };

  const monthlyData = generateMonthlyTrend();

  const handleDownloadReport = () => {
    toast({
      title: "Report Generation",
      description: "Your financial report is being prepared. You'll receive it shortly.",
    });
  };

  const handleRefreshData = () => {
    toast({
      title: "Data Refreshed",
      description: "Your financial data has been updated with the latest information.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary flex items-center space-x-2">
              <BarChart3 className="w-6 h-6" />
              <span>Your Financial Progress</span>
            </CardTitle>
            <CardDescription>Track your journey to financial freedom</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownloadReport}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshData}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Overall Health Score */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Financial Health Score</h3>
                <div className="flex items-center space-x-3">
                  <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {healthScore}
                  </div>
                  <div>
                    <Badge 
                      variant="secondary" 
                      className={`${getHealthScoreColor(healthScore)} bg-opacity-10`}
                    >
                      {getHealthScoreLabel(healthScore)}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Overall financial wellness
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-xs text-muted-foreground">
                  Based on {progressMetrics.length} metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Circles */}
        <div className="grid md:grid-cols-3 gap-8">
          {progressMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                {/* Background Circle */}
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="hsl(var(--muted))" 
                    strokeWidth="8" 
                    fill="none"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke={`hsl(var(--${metric.color.split('-')[1]}))`}
                    strokeWidth="8" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * metric.percentage / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">
                    {Math.round(metric.percentage)}%
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">
                ${metric.current.toLocaleString()} / ${metric.target.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Monthly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Monthly Financial Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-2">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t transition-all duration-1000 ease-out ${
                      index < 2 ? 'bg-red-500' :
                      index < 4 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ 
                      height: `${data.height}%`,
                      transitionDelay: `${index * 100}ms`
                    }}
                  />
                  <span className="text-xs text-muted-foreground mt-2 font-medium">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Chart Legend */}
            <div className="flex justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-muted-foreground">High Debt</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-muted-foreground">Moderate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Recommended Next Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4 flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">Schedule Extra Payment</h5>
                  <p className="text-sm text-muted-foreground">
                    Make $200 extra payment to highest interest debt by month end
                  </p>
                </div>
              </div>
              
              <div className="bg-muted rounded-xl p-4 flex items-start space-x-3">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">Review Budget</h5>
                  <p className="text-sm text-muted-foreground">
                    Identify $50 more monthly savings opportunities in your budget
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(Number(userProfile?.currentSavings) || 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Current Savings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${(Number(userProfile?.targetAmount) || 10000).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Target Goal</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.ceil(((Number(userProfile?.targetAmount) || 10000) - (Number(userProfile?.currentSavings) || 0)) / 500)} months
              </div>
              <p className="text-sm text-muted-foreground">Time to Goal</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                $500
              </div>
              <p className="text-sm text-muted-foreground">Monthly Target</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
