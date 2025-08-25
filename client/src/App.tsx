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
    const isAdmin = systemRole === 'ADMIN';

    console.log('🧭 Routing check:', {
      location,
      systemRole,
      onboardingCompleted,
      isAdmin
    });

    // Allow landing page for everyone - no redirects from landing page
    if (location === '/') {
      console.log('📍 On landing page - no redirect needed');
      return null;
    }

    // For ADMIN users - redirect to finapp-home if they're on signin/onboarding
    if (isAdmin) {
      console.log('👑 Admin user detected');
      if (location === '/signin' || location === '/onboarding') {
        console.log('➡️ Redirecting admin to finapp-home');
        return '/finapp-home';
      }
      console.log('✅ Admin - allowing access to:', location);
      return null;
    }

    // For USER role - check onboarding status
    if (systemRole === 'USER') {
      if (!onboardingCompleted) {
        console.log('🚀 User needs onboarding - current location:', location);
        // Allow access to onboarding and signin only
        if (location === '/onboarding' || location === '/signin') {
          console.log('✅ Allowing access to onboarding flow');
          return null;
        }
        // Redirect to onboarding for any other route
        console.log('➡️ Redirecting to onboarding');
        return '/onboarding';
      } else {
        console.log('✅ User onboarding completed - checking route access');
        // Onboarding completed - redirect away from onboarding/signin
        if (location === '/onboarding' || location === '/signin') {
          console.log('➡️ Redirecting completed user to chat');
          return '/chat';
        }
        // Block access to admin routes for regular users
        if (location.startsWith('/admin') || location.startsWith('/finapp-home')) {
          console.log('🚫 Blocking admin route access - redirecting to chat');
          return '/chat';
        }
      }
    }

    console.log('✅ No redirect needed');
    return null;
  };

  // Show public pages for unauthenticated users
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
          {/* All other routes redirect to landing page for unauthenticated users */}
          <Route component={() => { window.location.href = '/'; return null; }} />
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
  const isAdmin = systemRole === 'ADMIN';

  // Pages that don't need navigation
  const noNavigationPages = ['/signin', '/onboarding', '/', '/chat'];
  const showNavigation = !noNavigationPages.includes(location);

  // For USER role with incomplete onboarding
  if (systemRole === 'USER' && !onboardingCompleted) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/signin" component={SignIn} />
          <Route path="/onboarding" component={Onboarding} />
          <Route component={() => { window.location.href = '/onboarding'; return null; }} />
        </Switch>
      </div>
    );
  }

  // For USER role with completed onboarding - show limited navigation (chat only)
  if (systemRole === 'USER' && onboardingCompleted) {
    return (
      <div className="flex min-h-screen">
        {showNavigation && <MainNavigation />}

        <main className={`flex-1 ${showNavigation ? 'md:ml-80' : ''}`}>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/chat" component={Chat} />
            <Route path="/user-profile" component={UserProfile} />
            <Route path="/signin" component={SignIn} />
            {/* Redirect all other routes to chat for regular users */}
            <Route component={() => { window.location.href = '/chat'; return null; }} />
          </Switch>
        </main>
      </div>
    );
  }

  // For ADMIN role - show full navigation and all routes
  return (
    <div className="flex min-h-screen">
      {showNavigation && <MainNavigation />}

      <main className={`flex-1 ${showNavigation ? 'md:ml-72' : ''}`}>
        <Switch>
          {/* Landing page accessible by admin */}
          <Route path="/" component={Landing} />

          {/* Admin shell - main admin home */}
          <Route path="/finapp-home" component={FinAppHome} />

          {/* Admin routes */}
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin-jarvis" component={AdminJarvis} />
          <Route path="/admin-ai-control" component={AdvancedAIControlCenter} />
          <Route path="/developer-diagnostics" component={DeveloperDiagnostics} />

          {/* Shared routes accessible by admin */}
          <Route path="/chat" component={Chat} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/user-profile" component={UserProfile} />
          <Route path="/profile" component={UserProfile} />

          {/* FinApp feature routes */}
          <Route path="/ai-report-generator" component={AIReportGenerator} />
          <Route path="/investment-consultation" component={InvestmentConsultation} />
          <Route path="/tax-optimization" component={TaxOptimization} />
          <Route path="/retirement-planning" component={RetirementPlanning} />
          <Route path="/learning-hub" component={LearningHub} />
          <Route path="/community-discussions" component={CommunityDiscussions} />
          <Route path="/gaming" component={GamingHub} />
          <Route path="/enhanced-crypto" component={EnhancedCryptoMarketplace} />
          <Route path="/crypto-marketplace" component={CryptoMarketplace} />

          {/* Other admin accessible routes */}
          <Route path="/learning-progress" component={LearningProgress} />
          <Route path="/test" component={ComprehensiveTest} />
          <Route path="/upgrade" component={UpgradePage} />
          <Route path="/pricing" component={UpgradePage} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/security" component={Security} />
          <Route path="/analytics" component={AnalyticsDashboard} />

          {/* Default redirect for admin */}
          <Route component={() => { window.location.href = '/finapp-home'; return null; }} />
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