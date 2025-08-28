import { ProfessionalTradingDashboard } from "@/components/professional-trading-dashboard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  // The entire app now uses the professional trading dashboard
  return (
    <>
      <ProfessionalTradingDashboard />
      <Toaster />
    </>
  );
}