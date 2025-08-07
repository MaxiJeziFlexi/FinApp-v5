import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Shield, Home, TrendingUp, PiggyBank, DollarSign } from "lucide-react";

interface OnboardingFormProps {
  onComplete: () => void;
  userId: string;
}

interface FormData {
  goal: string;
  timeframe: string;
  monthlyIncome: string;
  currentSavings: string;
  targetAmount: string;
}

interface Consents {
  dataProcessing: boolean;
  profiling: boolean;
}

export default function OnboardingForm({ onComplete, userId }: OnboardingFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    goal: '',
    timeframe: '',
    monthlyIncome: '',
    currentSavings: '',
    targetAmount: ''
  });
  
  const [consents, setConsents] = useState<Consents>({
    dataProcessing: false,
    profiling: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await apiRequest('POST', `/api/user/profile/${userId}`, profileData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Created!",
        description: "Welcome to your financial journey.",
      });
      onComplete();
    },
    onError: (error: any) => {
      console.error('Profile creation error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.goal) {
      newErrors.goal = 'Please select a financial goal';
    }
    
    if (!formData.timeframe) {
      newErrors.timeframe = 'Please select a timeframe';
    }
    
    if (!formData.monthlyIncome) {
      newErrors.monthlyIncome = 'Please select your monthly income range';
    }
    
    if (!consents.dataProcessing) {
      newErrors.consents = 'You must agree to data processing to continue';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const profileData = {
      financialGoal: formData.goal,
      timeframe: formData.timeframe,
      monthlyIncome: formData.monthlyIncome,
      currentSavings: formData.currentSavings || "0",
      targetAmount: formData.targetAmount || "10000",
      onboardingComplete: true,
      consents: consents,
      financialData: [
        { date: "2024-01", amount: 2000 },
        { date: "2024-02", amount: 2500 },
        { date: "2024-03", amount: 3000 },
        { date: "2024-04", amount: 3500 },
        { date: "2024-05", amount: 4200 },
        { date: "2024-06", amount: 4800 },
        { date: "2024-07", amount: 5500 },
        { date: "2024-08", amount: 6200 }
      ]
    };
    
    updateProfileMutation.mutate(profileData);
  };

  const calculateProgress = (): number => {
    const fields = [formData.goal, formData.timeframe, formData.monthlyIncome];
    const filledFields = fields.filter(field => field.trim() !== '').length;
    const consentProgress = consents.dataProcessing ? 1 : 0;
    return Math.round(((filledFields + consentProgress) / 4) * 100);
  };

  const goalOptions = [
    {
      id: 'emergency_fund',
      title: 'Emergency Fund',
      description: 'Build safety net',
      icon: Shield
    },
    {
      id: 'home_purchase',
      title: 'Home Purchase',
      description: 'Save for house',
      icon: Home
    },
    {
      id: 'debt_reduction',
      title: 'Debt Reduction',
      description: 'Pay off debts',
      icon: TrendingUp
    },
    {
      id: 'retirement',
      title: 'Retirement',
      description: 'Long-term savings',
      icon: PiggyBank
    }
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="text-white text-2xl" />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Welcome to Your Financial Journey</CardTitle>
        <CardDescription className="text-lg">
          Let's start by understanding your financial goals and situation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Profile Completion</span>
                <span className="text-primary font-semibold">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-3" />
            </div>

            {/* Simplified Profile Setup - No Name Required */}

            {/* Financial Goal */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Primary Financial Goal</Label>
              <div className="grid grid-cols-2 gap-3">
                {goalOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={formData.goal === option.id ? "default" : "outline"}
                      className={`p-4 h-auto justify-start ${
                        formData.goal === option.id ? "bg-primary text-white" : "border-2"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, goal: option.id }))}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">{option.title}</div>
                          <div className="text-xs opacity-70">{option.description}</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              {errors.goal && <p className="text-sm text-destructive">{errors.goal}</p>}
            </div>

            {/* Timeframe and Income */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Timeframe</Label>
                <Select value={formData.timeframe} onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}>
                  <SelectTrigger className={errors.timeframe ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short-term (1-2 years)</SelectItem>
                    <SelectItem value="medium">Medium-term (3-5 years)</SelectItem>
                    <SelectItem value="long">Long-term (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.timeframe && <p className="text-sm text-destructive">{errors.timeframe}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Monthly Income</Label>
                <Select value={formData.monthlyIncome} onValueChange={(value) => setFormData(prev => ({ ...prev, monthlyIncome: value }))}>
                  <SelectTrigger className={errors.monthlyIncome ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$3,000 - $5,000">$3,000 - $5,000</SelectItem>
                    <SelectItem value="$5,000 - $8,000">$5,000 - $8,000</SelectItem>
                    <SelectItem value="$8,000+">$8,000+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.monthlyIncome && <p className="text-sm text-destructive">{errors.monthlyIncome}</p>}
              </div>
            </div>

            {/* Current Savings */}
            <div className="space-y-2">
              <Label htmlFor="savings" className="text-sm font-semibold">Current Savings</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="savings"
                  placeholder="0"
                  value={formData.currentSavings}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentSavings: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <Label htmlFor="target" className="text-sm font-semibold">Target Amount (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="target"
                  placeholder="10,000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent1"
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) => 
                    setConsents(prev => ({ ...prev, dataProcessing: !!checked }))
                  }
                />
                <Label htmlFor="consent1" className="text-sm leading-5">
                  I agree to data processing for personalized financial advice
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent2"
                  checked={consents.profiling}
                  onCheckedChange={(checked) => 
                    setConsents(prev => ({ ...prev, profiling: !!checked }))
                  }
                />
                <Label htmlFor="consent2" className="text-sm leading-5">
                  I consent to profiling for improved recommendations
                </Label>
              </div>
              
              {errors.consents && <p className="text-sm text-destructive">{errors.consents}</p>}
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={updateProfileMutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              size="lg"
            >
              {updateProfileMutation.isPending ? "Creating Profile..." : "Complete Profile Setup"}
            </Button>
          </div>

          {/* Visualization Section */}
          <div className="space-y-6">
            {/* Sample Goals Progress */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Your Goals Visualization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Emergency Fund</span>
                  <div className="flex-1 mx-4 bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-sm font-medium">$6,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Debt Payoff</span>
                  <div className="flex-1 mx-4 bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }} />
                  </div>
                  <span className="text-sm font-medium">$3,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Investment</span>
                  <div className="flex-1 mx-4 bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <span className="text-sm font-medium">$4,500</span>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Preview */}
            <Card className="bg-gradient-to-r from-accent/20 to-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <PiggyBank className="text-primary text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Ready to Unlock</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete setup to earn your first achievement!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <span className="text-sm">Choose your AI financial advisor</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <span className="text-secondary font-bold text-sm">2</span>
                  </div>
                  <span className="text-sm">Complete personalized consultation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent-foreground font-bold text-sm">3</span>
                  </div>
                  <span className="text-sm">Get AI-powered financial advice</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
