import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Bot,
  Brain,
  Settings,
  Star,
  TrendingUp,
  Zap,
  Heart,
  Target,
  BookOpen,
  MessageSquare,
  Award,
  BarChart3,
  Save,
  RefreshCw,
  Sparkles,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalizedAgent {
  id?: string;
  userId: string;
  name: string;
  personality: string;
  expertise: string;
  responseStyle: string;
  creativity: number;
  analyticalDepth: number;
  friendliness: number;
  accuracy: number;
  learningRate: number;
  customInstructions: string;
  trainingData: any[];
  performanceMetrics: any;
  preferences: any;
  isActive: boolean;
}

interface TrainingExample {
  id?: string;
  userInput: string;
  expectedResponse: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
}

interface AIAgentSettingsProps {
  userId: string;
  onClose: () => void;
}

export default function AIAgentSettings({ userId, onClose }: AIAgentSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('settings');
  const [isTraining, setIsTraining] = useState(false);
  const [newTrainingExample, setNewTrainingExample] = useState<TrainingExample>({
    userInput: '',
    expectedResponse: '',
    category: 'general',
    importance: 'medium'
  });

  // Fetch user's AI agent
  const { data: agent, isLoading } = useQuery({
    queryKey: ['/api/ai-agent', userId],
    retry: false
  });

  const [agentSettings, setAgentSettings] = useState<PersonalizedAgent>({
    userId,
    name: 'My AI Agent',
    personality: 'helpful',
    expertise: 'general',
    responseStyle: 'balanced',
    creativity: 0.7,
    analyticalDepth: 0.8,
    friendliness: 0.7,
    accuracy: 0.9,
    learningRate: 0.1,
    customInstructions: '',
    trainingData: [],
    performanceMetrics: {},
    preferences: {},
    isActive: true
  });

  useEffect(() => {
    if (agent) {
      setAgentSettings(agent);
    }
  }, [agent]);

  // Save agent settings
  const saveAgentMutation = useMutation({
    mutationFn: async (settings: PersonalizedAgent) => {
      const endpoint = agent?.id ? `/api/ai-agent/${agent.id}` : '/api/ai-agent';
      const method = agent?.id ? 'PUT' : 'POST';
      return await apiRequest(method, endpoint, settings);
    },
    onSuccess: () => {
      toast({
        title: "AI Agent Updated",
        description: "Your personalized AI agent has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agent', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save AI agent settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add training example
  const addTrainingMutation = useMutation({
    mutationFn: async (example: TrainingExample) => {
      return await apiRequest('POST', `/api/ai-agent/${agent?.id}/training`, example);
    },
    onSuccess: () => {
      toast({
        title: "Training Example Added",
        description: "Your AI agent will learn from this example.",
      });
      setNewTrainingExample({
        userInput: '',
        expectedResponse: '',
        category: 'general',
        importance: 'medium'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agent', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add training example.",
        variant: "destructive",
      });
    },
  });

  // Train agent mutation
  const trainAgentMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/ai-agent/${agent?.id}/train`, {});
    },
    onSuccess: () => {
      toast({
        title: "Training Complete",
        description: "Your AI agent has been retrained with new examples.",
      });
      setIsTraining(false);
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agent', userId] });
    },
    onError: () => {
      toast({
        title: "Training Error",
        description: "Failed to train AI agent. Please try again.",
        variant: "destructive",
      });
      setIsTraining(false);
    },
  });

  const handleSave = () => {
    saveAgentMutation.mutate(agentSettings);
  };

  const handleAddTrainingExample = () => {
    if (newTrainingExample.userInput.trim() && newTrainingExample.expectedResponse.trim()) {
      addTrainingMutation.mutate(newTrainingExample);
    }
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    trainAgentMutation.mutate();
  };

  const personalities = [
    { value: 'helpful', label: '🤝 Helpful', desc: 'Supportive and solution-oriented' },
    { value: 'professional', label: '💼 Professional', desc: 'Formal and business-focused' },
    { value: 'friendly', label: '😊 Friendly', desc: 'Warm and conversational' },
    { value: 'analytical', label: '📊 Analytical', desc: 'Data-driven and logical' },
    { value: 'creative', label: '🎨 Creative', desc: 'Innovative and imaginative' },
    { value: 'direct', label: '🎯 Direct', desc: 'Straightforward and concise' },
  ];

  const expertiseAreas = [
    { value: 'general', label: 'General Finance' },
    { value: 'investment', label: 'Investment Strategy' },
    { value: 'budgeting', label: 'Budget Planning' },
    { value: 'trading', label: 'Trading & Markets' },
    { value: 'retirement', label: 'Retirement Planning' },
    { value: 'tax', label: 'Tax Optimization' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'business', label: 'Business Finance' },
  ];

  const responseStyles = [
    { value: 'concise', label: 'Concise' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'conversational', label: 'Conversational' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-4xl h-full max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Agent Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Customize and train your personal AI financial advisor
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Training
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="examples" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Examples
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(90vh-200px)] p-6">
              <TabsContent value="settings" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Basic Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Agent Name</Label>
                        <Input
                          id="name"
                          value={agentSettings.name}
                          onChange={(e) => setAgentSettings(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="My AI Agent"
                          data-testid="input-agent-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Personality</Label>
                        <Select 
                          value={agentSettings.personality} 
                          onValueChange={(value) => setAgentSettings(prev => ({ ...prev, personality: value }))}
                        >
                          <SelectTrigger data-testid="select-personality">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {personalities.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                <div>
                                  <div className="font-medium">{p.label}</div>
                                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Expertise Area</Label>
                        <Select 
                          value={agentSettings.expertise} 
                          onValueChange={(value) => setAgentSettings(prev => ({ ...prev, expertise: value }))}
                        >
                          <SelectTrigger data-testid="select-expertise">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {expertiseAreas.map((area) => (
                              <SelectItem key={area.value} value={area.value}>
                                {area.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Response Style</Label>
                        <Select 
                          value={agentSettings.responseStyle} 
                          onValueChange={(value) => setAgentSettings(prev => ({ ...prev, responseStyle: value }))}
                        >
                          <SelectTrigger data-testid="select-response-style">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {responseStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Tuning */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Performance Tuning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Creativity
                          </Label>
                          <span className="text-sm font-mono">{agentSettings.creativity.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[agentSettings.creativity]}
                          onValueChange={([value]) => setAgentSettings(prev => ({ ...prev, creativity: value }))}
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                          data-testid="slider-creativity"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Analytical Depth
                          </Label>
                          <span className="text-sm font-mono">{agentSettings.analyticalDepth.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[agentSettings.analyticalDepth]}
                          onValueChange={([value]) => setAgentSettings(prev => ({ ...prev, analyticalDepth: value }))}
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                          data-testid="slider-analytical-depth"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Friendliness
                          </Label>
                          <span className="text-sm font-mono">{agentSettings.friendliness.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[agentSettings.friendliness]}
                          onValueChange={([value]) => setAgentSettings(prev => ({ ...prev, friendliness: value }))}
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                          data-testid="slider-friendliness"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Accuracy Focus
                          </Label>
                          <span className="text-sm font-mono">{agentSettings.accuracy.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[agentSettings.accuracy]}
                          onValueChange={([value]) => setAgentSettings(prev => ({ ...prev, accuracy: value }))}
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                          data-testid="slider-accuracy"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Custom Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      Custom Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={agentSettings.customInstructions}
                      onChange={(e) => setAgentSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                      placeholder="Add specific instructions for how your AI agent should behave, respond, or focus on particular topics..."
                      className="min-h-[120px] resize-none"
                      data-testid="textarea-custom-instructions"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      These instructions will be included in every conversation with your AI agent.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="training" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-500" />
                      Add Training Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select 
                          value={newTrainingExample.category} 
                          onValueChange={(value) => setNewTrainingExample(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Finance</SelectItem>
                            <SelectItem value="investment">Investment Advice</SelectItem>
                            <SelectItem value="budgeting">Budget Planning</SelectItem>
                            <SelectItem value="trading">Trading Strategy</SelectItem>
                            <SelectItem value="analysis">Financial Analysis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Importance</Label>
                        <Select 
                          value={newTrainingExample.importance} 
                          onValueChange={(value: 'low' | 'medium' | 'high') => setNewTrainingExample(prev => ({ ...prev, importance: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>User Input</Label>
                      <Textarea
                        value={newTrainingExample.userInput}
                        onChange={(e) => setNewTrainingExample(prev => ({ ...prev, userInput: e.target.value }))}
                        placeholder="What would the user say or ask?"
                        className="min-h-[80px]"
                        data-testid="textarea-user-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expected Response</Label>
                      <Textarea
                        value={newTrainingExample.expectedResponse}
                        onChange={(e) => setNewTrainingExample(prev => ({ ...prev, expectedResponse: e.target.value }))}
                        placeholder="How should your AI agent respond?"
                        className="min-h-[100px]"
                        data-testid="textarea-expected-response"
                      />
                    </div>

                    <Button
                      onClick={handleAddTrainingExample}
                      disabled={!newTrainingExample.userInput.trim() || !newTrainingExample.expectedResponse.trim() || addTrainingMutation.isPending}
                      className="w-full"
                      data-testid="button-add-training-example"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Training Example
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Training Status
                      </CardTitle>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {agentSettings.trainingData?.length || 0} Examples
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        Start training your AI agent with the examples you've provided.
                      </p>
                      <Button
                        onClick={handleStartTraining}
                        disabled={isTraining || trainAgentMutation.isPending}
                        className="px-8"
                        data-testid="button-start-training"
                      >
                        {isTraining ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Training...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Start Training
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Response Quality
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">
                        {agentSettings.performanceMetrics?.averageRating?.toFixed(1) || '4.2'}
                      </div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-blue-500" />
                        Accuracy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-500">
                        {Math.round((agentSettings.performanceMetrics?.accuracy || 0.87) * 100)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Response Accuracy</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        Interactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-500">
                        {agentSettings.performanceMetrics?.totalInteractions || 42}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Conversations</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Training Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {agentSettings.trainingData?.map((example: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{example.category}</Badge>
                            <Badge variant={example.importance === 'high' ? 'default' : example.importance === 'medium' ? 'secondary' : 'outline'}>
                              {example.importance}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">User Input:</h4>
                            <p className="text-sm text-muted-foreground">{example.userInput}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Expected Response:</h4>
                            <p className="text-sm text-muted-foreground">{example.expectedResponse}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center text-muted-foreground py-8">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>No training examples yet. Add some to improve your AI agent.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>

            {/* Save Button */}
            <div className="border-t p-4 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saveAgentMutation.isPending}
                className="px-8"
                data-testid="button-save-agent"
              >
                {saveAgentMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Agent
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}