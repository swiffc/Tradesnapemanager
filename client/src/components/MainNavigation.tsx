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
    <div className={`${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center pb-4 border-b border-trading-border">
          <h2 className="text-xl font-bold text-trading-text mb-2">TradeSnapManager</h2>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="outline" className="text-trading-accent border-trading-accent text-xs">
              v2.0
            </Badge>
            <Badge variant="outline" className="text-bullish border-bullish text-xs">
              Live
            </Badge>
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-3">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={item.isActive ? "default" : "ghost"}
                    className={`
                      w-full justify-start p-3 h-auto
                      ${item.isActive 
                        ? "bg-trading-accent text-white shadow-lg" 
                        : "text-trading-text hover:bg-trading-border/20 hover:text-white"
                      }
                      transition-all duration-200
                    `}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs opacity-70 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-trading-border">
          <div className="text-center">
            <div className="text-lg font-bold text-trading-accent">6</div>
            <div className="text-xs text-trading-muted">Features</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-bullish">100%</div>
            <div className="text-xs text-trading-muted">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-trading-gold">Live</div>
            <div className="text-xs text-trading-muted">Status</div>
          </div>
        </div>

        {/* Feature Status */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-semibold text-trading-text">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-trading-muted">Dashboard</span>
              <Badge variant="outline" className="text-bullish border-bullish text-xs">Online</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-trading-muted">ICT System</span>
              <Badge variant="outline" className="text-bullish border-bullish text-xs">Live</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-trading-muted">Study Buckets</span>
              <Badge variant="outline" className="text-bullish border-bullish text-xs">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-trading-muted">BTMM Systems</span>
              <Badge variant="outline" className="text-bullish border-bullish text-xs">Ready</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
