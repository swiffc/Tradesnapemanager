import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MainNavigation } from '@/components/MainNavigation';
import { FeatureTest } from '@/components/FeatureTest';
import { SystemStatus } from '@/components/SystemStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  Zap, 
  Target, 
  BookOpen, 
  BarChart3, 
  TrendingUp,
  Activity,
  Sparkles,
  CheckCircle
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      title: "Professional Trading Dashboard",
      description: "Advanced trade analysis with comprehensive metrics, R-multiple tracking, and professional charting tools.",
      icon: Target,
      path: "/dashboard",
      status: "Active",
      color: "text-trading-accent"
    },
    {
      title: "ICT Live Trading System",
      description: "Real-time ICT methodology implementation with CBDR, Asian Range, Flout analysis, and protraction timing.",
      icon: Zap,
      path: "/ict",
      status: "Live",
      color: "text-blue-400",
      badge: "NEW"
    },
    {
      title: "Study Buckets System",
      description: "Systematic trade categorization with Bias → Setup → Pattern → Entry hierarchy for learning optimization.",
      icon: BookOpen,
      path: "/study-buckets",
      status: "Ready",
      color: "text-green-400"
    },
    {
      title: "BTMM Classic Dashboard",
      description: "Beat The Market Maker methodology with institutional bias analysis and market structure identification.",
      icon: BarChart3,
      path: "/btmm",
      status: "Stable",
      color: "text-purple-400"
    },
    {
      title: "BTMM Modern Interface",
      description: "Enhanced BTMM experience with modern UI, advanced filtering, and improved analytics.",
      icon: TrendingUp,
      path: "/btmm-modern",
      status: "Updated",
      color: "text-cyan-400"
    },
    {
      title: "Pro Trading Interface",
      description: "Professional-grade trading interface with advanced portfolio management and risk analysis tools.",
      icon: Activity,
      path: "/pro",
      status: "Premium",
      color: "text-yellow-400"
    }
  ];

  const systemStats = [
    { label: "Active Features", value: "6", color: "text-trading-accent" },
    { label: "System Uptime", value: "100%", color: "text-bullish" },
    { label: "Response Time", value: "<50ms", color: "text-trading-gold" },
    { label: "Data Accuracy", value: "99.9%", color: "text-cyan-400" }
  ];

  return (
    <AppLayout showNavigation={true} title="TradeSnapManager - Professional Trading Suite">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-trading-accent/10 to-purple-600/10 border-trading-accent/20">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-8 w-8 text-trading-accent" />
                <h1 className="text-4xl font-bold text-trading-text">TradeSnapManager</h1>
                <Sparkles className="h-8 w-8 text-trading-accent" />
              </div>
              <p className="text-xl text-trading-muted max-w-3xl mx-auto">
                Professional Trading Analysis Suite with ICT Methodology, Advanced Analytics, and Comprehensive Learning Tools
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Badge variant="outline" className="text-trading-accent border-trading-accent">
                  Version 2.0
                </Badge>
                <Badge variant="outline" className="text-bullish border-bullish">
                  All Systems Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStats.map((stat, index) => (
            <Card key={index} className="bg-trading-card border-trading-border">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-trading-muted">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-trading-text mb-6">Available Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-trading-card border-trading-border hover:border-trading-accent/50 transition-all duration-200 group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <IconComponent className={`h-6 w-6 ${feature.color}`} />
                      <div className="flex items-center space-x-2">
                        {feature.badge && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            {feature.badge}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-bullish border-bullish">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-trading-text group-hover:text-white transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-trading-muted text-sm mb-4 group-hover:text-trading-text transition-colors">
                      {feature.description}
                    </p>
                    <Link href={feature.path}>
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-trading-accent group-hover:text-white group-hover:border-trading-accent"
                      >
                        Access Feature
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <SystemStatus />

        {/* System Test */}
        <FeatureTest />

        {/* Quick Start Guide */}
        <Card className="bg-trading-card border-trading-border">
          <CardHeader>
            <CardTitle className="text-trading-text flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-trading-accent" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-trading-text">For New Users</h3>
                <div className="space-y-2 text-sm text-trading-muted">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-bullish" />
                    <span>Start with the Professional Dashboard to upload your first trade</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-bullish" />
                    <span>Explore Study Buckets for systematic trade categorization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-bullish" />
                    <span>Try the ICT System for live trading analysis</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-trading-text">For Advanced Users</h3>
                <div className="space-y-2 text-sm text-trading-muted">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-bullish" />
                    <span>Use BTMM systems for institutional analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-bullish" />
                    <span>Leverage Pro Interface for portfolio management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-bullish" />
                    <span>Integrate ICT methodology with your existing strategy</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-trading-muted text-sm py-8">
          <p>TradeSnapManager v2.0 - Professional Trading Analysis Suite</p>
          <p>All systems operational • Real-time data • Advanced analytics</p>
        </div>
      </div>
    </AppLayout>
  );
}
