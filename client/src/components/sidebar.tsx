import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SidebarProps {
  stats?: {
    total: number;
    thisWeek: number;
    winRate: number;
  };
  filters: {
    strategyType: string;
    sessionTiming: string;
    isBookmarked?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onUploadClick: () => void;
  isMobile?: boolean;
}

const strategyLevels = [
  {
    id: "BIAS",
    name: "1. BIAS",
    color: "text-blue-400",
    icon: "fas fa-brain",
    subcategories: [
      {
        id: "BEARISH_PATTERNS",
        name: "📉 Bearish Market Structure",
        isFolder: true,
        children: [
          { id: "M", name: "M - Reversal Level/Peak Formation High" },
          { id: "A1", name: "A1 - Stop Hunt High (Level 1)" },
          { id: "A2", name: "A2 - Stop Hunt Level 2" },
          { id: "W", name: "W - Level 3 Reversal Area (includes PFL)" },
        ]
      },
      {
        id: "BULLISH_PATTERNS", 
        name: "📈 Bullish Market Structure",
        isFolder: true,
        children: [
          { id: "W2", name: "W - Level 3 Reversal Area (includes PFH)" },
          { id: "V1", name: "V1 - Stop Hunt Low (Level 1)" },
          { id: "V2", name: "V2 - Stop Hunt Level 2" },
          { id: "M2", name: "M - Reversal Level/Peak Formation Low" },
        ]
      },
      {
        id: "BTMM_CYCLES",
        name: "⚡ BTMM Market Maker Cycles",
        isFolder: true,
        children: [
          { id: "MM_LEVEL_1", name: "MM Level 1 - Institutional Move (MA 13/50)" },
          { id: "MM_RESET_1", name: "MM Reset 1 - Correction Phase" },
          { id: "MM_LEVEL_2", name: "MM Level 2 - Retail Participation (MA 50/200)" },
          { id: "MM_RESET_2", name: "MM Reset 2 - Second Correction" },
          { id: "MM_LEVEL_3", name: "MM Level 3 - Market Maker Return (MA 50/800)" },
          { id: "PEAK_FORMATION", name: "Peak Formation - Last Level 3 Reference" },
        ]
      },
      {
        id: "RANGE_ANALYSIS",
        name: "📊 Range & Volatility Analysis", 
        isFolder: true,
        children: [
          { id: "ABS", name: "Asian Box Stacking" },
          { id: "3XADR", name: "3X ADR" },
        ]
      },
      {
        id: "EMA_LEVELS",
        name: "📈 EMA Crossover Levels",
        isFolder: true, 
        children: [
          { id: "L1_13_50", name: "13/50 Cross - Level 1 Confirmation" },
          { id: "L2_50_200", name: "50/200 Cross - Level 2 Confirmation" },
        ]
      }
    ],
  },
  {
    id: "SETUPS",
    name: "2. SETUP",
    color: "text-green-400",
    icon: "fas fa-target",
    subcategories: [
      { id: "ANCHORS", name: "Anchors" },
      { id: "ASIAN_RANGE", name: "Asian Range" },
      { id: "BOX_SETUPS", name: "Box Setups" },
      { id: "HARMONICS_P1", name: "Harmonics Part 1" },
      { id: "RESET_SAFETY", name: "Reset Safety Trades" },
      { id: "RESETS", name: "Resets" },
    ],
  },
  {
    id: "PATTERNS",
    name: "3. PATTERN",
    color: "text-purple-400",
    icon: "fas fa-chart-line",
    subcategories: [
      { id: "1H_50_50_BOUNCE", name: "1H 50/50 Bounce" },
      { id: "2ND_LEG_HALF_BAT", name: "2nd Leg Half Bat" },
      { id: "3_DRIVES_3_DAY", name: "3 Drives 3 Day" },
      { id: "3_HITS_TRADE", name: "3 Hits Trade" },
      { id: "HALF_BATS", name: "Half Bats" },
      { id: "HEAD_SHOULDERS", name: "Head & Shoulders" },
      { id: "ID_50", name: "ID 50" },
      { id: "LONDON_PATTERNS", name: "London Patterns" },
      { id: "TYPE1", name: "Type 1" },
      { id: "TYPE2", name: "Type 2" },
      { id: "TYPE3", name: "Type 3" },
      { id: "TYPE4", name: "Type 4" },
      { id: "W&M_PATTERNS", name: "W&M Patterns" },
    ],
  },
  {
    id: "ENTRY'S",
    name: "4. ENTRY'S",
    color: "text-orange-400",
    icon: "fas fa-map-pin",
    subcategories: [
      { id: "RAILROAD_TRACKS", name: "Railroad Tracks" },
      { id: "CORD_OF_WOODS", name: "Cord of Woods" },
      { id: "EVENING_STAR", name: "Evening Star" },
      { id: "MORNING_STAR", name: "Morning Star" },
      { id: "SHIFT_CANDLE", name: "Shift Candle" },
    ],
  },
];

const sessionTimings = [
  { id: "asian", name: "Asian Session (000-0800 HRS)" },
  { id: "asian_gap", name: "Asian Gap Time (1000-1100 HRS)" },
  { id: "london", name: "London Session (1100-1600 HRS)" },
  { id: "london_gap", name: "London Gap Time (1530-1630 HRS)" },
  { id: "newyork", name: "New York Session (1600-2000 HRS)" },
  { id: "brinks", name: "Brinks Timing (9:45 PM/3:45 AM/9:45 AM)" },
];

export function Sidebar({ stats, filters, onFiltersChange, onUploadClick, isMobile = false }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleClipboardPaste = async () => {
    // Check if clipboard API is supported
    if (!navigator.clipboard || !navigator.clipboard.read) {
      // Fallback for unsupported browsers (especially mobile)
      onUploadClick();
      return;
    }

    try {
      // Check clipboard permissions first
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      
      if (permission.state === 'denied') {
        onUploadClick();
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      console.log("Clipboard paste initiated");
      onUploadClick();
    } catch (error) {
      console.error("Clipboard access failed:", error);
      // Fallback to regular upload
      onUploadClick();
    }
  };

  return (
    <aside className="w-full bg-gradient-to-br from-trading-card via-trading-card to-purple-900/10 border-r border-trading-border flex-shrink-0 h-full shadow-xl shadow-purple-500/5">
      <div className={`${isMobile ? 'p-4' : 'p-6'} h-full overflow-y-auto space-y-6`}>
        {/* Upload Section */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <i className="fas fa-upload mr-2 text-trading-accent"></i>
            Quick Upload
          </h3>
          
          <div className="space-y-3">
            <button 
              onClick={handleClipboardPaste}
              className={`w-full bg-gradient-to-r from-trading-accent to-trading-gold text-white font-semibold ${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-4'} rounded-lg hover:opacity-90 transition-all flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30`}
              data-testid="button-paste-clipboard"
            >
              <i className="fas fa-clipboard mr-2"></i>
              {isMobile ? 'Quick Upload' : 'Paste from Clipboard'}
            </button>
            
            <button 
              onClick={onUploadClick}
              className={`w-full bg-gradient-to-r from-trading-border to-purple-800/30 hover:from-trading-accent/20 hover:to-purple-700/40 text-white ${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-4'} rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg`}
              data-testid="button-browse-files"
            >
              <i className="fas fa-folder-open mr-2"></i>
              Browse Files
            </button>
            
            <div 
              className="border-2 border-dashed border-trading-border rounded-lg p-4 text-center hover:border-trading-accent hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 bg-gradient-to-br from-transparent to-purple-900/5 group cursor-pointer"
              data-testid="dropzone-upload"
            >
              <i className="fas fa-cloud-upload-alt text-2xl text-trading-text mb-2 group-hover:text-trading-accent group-hover:animate-bounce transition-all duration-300"></i>
              <p className="text-trading-text text-sm group-hover:text-white transition-colors duration-300">Drag & drop images here</p>
            </div>
          </div>
        </div>

        {/* Strategy Level Dropdowns */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <i className="fas fa-layer-group mr-2 text-trading-accent"></i>
            Strategy Level Filter
          </h3>
          
          <div className="space-y-3">
            {/* BIAS Dropdown */}
            <div>
              <label className="text-blue-400 text-sm font-medium mb-2 block">🔵 1. BIAS</label>
              <Select value={filters.strategyType} onValueChange={(value) => onFiltersChange({ ...filters, strategyType: value })}>
                <SelectTrigger className="bg-trading-card text-white border-trading-border text-sm">
                  <SelectValue placeholder="Select BIAS Type" />
                </SelectTrigger>
                <SelectContent className="bg-trading-card border-trading-border text-white">
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs border-b border-trading-border bg-trading-card">📉 Bearish Market Structure</div>
                  {strategyLevels[0].subcategories[0] && 'children' in strategyLevels[0].subcategories[0] ? strategyLevels[0].subcategories[0].children?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {item.name}
                    </SelectItem>
                  )) : null}
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs border-b border-trading-border bg-trading-card">📈 Bullish Market Structure</div>
                  {strategyLevels[0].subcategories[1] && 'children' in strategyLevels[0].subcategories[1] ? strategyLevels[0].subcategories[1].children?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {item.name}
                    </SelectItem>
                  )) : null}
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs border-b border-trading-border bg-trading-card">⚡ BTMM Market Maker Cycles</div>
                  {strategyLevels[0].subcategories[2] && 'children' in strategyLevels[0].subcategories[2] ? strategyLevels[0].subcategories[2].children?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {item.name}
                    </SelectItem>
                  )) : null}
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs border-b border-trading-border bg-trading-card">📊 Range & Volatility</div>
                  {strategyLevels[0].subcategories[3] && 'children' in strategyLevels[0].subcategories[3] ? strategyLevels[0].subcategories[3].children?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {item.name}
                    </SelectItem>
                  )) : null}
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs border-b border-trading-border bg-trading-card">📈 EMA Crossover Levels</div>
                  {strategyLevels[0].subcategories[4] && 'children' in strategyLevels[0].subcategories[4] ? strategyLevels[0].subcategories[4].children?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {item.name}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>

            {/* SETUP Dropdown */}
            <div>
              <label className="text-green-400 text-sm font-medium mb-2 block">🟢 2. SETUP</label>
              <Select value={filters.strategyType} onValueChange={(value) => onFiltersChange({ ...filters, strategyType: value })}>
                <SelectTrigger className="bg-trading-card text-white border-trading-border text-sm">
                  <SelectValue placeholder="Select SETUP Type" />
                </SelectTrigger>
                <SelectContent className="bg-trading-card border-trading-border text-white">
                  {strategyLevels.find(level => level.id === "SETUPS")?.subcategories?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PATTERN Dropdown */}
            <div>
              <label className="text-purple-400 text-sm font-medium mb-2 block">🟣 3. PATTERN</label>
              <Select value={filters.strategyType} onValueChange={(value) => onFiltersChange({ ...filters, strategyType: value })}>
                <SelectTrigger className="bg-trading-card text-white border-trading-border text-sm">
                  <SelectValue placeholder="Select PATTERN Type" />
                </SelectTrigger>
                <SelectContent className="bg-trading-card border-trading-border text-white">
                  {strategyLevels.find(level => level.id === "PATTERNS")?.subcategories?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ENTRY'S Dropdown */}
            <div>
              <label className="text-orange-400 text-sm font-medium mb-2 block">🟠 4. ENTRY'S</label>
              <Select value={filters.strategyType} onValueChange={(value) => onFiltersChange({ ...filters, strategyType: value })}>
                <SelectTrigger className="bg-trading-card text-white border-trading-border text-sm">
                  <SelectValue placeholder="Select ENTRY Type" />
                </SelectTrigger>
                <SelectContent className="bg-trading-card border-trading-border text-white">
                  {strategyLevels.find(level => level.id === "ENTRY'S")?.subcategories?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filter Button */}
            <button
              onClick={() => onFiltersChange({ ...filters, strategyType: "" })}
              className="w-full py-2 px-3 bg-trading-border hover:bg-trading-accent hover:text-trading-dark text-white rounded-lg transition-colors text-sm"
              data-testid="button-clear-strategy-filter"
            >
              <i className="fas fa-times mr-2"></i>
              Clear Strategy Filter
            </button>
          </div>
        </div>

        {/* Session Timing Filter */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <i className="fas fa-clock mr-2 text-trading-accent"></i>
            Session Timing
          </h3>
          
          <div className="space-y-2">
            {sessionTimings.map((session) => (
              <label key={session.id} className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-trading-accent bg-trading-border border-trading-border rounded focus:ring-trading-accent"
                  checked={filters.sessionTiming === session.id}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    sessionTiming: e.target.checked ? session.id : ""
                  })}
                  data-testid={`checkbox-session-${session.id}`}
                />
                <span className="text-white">{session.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-trading-border to-trading-card rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Quick Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white">Total Screenshots:</span>
              <span className="text-white font-semibold" data-testid="stat-total">
                {stats?.total || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">This Week:</span>
              <span className="text-bullish font-semibold" data-testid="stat-thisweek">
                {stats?.thisWeek || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Win Rate:</span>
              <span className="text-trading-accent font-semibold" data-testid="stat-winrate">
                {stats?.winRate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
