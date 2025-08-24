import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import UserSideNav from '@/components/navigation/UserSideNav';
import ImprovedChatInterface from '@/components/chat/ImprovedChatInterface';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/signin');
      return;
    }

    // Redirect to onboarding if not completed
    if (user && !user.onboardingCompleted) {
      setLocation('/onboarding');
      return;
    }

    // Ensure USER role has access to chat
    if (user && user.systemRole !== 'USER' && user.systemRole !== 'ADMIN') {
      setLocation('/');
      return;
    }
  }, [user, isLoading, isAuthenticated, setLocation]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="h-screen flex">
        <div className="w-72 border-r bg-muted/30">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your chat interface...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check role access
  if (user.systemRole !== 'USER' && user.systemRole !== 'ADMIN') {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have access to the chat interface. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} transition-all duration-300 relative`}>
        <UserSideNav 
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          className="h-full"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4">
          <Card className="h-full p-6">
            <ImprovedChatInterface
              userId={user.id}
              advisorId="financial-advisor"
              sessionId={`session_${user.id}_chat`}
              onDataCollected={(data) => {
                // Handle data collection for analytics
                console.log('Chat data collected:', data);
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}