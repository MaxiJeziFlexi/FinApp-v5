import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect logic
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/signin');
      return;
    }

    // If onboarding is already completed, redirect based on role
    if (user && user.onboardingCompleted) {
      if (user.systemRole === 'ADMIN') {
        setLocation('/finapp-home');
      } else {
        setLocation('/chat');
      }
      return;
    }
  }, [user, isLoading, isAuthenticated, setLocation]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing your onboarding experience...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to continue with onboarding.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleOnboardingComplete = () => {
    // Update user auth to mark onboarding as completed
    const currentAuth = localStorage.getItem('finapp_user_auth');
    if (currentAuth) {
      try {
        const authData = JSON.parse(currentAuth);
        localStorage.setItem('finapp_user_auth', JSON.stringify({
          ...authData,
          onboardingCompleted: true
        }));
      } catch (e) {
        console.error('Failed to update auth data:', e);
      }
    }
    
    // Redirect based on user's system role
    if (user.systemRole === 'ADMIN') {
      setLocation('/admin');
    } else {
      setLocation('/chat');
    }
  };

  return (
    <div className="min-h-screen">
      <OnboardingWizard
        userId={user.id}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}