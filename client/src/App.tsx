import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MainNavigation from "@/components/navigation/MainNavigation";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import FinAppHome from "@/pages/finapp-home";
import Privacy from "@/pages/privacy";
import Security from "@/pages/security";
import AnalyticsDashboard from "@/pages/analytics-dashboard";

import LearningProgress from "@/pages/learning-progress";
import ComprehensiveTest from "@/pages/comprehensive-test";
import { AdminDashboard } from "@/pages/admin-dashboard";
import MandatorySignIn from "@/pages/mandatory-signin";
import CryptoMarketplace from "@/pages/crypto-marketplace";
import AdvancedAIDashboard from "@/pages/advanced-ai-dashboard";
import AdvancedAIControlCenter from "@/components/admin/AdvancedAIControlCenter";
import GamingHub from "@/pages/gaming-hub";
import EnhancedCryptoMarketplace from "@/pages/enhanced-crypto-marketplace";
import DeveloperDiagnostics from "@/pages/developer-diagnostics";
import SignIn from "@/pages/signin";
import Checkout from "@/pages/checkout";
import AdminLogin from "@/pages/admin-login";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Features from "@/pages/features";
import AIReportGenerator from "@/pages/ai-report-generator";
import InvestmentConsultation from "@/pages/investment-consultation";
import TaxOptimization from "@/pages/tax-optimization";
import RetirementPlanning from "@/pages/retirement-planning";
import LearningHub from "@/pages/learning-hub";
import CommunityDiscussions from "@/pages/community-discussions";
import UserProfile from "@/pages/user-profile";
import AdminJarvis from "@/pages/AdminJarvis";
import UpgradePage from "@/pages/upgrade";
import Onboarding from "@/pages/onboarding";
import Chat from "@/pages/chat";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { useHeatMapTracking } from "@/hooks/useHeatMapTracking";


function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  
  // Enable heat map tracking
  useHeatMapTracking();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Helper function to handle authenticated user redirects
  const getAuthenticatedRedirect = () => {
    const onboardingCompleted = (user as any)?.onboardingCompleted || false;
    const systemRole = (user as any)?.systemRole || 'USER';
    
    // For ADMIN users, allow access to admin routes
    if (systemRole === 'ADMIN') {
      return null; // No redirect needed, allow normal routing
    }
    
    // For USER role - check onboarding status
    if (!onboardingCompleted) {
      // Allow access to onboarding, signin, and landing
      if (location === '/onboarding' || location === '/signin' || location === '/') {
        return null;
      }
      // Redirect to onboarding for any other route
      return '/onboarding';
    } else {
      // Onboarding completed - redirect away from onboarding
      if (location === '/onboarding') {
        return '/chat';
      }
      // Redirect legacy dashboard routes to chat
      if (location === '/' || location === '/finapp-home' || location.startsWith('/dashboard')) {
        return '/chat';
      }
    }
    
    return null;
  };

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/signin" component={SignIn} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/upgrade" component={UpgradePage} />
          <Route path="/pricing" component={UpgradePage} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/features" component={Features} />
          <Route path="/security" component={Security} />
          <Route path="/mandatory-signin" component={MandatorySignIn} />
          <Route component={Landing} />
        </Switch>
      </div>
    );
  }

  // Check for redirects for authenticated users
  const redirectTo = getAuthenticatedRedirect();
  if (redirectTo) {
    // Use location.href for immediate redirect
    window.location.href = redirectTo;
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Show authenticated routes with navigation
  const systemRole = (user as any)?.systemRole || 'USER';
  const onboardingCompleted = (user as any)?.onboardingCompleted || false;
  
  // Pages that don't need navigation
  const noNavigationPages = ['/signin', '/onboarding'];
  const showNavigation = !noNavigationPages.includes(location);
  
  // For USER role with incomplete onboarding, only show onboarding
  if (systemRole === 'USER' && !onboardingCompleted) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/onboarding" component={Onboarding} />
          <Route component={() => { window.location.href = '/onboarding'; return null; }} />
        </Switch>
      </div>
    );
  }
  
  // For USER role with completed onboarding
  if (systemRole === 'USER' && onboardingCompleted) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/chat" component={Chat} />
          <Route path="/signin" component={SignIn} />
          <Route component={() => { window.location.href = '/chat'; return null; }} />
        </Switch>
      </div>
    );
  }

  // For ADMIN role - show full navigation and all routes
  return (
    <div className="flex min-h-screen">
      {showNavigation && <MainNavigation />}
      
      <main className={`flex-1 ${showNavigation ? 'md:ml-72' : ''}`}>
        <Switch>
          <Route path="/" component={FinAppHome} />
          <Route path="/finapp-home" component={FinAppHome} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/chat" component={Chat} />
          <Route path="/crypto-marketplace" component={CryptoMarketplace} />
          <Route path="/upgrade" component={UpgradePage} />
          <Route path="/pricing" component={UpgradePage} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/security" component={Security} />
          <Route path="/analytics" component={AnalyticsDashboard} />

          <Route path="/learning-progress" component={LearningProgress} />
          <Route path="/test" component={ComprehensiveTest} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin-jarvis" component={AdminJarvis} />
          <Route path="/admin-ai-control" component={AdvancedAIControlCenter} />

          <Route path="/gaming" component={GamingHub} />
          <Route path="/enhanced-crypto" component={EnhancedCryptoMarketplace} />
          <Route path="/developer-diagnostics" component={DeveloperDiagnostics} />
          <Route path="/ai-report-generator" component={AIReportGenerator} />
          <Route path="/investment-consultation" component={InvestmentConsultation} />
          <Route path="/tax-optimization" component={TaxOptimization} />
          <Route path="/retirement-planning" component={RetirementPlanning} />
          <Route path="/learning-hub" component={LearningHub} />
          <Route path="/community-discussions" component={CommunityDiscussions} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/user-profile" component={UserProfile} />

          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
