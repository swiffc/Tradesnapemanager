import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { Screenshot } from "@shared/schema";

interface ScreenshotGalleryProps {
  filters: {
    strategyType: string;
    sessionTiming: string;
    isBookmarked?: boolean;
  };
  selectedScreenshot: Screenshot | null;
  onSelectScreenshot: (screenshot: Screenshot) => void;
  isMobile?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const getStrategyBadgeColor = (strategyType: string | null) => {
  if (!strategyType) return "bg-gray-400";
  
  // BIAS subcategories
  if (["M", "A1", "A2", "W"].includes(strategyType)) return "bg-blue-500"; // MAAW pattern (upward bias)
  if (["W2", "V1", "V2", "M2"].includes(strategyType)) return "bg-purple-500"; // WVVM pattern (downward bias)
  if (strategyType === "ABS") return "bg-yellow-500"; // Asian Box Stacking
  if (strategyType === "3XADR") return "bg-red-500"; // 3X ADR
  if (["L1_13_50", "L2_50_200"].includes(strategyType)) return "bg-cyan-500"; // EMA Crossovers
  
  // SETUPS subcategories
  if (["BOX_SETUPS", "ANCHORS", "ASIAN_RANGE", "HARMONICS_P1", "RESET_SAFETY", "RESETS"].includes(strategyType)) return "bg-green-500";

  // PATTERNS subcategories
  if (["1H_50_50_BOUNCE", "2ND_LEG_HALF_BAT", "3_DRIVES_3_DAY", "3_HITS_TRADE", "HALF_BATS", "HEAD_SHOULDERS", "ID_50", "LONDON_PATTERNS", "TYPE1", "TYPE2", "TYPE3", "TYPE4", "W&M_PATTERNS"].includes(strategyType)) return "bg-purple-500";

  // ENTRYS subcategories
  if (["RAILROAD_TRACKS", "CORD_OF_WOODS", "EVENING_STAR", "MORNING_STAR", "SHIFT_CANDLE"].includes(strategyType)) return "bg-orange-500";

  // Legacy strategy levels
  if (strategyType === "BIAS") return "bg-blue-500";
  if (strategyType === "SETUPS") return "bg-green-500";
  if (strategyType === "PATTERNS") return "bg-purple-500";
  if (strategyType === "ENTRY'S") return "bg-orange-500";
  
  // Legacy numerical patterns
  if (strategyType.startsWith("1")) return "bg-bullish";
  if (strategyType.startsWith("2")) return "bg-trading-gold";
  if (strategyType.startsWith("3")) return "bg-trading-accent";
  if (strategyType.startsWith("4")) return "bg-orange-400";
  
  return "bg-gray-400";
};

const getResultBadgeColor = () => {
  return "bg-bullish text-white";
};

export function ScreenshotGallery({ filters, selectedScreenshot, onSelectScreenshot, isMobile = false, searchQuery = "", onSearchChange }: ScreenshotGalleryProps) {
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { data: screenshots = [], isLoading } = useQuery({
    queryKey: ["/api/screenshots", filters.strategyType, filters.sessionTiming, filters.isBookmarked],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.strategyType) params.append('strategyType', filters.strategyType);
      if (filters.sessionTiming) params.append('sessionTiming', filters.sessionTiming);
      if (filters.isBookmarked !== undefined) params.append('isBookmarked', String(filters.isBookmarked));
      
      const response = await fetch(`/api/screenshots?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch screenshots');
      return response.json();
    },
  }) as { data: Screenshot[], isLoading: boolean };

  const filteredScreenshots = screenshots.filter(screenshot => 
    screenshot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (screenshot.currencyPair?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (screenshot.strategyType?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col bg-trading-dark h-full">
        <div className="bg-trading-card border-b border-trading-border p-4">
          <h2 className="text-white font-semibold flex items-center">
            <i className="fas fa-images mr-2 text-trading-accent"></i>
            Screenshot Gallery
          </h2>
        </div>
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-trading-card rounded-lg border border-trading-border overflow-hidden animate-pulse">
                <div className="bg-trading-border h-32 w-full"></div>
                <div className="p-3">
                  <div className="bg-trading-border h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-trading-border h-3 w-1/2 mb-2 rounded"></div>
                  <div className="bg-trading-border h-3 w-1/4 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-trading-dark h-full border-r border-trading-border">
      {/* Gallery Header */}
      <div className={`bg-trading-card border-b border-trading-border ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-white font-semibold flex items-center ${isMobile ? 'text-base' : 'text-lg'} hover:text-trading-accent transition-colors duration-200 cursor-pointer group`}>
            <i className="fas fa-images mr-2 text-trading-accent animate-pulse group-hover:animate-bounce"></i>
            <span className="group-hover:scale-105 transition-transform duration-200">Screenshot Gallery</span>
          </h2>
          
          {!isMobile && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-trading-border rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'text-trading-accent bg-trading-dark shadow-lg transform scale-105' 
                      : 'text-trading-text hover:text-white hover:bg-trading-dark/50'
                  }`} 
                  data-testid="button-grid-view"
                  title="Grid View"
                  aria-label="Switch to grid view"
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'text-trading-accent bg-trading-dark shadow-lg transform scale-105' 
                      : 'text-trading-text hover:text-white hover:bg-trading-dark/50'
                  }`} 
                  data-testid="button-list-view"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-trading-border text-white border border-trading-border rounded-lg px-3 py-2 text-sm hover:border-trading-accent transition-colors duration-200"
                data-testid="select-sort"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="strategy">By Strategy Type</option>
                <option value="winrate">By Win Rate</option>
              </select>
            </div>
          )}
          
          {isMobile && (
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-trading-border text-white border border-trading-border rounded-lg px-2 py-1 text-sm hover:border-trading-accent transition-colors duration-200"
              data-testid="select-sort-mobile"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="strategy">By Strategy</option>
              <option value="winrate">By Win Rate</option>
            </select>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
        {/* Quick Stats Bar */}
        {filteredScreenshots.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-trading-card rounded-lg border border-trading-border">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-trading-text">Total: <span className="text-white font-semibold">{filteredScreenshots.length}</span></span>
              <span className="text-trading-text">Winners: <span className="text-bullish font-semibold">{filteredScreenshots.length}</span></span>
              <span className="text-trading-text">Win Rate: <span className="text-trading-accent font-semibold">100%</span></span>
            </div>
            {searchQuery && (
              <div className="flex items-center text-sm text-trading-text">
                <i className="fas fa-search mr-2"></i>
                Results for "{searchQuery}"
              </div>
            )}
          </div>
        )}
        
        {filteredScreenshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-trading-text animate-in fade-in-0 duration-500">
            <div className="relative mb-6">
              <i className={`fas fa-image ${isMobile ? 'text-4xl' : 'text-5xl'} mb-4 animate-pulse text-trading-accent`}></i>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-trading-gold to-trading-accent rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-purple-500/20">
                <i className="fas fa-plus text-white text-xs"></i>
              </div>
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-3 animate-in slide-in-from-top-4 duration-700 delay-200`}>
              No Screenshots Found
            </h3>
            <p className={`text-center ${isMobile ? 'text-sm' : 'text-base'} mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-300`}>
              Upload your first trading screenshot to get started
            </p>
            <div className="flex space-x-4 animate-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="flex items-center space-x-2 text-xs text-trading-text">
                <div className="w-2 h-2 bg-bullish rounded-full animate-pulse"></div>
                <span>Analyze Performance</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-trading-text">
                <div className="w-2 h-2 bg-trading-gold rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>Track Strategies</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-trading-text">
                <div className="w-2 h-2 bg-trading-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span>Build Expertise</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`grid ${
            isMobile 
              ? 'grid-cols-1 gap-3' 
              : viewMode === 'grid' 
                ? 'grid-cols-2 gap-4' 
                : 'grid-cols-1 gap-2'
          }`}>
            {filteredScreenshots.map((screenshot, index) => (
              <div 
                key={screenshot.id}
                className={`bg-gradient-to-br from-trading-card via-trading-card to-purple-900/10 rounded-lg border ${
                  selectedScreenshot?.id === screenshot.id 
                    ? 'border-trading-accent shadow-xl shadow-purple-500/30 transform scale-105' 
                    : 'border-trading-border'
                } overflow-hidden hover:border-trading-accent hover:shadow-xl hover:shadow-purple-500/20 hover:transform hover:scale-102 transition-all duration-300 cursor-pointer group animate-in fade-in-0 slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onSelectScreenshot(screenshot)}
                onMouseEnter={() => setHoveredCard(screenshot.id)}
                onMouseLeave={() => setHoveredCard(null)}
                data-testid={`card-screenshot-${screenshot.id}`}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={screenshot.imagePath.startsWith('http') || screenshot.imagePath.startsWith('data:') ? screenshot.imagePath : `/objects/${screenshot.imagePath.replace('/objects/', '')}`}
                    alt={screenshot.title}
                    className={`w-full ${isMobile ? 'h-48' : 'h-32'} object-cover transition-transform duration-500 ${
                      hoveredCard === screenshot.id ? 'transform scale-110' : ''
                    }`}
                    data-testid={`img-screenshot-${screenshot.id}`}
                  />
                  
                  {/* Hover overlay with quick actions */}
                  <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-3 transition-opacity duration-300 ${
                    hoveredCard === screenshot.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <button className="bg-gradient-to-r from-trading-accent to-purple-500 text-white p-2 rounded-full hover:scale-110 transition-transform duration-200 shadow-lg shadow-purple-500/30">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="bg-gradient-to-r from-trading-gold to-orange-500 text-white p-2 rounded-full hover:scale-110 transition-transform duration-200 shadow-lg shadow-orange-500/30">
                      <i className="fas fa-bookmark"></i>
                    </button>
                    <button className="bg-gradient-to-r from-bullish to-green-600 text-white p-2 rounded-full hover:scale-110 transition-transform duration-200 shadow-lg shadow-green-500/30">
                      <i className="fas fa-share"></i>
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`${getStrategyBadgeColor(screenshot.strategyType)} text-trading-dark ${isMobile ? 'text-xs' : 'text-xs'} px-2 py-1 rounded-full font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                      {screenshot.strategyType}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`${getResultBadgeColor()} ${isMobile ? 'text-xs' : 'text-xs'} px-2 py-1 rounded font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 animate-pulse`}>
                      +2R 🏆
                    </span>
                  </div>
                </div>
                <div className={`${isMobile ? 'p-4' : 'p-3'} transform transition-all duration-300 ${
                  hoveredCard === screenshot.id ? 'translate-y-[-2px]' : ''
                }`}>
                  <h4 className={`text-white font-medium ${isMobile ? 'text-base' : 'text-sm'} mb-1 hover:text-trading-accent transition-colors duration-200`} data-testid={`text-title-${screenshot.id}`}>
                    {screenshot.title}
                  </h4>
                  <p className={`text-trading-text ${isMobile ? 'text-sm' : 'text-xs'} mb-2 flex items-center space-x-2`}>
                    <span className="flex items-center space-x-1">
                      <i className="fas fa-clock text-trading-accent"></i>
                      <span>{screenshot.sessionTiming}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <i className="fas fa-coins text-trading-gold"></i>
                      <span>{screenshot.currencyPair}</span>
                    </span>
                  </p>
                  <div className={`flex items-center justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    <span className="text-trading-text flex items-center space-x-1">
                      <i className="fas fa-calendar text-trading-text"></i>
                      <span>{new Date(screenshot.uploadedAt!).toLocaleDateString()}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-bullish/20 px-2 py-1 rounded-full">
                        <i className="fas fa-trophy text-bullish animate-bounce"></i>
                        <span className="text-bullish font-semibold">Winner</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredScreenshots.length > 0 && screenshots.length >= 10 && (
          <div className="text-center mt-6">
            <button 
              className="bg-trading-border hover:bg-trading-accent hover:text-trading-dark text-trading-text px-6 py-3 rounded-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg group"
              data-testid="button-load-more"
            >
              <span className="flex items-center space-x-2">
                <span>Load More Screenshots</span>
                <i className="fas fa-chevron-down transition-transform duration-300 group-hover:translate-y-1"></i>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
