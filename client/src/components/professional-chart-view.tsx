import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Screenshot } from '@shared/schema';

interface ProfessionalChartViewProps {
  screenshots: Screenshot[];
  selectedScreenshot: Screenshot | null;
  onSelectScreenshot: (screenshot: Screenshot) => void;
  viewMode: 'grid' | 'chart' | 'table';
  onViewModeChange: (mode: 'grid' | 'chart' | 'table') => void;
}

export function ProfessionalChartView({ 
  screenshots, 
  selectedScreenshot, 
  onSelectScreenshot,
  viewMode,
  onViewModeChange 
}: ProfessionalChartViewProps) {
  const [sortBy, setSortBy] = useState<'date' | 'performance' | 'pair' | 'session'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'winners' | 'losers' | 'pending'>('all');
  const [hoveredTrade, setHoveredTrade] = useState<string | null>(null);

  const filteredScreenshots = screenshots.filter(screenshot => {
    switch (filterBy) {
      case 'winners': return screenshot.result === 'win';
      case 'losers': return screenshot.result === 'loss';
      case 'pending': return !screenshot.result;
      default: return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime();
      case 'performance':
        const aR = parseFloat(a.riskReward?.replace(/[^-0-9.]/g, '') || '0');
        const bR = parseFloat(b.riskReward?.replace(/[^-0-9.]/g, '') || '0');
        return bR - aR;
      case 'pair':
        return (a.currencyPair || '').localeCompare(b.currencyPair || '');
      case 'session':
        return (a.sessionTiming || '').localeCompare(b.sessionTiming || '');
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between p-4 bg-[hsl(215,20%,16%)] rounded-lg border border-[hsl(215,15%,22%)]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-sm font-medium">View:</span>
            <div className="flex bg-[hsl(215,25%,11%)] rounded-lg p-1 border border-[hsl(215,15%,22%)]">
              {[
                { mode: 'grid', icon: 'fas fa-th-large', tooltip: 'Grid View' },
                { mode: 'chart', icon: 'fas fa-chart-line', tooltip: 'Chart View' },
                { mode: 'table', icon: 'fas fa-table', tooltip: 'Table View' }
              ].map((view) => (
                <button
                  key={view.mode}
                  onClick={() => onViewModeChange(view.mode as any)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === view.mode
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-[hsl(215,22%,14%)]'
                  }`}
                  title={view.tooltip}
                >
                  <i className={view.icon}></i>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-sm font-medium">Sort:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-32 bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)]">
                <SelectItem value="date" className="text-white">Date</SelectItem>
                <SelectItem value="performance" className="text-white">Performance</SelectItem>
                <SelectItem value="pair" className="text-white">Currency Pair</SelectItem>
                <SelectItem value="session" className="text-white">Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-sm font-medium">Filter:</span>
            <Select value={filterBy} onValueChange={(value) => setFilterBy(value as any)}>
              <SelectTrigger className="w-32 bg-[hsl(215,25%,11%)] border-[hsl(215,15%,22%)] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)]">
                <SelectItem value="all" className="text-white">All Trades</SelectItem>
                <SelectItem value="winners" className="text-green-400">Winners</SelectItem>
                <SelectItem value="losers" className="text-red-400">Losers</SelectItem>
                <SelectItem value="pending" className="text-yellow-400">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-white/60">
            Showing {filteredScreenshots.length} of {screenshots.length} trades
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
            <i className="fas fa-download mr-2"></i>
            Export
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'grid' && (
        <ProfessionalGridView 
          screenshots={filteredScreenshots}
          selectedScreenshot={selectedScreenshot}
          onSelectScreenshot={onSelectScreenshot}
          hoveredTrade={hoveredTrade}
          onHoverTrade={setHoveredTrade}
        />
      )}

      {viewMode === 'chart' && (
        <ProfessionalChartAnalysis screenshots={filteredScreenshots} />
      )}

      {viewMode === 'table' && (
        <ProfessionalTableView 
          screenshots={filteredScreenshots}
          selectedScreenshot={selectedScreenshot}
          onSelectScreenshot={onSelectScreenshot}
        />
      )}
    </div>
  );
}

// Professional Grid View
function ProfessionalGridView({ screenshots, selectedScreenshot, onSelectScreenshot, hoveredTrade, onHoverTrade }: {
  screenshots: Screenshot[];
  selectedScreenshot: Screenshot | null;
  onSelectScreenshot: (screenshot: Screenshot) => void;
  hoveredTrade: string | null;
  onHoverTrade: (id: string | null) => void;
}) {
  if (screenshots.length === 0) {
    return (
      <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-chart-line text-white text-3xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Trades Found</h3>
          <p className="text-white/60 mb-6">Start by uploading your first trading screenshot</p>
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
            <i className="fas fa-plus mr-2"></i>
            Upload First Trade
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {screenshots.map((screenshot, index) => (
        <TradeCard
          key={screenshot.id}
          screenshot={screenshot}
          isSelected={selectedScreenshot?.id === screenshot.id}
          isHovered={hoveredTrade === screenshot.id}
          onSelect={() => onSelectScreenshot(screenshot)}
          onHover={() => onHoverTrade(screenshot.id)}
          onLeave={() => onHoverTrade(null)}
          index={index}
        />
      ))}
    </div>
  );
}

// Professional Trade Card
function TradeCard({ screenshot, isSelected, isHovered, onSelect, onHover, onLeave, index }: {
  screenshot: Screenshot;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  index: number;
}) {
  const rValue = parseFloat(screenshot.riskReward?.replace(/[^-0-9.]/g, '') || '0');
  const isWinner = screenshot.result === 'win';
  const isLoser = screenshot.result === 'loss';

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 overflow-hidden ${
        isSelected 
          ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-2xl scale-105' 
          : 'bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] hover:border-[hsl(215,12%,25%)] hover:shadow-xl hover:scale-102'
      } ${isHovered ? 'shadow-2xl' : ''}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48">
        <img 
          src={screenshot.imagePath.startsWith('http') || screenshot.imagePath.startsWith('data:') 
            ? screenshot.imagePath 
            : `/objects/${screenshot.imagePath.replace('/objects/', '')}`}
          alt={screenshot.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Quick Action Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center space-x-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
            <i className="fas fa-eye"></i>
          </Button>
          <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
            <i className="fas fa-edit"></i>
          </Button>
          <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
            <i className="fas fa-share"></i>
          </Button>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {screenshot.bias && (
            <Badge className="bg-blue-500/80 text-white backdrop-blur-sm text-xs">
              {screenshot.bias}
            </Badge>
          )}
          {screenshot.sessionTiming && (
            <Badge className="bg-purple-500/80 text-white backdrop-blur-sm text-xs">
              {screenshot.sessionTiming}
            </Badge>
          )}
        </div>

        {/* Performance Badge */}
        <div className="absolute top-3 right-3">
          {screenshot.result && (
            <Badge className={`backdrop-blur-sm text-white text-xs ${
              isWinner ? 'bg-green-500/80' : isLoser ? 'bg-red-500/80' : 'bg-yellow-500/80'
            }`}>
              {isWinner ? (
                <><i className="fas fa-trophy mr-1"></i>Win</>
              ) : isLoser ? (
                <><i className="fas fa-times mr-1"></i>Loss</>
              ) : (
                <><i className="fas fa-clock mr-1"></i>Pending</>
              )}
            </Badge>
          )}
        </div>

        {/* R:R Badge */}
        {screenshot.riskReward && (
          <div className="absolute bottom-3 right-3">
            <Badge className={`backdrop-blur-sm text-white font-bold ${
              rValue > 0 ? 'bg-green-500/80' : rValue < 0 ? 'bg-red-500/80' : 'bg-gray-500/80'
            }`}>
              {screenshot.riskReward}
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {screenshot.title}
          </h4>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="font-mono">{screenshot.currencyPair}</span>
            <span>{new Date(screenshot.uploadedAt!).toLocaleDateString()}</span>
          </div>
        </div>

        {/* BTMM Flow Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {[
              { label: 'B', value: screenshot.bias, color: 'text-blue-400' },
              { label: 'S', value: screenshot.setupPattern, color: 'text-green-400' },
              { label: 'P', value: screenshot.strategyType, color: 'text-purple-400' },
              { label: 'E', value: screenshot.entry, color: 'text-orange-400' }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  item.value 
                    ? `${item.color} bg-current/20 border border-current/30` 
                    : 'text-white/30 bg-white/10 border border-white/20'
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-white/60 hover:text-white">
              <i className="fas fa-bookmark"></i>
            </Button>
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-white/60 hover:text-white">
              <i className="fas fa-ellipsis-v"></i>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Professional Chart Analysis
function ProfessionalChartAnalysis({ screenshots }: { screenshots: Screenshot[] }) {
  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] p-6">
      <h4 className="text-xl font-semibold text-white mb-6 flex items-center">
        <i className="fas fa-chart-area mr-3 text-blue-400"></i>
        Performance Chart Analysis
      </h4>
      
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-chart-line text-6xl text-white/20 mb-4"></i>
          <h5 className="text-lg font-semibold text-white mb-2">Advanced Charting</h5>
          <p className="text-white/60">Interactive performance charts coming soon</p>
        </div>
      </div>
    </Card>
  );
}

// Professional Table View
function ProfessionalTableView({ screenshots, selectedScreenshot, onSelectScreenshot }: {
  screenshots: Screenshot[];
  selectedScreenshot: Screenshot | null;
  onSelectScreenshot: (screenshot: Screenshot) => void;
}) {
  return (
    <Card className="bg-[hsl(215,20%,16%)] border-[hsl(215,15%,22%)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[hsl(215,25%,11%)] border-b border-[hsl(215,15%,22%)]">
            <tr>
              <th className="text-left py-4 px-6 text-white/80 font-semibold text-sm">Trade</th>
              <th className="text-left py-4 px-6 text-white/80 font-semibold text-sm">Pair</th>
              <th className="text-left py-4 px-6 text-white/80 font-semibold text-sm">Session</th>
              <th className="text-left py-4 px-6 text-white/80 font-semibold text-sm">BTMM Flow</th>
              <th className="text-left py-4 px-6 text-white/80 font-semibold text-sm">Result</th>
              <th className="text-left py-4 px-6 text-white/80 font-semibold text-sm">R:R</th>
              <th className="text-left py-4 px-6 text-white/80 font-semibold text-sm">Date</th>
              <th className="text-left py-4 px-6 text-white/80 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {screenshots.map((screenshot) => (
              <tr 
                key={screenshot.id}
                className={`border-b border-[hsl(215,15%,22%)] hover:bg-[hsl(215,22%,14%)] transition-colors cursor-pointer ${
                  selectedScreenshot?.id === screenshot.id ? 'bg-purple-500/20 border-purple-500/30' : ''
                }`}
                onClick={() => onSelectScreenshot(screenshot)}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={screenshot.imagePath} 
                      alt={screenshot.title}
                      className="w-12 h-12 rounded-lg object-cover border border-[hsl(215,15%,22%)]"
                    />
                    <div>
                      <div className="text-white font-medium text-sm">{screenshot.title}</div>
                      <div className="text-white/60 text-xs">ID: {screenshot.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-white font-mono text-sm">{screenshot.currencyPair}</span>
                </td>
                <td className="py-4 px-6">
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {screenshot.sessionTiming}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-1">
                    {[
                      { value: screenshot.bias, color: 'bg-blue-500' },
                      { value: screenshot.setupPattern, color: 'bg-green-500' },
                      { value: screenshot.strategyType, color: 'bg-purple-500' },
                      { value: screenshot.entry, color: 'bg-orange-500' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full ${item.value ? item.color : 'bg-white/20'}`}
                        title={item.value || 'Not set'}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-4 px-6">
                  {screenshot.result && (
                    <Badge className={`${
                      screenshot.result === 'win' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : screenshot.result === 'loss'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {screenshot.result.toUpperCase()}
                    </Badge>
                  )}
                </td>
                <td className="py-4 px-6">
                  {screenshot.riskReward && (
                    <span className={`font-mono text-sm font-bold ${
                      parseFloat(screenshot.riskReward.replace(/[^-0-9.]/g, '') || '0') > 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {screenshot.riskReward}
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className="text-white/60 text-sm">
                    {new Date(screenshot.uploadedAt!).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-white/60 hover:text-white">
                      <i className="fas fa-eye"></i>
                    </Button>
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-white/60 hover:text-white">
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-white/60 hover:text-white">
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
