import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import StudyBucketsPage from "@/pages/study-buckets";
import NotFound from "@/pages/not-found";
import { BTMMDashboard } from "@/components/btmm-dashboard";
import { ModernBTMMDashboard } from "@/components/modern-btmm-dashboard";
import { ProfessionalTradingDashboard } from "@/components/professional-trading-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/study-buckets" component={StudyBucketsPage} />
      <Route path="/btmm" component={BTMMDashboard} />
      <Route path="/btmm-modern" component={ModernBTMMDashboard} />
      <Route path="/pro" component={ProfessionalTradingDashboard} />
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
