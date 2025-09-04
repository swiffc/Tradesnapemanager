import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { ProfessionalUploadModal } from './professional-upload-modal';
import { ICTTradingSystem } from './ict/ICTTradingSystem';
import { SystemStatus } from './SystemStatus';
import { 
  Upload, 
  Search, 
  Filter,
  BarChart3,
  Zap,
  Target,
  TrendingUp,
  Activity,
  BookOpen,
  Settings
} from 'lucide-react';
import type { Screenshot } from '@shared/schema';

export function UnifiedTradeSnapManager() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [activeTab, setActiveTab] = useState<'screenshots' | 'ict' | 'analysis' | 'system'>('screenshots');

  // Fetch screenshots
  const { data: screenshots = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/screenshots"],
    queryFn: async () => {
      const response = await fetch('/api/screenshots');
      if (!response.ok) throw new Error('Failed to fetch screenshots');
      return response.json();
    },
  }) as { data: Screenshot[], isLoading: boolean, refetch: () => void };

  // Filter screenshots based on search
  const filteredScreenshots = screenshots.filter(screenshot =>
    screenshot.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screenshot.bias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screenshot.setupPattern?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate trading metrics
  const metrics = React.useMemo(() => {
    const total = screenshots.length;
    const winners = screenshots.filter(s => s.result === 'win').length;
    const winRate = total > 0 ? (winners / total) * 100 : 0;
    
    const rMultiples = screenshots
      .filter(s => s.riskReward)
      .map(s => parseFloat(s.riskReward?.replace(/[^-0-9.]/g, '') || '0'));
    
    const totalR = rMultiples.reduce((sum, r) => sum + r, 0);
    const avgR = rMultiples.length > 0 ? totalR / rMultiples.length : 0;
    
    return { total, winners, winRate, avgR, totalR };
  }, [screenshots]);

  const handleUploadSuccess = () => {
    refetch();
    setIsUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trading-dark via-gray-900 to-trading-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-trading-card/95 backdrop-blur-sm border-b border-trading-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-trading-accent" />
              <h1 className="text-2xl font-bold text-trading-text">TradeSnapManager</h1>
              <Badge variant="outline" className="text-trading-accent border-trading-accent">
                Professional
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              variant="premium"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              New Trade
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-trading-card border-trading-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-trading-accent">{metrics.total}</div>
              <div className="text-xs text-trading-muted">Total Trades</div>
            </CardContent>
          </Card>
          <Card className="bg-trading-card border-trading-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-bullish">{metrics.winRate.toFixed(1)}%</div>
              <div className="text-xs text-trading-muted">Win Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-trading-card border-trading-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-trading-gold">{metrics.avgR.toFixed(2)}R</div>
              <div className="text-xs text-trading-muted">Avg R-Multiple</div>
            </CardContent>
          </Card>
          <Card className="bg-trading-card border-trading-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{metrics.totalR.toFixed(1)}R</div>
              <div className="text-xs text-trading-muted">Total R</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-trading-card border-trading-border">
            <TabsTrigger value="screenshots" className="data-[state=active]:bg-trading-accent">
              <Target className="h-4 w-4 mr-2" />
              Screenshots
            </TabsTrigger>
            <TabsTrigger value="ict" className="data-[state=active]:bg-trading-accent">
              <Zap className="h-4 w-4 mr-2" />
              ICT System
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-trading-accent">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-trading-accent">
              <Settings className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Screenshots Tab */}
          <TabsContent value="screenshots" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-trading-muted" />
                <Input
                  placeholder="Search trades by title, bias, pattern..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-trading-card border-trading-border text-trading-text"
                />
              </div>
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Screenshots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="bg-trading-card border-trading-border animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-48 bg-trading-border rounded mb-4"></div>
                      <div className="h-4 bg-trading-border rounded mb-2"></div>
                      <div className="h-3 bg-trading-border rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredScreenshots.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-24 h-24 bg-trading-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-12 w-12 text-trading-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-trading-text mb-2">No trades yet</h3>
                  <p className="text-trading-muted mb-4">Upload your first trade screenshot to get started</p>
                  <Button onClick={() => setIsUploadModalOpen(true)} variant="default">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Trade
                  </Button>
                </div>
              ) : (
                filteredScreenshots.map((screenshot) => (
                  <Card key={screenshot.id} className="bg-trading-card border-trading-border hover:border-trading-accent/50 transition-all group cursor-pointer">
                    <CardContent className="p-4">
                      {/* Screenshot Image */}
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={screenshot.imagePath}
                          alt={screenshot.title || 'Trade Screenshot'}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {screenshot.result && (
                          <Badge 
                            variant={screenshot.result === 'win' ? 'default' : 'destructive'}
                            className={`absolute top-2 right-2 ${
                              screenshot.result === 'win' ? 'bg-bullish' : 'bg-bearish'
                            }`}
                          >
                            {screenshot.result === 'win' ? '✓' : '✗'} {screenshot.result?.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      {/* Trade Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-trading-text truncate">
                          {screenshot.title || 'Untitled Trade'}
                        </h3>
                        
                        <div className="flex flex-wrap gap-1">
                          {screenshot.bias && (
                            <Badge variant="outline" className="text-xs">
                              {screenshot.bias}
                            </Badge>
                          )}
                          {screenshot.setupPattern && (
                            <Badge variant="outline" className="text-xs">
                              {screenshot.setupPattern}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-trading-muted">
                          <span>{new Date(screenshot.createdAt).toLocaleDateString()}</span>
                          {screenshot.riskReward && (
                            <span className="font-medium text-trading-accent">
                              {screenshot.riskReward}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="ict"
                          onClick={() => setSelectedScreenshot(screenshot)}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* ICT System Tab */}
          <TabsContent value="ict">
            <ICTTradingSystem />
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-trading-card border-trading-border">
                <CardHeader>
                  <CardTitle className="text-trading-text">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-trading-muted">Total Trades</span>
                      <span className="text-trading-text font-semibold">{metrics.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-trading-muted">Win Rate</span>
                      <span className={`font-semibold ${metrics.winRate >= 50 ? 'text-bullish' : 'text-bearish'}`}>
                        {metrics.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-trading-muted">Average R-Multiple</span>
                      <span className={`font-semibold ${metrics.avgR >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                        {metrics.avgR.toFixed(2)}R
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-trading-muted">Total R</span>
                      <span className={`font-semibold ${metrics.totalR >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                        {metrics.totalR.toFixed(1)}R
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-trading-card border-trading-border">
                <CardHeader>
                  <CardTitle className="text-trading-text">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {screenshots.slice(0, 5).map((screenshot) => (
                      <div key={screenshot.id} className="flex items-center space-x-3 p-2 bg-trading-border/10 rounded">
                        <div className="w-12 h-12 rounded overflow-hidden">
                          <img 
                            src={screenshot.imagePath} 
                            alt="Trade" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-trading-text">
                            {screenshot.title || 'Untitled Trade'}
                          </div>
                          <div className="text-xs text-trading-muted">
                            {new Date(screenshot.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {screenshot.result && (
                          <Badge 
                            variant={screenshot.result === 'win' ? 'default' : 'destructive'}
                            className={`text-xs ${
                              screenshot.result === 'win' ? 'bg-bullish' : 'bg-bearish'
                            }`}
                          >
                            {screenshot.result === 'win' ? 'Win' : 'Loss'}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <SystemStatus />
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <ProfessionalUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
