import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  DollarSign, 
  Target, 
  TrendingUp,
  Github,
  Shield,
  Globe,
  Smartphone,
  Chrome
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProfileData {
  email: string;
  name: string;
  phoneNumber?: string;
  occupation?: string;
  dateOfBirth?: string;
  annualIncome?: string;
  monthlyExpenses?: string;
  savingsGoals?: string;
  riskTolerance?: string;
  investmentExperience?: string;
  financialGoals?: string[];
  preferredLanguage?: string;
}

const socialProviders = [
  { name: 'Google', icon: Chrome, color: 'bg-red-500 hover:bg-red-600' },
  { name: 'GitHub', icon: Github, color: 'bg-gray-800 hover:bg-gray-900' },
  { name: 'Facebook', icon: Globe, color: 'bg-blue-600 hover:bg-blue-700' },
  { name: 'LinkedIn', icon: Building2, color: 'bg-blue-700 hover:bg-blue-800' },
  { name: 'Apple', icon: Smartphone, color: 'bg-black hover:bg-gray-900' }
];

const financialGoalsOptions = [
  'Emergency Fund Building',
  'Retirement Planning',
  'Investment Growth',
  'Debt Reduction',
  'Home Purchase',
  'Education Funding',
  'Tax Optimization',
  'Business Investment'
];

export default function SignUpModal({ isOpen, onClose, onSuccess }: SignUpModalProps) {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    name: '',
    preferredLanguage: 'en'
  });
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!profileData.email || !profileData.name) {
        toast({
          title: "Required Fields",
          description: "Please fill in your email and name to continue.",
          variant: "destructive"
        });
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSocialSignUp = (provider: string) => {
    toast({
      title: "Social Sign-Up",
      description: `${provider} integration will be available soon. Please use email sign-up for now.`,
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const finalData = {
        ...profileData,
        financialGoals: selectedGoals,
        onboardingComplete: true,
        role: 'user'
      };

      const response = await apiRequest('POST', '/api/auth/signin', finalData);
      
      if (response.ok) {
        toast({
          title: "Welcome to FinApp!",
          description: "Your profile has been created successfully. Welcome to the future of financial intelligence!",
        });
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to create profile');
      }
    } catch (error) {
      toast({
        title: "Sign-Up Failed",
        description: "There was an error creating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Join FinApp - Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-center">
            Create your comprehensive financial profile to unlock AI-powered insights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full ${
                  step >= num ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Basic Information + Social Login */}
          {step === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        type="text"
                        value={profileData.occupation || ''}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={profileData.preferredLanguage} onValueChange={(value) => handleInputChange('preferredLanguage', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="pl">Polish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Social Login Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Or Sign Up With</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {socialProviders.map((provider) => {
                      const IconComponent = provider.icon;
                      return (
                        <Button
                          key={provider.name}
                          variant="outline"
                          className={`${provider.color} text-white border-0`}
                          onClick={() => handleSocialSignUp(provider.name)}
                        >
                          <IconComponent className="mr-2 h-4 w-4" />
                          {provider.name}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Financial Information */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="income">Annual Income</Label>
                    <Select value={profileData.annualIncome} onValueChange={(value) => handleInputChange('annualIncome', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-30k">Under $30,000</SelectItem>
                        <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                        <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                        <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
                        <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                        <SelectItem value="150k-plus">$150,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expenses">Monthly Expenses</Label>
                    <Select value={profileData.monthlyExpenses} onValueChange={(value) => handleInputChange('monthlyExpenses', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-2k">Under $2,000</SelectItem>
                        <SelectItem value="2k-4k">$2,000 - $4,000</SelectItem>
                        <SelectItem value="4k-6k">$4,000 - $6,000</SelectItem>
                        <SelectItem value="6k-10k">$6,000 - $10,000</SelectItem>
                        <SelectItem value="10k-plus">$10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="risk">Risk Tolerance</Label>
                    <Select value={profileData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                        <SelectItem value="very-aggressive">Very Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Investment Experience</Label>
                    <Select value={profileData.investmentExperience} onValueChange={(value) => handleInputChange('investmentExperience', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="savings">Savings Goals</Label>
                  <Input
                    id="savings"
                    type="text"
                    value={profileData.savingsGoals || ''}
                    onChange={(e) => handleInputChange('savingsGoals', e.target.value)}
                    placeholder="e.g., $50,000 for emergency fund"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Financial Goals */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Financial Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Select your primary financial goals (choose multiple):</p>
                  <div className="grid grid-cols-2 gap-3">
                    {financialGoalsOptions.map((goal) => (
                      <Button
                        key={goal}
                        variant={selectedGoals.includes(goal) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGoalToggle(goal)}
                        className="justify-start"
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                  {selectedGoals.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Selected Goals:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedGoals.map((goal) => (
                          <Badge key={goal} variant="secondary">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            >
              {step > 1 ? 'Previous' : 'Cancel'}
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Creating...' : step === 3 ? 'Complete Profile' : 'Next Step'}
            </Button>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
            <Shield className="h-4 w-4" />
            Your data is encrypted and secure. We never share your personal information.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}