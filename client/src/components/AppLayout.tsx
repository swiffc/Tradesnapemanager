import React, { useState } from 'react';
import { MainNavigation } from './MainNavigation';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Menu, X, Settings, HelpCircle } from 'lucide-react';

export interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  title?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showNavigation = false,
  title 
}) => {
  const [isNavigationOpen, setIsNavigationOpen] = useState(showNavigation);

  const toggleNavigation = () => {
    setIsNavigationOpen(!isNavigationOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trading-dark via-gray-900 to-trading-dark">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-trading-card/95 backdrop-blur-sm border-b border-trading-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNavigation}
              className="text-trading-text hover:text-white hover:bg-trading-border/20"
            >
              {isNavigationOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {title && (
              <h1 className="text-xl font-semibold text-trading-text">{title}</h1>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-trading-accent border-trading-accent px-3 py-1">
              TradeSnapManager v2.0
            </Badge>
            <Button variant="ghost" size="sm" className="text-trading-text hover:text-white hover:bg-trading-border/20">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-trading-text hover:text-white hover:bg-trading-border/20">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Navigation Sidebar */}
        {isNavigationOpen && (
          <>
            {/* Mobile Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={toggleNavigation}
            />
            
            {/* Sidebar */}
            <div className="fixed left-0 top-20 w-80 max-w-[85vw] h-[calc(100vh-5rem)] bg-trading-card/98 backdrop-blur-md border-r border-trading-border overflow-y-auto z-40 shadow-2xl">
              <div className="p-4">
                <MainNavigation />
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isNavigationOpen ? 'md:ml-80 ml-0' : 'ml-0'}`}>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>

      {/* Quick Access Floating Button */}
      {!isNavigationOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={toggleNavigation}
            variant="default"
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl"
          >
            <Menu className="h-5 w-5 mr-2" />
            Menu
          </Button>
        </div>
      )}
    </div>
  );
};
