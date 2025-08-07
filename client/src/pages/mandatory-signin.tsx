import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Brain, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  DollarSign, 
  Target, 
  TrendingUp,
  Github,
  Shield,
  Globe,
  Smartphone,
  Chrome,
  Lock,
  ArrowRight,
  Calculator,
  Bitcoin,
  Users,
  Award,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import FloatingElements, { Card3D, Button3D } from '@/components/3d/FloatingElements';

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
  userType?: 'user' | 'admin';
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

export default function MandatorySignIn() {
  const [step, setStep] = useState(1);
  const [isSignUp, setIsSignUp] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    name: '',
    preferredLanguage: 'en',
    userType: 'user'
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

  const handleSocialSignUp = (provider: string) => {
    toast({
      title: "Social Authentication",
      description: `${provider} integration will be available soon. Please use email authentication for now.`,
    });
  };

  const handleAdminLogin = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/admin-signin', {
        email: profileData.email,
        name: profileData.name || 'Admin User',
        role: 'admin',
        userType: 'admin'
      });
      
      if (response.ok) {
        toast({
          title: "Admin Access Granted",
          description: "Welcome to FinApp Admin Dashboard!",
        });
        window.location.href = '/finapp-home?admin=true';
      } else {
        throw new Error('Admin authentication failed');
      }
    } catch (error) {
      toast({
        title: "Admin Login Failed",
        description: "Please check your admin credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const finalData = {
        ...profileData,
        financialGoals: selectedGoals,
        onboardingComplete: true,
        role: isAdminMode ? 'admin' : 'user',
        userType: isAdminMode ? 'admin' : 'user',
        termsAccepted: true,
        privacyAccepted: true,
        dataAnalyticsOptIn: true
      };

      // Use the correct endpoint for registration vs signin
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/signin';
      console.log('Submitting to endpoint:', endpoint, finalData);
      
      const response = await apiRequest('POST', endpoint, finalData);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Registration/signin successful:', result);
        
        toast({
          title: isSignUp ? "Welcome to FinApp!" : "Welcome Back!",
          description: isSignUp ? "Your profile has been created successfully!" : "Successfully signed in!",
        });
        
        // Small delay to show success message
        setTimeout(() => {
          window.location.href = '/finapp-home';
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.details || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      <FloatingElements />
      
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card3D className="w-full max-w-4xl">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white mr-3">
                  <Brain className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FinApp
                </h1>
              </div>
              <CardTitle className="text-2xl text-gray-900">
                {isAdminMode ? 'Admin Access Required' : 'Mandatory Profile Completion'}
              </CardTitle>
              <CardDescription>
                {isAdminMode 
                  ? 'Administrative access to FinApp platform' 
                  : 'Complete your profile to access AI-powered financial intelligence'
                }
              </CardDescription>
              
              {/* Progress Indicator */}
              {!isAdminMode && (
                <div className="flex justify-center space-x-2 mt-4">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className={`w-3 h-3 rounded-full ${
                        step >= num ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex justify-center space-x-2 mb-6">
                <Button
                  variant={!isAdminMode ? "default" : "outline"}
                  onClick={() => setIsAdminMode(false)}
                  size="sm"
                >
                  User Access
                </Button>
                <Button
                  variant={isAdminMode ? "default" : "outline"}
                  onClick={() => setIsAdminMode(true)}
                  size="sm"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Admin Access
                </Button>
              </div>

              {/* Admin Mode */}
              {isAdminMode && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center text-orange-800 mb-2">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="font-semibold">Administrative Access</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Admin access provides full platform control including user management, system analytics, and AI agent configuration.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admin-name">Admin Name</Label>
                      <Input
                        id="admin-name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Admin User"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="admin@finapp.com"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAdminLogin}
                    disabled={isLoading || !profileData.email}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold"
                  >
                    <Lock className="mr-2 h-5 w-5" />
                    {isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
                  </Button>
                </div>
              )}

              {/* User Mode - Step 1: Basic Information + Social Login */}
              {!isAdminMode && step === 1 && (
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

              {/* User Mode - Step 2: Financial Information */}
              {!isAdminMode && step === 2 && (
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
                  </CardContent>
                </Card>
              )}

              {/* User Mode - Step 3: Financial Goals */}
              {!isAdminMode && step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Financial Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Select your primary financial goals:</p>
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
              {!isAdminMode && (
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
                  >
                    {step > 1 ? 'Previous' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold"
                  >
                    {isLoading ? 'Processing...' : step === 3 ? 'Access FinApp' : 'Next Step'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                <Shield className="h-4 w-4" />
                Your data is encrypted and secure. Profile completion is mandatory for platform access.
              </div>
            </CardContent>
          </Card>
        </Card3D>
      </div>
    </div>
  );
}