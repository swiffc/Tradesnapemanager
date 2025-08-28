import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ModernScreenshotFlow } from './modern-screenshot-flow';
import { ModernAnalysisPanel } from './modern-analysis-panel';
import { ModernUploadModal } from './modern-upload-modal';
import type { Screenshot, InsertScreenshot } from '@shared/schema';

interface BTMMFilter {
  bias?: string;
  setupPattern?: string;
  entryType?: string;
  sessionTiming?: string;
}

export function ModernBTMMDashboard() {
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [btmmFilters, setBTMMFilters] = useState<BTMMFilter>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch screenshots
  const { data: screenshots = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/screenshots"],
    queryFn: async () => {
      const response = await fetch('/api/screenshots');
      if (!response.ok) throw new Error('Failed to fetch screenshots');
      return response.json();
    },
  }) as { data: Screenshot[], isLoading: boolean, refetch: () => void };

  // Apply filters
  const filteredScreenshots = screenshots.filter(screenshot => {
    if (btmmFilters.bias && screenshot.bias !== btmmFilters.bias) return false;
    if (btmmFilters.setupPattern && screenshot.setupPattern !== btmmFilters.setupPattern) return false;
    if (btmmFilters.entryType && screenshot.entry !== btmmFilters.entryType) return false;
    if (btmmFilters.sessionTiming && screenshot.sessionTiming !== btmmFilters.sessionTiming) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        screenshot.title.toLowerCase().includes(query) ||
        (screenshot.currencyPair?.toLowerCase() || '').includes(query) ||
        (screenshot.bias?.toLowerCase() || '').includes(query) ||
        (screenshot.setupPattern?.toLowerCase() || '').includes(query)
      );
    }
    
    return true;
  });

  const handleUpload = async (data: InsertScreenshot & { file: File }) => {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('data', JSON.stringify(data));

      const response = await fetch('/api/screenshots', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      refetch();
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // Statistics
  const stats = {
    total: filteredScreenshots.length,
    winners: filteredScreenshots.filter(s => s.result === 'win').length,
    winRate: filteredScreenshots.length > 0 ? Math.round((filteredScreenshots.filter(s => s.result === 'win').length / filteredScreenshots.length) * 100) : 0,
    thisWeek: filteredScreenshots.filter(s => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(s.uploadedAt!) > weekAgo;
    }).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading BTMM Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-chart-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BTMM Analysis</h1>
                <p className="text-white/60 text-sm">Steve Mauro's Beat The Market Maker</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <i className="fas fa-plus mr-2"></i>
                Upload Trade
              </Button>
            </div>
          </div>

          {/* Search and Stats Bar */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  placeholder="Search trades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 bg-white/10 border-white/20 text-white placeholder-white/50 backdrop-blur-sm"
                />
                <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50"></i>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <i className={`fas ${viewMode === 'grid' ? 'fa-list' : 'fa-th-large'}`}></i>
                </Button>
              </div>
            </div>

            {/* Live Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-white/60">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.winRate}%</div>
                <div className="text-xs text-white/60">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.thisWeek}</div>
                <div className="text-xs text-white/60">This Week</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-180px)]">
        {/* Left Sidebar - BTMM Flow */}
        <div className="w-80 border-r border-white/10 bg-white/5 backdrop-blur-sm">
          <ModernScreenshotFlow 
            screenshots={filteredScreenshots} 
            onFilterChange={setBTMMFilters}
            activeFilters={btmmFilters}
          />
        </div>

        {/* Center Panel - Screenshot Gallery */}
        <div className="flex-1 bg-white/5 backdrop-blur-sm">
          <div className="h-full overflow-y-auto p-6">
            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-500">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-white data-[state=active]:bg-purple-500">
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-white data-[state=active]:bg-purple-500">
                  Performance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ModernScreenshotGallery 
                  screenshots={filteredScreenshots}
                  selectedScreenshot={selectedScreenshot}
                  onSelectScreenshot={setSelectedScreenshot}
                  viewMode={viewMode}
                />
              </TabsContent>

              <TabsContent value="analysis">
                <ModernBTMMAnalysis screenshots={filteredScreenshots} />
              </TabsContent>

              <TabsContent value="performance">
                <ModernPerformanceMetrics screenshots={filteredScreenshots} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Trade Analysis */}
        <div className="w-96 border-l border-white/10 bg-white/5 backdrop-blur-sm">
          <ModernAnalysisPanel 
            screenshot={selectedScreenshot}
            onAnnotate={(annotation) => console.log('Annotation:', annotation)}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <ModernUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}

// Modern Screenshot Gallery Component
function ModernScreenshotGallery({ screenshots, selectedScreenshot, onSelectScreenshot, viewMode }: {
  screenshots: Screenshot[];
  selectedScreenshot: Screenshot | null;
  onSelectScreenshot: (screenshot: Screenshot) => void;
  viewMode: 'grid' | 'list';
}) {
  if (screenshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-image text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No trades found</h3>
          <p className="text-white/60">Upload your first trade to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
        : 'grid-cols-1'
    }`}>
      {screenshots.map((screenshot, index) => (
        <Card 
          key={screenshot.id}
          className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            selectedScreenshot?.id === screenshot.id 
              ? 'ring-2 ring-purple-500 bg-white/20' 
              : 'bg-white/10 hover:bg-white/20'
          } backdrop-blur-sm border-white/20`}
          onClick={() => onSelectScreenshot(screenshot)}
        >
          <div className="relative overflow-hidden rounded-t-lg">
            <img 
              src={screenshot.imagePath}
              alt={screenshot.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {screenshot.bias && (
                <Badge className="bg-blue-500/80 text-white backdrop-blur-sm">
                  {screenshot.bias}
                </Badge>
              )}
              {screenshot.result === 'win' && (
                <Badge className="bg-green-500/80 text-white backdrop-blur-sm">
                  <i className="fas fa-trophy mr-1"></i>
                  Winner
                </Badge>
              )}
            </div>

            {/* R:R Badge */}
            {screenshot.riskReward && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-purple-500/80 text-white backdrop-blur-sm">
                  {screenshot.riskReward}
                </Badge>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-white font-semibold mb-2 line-clamp-2">{screenshot.title}</h3>
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{screenshot.currencyPair}</span>
              <span>{screenshot.sessionTiming}</span>
            </div>
            <div className="mt-2 text-xs text-white/50">
              {new Date(screenshot.uploadedAt!).toLocaleDateString()}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// BTMM Analysis Component
function ModernBTMMAnalysis({ screenshots }: { screenshots: Screenshot[] }) {
  const biasStats = screenshots.reduce((acc, s) => {
    if (s.bias) acc[s.bias] = (acc[s.bias] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Bias Distribution</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(biasStats).map(([bias, count]) => (
            <div key={bias} className="text-center p-4 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-sm text-white/60">{bias}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Performance Metrics Component
function ModernPerformanceMetrics({ screenshots }: { screenshots: Screenshot[] }) {
  const winners = screenshots.filter(s => s.result === 'win').length;
  const losers = screenshots.filter(s => s.result === 'loss').length;
  const winRate = screenshots.length > 0 ? (winners / screenshots.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Performance Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{winners}</div>
            <div className="text-sm text-white/60">Winners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{losers}</div>
            <div className="text-sm text-white/60">Losers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{winRate.toFixed(1)}%</div>
            <div className="text-sm text-white/60">Win Rate</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
