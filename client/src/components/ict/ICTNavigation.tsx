import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';

export const ICTNavigation: React.FC = () => {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/study-buckets', label: 'Study Buckets', icon: '📚' },
    { path: '/pro', label: 'Trading Dashboard', icon: '📊' },
    { path: '/ict', label: 'ICT System', icon: '⚡', isNew: true },
    { path: '/btmm', label: 'BTMM', icon: '🎯' },
    { path: '/btmm-modern', label: 'Modern BTMM', icon: '🚀' },
  ];

  return (
    <Card className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">TradeSnapManager</h2>
            <Badge variant="outline" className="text-xs">v2.0</Badge>
          </div>
          
          <nav className="flex flex-wrap items-center gap-2">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant={location === item.path ? "default" : "ghost"}
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`relative ${
                  location === item.path 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                {item.isNew && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 text-xs px-1 animate-pulse"
                  >
                    NEW
                  </Badge>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </CardContent>
    </Card>
  );
};
