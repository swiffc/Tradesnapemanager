import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[hsl(215,28%,8%)] via-[hsl(215,25%,10%)] to-[hsl(215,22%,12%)]">
      <Card className="w-full max-w-md mx-4 bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)]">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">404</h1>
              <h2 className="text-xl font-semibold text-white/80 mb-4">Page Not Found</h2>
              <p className="text-white/60 mb-6">
                The trading page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <Link href="/">
              <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                <i className="fas fa-chart-line mr-2"></i>
                Back to Trading Dashboard
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
