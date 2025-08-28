import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sidebar } from "@/components/sidebar";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { StudyMode } from "@/components/study-mode";
import { UploadModal } from "@/components/upload-modal";
import { ForexCalculator } from "@/components/forex-calculator";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { Screenshot } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);

  const handleScreenshotUpdate = (updatedScreenshot: Screenshot) => {
    setSelectedScreenshot(updatedScreenshot);
  };
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showForexCalculator, setShowForexCalculator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state (darkMode is always true and locked)
  const [settings, setSettings] = useState({
    darkMode: true, // Always true, not toggleable
    autoSave: true,
    showGridLines: false,
    defaultRisk: 2.0,
    defaultSession: ''
  });

  // Load settings from localStorage on startup
  useEffect(() => {
    const savedSettings = localStorage.getItem('trading-app-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Always force dark mode to true
        setSettings({ ...parsedSettings, darkMode: true });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);
  const [filters, setFilters] = useState({
    strategyType: "",
    sessionTiming: "",
    isBookmarked: undefined as boolean | undefined,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'gallery' | 'study'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  }) as { data: { total: number; thisWeek: number; winRate: number; } | undefined };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trading-dark via-purple-900/20 to-trading-dark text-white font-trading">
      {/* Header */}
      <header className="bg-gradient-to-r from-trading-card via-trading-card to-purple-900/20 border-b border-trading-border sticky top-0 z-40 shadow-lg shadow-purple-500/10 backdrop-blur-sm">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="px-3 py-2 hover:bg-trading-accent rounded-lg transition-colors md:hidden bg-trading-accent text-trading-dark font-semibold text-sm"
                data-testid="button-mobile-menu"
              >
                ☰ Menu
              </button>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-trading-accent to-trading-gold rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer group animate-float hover:animate-breathe shadow-lg shadow-purple-500/30">
                <i className="fas fa-chart-line text-white font-bold text-sm md:text-base group-hover:animate-wiggle"></i>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-trading-accent to-trading-gold bg-clip-text text-transparent">X-Vibz Trading</h1>
                <p className="text-trading-text text-xs md:text-sm hidden sm:block">Professional Screenshot & Analysis Tool</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-1 md:space-x-2 bg-trading-accent hover:bg-opacity-80 text-white px-3 md:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base hover:scale-110 hover:shadow-lg hover:shadow-trading-accent/30 group animate-glow animate-shimmer"
                data-testid="button-new-session"
              >
                <i className="fas fa-plus text-sm group-hover:rotate-180 transition-transform duration-300"></i>
                <span className="hidden sm:inline">New Session</span>
                <span className="sm:hidden">New</span>
                <i className="fas fa-sparkles text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
              </button>
              
              <div className={`hidden md:flex items-center space-x-2 bg-trading-card border rounded-lg px-3 py-2 transition-all duration-300 ${
                isSearchFocused ? 'border-trading-accent shadow-lg transform scale-105' : 'border-trading-border'
              }`}>
                <i className={`fas fa-search transition-colors duration-300 ${
                  isSearchFocused ? 'text-trading-accent' : 'text-trading-text'
                }`}></i>
                <input 
                  type="text" 
                  placeholder="Search screenshots, notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="bg-transparent text-white placeholder-trading-text border-none outline-none w-64 transition-all duration-200"
                  data-testid="input-search"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-trading-text hover:text-white transition-colors duration-200"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <Link href="/btmm">
                <button 
                  className="px-3 py-2 hover:bg-purple-500 rounded-lg transition-all duration-300 md:bg-transparent bg-purple-500/20 md:text-white text-white font-semibold text-sm hover:scale-105 hover:shadow-lg group"
                  title="BTMM Analysis - Steve Mauro Method"
                  data-testid="button-btmm-analysis"
                >
                  <span className="group-hover:animate-bounce">🎯</span> BTMM Analysis
                </button>
              </Link>
              
              <Link href="/pro">
                <button 
                  className="px-3 py-2 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 rounded-lg transition-all duration-300 md:bg-transparent bg-gradient-to-r from-purple-500/20 to-blue-500/20 md:text-white text-white font-semibold text-sm hover:scale-105 hover:shadow-lg group border border-purple-500/30"
                  title="Professional Trading Dashboard"
                  data-testid="button-pro-dashboard"
                >
                  <span className="group-hover:animate-pulse">⚡</span> Pro Dashboard
                </button>
              </Link>
              
              <Link href="/study-buckets">
                <button 
                  className="px-3 py-2 hover:bg-blue-500 rounded-lg transition-all duration-300 md:bg-transparent bg-blue-500/20 md:text-white text-white font-semibold text-sm hover:scale-105 hover:shadow-lg group"
                  title="Strategy Levels - 4-Step Trading Process"
                  data-testid="button-strategy-levels"
                >
                  <span className="group-hover:animate-bounce">📊</span> Strategy Levels
                </button>
              </Link>
              
              <button 
                onClick={() => setShowForexCalculator(true)}
                className="px-3 py-2 hover:bg-trading-gold rounded-lg transition-all duration-300 md:bg-transparent bg-trading-gold md:text-white text-white font-semibold text-sm hover:scale-105 hover:shadow-lg group animate-breathe"
                title="Forex Calculator"
                data-testid="button-forex-calculator"
              >
                <span className="group-hover:animate-spin">🧮</span> Calc
              </button>
              
              <button 
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 hover:bg-trading-border rounded-lg transition-all duration-300 md:bg-transparent bg-trading-border md:text-white text-white font-semibold text-sm hover:scale-105 hover:shadow-lg group"
                data-testid="button-settings"
              >
                <span className="group-hover:animate-spin">⚙️</span> Set
              </button>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          {isMobile && (
            <div className={`mt-3 flex items-center space-x-2 bg-trading-card border rounded-lg px-3 py-2 transition-all duration-300 ${
              isSearchFocused ? 'border-trading-accent shadow-lg' : 'border-trading-border'
            }`}>
              <i className={`fas fa-search transition-colors duration-300 ${
                isSearchFocused ? 'text-trading-accent' : 'text-trading-text'
              }`}></i>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="bg-transparent text-white placeholder-trading-text border-none outline-none flex-1"
                data-testid="input-search-mobile"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-trading-text hover:text-white transition-colors duration-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          )}
          
          {/* Mobile Navigation Tabs */}
          {isMobile && (
            <div className="mt-3 flex bg-trading-border rounded-lg p-1">
              <button 
                onClick={() => setCurrentView('gallery')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  currentView === 'gallery' 
                    ? 'bg-trading-accent text-trading-dark shadow-lg transform scale-105' 
                    : 'text-trading-text hover:text-white hover:bg-trading-border/50'
                }`}
                data-testid="tab-gallery"
              >
                <i className={`fas fa-images mr-2 ${currentView === 'gallery' ? 'animate-bounce' : ''}`}></i>
                Gallery
              </button>
              <button 
                onClick={() => setCurrentView('study')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  currentView === 'study' 
                    ? 'bg-trading-accent text-trading-dark shadow-lg transform scale-105' 
                    : 'text-trading-text hover:text-white hover:bg-trading-border/50'
                }`}
                data-testid="tab-study"
                disabled={!selectedScreenshot}
              >
                <i className={`fas fa-search-plus mr-2 ${currentView === 'study' ? 'animate-pulse' : ''}`}></i>
                Study
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-trading-card border-r border-trading-border z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-trading-border">
              <h3 className="text-white font-semibold">Filters & Options</h3>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="px-3 py-2 hover:bg-bearish rounded-lg transition-colors bg-bearish text-white font-semibold text-sm"
                data-testid="button-close-sidebar"
              >
                ✕ Close
              </button>
            </div>
            <Sidebar 
              stats={stats}
              filters={filters}
              onFiltersChange={setFilters}
              onUploadClick={() => {
                setShowUploadModal(true);
                setSidebarOpen(false);
              }}
              isMobile={true}
            />
          </div>
        </div>
      )}
      
      <div className={`${isMobile ? 'h-[calc(100vh-140px)]' : 'h-[calc(100vh-80px)]'} ${isMobile ? 'block' : 'flex'}`}>
        {!isMobile ? (
          /* Desktop Layout */
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="min-w-80">
              <Sidebar 
                stats={stats}
                filters={filters}
                onFiltersChange={setFilters}
                onUploadClick={() => setShowUploadModal(true)}
              />
            </ResizablePanel>
            
            <ResizableHandle className="w-1 bg-trading-border hover:bg-trading-accent transition-colors" />
            
            {/* Main Content */}
            <ResizablePanel defaultSize={80} minSize={60}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Screenshot Gallery */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <ScreenshotGallery 
                    filters={filters}
                    selectedScreenshot={selectedScreenshot}
                    onSelectScreenshot={(screenshot) => {
                      setSelectedScreenshot(screenshot);
                      if (isMobile) setCurrentView('study');
                    }}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isMobile={false}
                  />
                </ResizablePanel>
                
                <ResizableHandle className="w-1 bg-trading-border hover:bg-trading-accent transition-colors" />
                
                {/* Study Mode */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <StudyMode 
                    screenshot={selectedScreenshot} 
                    isMobile={false} 
                    onScreenshotUpdate={handleScreenshotUpdate}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* Mobile Layout */
          <div className="h-full">
            {currentView === 'gallery' ? (
              <ScreenshotGallery 
                filters={filters}
                selectedScreenshot={selectedScreenshot}
                onSelectScreenshot={(screenshot) => {
                  setSelectedScreenshot(screenshot);
                  setCurrentView('study');
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isMobile={true}
              />
            ) : (
              <StudyMode 
                screenshot={selectedScreenshot} 
                isMobile={true} 
                onScreenshotUpdate={handleScreenshotUpdate}
              />
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
      
      {/* Forex Calculator */}
      <ForexCalculator 
        isOpen={showForexCalculator}
        onClose={() => setShowForexCalculator(false)}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-trading-card via-trading-card to-purple-900/20 border border-trading-border rounded-xl max-w-md w-full shadow-2xl shadow-purple-500/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-trading-accent to-trading-gold bg-clip-text text-transparent flex items-center">
                  <i className="fas fa-cog mr-3 text-trading-accent animate-spin-slow"></i>
                  Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-trading-text hover:text-trading-accent transition-colors p-2 hover:bg-trading-border rounded-lg"
                  data-testid="button-close-settings"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-trading-border to-purple-900/20 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Application Settings</h3>
                  <p className="text-trading-text text-sm mb-4">Customize your trading analysis experience</p>
                  
                  <div className="space-y-3">
                    {/* Dark Mode is now always enabled and not toggleable */}
                    <div className="flex items-center justify-between p-3 bg-trading-accent/10 rounded-lg border border-trading-accent/30">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-moon text-trading-accent"></i>
                        <div>
                          <span className="text-white text-sm font-medium">Dark Mode</span>
                          <p className="text-trading-text text-xs">Always enabled for optimal trading experience</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-gradient-to-r from-trading-accent to-purple-500 flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Auto-save Screenshots</span>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 shadow-md ${
                          settings.autoSave ? 'bg-gradient-to-r from-trading-accent to-purple-500 justify-end shadow-purple-500/30' : 'bg-gray-600 justify-start'
                        }`}
                        data-testid="toggle-auto-save"
                      >
                        <div className="w-4 h-4 bg-white rounded-full transition-transform shadow-lg"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Show Grid Lines</span>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, showGridLines: !prev.showGridLines }))}
                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 shadow-md ${
                          settings.showGridLines ? 'bg-gradient-to-r from-trading-accent to-purple-500 justify-end shadow-purple-500/30' : 'bg-gray-600 justify-start'
                        }`}
                        data-testid="toggle-grid-lines"
                      >
                        <div className="w-4 h-4 bg-white rounded-full transition-transform shadow-lg"></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-trading-border to-purple-900/20 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Trading Preferences</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white text-sm block mb-1">Default Risk Percentage</label>
                      <input 
                        type="number" 
                        value={settings.defaultRisk}
                        onChange={(e) => setSettings(prev => ({ ...prev, defaultRisk: parseFloat(e.target.value) || 0 }))}
                        placeholder="2.0" 
                        step="0.1"
                        min="0.1"
                        max="10"
                        className="w-full bg-trading-card text-white border border-trading-border rounded px-3 py-2 text-sm focus:border-trading-accent focus:ring-1 focus:ring-trading-accent/50 transition-all duration-300"
                        data-testid="input-default-risk"
                      />
                    </div>
                    
                    <div>
                      <label className="text-white text-sm block mb-1">Default Session</label>
                      <select 
                        value={settings.defaultSession}
                        onChange={(e) => setSettings(prev => ({ ...prev, defaultSession: e.target.value }))}
                        className="w-full bg-trading-card text-white border border-trading-border rounded px-3 py-2 text-sm focus:border-trading-accent focus:ring-1 focus:ring-trading-accent/50 transition-all duration-300"
                        data-testid="select-default-session"
                      >
                        <option value="">Select default session</option>
                        <option value="london">London</option>
                        <option value="newyork">New York</option>
                        <option value="asian">Asian</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      const defaultSettings = {
                        darkMode: true, // Always true
                        autoSave: true,
                        showGridLines: false,
                        defaultRisk: 2.0,
                        defaultSession: ''
                      };
                      setSettings(defaultSettings);
                      toast({
                        title: "Settings Reset",
                        description: "All settings have been restored to defaults.",
                      });
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm shadow-lg hover:shadow-orange-500/30"
                    data-testid="button-reset-settings"
                  >
                    Reset to Defaults
                  </button>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        // Save settings to localStorage, always ensuring dark mode is true
                        const settingsToSave = { ...settings, darkMode: true };
                        localStorage.setItem('trading-app-settings', JSON.stringify(settingsToSave));
                        setShowSettings(false);
                        toast({
                          title: "Settings Saved",
                          description: "Your preferences have been saved successfully.",
                        });
                      }}
                      className="flex-1 bg-gradient-to-r from-trading-accent to-purple-500 hover:from-purple-500 hover:to-trading-accent text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                      data-testid="button-save-settings"
                    >
                      Save Settings
                    </button>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-3 text-trading-text hover:text-white hover:bg-trading-border rounded-lg transition-all duration-300"
                      data-testid="button-cancel-settings"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}
