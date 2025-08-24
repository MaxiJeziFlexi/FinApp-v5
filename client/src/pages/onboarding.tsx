import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect logic
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin');
      return;
    }

    // If onboarding is already completed, redirect based on role
    if (user && user.onboardingCompleted) {
      if (user.systemRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
      return;
    }
  }, [user, isLoading, isAuthenticated, navigate]);

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
    // Redirect based on user's system role
    if (user.systemRole === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/chat');
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