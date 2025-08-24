import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User,
  Settings,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Brain,
  Lock,
  Eye,
  AlertCircle,
  Zap
} from "lucide-react";

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
}

interface OnboardingData {
  step1: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    occupation: string;
    experience: string;
  };
  step2: {
    communicationStyle: string;
    learningPreference: string;
    riskTolerance: string;
    primaryGoals: string[];
    preferredAdvisors: string[];
  };
  step3: {
    dataCollection: boolean;
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
    thirdParty: boolean;
  };
  currentStep: number;
  completed: boolean;
}

const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  occupation: z.string().min(1, "Occupation is required"),
  experience: z.enum(["beginner", "intermediate", "advanced", "expert"], {
    required_error: "Please select your experience level"
  })
});

const step2Schema = z.object({
  communicationStyle: z.enum(["casual", "professional", "technical", "simple"], {
    required_error: "Please select a communication style"
  }),
  learningPreference: z.enum(["visual", "auditory", "hands-on", "reading"], {
    required_error: "Please select your learning preference"
  }),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"], {
    required_error: "Please select your risk tolerance"
  }),
  primaryGoals: z.array(z.string()).min(1, "Select at least one goal"),
  preferredAdvisors: z.array(z.string()).min(1, "Select at least one advisor type")
});

const step3Schema = z.object({
  dataCollection: z.boolean(),
  analytics: z.boolean(),
  personalization: z.boolean(),
  marketing: z.boolean(),
  thirdParty: z.boolean()
});

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    step1: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      occupation: "",
      experience: "beginner"
    },
    step2: {
      communicationStyle: "casual",
      learningPreference: "visual",
      riskTolerance: "moderate",
      primaryGoals: [],
      preferredAdvisors: []
    },
    step3: {
      dataCollection: true,
      analytics: true,
      personalization: true,
      marketing: false,
      thirdParty: false
    },
    currentStep: 1,
    completed: false
  });

  // Form hook must be at the top level (not inside conditional render functions)
  const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: onboardingData.step1
  });

  // Load saved progress
  const { data: savedProgress } = useQuery({
    queryKey: ['/api/onboarding/progress', userId],
    enabled: !!userId,
    staleTime: 0
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingData>) => {
      return await apiRequest('POST', '/api/onboarding/save-progress', {
        userId,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/onboarding/progress', userId] 
      });
    },
    onError: (error) => {
      console.error('Failed to save progress:', error);
      toast({
        title: "Save Failed",
        description: "Progress couldn't be saved. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      return await apiRequest('POST', '/api/onboarding/complete', {
        userId,
        ...data
      });
    },
    onSuccess: () => {
      toast({
        title: "Onboarding Complete! 🎉",
        description: "Welcome to FinApp! Let's start your financial journey.",
      });
      onComplete();
    },
    onError: (error) => {
      console.error('Failed to complete onboarding:', error);
      toast({
        title: "Completion Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  // Load saved progress on mount
  useEffect(() => {
    if (savedProgress && !savedProgress.completed) {
      // Safely merge saved progress with default structure
      const updatedData = {
        ...onboardingData,
        step1: {
          ...onboardingData.step1,
          ...savedProgress.step1
        },
        step2: {
          ...onboardingData.step2,
          ...savedProgress.step2,
          // Ensure arrays are properly initialized
          primaryGoals: savedProgress.step2?.primaryGoals || onboardingData.step2.primaryGoals,
          preferredAdvisors: savedProgress.step2?.preferredAdvisors || onboardingData.step2.preferredAdvisors
        },
        step3: {
          ...onboardingData.step3,
          ...savedProgress.step3
        },
        currentStep: savedProgress.currentStep || 1,
        completed: savedProgress.completed || false
      };

      setOnboardingData(updatedData);
      setCurrentStep(savedProgress.currentStep || 1);

      // Update form with loaded step1 data
      if (savedProgress.step1) {
        step1Form.reset(updatedData.step1);
      }
    }
  }, [savedProgress, step1Form]);

  // Sync form with onboarding data changes
  useEffect(() => {
    step1Form.reset(onboardingData.step1);
  }, [onboardingData.step1, step1Form]);

  // Auto-save on data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentStep > 1 || (onboardingData.step1 && Object.values(onboardingData.step1).some(v => v))) {
        saveProgressMutation.mutate({
          ...onboardingData,
          currentStep
        });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [onboardingData, currentStep]);

  const updateStepData = (step: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveProgressMutation.mutate({
        ...onboardingData,
        currentStep: newStep
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const finalData = {
      ...onboardingData,
      completed: true,
      currentStep: 4
    };
    completeOnboardingMutation.mutate(finalData);
  };

  const stepTitles = [
    "Account Basics",
    "Preferences",
    "Data Permissions",
    "Summary & Confirm"
  ];

  const stepDescriptions = [
    "Tell us about yourself to personalize your experience",
    "Customize how FinApp works for you",
    "Control your data and privacy settings",
    "Review and confirm your settings"
  ];

  const getProgressPercentage = () => {
    return Math.round((currentStep / 4) * 100);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
            ${step < currentStep 
              ? 'bg-green-500 border-green-500 text-white' 
              : step === currentStep 
                ? 'bg-primary border-primary text-white' 
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
            }
          `}>
            {step < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              step
            )}
          </div>
          {step < 4 && (
            <div className={`
              w-16 h-1 mx-2 rounded-full transition-all duration-300
              ${step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => {
    const onSubmit = (data: z.infer<typeof step1Schema>) => {
      updateStepData('step1', data);
      nextStep();
    };

    return (
      <form onSubmit={step1Form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...step1Form.register('firstName')}
              onChange={(e) => {
                step1Form.setValue('firstName', e.target.value);
                updateStepData('step1', { firstName: e.target.value });
              }}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {step1Form.formState.errors.firstName && (
              <p className="text-sm text-red-500">{step1Form.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...step1Form.register('lastName')}
              onChange={(e) => {
                step1Form.setValue('lastName', e.target.value);
                updateStepData('step1', { lastName: e.target.value });
              }}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {step1Form.formState.errors.lastName && (
              <p className="text-sm text-red-500">{step1Form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...step1Form.register('dateOfBirth')}
            onChange={(e) => {
              step1Form.setValue('dateOfBirth', e.target.value);
              updateStepData('step1', { dateOfBirth: e.target.value });
            }}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          {step1Form.formState.errors.dateOfBirth && (
            <p className="text-sm text-red-500">{step1Form.formState.errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            {...step1Form.register('occupation')}
            onChange={(e) => {
              step1Form.setValue('occupation', e.target.value);
              updateStepData('step1', { occupation: e.target.value });
            }}
            placeholder="e.g., Software Engineer, Teacher, Student"
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          {step1Form.formState.errors.occupation && (
            <p className="text-sm text-red-500">{step1Form.formState.errors.occupation.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Financial Knowledge Level</Label>
          <Select
            value={step1Form.watch('experience')}
            onValueChange={(value) => {
              step1Form.setValue('experience', value as any);
              updateStepData('step1', { experience: value });
            }}
          >
            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner - New to personal finance</SelectItem>
              <SelectItem value="intermediate">Intermediate - Some financial knowledge</SelectItem>
              <SelectItem value="advanced">Advanced - Experienced with investments</SelectItem>
              <SelectItem value="expert">Expert - Professional financial background</SelectItem>
            </SelectContent>
          </Select>
          {step1Form.formState.errors.experience && (
            <p className="text-sm text-red-500">{step1Form.formState.errors.experience.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  };

  const renderStep2 = () => {
    const communicationOptions = [
      { value: 'casual', label: 'Casual & Friendly', emoji: '😊' },
      { value: 'professional', label: 'Professional', emoji: '💼' },
      { value: 'technical', label: 'Technical & Detailed', emoji: '🔬' },
      { value: 'simple', label: 'Simple & Clear', emoji: '✨' }
    ];

    const learningOptions = [
      { value: 'visual', label: 'Visual Learner', emoji: '👁️' },
      { value: 'auditory', label: 'Audio Learner', emoji: '🎧' },
      { value: 'hands-on', label: 'Hands-On', emoji: '👋' },
      { value: 'reading', label: 'Reading & Text', emoji: '📖' }
    ];

    const riskOptions = [
      { value: 'conservative', label: 'Conservative', description: 'Prefer safety over returns', emoji: '🛡️' },
      { value: 'moderate', label: 'Moderate', description: 'Balanced approach', emoji: '⚖️' },
      { value: 'aggressive', label: 'Aggressive', description: 'Higher risk for higher returns', emoji: '🚀' }
    ];

    const goalOptions = [
      { value: 'emergency_fund', label: 'Build Emergency Fund', emoji: '🛡️' },
      { value: 'debt_payoff', label: 'Pay Off Debt', emoji: '💳' },
      { value: 'save_home', label: 'Save for Home', emoji: '🏠' },
      { value: 'retirement', label: 'Retirement Planning', emoji: '🏖️' },
      { value: 'investment', label: 'Investment Growth', emoji: '📈' },
      { value: 'learn_finance', label: 'Learn Finance', emoji: '🎓' }
    ];

    const advisorOptions = [
      { value: 'budget_planner', label: 'Budget Planner', emoji: '📊' },
      { value: 'debt_expert', label: 'Debt Expert', emoji: '💰' },
      { value: 'savings_strategist', label: 'Savings Strategist', emoji: '🎯' },
      { value: 'retirement_advisor', label: 'Retirement Advisor', emoji: '🏦' },
      { value: 'investment_guide', label: 'Investment Guide', emoji: '📊' }
    ];

    const toggleGoal = (goal: string) => {
      const currentGoals = onboardingData.step2.primaryGoals;
      const newGoals = currentGoals.includes(goal)
        ? currentGoals.filter(g => g !== goal)
        : [...currentGoals, goal];
      updateStepData('step2', { primaryGoals: newGoals });
    };

    const toggleAdvisor = (advisor: string) => {
      const currentAdvisors = onboardingData.step2.preferredAdvisors;
      const newAdvisors = currentAdvisors.includes(advisor)
        ? currentAdvisors.filter(a => a !== advisor)
        : [...currentAdvisors, advisor];
      updateStepData('step2', { preferredAdvisors: newAdvisors });
    };

    return (
      <div className="space-y-8">
        {/* Communication Style */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Communication Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {communicationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateStepData('step2', { communicationStyle: option.value })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  onboardingData.step2.communicationStyle === option.value
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Learning Preference */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Learning Preference</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {learningOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateStepData('step2', { learningPreference: option.value })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  onboardingData.step2.learningPreference === option.value
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Risk Tolerance */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Risk Tolerance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {riskOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateStepData('step2', { riskTolerance: option.value })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  onboardingData.step2.riskTolerance === option.value
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium mb-1">{option.label}</div>
                <div className="text-xs text-slate-400">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Goals */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Primary Goals (Select at least 1)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {goalOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleGoal(option.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  onboardingData.step2.primaryGoals.includes(option.value)
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Advisors */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Preferred AI Advisors (Select at least 1)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {advisorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleAdvisor(option.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  onboardingData.step2.preferredAdvisors.includes(option.value)
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const permissions = [
      {
        id: 'dataCollection',
        title: 'Data Collection & Analysis',
        description: 'Allow FinApp to collect and analyze your financial behavior to provide personalized insights',
        required: true,
        icon: '📊'
      },
      {
        id: 'analytics',
        title: 'Analytics & Performance Tracking',
        description: 'Track your learning progress and financial goals to improve recommendations',
        required: true,
        icon: '📈'
      },
      {
        id: 'personalization',
        title: 'AI Personalization',
        description: 'Use your data to personalize AI responses and create custom financial plans',
        required: true,
        icon: '🤖'
      },
      {
        id: 'marketing',
        title: 'Marketing Communications',
        description: 'Send you updates about new features, financial tips, and educational content',
        required: false,
        icon: '📧'
      },
      {
        id: 'thirdParty',
        title: 'Third-Party Integrations',
        description: 'Share anonymized data with trusted partners to improve financial services',
        required: false,
        icon: '🔗'
      }
    ];

    const togglePermission = (permissionId: keyof typeof onboardingData.step3) => {
      const permission = permissions.find(p => p.id === permissionId);
      if (!permission?.required) {
        updateStepData('step3', { 
          [permissionId]: !onboardingData.step3[permissionId] 
        });
      }
    };

    return (
      <div className="space-y-6">
        {/* Privacy Notice */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm text-slate-300">
              Your privacy is important to us. You have full control over your data permissions and can change these settings anytime.
            </p>
          </div>
        </div>

        {/* Permission Items */}
        <div className="space-y-4">
          {permissions.map((permission) => (
            <div
              key={permission.id}
              className={`bg-slate-800 border border-slate-600 rounded-lg p-4 ${
                !permission.required ? 'cursor-pointer hover:border-slate-500' : ''
              }`}
              onClick={() => !permission.required && togglePermission(permission.id as keyof typeof onboardingData.step3)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{permission.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white">{permission.title}</h4>
                      {permission.required && (
                        <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{permission.description}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {permission.required ? (
                    <div className="w-5 h-5 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div 
                      className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        onboardingData.step3[permission.id as keyof typeof onboardingData.step3]
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-500'
                      }`}
                    >
                      {onboardingData.step3[permission.id as keyof typeof onboardingData.step3] && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Transparency */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-medium text-white">Data Transparency</h4>
          </div>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>• All data is encrypted and stored securely</li>
            <li>• You can export or delete your data anytime</li>
            <li>• We never sell your personal information</li>
            <li>• Anonymous usage statistics help improve the app</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Almost Ready!</h2>
          <p className="text-slate-400">Review your settings and complete your FinApp setup</p>
        </div>

        {/* Personal Information */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Name</p>
              <p className="text-white font-medium">
                {onboardingData.step1.firstName} {onboardingData.step1.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Occupation</p>
              <p className="text-white font-medium">{onboardingData.step1.occupation}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Experience Level</p>
              <p className="text-white font-medium capitalize">{onboardingData.step1.experience}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Date of Birth</p>
              <p className="text-white font-medium">{onboardingData.step1.dateOfBirth}</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-400">Communication Style</p>
              <p className="text-white font-medium capitalize">{onboardingData.step2.communicationStyle}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Learning Preference</p>
              <p className="text-white font-medium capitalize">{onboardingData.step2.learningPreference}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">Primary Goals</p>
            <div className="flex flex-wrap gap-2">
              {onboardingData.step2.primaryGoals.map((goal) => (
                <Badge key={goal} variant="secondary" className="bg-blue-600 text-white">
                  {goal.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Preferred Advisors</p>
            <div className="flex flex-wrap gap-2">
              {onboardingData.step2.preferredAdvisors.map((advisor) => (
                <Badge key={advisor} variant="secondary" className="bg-purple-600 text-white">
                  {advisor.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy & Permissions */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Privacy & Permissions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Data Collection</p>
              <Badge className="bg-green-600 text-white">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Analytics</p>
              <Badge className="bg-green-600 text-white">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Personalization</p>
              <Badge className="bg-green-600 text-white">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Marketing</p>
              <Badge className={onboardingData.step3.marketing ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                {onboardingData.step3.marketing ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Third Party</p>
              <Badge className={onboardingData.step3.thirdParty ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                {onboardingData.step3.thirdParty ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              Welcome to FinApp! Your personalized financial education journey is about to begin. You can update any of these settings later in your profile.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to FinApp
            </h1>
          </div>
          <p className="text-lg text-slate-300 mb-2">
            Let's personalize your financial journey
          </p>
          <Progress value={getProgressPercentage()} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-slate-400 mt-2">
            Step {currentStep} of 4 • {getProgressPercentage()}% Complete
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Content */}
        <Card className="bg-slate-800 border border-slate-600 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl flex items-center justify-center gap-2 text-white">
              {currentStep === 1 && <User className="h-6 w-6 text-blue-400" />}
              {currentStep === 2 && <Settings className="h-6 w-6 text-purple-400" />}
              {currentStep === 3 && <Shield className="h-6 w-6 text-green-400" />}
              {currentStep === 4 && <CheckCircle className="h-6 w-6 text-emerald-400" />}
              {stepTitles[currentStep - 1]}
            </CardTitle>
            <CardDescription className="text-lg text-slate-400">
              {stepDescriptions[currentStep - 1]}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1}
            className="transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step === currentStep
                    ? 'bg-blue-600'
                    : step < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < 4 ? (
            <Button 
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={completeOnboardingMutation.isPending}
            >
              {completeOnboardingMutation.isPending ? (
                <>Loading...</>
              ) : (
                <>Complete Setup <CheckCircle className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}