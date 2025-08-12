import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, TrendingUp, Target, Users, Lightbulb, BarChart3, ArrowRight, Check } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface PersonalizedQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'single_choice' | 'multiple_choice' | 'range' | 'text' | 'boolean' | 'demographic';
  category: string;
  options?: {
    id: string;
    value: string;
    title: string;
    description?: string;
    ai_weight: number;
  }[];
  validation?: {
    required: boolean;
    min_value?: number;
    max_value?: number;
  };
  ai_context: string;
}

interface PersonalizedTreeDefinition {
  advisorId: string;
  name: string;
  description: string;
  categories: string[];
  questions: PersonalizedQuestion[];
  ai_learning_objectives: string[];
}

interface PersonalizedInsights {
  user_profile: {
    risk_tolerance: string;
    financial_experience: string;
    primary_goals: string[];
    financial_capacity: string;
    decision_style: string;
    life_stage: string;
  };
  ai_recommendations: {
    personalization_score: number;
    recommended_strategies: string[];
    focus_areas: string[];
    communication_style: string;
    next_best_actions: string[];
  };
  data_for_ai_models: {
    preferences: Record<string, any>;
    behavioral_indicators: Record<string, any>;
    financial_markers: Record<string, any>;
    learning_patterns: Record<string, any>;
  };
}

interface PersonalizedDecisionTreeViewProps {
  advisorId: string;
  userId: string;
  advisor?: {
    id: string;
    name: string;
    specialty?: string;
    icon?: string;
  };
  onComplete?: (insights: PersonalizedInsights) => void;
  onBackToAdvisor?: () => void;
}

export function PersonalizedDecisionTreeView({
  advisorId,
  userId,
  advisor,
  onComplete,
  onBackToAdvisor
}: PersonalizedDecisionTreeViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [confidenceLevel, setConfidenceLevel] = useState(80);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [insights, setInsights] = useState<PersonalizedInsights | null>(null);
  
  const { toast } = useToast();


  // Load personalized decision tree
  const { data: treeDefinition, isLoading: loadingTree } = useQuery({
    queryKey: ['/api/personalized-tree', advisorId],
    enabled: !!advisorId,
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: {
      userId: string;
      advisorId: string;
      questionId: string;
      answer: any;
      additionalData?: any;
    }) => {
      return await apiRequest('POST', '/api/personalized-tree/respond', responseData);
    },
    onSuccess: async (response) => {
      const result = await response.json();
      if (result.completed && result.insights) {
        setInsights(result.insights);
        toast({
          title: "Assessment Complete!",
          description: "Your personalized financial insights are ready.",
          variant: "default",
        });
        onComplete?.(result.insights);
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setAdditionalNotes('');
        setConfidenceLevel(80);
        
        toast({
          title: "Response Recorded",
          description: "Your answer has been saved and analyzed by our AI.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = (treeDefinition as PersonalizedTreeDefinition)?.questions?.[currentQuestionIndex];
  const progress = (treeDefinition as PersonalizedTreeDefinition) && (treeDefinition as PersonalizedTreeDefinition).questions ? 
    ((currentQuestionIndex) / (treeDefinition as PersonalizedTreeDefinition).questions.length) * 100 : 0;

  const handleSubmitResponse = () => {
    if (!currentQuestion || !userId || !advisorId) return;

    // Validate required fields
    if (currentQuestion.validation?.required && !currentAnswer) {
      toast({
        title: "Response Required",
        description: "Please provide an answer before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Record response locally
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: currentAnswer
    }));

    // Submit to backend with AI integration
    submitResponseMutation.mutate({
      userId,
      advisorId,
      questionId: currentQuestion.id,
      answer: currentAnswer,
      additionalData: {
        confidence: confidenceLevel / 100,
        notes: additionalNotes,
        category: currentQuestion.category,
        ai_context: currentQuestion.ai_context
      }
    });
  };

  const renderQuestionInput = (question: PersonalizedQuestion) => {
    switch (question.type) {
      case 'single_choice':
        return (
          <RadioGroup 
            value={currentAnswer} 
            onValueChange={setCurrentAnswer}
            className="space-y-4"
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <RadioGroupItem value={option.value} id={option.id} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="cursor-pointer">
                    <div className="font-medium text-sm">{option.title}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</div>
                    )}
                  </Label>
                  <div className="flex items-center mt-2">
                    <Badge variant="secondary" className="text-xs">
                      AI Weight: {Math.round(option.ai_weight * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-4">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Checkbox
                  id={option.id}
                  checked={Array.isArray(currentAnswer) ? currentAnswer.includes(option.value) : false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCurrentAnswer((prev: string[]) => [...(prev || []), option.value]);
                    } else {
                      setCurrentAnswer((prev: string[]) => (prev || []).filter((v: string) => v !== option.value));
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="cursor-pointer">
                    <div className="font-medium text-sm">{option.title}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</div>
                    )}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <div className="px-4">
              <Label className="text-sm font-medium">Amount: ${currentAnswer || 0}</Label>
              <Slider
                value={[currentAnswer || 0]}
                onValueChange={(value) => setCurrentAnswer(value[0])}
                max={question.validation?.max_value || 10000}
                min={question.validation?.min_value || 0}
                step={100}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Please provide your detailed response..."
            className="min-h-24"
          />
        );

      case 'boolean':
        return (
          <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial_status': return <BarChart3 className="w-4 h-4" />;
      case 'goals': return <Target className="w-4 h-4" />;
      case 'risk_tolerance': return <TrendingUp className="w-4 h-4" />;
      case 'preferences': return <Users className="w-4 h-4" />;
      case 'experience': return <Lightbulb className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const renderInsights = () => {
    if (!insights) return null;

    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Check className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-800 dark:text-green-200">Assessment Complete!</CardTitle>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your personalized financial profile has been created and shared with our AI models for enhanced recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-5 h-5 text-green-600" />
              <span className="font-medium">Personalization Score: {insights.ai_recommendations.personalization_score}/100</span>
            </div>
            <Progress value={insights.ai_recommendations.personalization_score} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Financial Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Risk Tolerance:</span>
                <Badge variant="outline">{insights.user_profile.risk_tolerance}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Experience Level:</span>
                <Badge variant="outline">{insights.user_profile.financial_experience}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Life Stage:</span>
                <Badge variant="outline">{insights.user_profile.life_stage}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Decision Style:</span>
                <Badge variant="outline">{insights.user_profile.decision_style}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Recommended Strategies</Label>
                  <div className="space-y-1 mt-1">
                    {insights.ai_recommendations.recommended_strategies.map((strategy, index) => (
                      <div key={index} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        {strategy}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Focus Areas</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {insights.ai_recommendations.focus_areas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{area}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Best Actions</CardTitle>
            <CardDescription>Personalized action items based on your responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.ai_recommendations.next_best_actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button onClick={onBackToAdvisor} variant="outline" className="flex-1">
            Back to Advisor Selection
          </Button>
          <Button 
            onClick={() => onComplete?.(insights)} 
            className="flex-1"
          >
            Continue to Personalized Chat
          </Button>
        </div>
      </div>
    );
  };

  if (loadingTree) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading personalized assessment...</p>
        </CardContent>
      </Card>
    );
  }

  if (!treeDefinition || insights) {
    return insights ? renderInsights() : (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Unable to load personalized assessment.</p>
          <Button onClick={onBackToAdvisor} variant="outline" className="mt-4">
            Back to Advisor Selection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{advisor.icon}</div>
            <div>
              <CardTitle>{(treeDefinition as PersonalizedTreeDefinition)?.name}</CardTitle>
              <CardDescription>{(treeDefinition as PersonalizedTreeDefinition)?.description}</CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {getCategoryIcon(currentQuestion.category)}
              <Badge variant="outline" className="text-xs">{currentQuestion.category.replace('_', ' ')}</Badge>
            </div>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            {currentQuestion.description && (
              <CardDescription>{currentQuestion.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {renderQuestionInput(currentQuestion)}

            {/* Confidence Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                How confident are you in this response? ({confidenceLevel}%)
              </Label>
              <Slider
                value={[confidenceLevel]}
                onValueChange={(value) => setConfidenceLevel(value[0])}
                max={100}
                min={50}
                step={10}
                className="mt-2"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Additional Notes (Optional)</Label>
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional context or concerns you'd like to share..."
                className="min-h-16 text-sm"
              />
            </div>

            {/* AI Context Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">AI Learning Context</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">{currentQuestion.ai_context}</p>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={onBackToAdvisor} 
                variant="outline" 
                className="flex-1"
              >
                Back to Advisors
              </Button>
              <Button 
                onClick={handleSubmitResponse}
                disabled={submitResponseMutation.isPending}
                className="flex-1"
              >
                {submitResponseMutation.isPending ? 'Processing...' : 'Next Question'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Learning Objectives</span>
          </CardTitle>
          <CardDescription>
            Our AI is learning about your financial behavior to provide better recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(treeDefinition as PersonalizedTreeDefinition)?.ai_learning_objectives?.map((objective: string, index: number) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                <span>{objective}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}