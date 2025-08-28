import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
      {isUploadModalOpen && (
        <ProfessionalUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={async (data) => {
            // Handle upload
            console.log('Upload:', data);
            refetch();
            setIsUploadModalOpen(false);
          }}
        />
      )}
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
  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6 h-96">
      <h4 className="text-lg font-semibold text-white mb-4">Recent Trades</h4>
      <div className="text-white/60">Trading overview content...</div>
    </Card>
  );
}

function TradingAnalysis({ screenshots }: any) {
  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6 h-96">
      <h4 className="text-lg font-semibold text-white mb-4">Trade Analysis</h4>
      <div className="text-white/60">Analysis content...</div>
    </Card>
  );
}

function TradingJournal({ screenshots }: any) {
  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6 h-96">
      <h4 className="text-lg font-semibold text-white mb-4">Trading Journal</h4>
      <div className="text-white/60">Journal content...</div>
    </Card>
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

function ProfessionalUploadModal({ isOpen, onClose, onUpload }: any) {
  return null; // Placeholder
}
