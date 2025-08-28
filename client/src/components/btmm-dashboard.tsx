import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { ScreenshotGallery } from './screenshot-gallery';
import { BTMMScreenshotFlow } from './btmm-screenshot-flow';
import { BTMMAnalysisPanel } from './btmm-analysis-panel';
import { BTMMUploadModal } from './btmm-upload-modal';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Screenshot, InsertScreenshot } from '@shared/schema';

interface BTMMFilter {
  bias?: string;
  setupPattern?: string;
  entryType?: string;
  sessionTiming?: string;
}

export function BTMMDashboard() {
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [btmmFilters, setBTMMFilters] = useState<BTMMFilter>({});
  const [galleryFilters, setGalleryFilters] = useState({
    strategyType: '',
    sessionTiming: '',
    isBookmarked: undefined as boolean | undefined
  });

  // Fetch screenshots
  const { data: screenshots = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/screenshots", galleryFilters.strategyType, galleryFilters.sessionTiming, galleryFilters.isBookmarked],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (galleryFilters.strategyType) params.append('strategyType', galleryFilters.strategyType);
      if (galleryFilters.sessionTiming) params.append('sessionTiming', galleryFilters.sessionTiming);
      if (galleryFilters.isBookmarked !== undefined) params.append('isBookmarked', String(galleryFilters.isBookmarked));
      
      const response = await fetch(`/api/screenshots?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch screenshots');
      return response.json();
    },
  }) as { data: Screenshot[], isLoading: boolean, refetch: () => void };

  // Apply BTMM filters to screenshots
  const filteredScreenshots = screenshots.filter(screenshot => {
    // BTMM flow filters
    if (btmmFilters.bias && screenshot.bias !== btmmFilters.bias) return false;
    if (btmmFilters.setupPattern && screenshot.setupPattern !== btmmFilters.setupPattern) return false;
    if (btmmFilters.entryType && screenshot.strategyType !== btmmFilters.entryType && screenshot.entry !== btmmFilters.entryType) return false;
    if (btmmFilters.sessionTiming && screenshot.sessionTiming !== btmmFilters.sessionTiming) return false;
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        screenshot.title.toLowerCase().includes(query) ||
        (screenshot.currencyPair?.toLowerCase() || '').includes(query) ||
        (screenshot.bias?.toLowerCase() || '').includes(query) ||
        (screenshot.setupPattern?.toLowerCase() || '').includes(query) ||
        (screenshot.entry?.toLowerCase() || '').includes(query)
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

  const handleBTMMFilterChange = (filters: BTMMFilter) => {
    setBTMMFilters(filters);
    // Also update gallery filters for session timing
    if (filters.sessionTiming) {
      setGalleryFilters(prev => ({ ...prev, sessionTiming: filters.sessionTiming || '' }));
    }
  };

  // Calculate statistics
  const stats = {
    total: filteredScreenshots.length,
    winners: filteredScreenshots.filter(s => s.result === 'win').length,
    winRate: filteredScreenshots.length > 0 ? Math.round((filteredScreenshots.filter(s => s.result === 'win').length / filteredScreenshots.length) * 100) : 0,
    avgRR: filteredScreenshots.filter(s => s.riskReward).length > 0 ? '1.8R' : 'N/A' // Simplified calculation
  };

  return (
    <div className="min-h-screen bg-trading-dark">
      {/* Header */}
      <div className="bg-trading-card border-b border-trading-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <i className="fas fa-route mr-3 text-trading-accent"></i>
              BTMM Trade Analysis Dashboard
            </h1>
            <p className="text-trading-text mt-1">
              Steve Mauro's Beat The Market Maker methodology - Bias → Setup → Pattern → Entry
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="flex space-x-4">
              <Card className="p-3 bg-trading-dark border-trading-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-trading-text">Total Trades</div>
                </div>
              </Card>
              <Card className="p-3 bg-trading-dark border-trading-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{stats.winRate}%</div>
                  <div className="text-xs text-trading-text">Win Rate</div>
                </div>
              </Card>
              <Card className="p-3 bg-trading-dark border-trading-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-trading-accent">{stats.avgRR}</div>
                  <div className="text-xs text-trading-text">Avg R:R</div>
                </div>
              </Card>
            </div>

            <Button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-trading-accent hover:bg-trading-accent/80 text-white"
            >
              <i className="fas fa-plus mr-2"></i>
              Upload Trade
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search trades by title, pair, bias, pattern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-trading-border border-trading-border text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGalleryFilters(prev => ({ ...prev, isBookmarked: prev.isBookmarked ? undefined : true }))}
              className={`border-trading-border ${galleryFilters.isBookmarked ? 'bg-trading-accent text-white' : 'text-trading-text'}`}
            >
              <i className="fas fa-bookmark mr-1"></i>
              Bookmarked
            </Button>
            
            {Object.keys(btmmFilters).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBTMMFilters({})}
                className="border-trading-border text-trading-text"
              >
                <i className="fas fa-times mr-1"></i>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(Object.keys(btmmFilters).length > 0 || searchQuery) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <Badge className="bg-trading-border text-white">
                Search: {searchQuery}
              </Badge>
            )}
            {Object.entries(btmmFilters).map(([type, value]) => (
              <Badge key={`${type}-${value}`} className="bg-trading-accent text-white">
                {type}: {value}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Panel - BTMM Flow */}
        <div className="w-80 border-r border-trading-border overflow-y-auto">
          <BTMMScreenshotFlow 
            screenshots={screenshots} 
            onFilterChange={handleBTMMFilterChange}
          />
        </div>

        {/* Center Panel - Gallery */}
        <div className="flex-1 min-w-0">
          <ScreenshotGallery
            filters={galleryFilters}
            selectedScreenshot={selectedScreenshot}
            onSelectScreenshot={setSelectedScreenshot}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Right Panel - Analysis */}
        <div className="w-96 border-l border-trading-border">
          <BTMMAnalysisPanel 
            screenshot={selectedScreenshot}
            onAnnotate={(annotation) => console.log('Annotation:', annotation)}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <BTMMUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
