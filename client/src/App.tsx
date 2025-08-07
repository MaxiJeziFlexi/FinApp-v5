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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/signin" component={SignIn} />
          <Route path="/checkout" component={Checkout} />
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

  // Show authenticated routes with navigation
  const noNavigationPages = ['/signin'];
  const showNavigation = !noNavigationPages.includes(location);

  return (
    <div className="flex min-h-screen">
      {showNavigation && <MainNavigation />}
      
      <main className={`flex-1 ${showNavigation ? 'md:ml-72' : ''}`}>
        <Switch>
          <Route path="/" component={FinAppHome} />
          <Route path="/finapp-home" component={FinAppHome} />
          <Route path="/crypto-marketplace" component={CryptoMarketplace} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/security" component={Security} />
          <Route path="/analytics" component={AnalyticsDashboard} />
          <Route path="/learning-progress" component={LearningProgress} />
          <Route path="/test" component={ComprehensiveTest} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/ai-dashboard" component={AdvancedAIDashboard} />
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
          <Route path="/admin-jarvis" component={AdminJarvis} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
