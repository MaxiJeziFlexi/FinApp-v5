import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/signin" component={MandatorySignIn} />
      <Route path="/finapp-home" component={FinAppHome} />
      <Route path="/crypto-marketplace" component={CryptoMarketplace} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/security" component={Security} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/learning-progress" component={LearningProgress} />
      <Route path="/test" component={ComprehensiveTest} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/ai-dashboard" component={AdvancedAIDashboard} />
      <Route component={NotFound} />
    </Switch>
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
