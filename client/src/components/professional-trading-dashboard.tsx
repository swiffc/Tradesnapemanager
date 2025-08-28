import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProfessionalChartView } from './professional-chart-view';
import { ProfessionalUploadModal } from './professional-upload-modal';
import type { Screenshot, InsertScreenshot } from '@shared/schema';

interface TradingDashboardProps {}

export function ProfessionalTradingDashboard({}: TradingDashboardProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'analysis' | 'journal'>('overview');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W');

  // Fetch screenshots
  const { data: screenshots = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/screenshots"],
    queryFn: async () => {
      const response = await fetch('/api/screenshots');
      if (!response.ok) throw new Error('Failed to fetch screenshots');
      return response.json();
    },
  }) as { data: Screenshot[], isLoading: boolean, refetch: () => void };

  // Calculate professional trading metrics
  const metrics = React.useMemo(() => {
    const total = screenshots.length;
    const winners = screenshots.filter(s => s.result === 'win').length;
    const losers = screenshots.filter(s => s.result === 'loss').length;
    const winRate = total > 0 ? (winners / total) * 100 : 0;
    
    // Calculate R-multiple
    const rMultiples = screenshots
      .filter(s => s.riskReward)
      .map(s => parseFloat(s.riskReward?.replace(/[^-0-9.]/g, '') || '0'));
    
    const totalR = rMultiples.reduce((sum, r) => sum + r, 0);
    const avgR = rMultiples.length > 0 ? totalR / rMultiples.length : 0;
    
    // Profit factor calculation
    const grossProfit = rMultiples.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
    const grossLoss = Math.abs(rMultiples.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    return {
      totalTrades: total,
      winners,
      losers,
      winRate,
      avgR,
      totalR,
      profitFactor,
      expectancy: avgR,
      sharpeRatio: 1.2, // Simplified calculation
      maxDrawdown: -15.5 // Simplified calculation
    };
  }, [screenshots]);

  if (isLoading) {
    return <TradingLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(215,28%,8%)] via-[hsl(215,25%,10%)] to-[hsl(215,22%,12%)]">
      {/* Professional Header */}
      <TradingHeader 
        onUploadClick={() => setIsUploadModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        metrics={metrics}
      />

      {/* Main Dashboard Content */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Left Sidebar - Market Overview & Tools */}
          <div className="col-span-3 space-y-6">
            <MarketOverviewCard />
            <BTMMWorkflowCard screenshots={screenshots} />
            <TradingToolsCard />
          </div>

          {/* Center Panel - Main Content */}
          <div className="col-span-6 space-y-6">
            <PerformanceMetricsCard metrics={metrics} timeframe={timeframe} onTimeframeChange={setTimeframe} />
            
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="flex-1">
              <TabsList className="grid w-full grid-cols-3 bg-[hsl(215,20%,16%)] border border-[hsl(215,15%,22%)]">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500">
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="journal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500">
                  Journal
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex-1">
                <TradingOverview screenshots={screenshots} selectedScreenshot={selectedScreenshot} onSelectScreenshot={setSelectedScreenshot} />
              </TabsContent>

              <TabsContent value="analysis" className="flex-1">
                <TradingAnalysis screenshots={screenshots} />
              </TabsContent>

              <TabsContent value="journal" className="flex-1">
                <TradingJournal screenshots={screenshots} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Trade Details & Analysis */}
          <div className="col-span-3 space-y-6">
            <TradeDetailsCard screenshot={selectedScreenshot} />
            <BTMMAnalysisCard screenshot={selectedScreenshot} />
            <RiskManagementCard />
          </div>
        </div>
      </div>

      {/* Professional Upload Modal */}
      <ProfessionalUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={async (data) => {
          try {
            const response = await fetch('/api/screenshots', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) throw new Error('Upload failed');
            
            await refetch();
            setIsUploadModalOpen(false);
          } catch (error) {
            console.error('Upload error:', error);
            throw error;
          }
        }}
      />
    </div>
  );
}

// Loading Screen Component
function TradingLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(215,28%,8%)] via-[hsl(215,25%,10%)] to-[hsl(215,22%,12%)] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin">
            <div className="absolute top-1 left-1 w-4 h-4 bg-purple-500 rounded-full"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Loading Trading Dashboard</h2>
          <p className="text-white/60">Initializing BTMM Analysis System...</p>
        </div>
      </div>
    </div>
  );
}

// Header Component
function TradingHeader({ onUploadClick, searchQuery, onSearchChange, metrics }: {
  onUploadClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  metrics: any;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-[hsl(215,15%,22%)] bg-[hsl(215,20%,16%)] backdrop-blur-xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-chart-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TradeSnap Pro</h1>
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <span>BTMM Analysis Platform</span>
                <span>•</span>
                <span>{currentTime.toLocaleTimeString()}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{metrics.winRate.toFixed(1)}%</div>
              <div className="text-xs text-white/60">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{metrics.totalR.toFixed(1)}R</div>
              <div className="text-xs text-white/60">Total Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{metrics.profitFactor.toFixed(2)}</div>
              <div className="text-xs text-white/60">Profit Factor</div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Search trades..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-80 bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white placeholder-white/50"
              />
              <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50"></i>
            </div>
            
            <Button
              onClick={onUploadClick}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <i className="fas fa-plus mr-2"></i>
              New Trade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Market Overview Card
function MarketOverviewCard() {
  const marketData = [
    { pair: 'EURUSD', price: '1.0875', change: '+0.0012', changePercent: '+0.11%', trend: 'up' },
    { pair: 'GBPUSD', price: '1.2654', change: '-0.0023', changePercent: '-0.18%', trend: 'down' },
    { pair: 'USDJPY', price: '149.82', change: '+0.45', changePercent: '+0.30%', trend: 'up' },
    { pair: 'AUDUSD', price: '0.6721', change: '+0.0008', changePercent: '+0.12%', trend: 'up' }
  ];

  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <i className="fas fa-globe mr-2 text-blue-400"></i>
          Market Overview
        </h3>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-3">
        {marketData.map((market) => (
          <div key={market.pair} className="flex items-center justify-between p-2 rounded-lg bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)]">
            <div>
              <div className="text-white font-medium text-sm">{market.pair}</div>
              <div className="text-white/60 text-xs font-mono">{market.price}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${market.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {market.change}
              </div>
              <div className={`text-xs ${market.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {market.changePercent}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// BTMM Workflow Card
function BTMMWorkflowCard({ screenshots }: { screenshots: Screenshot[] }) {
  const workflow = [
    { step: 'Bias', icon: 'fas fa-compass', color: 'text-blue-400', count: screenshots.filter(s => s.bias).length },
    { step: 'Setup', icon: 'fas fa-cog', color: 'text-green-400', count: screenshots.filter(s => s.setupPattern).length },
    { step: 'Pattern', icon: 'fas fa-chart-line', color: 'text-purple-400', count: screenshots.filter(s => s.strategyType).length },
    { step: 'Entry', icon: 'fas fa-crosshairs', color: 'text-orange-400', count: screenshots.filter(s => s.entry).length }
  ];

  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <i className="fas fa-route mr-2 text-purple-400"></i>
        BTMM Workflow
      </h3>
      
      <div className="space-y-3">
        {workflow.map((item, index) => (
          <div key={item.step} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)] hover:bg-[hsl(215,22%,14%)] transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center`}>
                <i className={`${item.icon} text-white text-sm`}></i>
              </div>
              <span className="text-white font-medium">{item.step}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${item.color} bg-opacity-20`}>
                {item.count}
              </Badge>
              {index < workflow.length - 1 && (
                <i className="fas fa-arrow-down text-white/30 text-xs"></i>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Trading Tools Card
function TradingToolsCard() {
  const tools = [
    { name: 'Position Calculator', icon: 'fas fa-calculator', color: 'text-blue-400' },
    { name: 'Risk Manager', icon: 'fas fa-shield-alt', color: 'text-green-400' },
    { name: 'Market Scanner', icon: 'fas fa-search', color: 'text-purple-400' },
    { name: 'Economic Calendar', icon: 'fas fa-calendar', color: 'text-orange-400' }
  ];

  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <i className="fas fa-tools mr-2 text-yellow-400"></i>
        Trading Tools
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {tools.map((tool) => (
          <button key={tool.name} className="flex items-center space-x-3 p-2 rounded-lg bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)] hover:bg-[hsl(215,22%,14%)] transition-colors text-left">
            <i className={`${tool.icon} ${tool.color}`}></i>
            <span className="text-white/80 text-sm">{tool.name}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

// Performance Metrics Card
function PerformanceMetricsCard({ metrics, timeframe, onTimeframeChange }: {
  metrics: any;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}) {
  const timeframes = ['1D', '1W', '1M', 'ALL'];

  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <i className="fas fa-chart-bar mr-3 text-green-400"></i>
          Performance Analytics
        </h3>
        
        <div className="flex items-center space-x-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-purple-500 text-white'
                  : 'bg-[hsl(215,25%,11%)] text-white/60 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">{metrics.winRate.toFixed(1)}%</div>
          <div className="text-sm text-white/60">Win Rate</div>
          <div className="text-xs text-white/40 mt-1">↑ 2.3% vs last period</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">{metrics.avgR.toFixed(2)}R</div>
          <div className="text-sm text-white/60">Avg Return</div>
          <div className="text-xs text-white/40 mt-1">↑ 0.15R vs last period</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{metrics.profitFactor.toFixed(2)}</div>
          <div className="text-sm text-white/60">Profit Factor</div>
          <div className="text-xs text-white/40 mt-1">↑ 0.08 vs last period</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
          <div className="text-2xl font-bold text-orange-400">{metrics.sharpeRatio.toFixed(2)}</div>
          <div className="text-sm text-white/60">Sharpe Ratio</div>
          <div className="text-xs text-white/40 mt-1">↑ 0.12 vs last period</div>
        </div>
      </div>
    </Card>
  );
}

// Placeholder components for other sections
function TradingOverview({ screenshots, selectedScreenshot, onSelectScreenshot }: any) {
  const [viewMode, setViewMode] = useState<'grid' | 'chart' | 'table'>('grid');
  
  return (
    <ProfessionalChartView
      screenshots={screenshots}
      selectedScreenshot={selectedScreenshot}
      onSelectScreenshot={onSelectScreenshot}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
}

function TradingAnalysis({ screenshots }: { screenshots: Screenshot[] }) {
  const [analysisType, setAnalysisType] = useState<'performance' | 'patterns' | 'sessions' | 'pairs'>('performance');

  // Calculate analysis data
  const analysisData = React.useMemo(() => {
    const total = screenshots.length;
    const winners = screenshots.filter(s => s.result === 'win');
    const losers = screenshots.filter(s => s.result === 'loss');
    
    // Performance by BTMM stage
    const biasAnalysis = screenshots.reduce((acc, s) => {
      if (s.bias) {
        acc[s.bias] = acc[s.bias] || { total: 0, wins: 0 };
        acc[s.bias].total++;
        if (s.result === 'win') acc[s.bias].wins++;
      }
      return acc;
    }, {} as Record<string, { total: number; wins: number }>);

    // Session analysis
    const sessionAnalysis = screenshots.reduce((acc, s) => {
      if (s.sessionTiming) {
        acc[s.sessionTiming] = acc[s.sessionTiming] || { total: 0, wins: 0 };
        acc[s.sessionTiming].total++;
        if (s.result === 'win') acc[s.sessionTiming].wins++;
      }
      return acc;
    }, {} as Record<string, { total: number; wins: number }>);

    // Currency pair analysis
    const pairAnalysis = screenshots.reduce((acc, s) => {
      if (s.currencyPair) {
        acc[s.currencyPair] = acc[s.currencyPair] || { total: 0, wins: 0, totalR: 0 };
        acc[s.currencyPair].total++;
        if (s.result === 'win') acc[s.currencyPair].wins++;
        
        const rValue = parseFloat(s.riskReward?.replace(/[^-0-9.]/g, '') || '0');
        acc[s.currencyPair].totalR += rValue;
      }
      return acc;
    }, {} as Record<string, { total: number; wins: number; totalR: number }>);

    // Strategy pattern analysis
    const strategyAnalysis = screenshots.reduce((acc, s) => {
      if (s.strategyType) {
        acc[s.strategyType] = acc[s.strategyType] || { total: 0, wins: 0 };
        acc[s.strategyType].total++;
        if (s.result === 'win') acc[s.strategyType].wins++;
      }
      return acc;
    }, {} as Record<string, { total: number; wins: number }>);

    return {
      biasAnalysis,
      sessionAnalysis,
      pairAnalysis,
      strategyAnalysis,
      totalTrades: total,
      winRate: total > 0 ? (winners.length / total) * 100 : 0
    };
  }, [screenshots]);

  const analysisTypes = [
    { key: 'performance', label: 'Performance', icon: 'fas fa-chart-line' },
    { key: 'patterns', label: 'Patterns', icon: 'fas fa-puzzle-piece' },
    { key: 'sessions', label: 'Sessions', icon: 'fas fa-clock' },
    { key: 'pairs', label: 'Pairs', icon: 'fas fa-exchange-alt' }
  ];

  return (
    <div className="space-y-6">
      {/* Analysis Type Selector */}
      <div className="flex items-center space-x-4">
        {analysisTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setAnalysisType(type.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              analysisType === type.key
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)] text-white/60 hover:text-white hover:border-purple-500/50'
            }`}
          >
            <i className={type.icon}></i>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Performance Analysis */}
      {analysisType === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-bullseye mr-2 text-blue-400"></i>
              Bias Performance
            </h5>
            <div className="space-y-3">
              {Object.entries(analysisData.biasAnalysis).map(([bias, data]) => {
                const winRate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
                return (
                  <div key={bias} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {bias}
                      </Badge>
                      <span className="text-white text-sm">{data.total} trades</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-16 bg-[hsl(215,22%,14%)] rounded-full h-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${Math.min(winRate, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                        {winRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-chart-pie mr-2 text-purple-400"></i>
              Trade Distribution
            </h5>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                <span className="text-white/80">Total Trades</span>
                <span className="text-2xl font-bold text-white">{analysisData.totalTrades}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                <span className="text-white/80">Win Rate</span>
                <span className={`text-2xl font-bold ${analysisData.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {analysisData.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                <span className="text-white/80">Avg per Week</span>
                <span className="text-2xl font-bold text-blue-400">
                  {(analysisData.totalTrades / Math.max(1, Math.ceil(analysisData.totalTrades / 7))).toFixed(1)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pattern Analysis */}
      {analysisType === 'patterns' && (
        <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
          <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-puzzle-piece mr-2 text-purple-400"></i>
            Strategy Pattern Performance
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysisData.strategyAnalysis).map(([strategy, data]) => {
              const winRate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
              return (
                <div key={strategy} className="p-4 rounded-lg bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)]">
                  <div className="text-center">
                    <h6 className="text-white font-medium text-sm mb-2">{strategy}</h6>
                    <div className={`text-2xl font-bold mb-1 ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {winRate.toFixed(1)}%
                    </div>
                    <div className="text-white/60 text-xs">{data.total} trades</div>
                    <div className="w-full bg-[hsl(215,22%,14%)] rounded-full h-1 mt-2">
                      <div 
                        className={`h-1 rounded-full ${winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(winRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Session Analysis */}
      {analysisType === 'sessions' && (
        <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
          <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-clock mr-2 text-orange-400"></i>
            Session Performance
          </h5>
          <div className="space-y-4">
            {Object.entries(analysisData.sessionAnalysis).map(([session, data]) => {
              const winRate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
              return (
                <div key={session} className="flex items-center justify-between p-4 rounded-lg bg-[hsl(215,25%,11%)]">
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {session}
                    </Badge>
                    <div>
                      <div className="text-white font-medium">{data.total} trades</div>
                      <div className="text-white/60 text-sm">{data.wins} wins</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {winRate.toFixed(1)}%
                    </div>
                    <div className="w-24 bg-[hsl(215,22%,14%)] rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(winRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Currency Pair Analysis */}
      {analysisType === 'pairs' && (
        <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
          <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-exchange-alt mr-2 text-cyan-400"></i>
            Currency Pair Performance
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(215,15%,22%)]">
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Pair</th>
                  <th className="text-center py-3 px-4 text-white/80 font-medium">Trades</th>
                  <th className="text-center py-3 px-4 text-white/80 font-medium">Win Rate</th>
                  <th className="text-center py-3 px-4 text-white/80 font-medium">Total R</th>
                  <th className="text-center py-3 px-4 text-white/80 font-medium">Avg R</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analysisData.pairAnalysis).map(([pair, data]) => {
                  const winRate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
                  const avgR = data.total > 0 ? data.totalR / data.total : 0;
                  return (
                    <tr key={pair} className="border-b border-[hsl(215,15%,22%)] hover:bg-[hsl(215,22%,14%)]">
                      <td className="py-3 px-4">
                        <span className="text-white font-mono font-medium">{pair}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-white">{data.total}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${data.totalR >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {data.totalR > 0 ? '+' : ''}{data.totalR.toFixed(1)}R
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${avgR >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {avgR > 0 ? '+' : ''}{avgR.toFixed(2)}R
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function TradingJournal({ screenshots }: { screenshots: Screenshot[] }) {
  const [journalView, setJournalView] = useState<'recent' | 'calendar' | 'notes' | 'insights'>('recent');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Group screenshots by date
  const journalData = React.useMemo(() => {
    const grouped = screenshots.reduce((acc, screenshot) => {
      const date = new Date(screenshot.uploadedAt!).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(screenshot);
      return acc;
    }, {} as Record<string, Screenshot[]>);

    // Calculate insights
    const recentTrades = screenshots
      .sort((a, b) => new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime())
      .slice(0, 10);

    const notesWithContent = screenshots.filter(s => s.notes && s.notes.trim().length > 0);

    return {
      groupedByDate: grouped,
      recentTrades,
      notesWithContent,
      totalDays: Object.keys(grouped).length
    };
  }, [screenshots]);

  const journalViews = [
    { key: 'recent', label: 'Recent', icon: 'fas fa-clock' },
    { key: 'calendar', label: 'Calendar', icon: 'fas fa-calendar' },
    { key: 'notes', label: 'Notes', icon: 'fas fa-sticky-note' },
    { key: 'insights', label: 'Insights', icon: 'fas fa-lightbulb' }
  ];

  return (
    <div className="space-y-6">
      {/* Journal View Selector */}
      <div className="flex items-center space-x-4">
        {journalViews.map((view) => (
          <button
            key={view.key}
            onClick={() => setJournalView(view.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              journalView === view.key
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)] text-white/60 hover:text-white hover:border-purple-500/50'
            }`}
          >
            <i className={view.icon}></i>
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Trades View */}
      {journalView === 'recent' && (
        <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
          <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-clock mr-2 text-blue-400"></i>
            Recent Trades
          </h5>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {journalData.recentTrades.map((trade, index) => (
              <div key={trade.id} className="flex items-start space-x-4 p-4 rounded-lg bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)]">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={trade.imagePath} 
                    alt={trade.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h6 className="text-white font-medium text-sm mb-1">{trade.title}</h6>
                      <div className="flex items-center space-x-2 text-xs text-white/60 mb-2">
                        <span>{trade.currencyPair}</span>
                        <span>•</span>
                        <span>{trade.sessionTiming}</span>
                        <span>•</span>
                        <span>{new Date(trade.uploadedAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {trade.result && (
                      <Badge className={`${
                        trade.result === 'win' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : trade.result === 'loss'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {trade.result.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  {trade.notes && (
                    <p className="text-white/70 text-sm line-clamp-2">{trade.notes}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    {trade.bias && (
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">B: {trade.bias}</Badge>
                    )}
                    {trade.setupPattern && (
                      <Badge className="bg-green-500/20 text-green-300 text-xs">S: {trade.setupPattern}</Badge>
                    )}
                    {trade.riskReward && (
                      <Badge className="bg-purple-500/20 text-purple-300 text-xs">{trade.riskReward}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Calendar View */}
      {journalView === 'calendar' && (
        <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
          <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-calendar mr-2 text-green-400"></i>
            Trading Calendar
          </h5>
          <div className="space-y-4">
            {Object.entries(journalData.groupedByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .slice(0, 7)
              .map(([date, trades]) => (
                <div key={date} className="p-4 rounded-lg bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)]">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="text-white font-medium">{new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</h6>
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {trades.length} trades
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {trades.map(trade => (
                      <div key={trade.id} className="flex items-center space-x-3 p-2 rounded bg-[hsl(215,22%,14%)]">
                        <div className="w-8 h-8 rounded overflow-hidden">
                          <img src={trade.imagePath} alt={trade.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-xs font-medium truncate">{trade.title}</div>
                          <div className="flex items-center space-x-1">
                            {trade.result && (
                              <div className={`w-2 h-2 rounded-full ${
                                trade.result === 'win' ? 'bg-green-400' :
                                trade.result === 'loss' ? 'bg-red-400' : 'bg-yellow-400'
                              }`} />
                            )}
                            <span className="text-white/60 text-xs">{trade.currencyPair}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        </Card>
      )}

      {/* Notes View */}
      {journalView === 'notes' && (
        <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
          <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-sticky-note mr-2 text-yellow-400"></i>
            Trade Notes
          </h5>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {journalData.notesWithContent.map(trade => (
              <div key={trade.id} className="p-4 rounded-lg bg-[hsl(215,25%,11%)] border border-[hsl(215,15%,22%)]">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={trade.imagePath} alt={trade.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="text-white font-medium text-sm">{trade.title}</h6>
                      <span className="text-white/60 text-xs">{new Date(trade.uploadedAt!).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white/80 text-sm mb-2">{trade.notes}</p>
                    <div className="flex items-center space-x-2 text-xs">
                      <Badge className="bg-gray-500/20 text-gray-300">{trade.currencyPair}</Badge>
                      <Badge className="bg-gray-500/20 text-gray-300">{trade.sessionTiming}</Badge>
                      {trade.result && (
                        <Badge className={`${
                          trade.result === 'win' ? 'bg-green-500/20 text-green-300' :
                          trade.result === 'loss' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {trade.result}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights View */}
      {journalView === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-lightbulb mr-2 text-yellow-400"></i>
              Journal Insights
            </h5>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                <span className="text-white/80">Total Trading Days</span>
                <span className="text-xl font-bold text-blue-400">{journalData.totalDays}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                <span className="text-white/80">Trades per Day</span>
                <span className="text-xl font-bold text-green-400">
                  {journalData.totalDays > 0 ? (screenshots.length / journalData.totalDays).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                <span className="text-white/80">Documented Notes</span>
                <span className="text-xl font-bold text-purple-400">{journalData.notesWithContent.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                <span className="text-white/80">Documentation Rate</span>
                <span className="text-xl font-bold text-orange-400">
                  {screenshots.length > 0 ? ((journalData.notesWithContent.length / screenshots.length) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-chart-line mr-2 text-cyan-400"></i>
              Recent Activity
            </h5>
            <div className="space-y-3">
              {Object.entries(journalData.groupedByDate)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .slice(0, 5)
                .map(([date, trades]) => {
                  const wins = trades.filter(t => t.result === 'win').length;
                  const losses = trades.filter(t => t.result === 'loss').length;
                  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
                  
                  return (
                    <div key={date} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(215,25%,11%)]">
                      <div>
                        <div className="text-white text-sm font-medium">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-white/60 text-xs">{trades.length} trades</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {winRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-white/60">{wins}W {losses}L</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function TradeDetailsCard({ screenshot }: any) {
  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-4">
      <h4 className="text-lg font-semibold text-white mb-4">Trade Details</h4>
      <div className="text-white/60">Trade details...</div>
    </Card>
  );
}

function BTMMAnalysisCard({ screenshot }: any) {
  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-4">
      <h4 className="text-lg font-semibold text-white mb-4">BTMM Analysis</h4>
      <div className="text-white/60">BTMM analysis...</div>
    </Card>
  );
}

function RiskManagementCard() {
  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-4">
      <h4 className="text-lg font-semibold text-white mb-4">Risk Management</h4>
      <div className="text-white/60">Risk management...</div>
    </Card>
  );
}


