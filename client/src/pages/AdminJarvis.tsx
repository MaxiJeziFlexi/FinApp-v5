import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Code, 
  Database, 
  Settings, 
  MessageSquare, 
  Activity, 
  Shield, 
  Zap,
  TrendingUp,
  Terminal,
  Bot,
  FileCode,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface JarvisSession {
  id: string;
  userId: string;
  sessionType: string;
  goals: string[];
  status: string;
  createdAt: string;
  lastActiveAt: string;
}

interface JarvisTask {
  id: string;
  sessionId: string;
  taskType: string;
  description: string;
  status: string;
  priority: string;
  result?: any;
  createdAt: string;
}

interface JarvisDashboard {
  overview: {
    activeSessions: number;
    tasksCompleted: number;
    knowledgeItems: number;
    trainingAccuracy: number;
  };
  recentActivity: any[];
  performanceMetrics: {
    responseTime: string;
    successRate: string;
    errorRate: string;
  };
  capabilities: {
    codeModification: boolean;
    databaseAccess: boolean;
    aiTraining: boolean;
    systemAdmin: boolean;
    fullAccess: boolean;
  };
  systemHealth: {
    status: string;
    lastCheck: string;
  };
}

export default function AdminJarvis() {
  const [activeSession, setActiveSession] = useState<JarvisSession | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Jarvis dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = useQuery<JarvisDashboard>({
    queryKey: ['/api/jarvis/dashboard'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Initialize Jarvis session
  const initializeJarvis = useMutation({
    mutationFn: async (data: { userId: string; sessionType: string; goals: string[] }) => {
      const response = await fetch('/api/jarvis/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setActiveSession(data.session);
      toast({
        title: "Jarvis AI Initialized",
        description: "Admin Jarvis session is now active with full permissions.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jarvis/dashboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Initialization Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send message to Jarvis
  const sendMessage = useMutation({
    mutationFn: async (data: { sessionId: string; message: string }) => {
      const response = await fetch(`/api/jarvis/chat/${data.sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: data.message }),
      });
      return response.json();
    },
    onSuccess: (response: any) => {
      setConversations(prev => [...prev, {
        type: 'user',
        message: chatMessage,
        timestamp: new Date().toISOString()
      }, {
        type: 'jarvis',
        message: response.response || response.message || 'Processing request...',
        timestamp: new Date().toISOString(),
        actions: response.actions || []
      }]);
      setChatMessage('');
      toast({
        title: "Message Sent",
        description: "Jarvis is processing your request.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Message Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Execute Jarvis command
  const executeCommand = useMutation({
    mutationFn: async (data: { sessionId: string; command: string; parameters?: any }) => {
      const response = await fetch('/api/jarvis/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      toast({
        title: "Command Executed",
        description: `Command "${result.command || result.type}" completed successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jarvis/dashboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Command Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInitializeJarvis = () => {
    initializeJarvis.mutate({
      userId: 'admin-user', // In real app, get from auth context
      sessionType: 'admin_development',
      goals: [
        'Full code modification access',
        'Database administration',
        'AI model tuning',
        'System optimization',
        'Analytics integration'
      ]
    });
  };

  const handleSendMessage = () => {
    if (!activeSession || !chatMessage.trim()) return;
    
    sendMessage.mutate({
      sessionId: activeSession.id,
      message: chatMessage
    });
  };

  const handleExecuteCommand = (command: string, parameters?: any) => {
    if (!activeSession) return;
    
    executeCommand.mutate({
      sessionId: activeSession.id,
      command,
      parameters
    });
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Jarvis AI System...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            Jarvis AI Admin Console
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive AI assistant with full development permissions
          </p>
        </div>
        <div className="flex gap-2">
          {!activeSession ? (
            <Button 
              onClick={handleInitializeJarvis}
              disabled={initializeJarvis.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {initializeJarvis.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Initialize Jarvis
            </Button>
          ) : (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Bot className="h-4 w-4 mr-1" />
              Active Session
            </Badge>
          )}
        </div>
      </div>

      {/* Dashboard Overview */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">{dashboard.overview.activeSessions}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold">{dashboard.overview.tasksCompleted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Knowledge Items</p>
                  <p className="text-2xl font-bold">{dashboard.overview.knowledgeItems}</p>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Accuracy</p>
                  <p className="text-2xl font-bold">{dashboard.overview.trainingAccuracy}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Interface */}
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="commands" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Commands
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Chat Interface */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Jarvis AI Chat
              </CardTitle>
              <CardDescription>
                Communicate with Jarvis AI for development tasks, code modifications, and system operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages */}
              <ScrollArea className="h-96 w-full border rounded-md p-4 space-y-2">
                {conversations.map((conv, index) => (
                  <div key={index} className={`mb-4 ${conv.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      conv.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <p className="font-semibold text-sm mb-1">
                        {conv.type === 'user' ? 'Admin' : 'Jarvis AI'}
                      </p>
                      <p>{conv.message}</p>
                      {conv.actions && conv.actions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {conv.actions.map((action: any, actionIndex: number) => (
                            <Badge key={actionIndex} variant="secondary" className="mr-1">
                              {action.type}: {action.description}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(conv.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask Jarvis to modify code, update database, analyze performance..."
                  className="flex-1"
                  disabled={!activeSession}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!activeSession || !chatMessage.trim() || sendMessage.isPending}
                  className="px-6"
                >
                  {sendMessage.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Commands */}
        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Quick Commands
              </CardTitle>
              <CardDescription>
                Execute pre-defined development and system administration commands.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => handleExecuteCommand('analyze_codebase')}
                  disabled={!activeSession}
                >
                  <Code className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Analyze Codebase</p>
                    <p className="text-sm text-muted-foreground">Review code structure and patterns</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => handleExecuteCommand('optimize_performance')}
                  disabled={!activeSession}
                >
                  <TrendingUp className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Optimize Performance</p>
                    <p className="text-sm text-muted-foreground">Analyze and improve system performance</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => handleExecuteCommand('train_models')}
                  disabled={!activeSession}
                >
                  <Brain className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Train AI Models</p>
                    <p className="text-sm text-muted-foreground">Update and improve AI models</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => handleExecuteCommand('update_database')}
                  disabled={!activeSession}
                >
                  <Database className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Update Database</p>
                    <p className="text-sm text-muted-foreground">Manage database schema and data</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => handleExecuteCommand('generate_insights')}
                  disabled={!activeSession}
                >
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Generate Insights</p>
                    <p className="text-sm text-muted-foreground">Create analytics and recommendations</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => handleExecuteCommand('security_audit')}
                  disabled={!activeSession}
                >
                  <Shield className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Security Audit</p>
                    <p className="text-sm text-muted-foreground">Review security configurations</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>
                Performance metrics and system insights from Jarvis AI operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {dashboard.performanceMetrics.responseTime}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboard.performanceMetrics.successRate}
                      </p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {dashboard.performanceMetrics.errorRate}
                      </p>
                      <p className="text-sm text-muted-foreground">Error Rate</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jarvis AI Permissions</CardTitle>
              <CardDescription>
                Current access levels and capabilities for the AI assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard && (
                <div className="space-y-4">
                  {Object.entries(dashboard.capabilities).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <Badge variant={enabled ? "default" : "secondary"}>
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Monitor Jarvis AI system health and configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        dashboard.systemHealth.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">System Status</span>
                    </div>
                    <Badge variant={dashboard.systemHealth.status === 'operational' ? "default" : "destructive"}>
                      {dashboard.systemHealth.status}
                    </Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Last Health Check</p>
                    <p className="font-medium">
                      {new Date(dashboard.systemHealth.lastCheck).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}