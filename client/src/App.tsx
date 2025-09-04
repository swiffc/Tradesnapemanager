import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UnifiedTradeSnapManager } from "@/components/UnifiedTradeSnapManager";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <UnifiedTradeSnapManager />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
