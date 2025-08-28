import { ProfessionalTradingDashboard } from "@/components/professional-trading-dashboard";
import { Toaster } from "@/components/ui/toaster";
import { Link } from "wouter";

export default function StudyBucketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(215,28%,8%)] via-[hsl(215,25%,10%)] to-[hsl(215,22%,12%)]">
      {/* Professional Header */}
      <div className="border-b border-[hsl(215,15%,22%)] bg-[hsl(215,20%,16%)] backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                  <i className="fas fa-arrow-left"></i>
                  <span>Back to Dashboard</span>
                </button>
              </Link>
              <div className="h-6 w-px bg-[hsl(215,15%,22%)]"></div>
              <h1 className="text-xl font-bold text-white">Strategy Levels</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-graduation-cap text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Study Buckets - Professional Mode</h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            The study buckets feature has been integrated into the professional dashboard. 
            Use the Analysis and Journal tabs for comprehensive trade study and review.
          </p>
          <Link href="/">
            <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
              <i className="fas fa-chart-line mr-2"></i>
              Go to Professional Dashboard
            </button>
          </Link>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}