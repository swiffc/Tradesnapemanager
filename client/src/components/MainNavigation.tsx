import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Zap,
  Activity,
  Target,
  PieChart
} from 'lucide-react';

export interface MainNavigationProps {
  className?: string;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ className }) => {
  const [location] = useLocation();

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Professional Trading Dashboard',
      isActive: location === '/dashboard'
    },
    {
      path: '/ict',
      label: 'ICT System',
      icon: Zap,
      description: 'Live Trading Decision System',
      isActive: location === '/ict',
      badge: 'NEW'
    },
    {
      path: '/study-buckets',
      label: 'Study Buckets',
      icon: BookOpen,
      description: 'Trade Analysis & Learning',
      isActive: location === '/study-buckets'
    },
    {
      path: '/btmm',
      label: 'BTMM Classic',
      icon: BarChart3,
      description: 'Beat The Market Maker',
      isActive: location === '/btmm'
    },
    {
      path: '/btmm-modern',
      label: 'BTMM Modern',
      icon: TrendingUp,
      description: 'Modern BTMM Interface',
      isActive: location === '/btmm-modern'
    },
    {
      path: '/pro',
      label: 'Pro Dashboard',
      icon: Target,
      description: 'Professional Trading Interface',
      isActive: location === '/pro'
    }
  ];

  return (
    <Card className={`bg-trading-card border-trading-border ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-trading-text">TradeSnapManager</h2>
            <Badge variant="outline" className="text-trading-accent border-trading-accent">
              v2.0
            </Badge>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={item.isActive ? "default" : "outline"}
                    className={`
                      w-full h-auto p-4 flex flex-col items-center space-y-2 
                      ${item.isActive 
                        ? "bg-trading-accent text-white" 
                        : "bg-trading-card border-trading-border text-trading-text hover:bg-trading-border hover:text-white"
                      }
                      transition-all duration-200
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-80 text-center">{item.description}</p>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-trading-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-trading-accent">6</div>
              <div className="text-xs text-trading-muted">Active Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-bullish">100%</div>
              <div className="text-xs text-trading-muted">Operational</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-trading-gold">Live</div>
              <div className="text-xs text-trading-muted">Status</div>
            </div>
          </div>

          {/* Feature Status */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold text-trading-text">System Status</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-trading-muted">Professional Dashboard</span>
                <Badge variant="outline" className="text-bullish border-bullish">Online</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-trading-muted">ICT Trading System</span>
                <Badge variant="outline" className="text-bullish border-bullish">Live</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-trading-muted">Study Buckets</span>
                <Badge variant="outline" className="text-bullish border-bullish">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-trading-muted">BTMM Systems</span>
                <Badge variant="outline" className="text-bullish border-bullish">Ready</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
