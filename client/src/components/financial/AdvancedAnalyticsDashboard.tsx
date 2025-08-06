import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Target, 
  Zap, 
  Eye, 
  Clock, 
  Award,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UserBehaviorData {
  userId: string;
  engagementScore: number;
  learningStyle: string;
  riskTolerance: string;
  preferredTopics: string[];
  completionRate: number;
  averageSessionTime: number;
  interactionPatterns: any;
}

interface AIModelInsights {
  totalRequests: number;
  modelInsights: Array<{
    model: string;
    totalRequests: number;
    avgResponseTime: number;
    avgTokenUsage: number;
    avgUserFeedback: number;
    avgRelevanceScore: number;
  }>;
  promptTypeDistribution: Record<string, number>;
}

interface RealTimeLearningData {
  last24Hours: {
    totalEvents: number;
    uniqueUsers: number;
    eventTypeDistribution: Record<string, number>;
    popularLearningPaths: Record<string, number>;
    avgEngagement: number;
  };
}

export function AdvancedAnalyticsDashboard({ userId }: { userId: string }) {
  const [selectedMetric, setSelectedMetric] = useState<'behavior' | 'ai' | 'realtime'>('behavior');
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Fetch user behavior analytics
  const { data: behaviorData } = useQuery<UserBehaviorData>({
    queryKey: ['/api/analytics/user-behavior', userId],
    refetchInterval: isLiveMode ? 5000 : false,
  });

  // Fetch AI model performance
  const { data: aiInsights } = useQuery<AIModelInsights>({
    queryKey: ['/api/analytics/ai-performance'],
    refetchInterval: isLiveMode ? 10000 : false,
  });

  // Fetch real-time learning data
  const { data: realtimeData } = useQuery<RealTimeLearningData>({
    queryKey: ['/api/analytics/realtime-learning'],
    refetchInterval: isLiveMode ? 3000 : false,
  });

  const renderBehaviorAnalytics = () => {
    if (!behaviorData) return <div>Loading behavioral analytics...</div>;

    return (
      <div className="space-y-6">
        {/* User Engagement Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                Engagement Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {behaviorData.engagementScore}/100
              </div>
              <Progress value={behaviorData.engagementScore} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                {behaviorData.engagementScore > 70 ? 'Highly Engaged' : 
                 behaviorData.engagementScore > 40 ? 'Moderately Engaged' : 'Needs Attention'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                Learning Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold mb-2 capitalize">
                {behaviorData.learningStyle}
              </div>
              <Badge variant="outline" className="text-xs">
                {behaviorData.learningStyle === 'visual' ? '👁️ Visual' :
                 behaviorData.learningStyle === 'auditory' ? '👂 Auditory' :
                 behaviorData.learningStyle === 'kinesthetic' ? '✋ Hands-on' : '📖 Reading'}
              </Badge>
              <p className="text-xs text-gray-600 mt-2">
                AI-detected learning preference
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {Math.round(behaviorData.completionRate)}%
              </div>
              <Progress value={behaviorData.completionRate} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                Average task completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Preferences & Risk Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Preferred Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {behaviorData.preferredTopics.map((topic, index) => (
                <div key={topic} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{topic.replace('_', ' ')}</span>
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Risk Tolerance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold capitalize">
                  {behaviorData.riskTolerance}
                </span>
                <Badge 
                  variant={behaviorData.riskTolerance === 'aggressive' ? 'destructive' :
                          behaviorData.riskTolerance === 'moderate' ? 'default' : 'secondary'}
                >
                  {behaviorData.riskTolerance === 'conservative' ? '🛡️ Conservative' :
                   behaviorData.riskTolerance === 'moderate' ? '⚖️ Moderate' : '🚀 Aggressive'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Avg Session: {Math.round(behaviorData.averageSessionTime / 60)}min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Behavioral Insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Behavioral Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Learning Optimization:</strong> Your {behaviorData.learningStyle} learning style 
                  shows high retention with visual content. Recommend more chart-based explanations.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Engagement Peak:</strong> Most active during financial planning sessions. 
                  Consider scheduling key lessons during these periods.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAIModelInsights = () => {
    if (!aiInsights) return <div>Loading AI model performance...</div>;

    return (
      <div className="space-y-6">
        {/* AI Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aiInsights.totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Model Versions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aiInsights.modelInsights.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(aiInsights.modelInsights.reduce((sum, model) => sum + model.avgResponseTime, 0) / aiInsights.modelInsights.length)}ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg User Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(aiInsights.modelInsights.reduce((sum, model) => sum + (model.avgUserFeedback || 0), 0) / aiInsights.modelInsights.length).toFixed(1)}/5
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.modelInsights.map((model, index) => (
                <div key={model.model} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{model.model}</h3>
                    <Badge variant="outline">{model.totalRequests} requests</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <div className="font-medium">{Math.round(model.avgResponseTime)}ms</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Token Usage:</span>
                      <div className="font-medium">{Math.round(model.avgTokenUsage)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">User Rating:</span>
                      <div className="font-medium">{(model.avgUserFeedback || 0).toFixed(1)}/5</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Relevance:</span>
                      <div className="font-medium">{Math.round(model.avgRelevanceScore || 0)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prompt Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Request Type Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(aiInsights.promptTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(count / aiInsights.totalRequests) * 100} 
                      className="w-24 h-2" 
                    />
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRealtimeAnalytics = () => {
    if (!realtimeData) return <div>Loading real-time analytics...</div>;

    return (
      <div className="space-y-6">
        {/* Real-time Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Users (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {realtimeData.last24Hours.uniqueUsers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Learning Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtimeData.last24Hours.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(realtimeData.last24Hours.avgEngagement)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Live Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Event Distribution (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(realtimeData.last24Hours.eventTypeDistribution).map(([event, count]) => (
                <div key={event} className="flex items-center justify-between">
                  <span className="capitalize">{event.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(count / realtimeData.last24Hours.totalEvents) * 100} 
                      className="w-32 h-2" 
                    />
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Learning Paths */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Learning Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(realtimeData.last24Hours.popularLearningPaths).map(([path, count]) => (
                <div key={path} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{path.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">{count} active sessions</div>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">FinApp Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={isLiveMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLiveMode(!isLiveMode)}
            className="flex items-center gap-2"
          >
            {isLiveMode ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {isLiveMode ? 'Live Mode' : 'Static'}
          </Button>
          <Badge variant="outline">
            The Biggest AI Financial Learning Experiment
          </Badge>
        </div>
      </div>

      <Tabs value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="behavior">User Behavior Analytics</TabsTrigger>
          <TabsTrigger value="ai">AI Model Performance</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Learning Data</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="space-y-4">
          {renderBehaviorAnalytics()}
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          {renderAIModelInsights()}
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          {renderRealtimeAnalytics()}
        </TabsContent>
      </Tabs>
    </div>
  );
}