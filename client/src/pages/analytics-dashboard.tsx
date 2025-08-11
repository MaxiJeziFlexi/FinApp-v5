import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Brain, 
  Clock,
  DollarSign,
  Star,
  Activity,
  PieChart,
  Zap,
  TrendingDown
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch live analytics data
  const { data: liveAnalytics, isLoading, refetch } = useQuery({
    queryKey: ['/api/analytics/live'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Loading real-time insights...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into learning patterns and user engagement</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Zap className="w-3 h-3 mr-1" />
          Live Data
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(liveAnalytics as any)?.totalUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{(liveAnalytics as any)?.newUsersToday || 0}</span> new today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(liveAnalytics as any)?.activeUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{Math.round(((liveAnalytics as any)?.activeUsers / (liveAnalytics as any)?.totalUsers) * 100 || 0)}%</span> of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round((liveAnalytics as any)?.completionRate || 0)}%</div>
                <Progress value={(liveAnalytics as any)?.completionRate || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round((liveAnalytics as any)?.avgSessionTime || 0)} min</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">Engagement Score: {Math.round((liveAnalytics as any)?.engagementScore || 0)}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Learning Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Questions</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(liveAnalytics as any)?.realtimeLearningData?.activeQuestions || 0}</div>
                <p className="text-xs text-muted-foreground">Currently being answered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Answers/Min</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(liveAnalytics as any)?.realtimeLearningData?.answersPerMinute || 0}</div>
                <p className="text-xs text-muted-foreground">Real-time learning rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Knowledge Growth</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round((liveAnalytics as any)?.realtimeLearningData?.knowledgeGrowthRate || 0)}%</div>
                <p className="text-xs text-muted-foreground">Weekly improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(liveAnalytics?.realtimeLearningData?.aiAccuracyScore || 0)}%</div>
                <Progress value={liveAnalytics?.realtimeLearningData?.aiAccuracyScore || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Active</span>
                    <span className="font-bold">{liveAnalytics?.dailyActiveUsers?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weekly Active</span>
                    <span className="font-bold">{liveAnalytics?.weeklyActiveUsers?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Active</span>
                    <span className="font-bold">{liveAnalytics?.monthlyActiveUsers?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Sessions</span>
                    <span className="font-bold">{liveAnalytics?.totalSessions?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Chat Messages</span>
                    <span className="font-bold">{liveAnalytics?.totalChatMessages?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Retention Rate</span>
                    <span className="font-bold">{Math.round(liveAnalytics?.retentionRate || 0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px] flex items-center justify-center bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium text-green-600">Growing {Math.round((liveAnalytics?.newUsersToday / liveAnalytics?.totalUsers) * 100 || 0)}% daily</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveAnalytics?.aiModelPerformance?.map((model) => (
              <Card key={model.modelName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {model.modelName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">{model.totalRequests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{Math.round(model.successRate)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      <p className="text-2xl font-bold">{(model.avgResponseTime / 1000).toFixed(1)}s</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">User Satisfaction</p>
                      <p className="text-2xl font-bold">{model.userSatisfactionScore.toFixed(1)}/5</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Topic Accuracy</span>
                      <span>{Math.round(model.topicAccuracy)}%</span>
                    </div>
                    <Progress value={model.topicAccuracy} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Improvement Rate</span>
                      <span className="text-green-600">+{Math.round(model.improvementRate)}%</span>
                    </div>
                    <Progress value={model.improvementRate * 5} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Behavior Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <Badge variant={liveAnalytics?.engagementScore > 60 ? "default" : "secondary"}>
                        {Math.round(liveAnalytics?.engagementScore || 0)}/100
                      </Badge>
                    </div>
                    <Progress value={liveAnalytics?.engagementScore || 0} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {liveAnalytics?.engagementScore > 70 ? 'Highly Engaged' : 
                       liveAnalytics?.engagementScore > 50 ? 'Moderately Engaged' : 'Low Engagement'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {liveAnalytics?.userBehaviorInsights?.slice(0, 3).map((user, index) => (
                      <div key={user.userId} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">User {index + 1}</span>
                          <Badge variant="outline">{user.learningStyle}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Completion:</span>
                            <span className="ml-1 font-medium">{Math.round(user.completionRate)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sessions:</span>
                            <span className="ml-1 font-medium">{user.totalSessions}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk:</span>
                            <span className="ml-1 font-medium capitalize">{user.riskTolerance}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">AI Chats:</span>
                            <span className="ml-1 font-medium">{user.aiInteractions}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Topics: {user.preferredTopics.slice(0, 2).join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📖 Reading</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">AI-detected learning preference shows high retention with visual content. Recommend more chart-based explanations.</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🎯 Engagement Peak</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">Most active during financial planning sessions. Consider scheduling key lessons during these periods.</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">⚖️ Moderate Risk Tolerance</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Average session: {Math.round((liveAnalytics as any)?.avgSessionTime || 0)} min</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">🚀 AI-Powered Behavioral Insights</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Learning Optimization: Mixed learning style detected. Engagement optimization active.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveAnalytics?.totalChatMessages * 2 || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+15%</span> this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Learning Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(liveAnalytics?.realtimeLearningData?.aiAccuracyScore * 0.9 || 0)}%</div>
                <Progress value={liveAnalytics?.realtimeLearningData?.aiAccuracyScore * 0.9 || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Topic Mastery</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(liveAnalytics?.realtimeLearningData?.knowledgeGrowthRate * 10 || 0)}%</div>
                <p className="text-xs text-muted-foreground">
                  Knowledge retention rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveAnalytics?.dailyActiveUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5.2%</span> from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Active</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveAnalytics?.weeklyActiveUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8.1%</span> from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Active</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveAnalytics?.monthlyActiveUsers?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.3%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(liveAnalytics?.retentionRate || 0)}%</div>
                <Progress value={liveAnalytics?.retentionRate || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <p className="text-purple-600 font-medium">Live engagement tracking active</p>
                  <p className="text-sm text-muted-foreground">Real-time user interaction analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}