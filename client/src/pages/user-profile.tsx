import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { User, Settings, CreditCard, Bell, Shield, Crown, Star, Zap } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface UserProfile {
  id: string;
  userId: string;
  financialGoal: string;
  timeframe: string;
  monthlyIncome: string;
  currentSavings?: string;
  targetAmount?: string;
  onboardingComplete: boolean;
  isPremium: boolean;
  progress: number;
  consents: any;
  financialData: any[];
  achievements: any[];
  learningStyle?: string;
  behaviorPatterns: any;
  riskTolerance?: string;
  financialLiteracyScore: number;
  engagementMetrics: any;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfile() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const userId = (user as UserType)?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    financialGoal: '',
    timeframe: '',
    monthlyIncome: '',
    currentSavings: '',
    targetAmount: '',
    learningStyle: '',
    riskTolerance: ''
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery<UserProfile>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID available');
      const response = await apiRequest('GET', `/api/user/profile/${userId}`);
      return response.json();
    },
    enabled: !!userId,
    retry: false,
  });

  // Create/Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/user/profile/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile', userId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        financialGoal: profile.financialGoal || '',
        timeframe: profile.timeframe || '',
        monthlyIncome: profile.monthlyIncome || '',
        currentSavings: profile.currentSavings || '',
        targetAmount: profile.targetAmount || '',
        learningStyle: profile.learningStyle || '',
        riskTolerance: profile.riskTolerance || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = () => {
    const profileData = {
      ...formData,
      onboardingComplete: true,
      progress: Math.max(70, profile?.progress || 0), // Increase progress when profile is updated
    };

    updateProfileMutation.mutate(profileData);
  };

  const getInitials = () => {
    if ((user as UserType)?.name) {
      return (user as UserType).name!.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    return (user as UserType)?.email ? (user as UserType).email!.substring(0, 2).toUpperCase() : 'US';
  };

  const getSubscriptionInfo = () => {
    switch ((user as UserType)?.subscriptionTier) {
      case 'pro':
        return {
          label: 'Pro',
          icon: <Crown className="w-4 h-4" />,
          color: 'bg-purple-600 text-white',
          description: 'Pro Plan - Advanced AI Features'
        };
      case 'premium':
        return {
          label: 'Premium',
          icon: <Star className="w-4 h-4" />,
          color: 'bg-amber-600 text-white',
          description: 'Premium Plan - Enhanced Learning'
        };
      case 'max':
        return {
          label: 'Max',
          icon: <Crown className="w-4 h-4" />,
          color: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
          description: 'Max Plan - Full Access'
        };
      default:
        return {
          label: 'Free',
          icon: <Zap className="w-4 h-4" />,
          color: 'bg-gray-500 text-white',
          description: 'Free Plan - Basic Features'
        };
    }
  };

  const subscriptionInfo = getSubscriptionInfo();

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account and financial preferences</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{(user as UserType)?.name || 'User'}</CardTitle>
                    <CardDescription>{(user as UserType)?.email}</CardDescription>
                    <div className="flex items-center mt-2">
                      <Badge className={subscriptionInfo.color}>
                        {subscriptionInfo.icon}
                        <span className="ml-1">{subscriptionInfo.label}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Account Status</Label>
                    <p className="text-sm text-muted-foreground capitalize">{(user as UserType)?.accountStatus || 'Active'}</p>
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <p className="text-sm text-muted-foreground">
                      {(user as UserType)?.createdAt ? new Date((user as UserType).createdAt!).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  <div>
                    <Label>Profile Completion</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={profile?.progress || 30} className="flex-1" />
                      <span className="text-sm">{profile?.progress || 30}%</span>
                    </div>
                  </div>
                  <div>
                    <Label>Financial Literacy Score</Label>
                    <p className="text-sm text-muted-foreground">{profile?.financialLiteracyScore || 0}/100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Profile</CardTitle>
                <CardDescription>Your financial goals and current situation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="financialGoal">Financial Goal</Label>
                    {isEditing ? (
                      <Select value={formData.financialGoal} onValueChange={(value) => setFormData({...formData, financialGoal: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                          <SelectItem value="debt_reduction">Debt Reduction</SelectItem>
                          <SelectItem value="home_purchase">Home Purchase</SelectItem>
                          <SelectItem value="retirement">Retirement</SelectItem>
                          <SelectItem value="investment">Investment Growth</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm capitalize">{profile?.financialGoal || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    {isEditing ? (
                      <Select value={formData.timeframe} onValueChange={(value) => setFormData({...formData, timeframe: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short-term (1-2 years)</SelectItem>
                          <SelectItem value="medium">Medium-term (3-5 years)</SelectItem>
                          <SelectItem value="long">Long-term (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm capitalize">{profile?.timeframe || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                    {isEditing ? (
                      <Select value={formData.monthlyIncome} onValueChange={(value) => setFormData({...formData, monthlyIncome: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Under $3,000</SelectItem>
                          <SelectItem value="medium">$3,000 - $6,000</SelectItem>
                          <SelectItem value="high">$6,000 - $10,000</SelectItem>
                          <SelectItem value="very_high">$10,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm capitalize">{profile?.monthlyIncome || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="currentSavings">Current Savings</Label>
                    {isEditing ? (
                      <Input
                        id="currentSavings"
                        value={formData.currentSavings}
                        onChange={(e) => setFormData({...formData, currentSavings: e.target.value})}
                        placeholder="e.g., $5,000"
                      />
                    ) : (
                      <p className="text-sm">{profile?.currentSavings || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    {isEditing ? (
                      <Input
                        id="targetAmount"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                        placeholder="e.g., $50,000"
                      />
                    ) : (
                      <p className="text-sm">{profile?.targetAmount || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                    {isEditing ? (
                      <Select value={formData.riskTolerance} onValueChange={(value) => setFormData({...formData, riskTolerance: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk tolerance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm capitalize">{profile?.riskTolerance || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="learningStyle">Preferred Learning Style</Label>
                  {isEditing ? (
                    <Select value={formData.learningStyle} onValueChange={(value) => setFormData({...formData, learningStyle: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select learning style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual Learner</SelectItem>
                        <SelectItem value="reading">Reading/Writing</SelectItem>
                        <SelectItem value="auditory">Auditory</SelectItem>
                        <SelectItem value="kinesthetic">Interactive/Hands-on</SelectItem>
                        <SelectItem value="mixed">Mixed Approach</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm capitalize">{profile?.learningStyle || 'Not set'}</p>
                  )}
                </div>

                {profile?.achievements && profile.achievements.length > 0 && (
                  <div>
                    <Label>Achievements</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.achievements.map((achievement: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {achievement.name || `Achievement ${index + 1}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>{subscriptionInfo.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {subscriptionInfo.icon}
                    <div>
                      <h3 className="font-semibold">{subscriptionInfo.label} Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {(user as UserType)?.role === 'admin' ? 'Administrator Account' : subscriptionInfo.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={subscriptionInfo.color}>
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>API Usage This Month</Label>
                    <p className="text-muted-foreground">{(user as UserType)?.apiUsageThisMonth || '0'} requests</p>
                  </div>
                  <div>
                    <Label>Email Verified</Label>
                    <p className="text-muted-foreground">{(user as UserType)?.emailVerified ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}