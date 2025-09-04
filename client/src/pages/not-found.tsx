import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-trading-dark via-gray-900 to-trading-dark">
      <Card className="w-full max-w-md mx-4 bg-trading-card border-trading-border">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-trading-text mb-2">404</h1>
              <h2 className="text-xl font-semibold text-trading-text mb-4">Page Not Found</h2>
              <p className="text-trading-muted mb-6">
                This page doesn't exist. TradeSnapManager is now a single unified application.
              </p>
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-home mr-2"></i>
              Go to TradeSnapManager
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
