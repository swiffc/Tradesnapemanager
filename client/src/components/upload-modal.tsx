import { useState, useRef } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 4-Level Strategy System: BIAS, SETUP, PATTERN, ENTRY'S
const strategyTypes = [
  // BIAS Level (Level 1) - Market Direction Analysis
  
  // MAAW Pattern (Bearish Market Structure)
  { category: "BIAS", value: "M", label: "🔵 BIAS: M - Reversal Level/Peak Formation High" },
  { category: "BIAS", value: "A1", label: "🔵 BIAS: A1 - Stop Hunt High (Level 1)" },
  { category: "BIAS", value: "A2", label: "🔵 BIAS: A2 - Stop Hunt Level 2" },
  { category: "BIAS", value: "W", label: "🔵 BIAS: W - Level 3 Reversal Area (PFL)" },
  
  // WVVM Pattern (Bullish Market Structure)
  { category: "BIAS", value: "V1", label: "🔵 BIAS: V1 - Stop Hunt Low (Level 1)" },
  { category: "BIAS", value: "V2", label: "🔵 BIAS: V2 - Stop Hunt Level 2" },
  { category: "BIAS", value: "W2", label: "🔵 BIAS: W - Level 3 Reversal Area (PFH)" },
  { category: "BIAS", value: "M2", label: "🔵 BIAS: M - Reversal Level/Peak Formation Low" },
  
  // BTMM Market Maker Cycles
  { category: "BIAS", value: "MM_LEVEL_1", label: "🔵 BIAS: MM Level 1 - Institutional Move (MA 13/50)" },
  { category: "BIAS", value: "MM_RESET_1", label: "🔵 BIAS: MM Reset 1 - Correction Phase" },
  { category: "BIAS", value: "MM_LEVEL_2", label: "🔵 BIAS: MM Level 2 - Retail Participation (MA 50/200)" },
  { category: "BIAS", value: "MM_RESET_2", label: "🔵 BIAS: MM Reset 2 - Second Correction" },
  { category: "BIAS", value: "MM_LEVEL_3", label: "🔵 BIAS: MM Level 3 - Market Maker Return (MA 50/800)" },
  { category: "BIAS", value: "PEAK_FORMATION", label: "🔵 BIAS: Peak Formation - Last Level 3 Reference" },
  
  // Range & Volatility Analysis
  { category: "BIAS", value: "ABS", label: "🔵 BIAS: Asian Box Stacking" },
  { category: "BIAS", value: "3XADR", label: "🔵 BIAS: 3X ADR Analysis" },
  
  // EMA Crossover Levels
  { category: "BIAS", value: "L1_13_50", label: "🔵 BIAS: 13/50 Cross - Level 1 Confirmation" },
  { category: "BIAS", value: "L2_50_200", label: "🔵 BIAS: 50/200 Cross - Level 2 Confirmation" },

  // SETUP Level (Level 2) - Trading Setup Patterns
  { category: "SETUP", value: "ANCHORS", label: "🟢 SETUP: Anchors" },
  { category: "SETUP", value: "ASIAN_RANGE", label: "🟢 SETUP: Asian Range" },
  { category: "SETUP", value: "BOX_SETUPS", label: "🟢 SETUP: Box Setups" },
  { category: "SETUP", value: "HARMONICS_P1", label: "🟢 SETUP: Harmonics Part 1" },
  { category: "SETUP", value: "RESET_SAFETY", label: "🟢 SETUP: Reset Safety Trades" },
  { category: "SETUP", value: "RESETS", label: "🟢 SETUP: Resets" },

  // PATTERN Level (Level 3) - Chart Patterns & Formations
  { category: "PATTERN", value: "1H_50_50_BOUNCE", label: "🟣 PATTERN: 1H 50/50 Bounce" },
  { category: "PATTERN", value: "2ND_LEG_HALF_BAT", label: "🟣 PATTERN: 2nd Leg Half Bat" },
  { category: "PATTERN", value: "3_DRIVES_3_DAY", label: "🟣 PATTERN: 3 Drives 3 Day" },
  { category: "PATTERN", value: "3_HITS_TRADE", label: "🟣 PATTERN: 3 Hits Trade" },
  { category: "PATTERN", value: "HALF_BATS", label: "🟣 PATTERN: Half Bats" },
  { category: "PATTERN", value: "HEAD_SHOULDERS", label: "🟣 PATTERN: Head & Shoulders" },
  { category: "PATTERN", value: "ID_50", label: "🟣 PATTERN: ID 50" },
  { category: "PATTERN", value: "LONDON_PATTERNS", label: "🟣 PATTERN: London Patterns" },
  { category: "PATTERN", value: "TYPE1", label: "🟣 PATTERN: Type 1" },
  { category: "PATTERN", value: "TYPE2", label: "🟣 PATTERN: Type 2" },
  { category: "PATTERN", value: "TYPE3", label: "🟣 PATTERN: Type 3" },
  { category: "PATTERN", value: "TYPE4", label: "🟣 PATTERN: Type 4" },
  { category: "PATTERN", value: "W&M_PATTERNS", label: "🟣 PATTERN: W&M Patterns" },

  // ENTRY Level (Level 4) - Entry Timing & Execution
  { category: "ENTRY", value: "RAILROAD_TRACKS", label: "🟠 ENTRY'S: Railroad Tracks" },
  { category: "ENTRY", value: "CORD_OF_WOODS", label: "🟠 ENTRY'S: Cord of Woods" },
  { category: "ENTRY", value: "EVENING_STAR", label: "🟠 ENTRY'S: Evening Star" },
  { category: "ENTRY", value: "MORNING_STAR", label: "🟠 ENTRY'S: Morning Star" },
  { category: "ENTRY", value: "SHIFT_CANDLE", label: "🟠 ENTRY'S: Shift Candle" },
];

const sessionTimings = [
  { value: "london", label: "London Session" },
  { value: "newyork", label: "New York Session" },
  { value: "brinks", label: "Brinks Timing" },
  { value: "asian", label: "Asian Session" },
];

const forexPairs = [
  // Major Pairs
  { value: "EURUSD", label: "EUR/USD - Euro/US Dollar" },
  { value: "GBPUSD", label: "GBP/USD - British Pound/US Dollar" },
  { value: "USDJPY", label: "USD/JPY - US Dollar/Japanese Yen" },
  { value: "USDCHF", label: "USD/CHF - US Dollar/Swiss Franc" },
  { value: "AUDUSD", label: "AUD/USD - Australian Dollar/US Dollar" },
  { value: "USDCAD", label: "USD/CAD - US Dollar/Canadian Dollar" },
  { value: "NZDUSD", label: "NZD/USD - New Zealand Dollar/US Dollar" },
  
  // Minor Pairs
  { value: "EURGBP", label: "EUR/GBP - Euro/British Pound" },
  { value: "EURJPY", label: "EUR/JPY - Euro/Japanese Yen" },
  { value: "EURCHF", label: "EUR/CHF - Euro/Swiss Franc" },
  { value: "EURAUD", label: "EUR/AUD - Euro/Australian Dollar" },
  { value: "EURCAD", label: "EUR/CAD - Euro/Canadian Dollar" },
  { value: "EURNZD", label: "EUR/NZD - Euro/New Zealand Dollar" },
  { value: "GBPJPY", label: "GBP/JPY - British Pound/Japanese Yen" },
  { value: "GBPCHF", label: "GBP/CHF - British Pound/Swiss Franc" },
  { value: "GBPAUD", label: "GBP/AUD - British Pound/Australian Dollar" },
  { value: "GBPCAD", label: "GBP/CAD - British Pound/Canadian Dollar" },
  { value: "GBPNZD", label: "GBP/NZD - British Pound/New Zealand Dollar" },
  { value: "AUDJPY", label: "AUD/JPY - Australian Dollar/Japanese Yen" },
  { value: "AUDCHF", label: "AUD/CHF - Australian Dollar/Swiss Franc" },
  { value: "AUDCAD", label: "AUD/CAD - Australian Dollar/Canadian Dollar" },
  { value: "AUDNZD", label: "AUD/NZD - Australian Dollar/New Zealand Dollar" },
  { value: "CADJPY", label: "CAD/JPY - Canadian Dollar/Japanese Yen" },
  { value: "CADCHF", label: "CAD/CHF - Canadian Dollar/Swiss Franc" },
  { value: "CHFJPY", label: "CHF/JPY - Swiss Franc/Japanese Yen" },
  { value: "NZDJPY", label: "NZD/JPY - New Zealand Dollar/Japanese Yen" },
  { value: "NZDCHF", label: "NZD/CHF - New Zealand Dollar/Swiss Franc" },
  { value: "NZDCAD", label: "NZD/CAD - New Zealand Dollar/Canadian Dollar" },
];

const commodities = [
  // Precious Metals
  { value: "XAUUSD", label: "XAU/USD - Gold" },
  { value: "XAGUSD", label: "XAG/USD - Silver" },
  { value: "XPDUSD", label: "XPD/USD - Palladium" },
  { value: "XPTUSD", label: "XPT/USD - Platinum" },
  
  // Energy
  { value: "CRUDE", label: "Crude Oil (WTI)" },
  { value: "BRENT", label: "Brent Oil" },
  { value: "NATGAS", label: "Natural Gas" },
  
  // Agricultural
  { value: "WHEAT", label: "Wheat" },
  { value: "CORN", label: "Corn" },
  { value: "SUGAR", label: "Sugar" },
  { value: "COFFEE", label: "Coffee" },
  { value: "COCOA", label: "Cocoa" },
  { value: "COTTON", label: "Cotton" },
  { value: "SOYBEAN", label: "Soybean" },
];

const indices = [
  // US Indices
  { value: "US30", label: "US30 - Dow Jones Industrial Average" },
  { value: "SPX500", label: "SPX500 - S&P 500" },
  { value: "NAS100", label: "NAS100 - NASDAQ 100" },
  { value: "US2000", label: "US2000 - Russell 2000" },
  
  // European Indices
  { value: "GER40", label: "GER40 - DAX 40" },
  { value: "UK100", label: "UK100 - FTSE 100" },
  { value: "FRA40", label: "FRA40 - CAC 40" },
  { value: "SPA35", label: "SPA35 - IBEX 35" },
  { value: "ITA40", label: "ITA40 - FTSE MIB" },
  { value: "EU50", label: "EU50 - Euro Stoxx 50" },
  
  // Asian Indices
  { value: "JPN225", label: "JPN225 - Nikkei 225" },
  { value: "HK50", label: "HK50 - Hang Seng" },
  { value: "AUS200", label: "AUS200 - ASX 200" },
  
  // Other Major Indices
  { value: "VIX", label: "VIX - Volatility Index" },
  { value: "DXY", label: "DXY - US Dollar Index" },
];

const allInstruments = [
  ...forexPairs.map(pair => ({ ...pair, category: 'Forex' })),
  ...commodities.map(commodity => ({ ...commodity, category: 'Commodities' })),
  ...indices.map(index => ({ ...index, category: 'Indices' }))
];

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [formData, setFormData] = useState({
    strategyType: "",
    sessionTiming: "",
    tradingInstrument: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createScreenshotMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/screenshots", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/screenshots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Screenshot uploaded successfully!",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload screenshot. Please try again.",
        variant: "destructive",
      });
    },
  });

  // No longer needed with Supabase storage

  const handleUploadComplete = (result: { uploadURL: string; fileName: string }) => {
    setUploadedFiles([{
      uploadURL: result.uploadURL,
      name: result.fileName,
      size: 0,
      type: 'image/*',
    }]);
  };

  const handleMobileFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      // This mobile upload path is now handled by the ObjectUploader component
      // Just show a message to use the main upload button
      toast({
        title: "Mobile Upload",
        description: "Please use the 'Browse Files' button above.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    if (!uploadedFiles.length || !formData.strategyType || !formData.tradingInstrument) {
      toast({
        title: "Missing Information",
        description: "Please fill in strategy type, trading instrument, and upload an image.",
        variant: "destructive",
      });
      return;
    }

    const uploadedFile = uploadedFiles[0];
    // Generate automatic title based on instrument and strategy
    const autoTitle = `${formData.tradingInstrument} ${formData.strategyType} Trade`;
    
    createScreenshotMutation.mutate({
      title: autoTitle,
      imagePath: uploadedFile.uploadURL,
      strategyType: formData.strategyType,
      sessionTiming: formData.sessionTiming,
      currencyPair: formData.tradingInstrument,
      result: "win", // All trades are winners
      riskReward: "+2R", // All trades are 2R
      tags: [],
      metadata: {},
      isBookmarked: false,
    });
  };

  const handleClose = () => {
    setFormData({
      strategyType: "",
      sessionTiming: "",
      tradingInstrument: "",
    });
    setUploadedFiles([]);
    onClose();
  };

  const handleClipboardPaste = async () => {
    // Check if we're on mobile or clipboard API is not supported
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile || !navigator.clipboard || !navigator.clipboard.read) {
      toast({
        title: "Mobile Upload",
        description: "On mobile devices, please use the 'Browse Files' button to select images from your photo gallery.",
      });
      return;
    }

    try {
      // Check clipboard permissions first
      const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      
      if (permission.state === 'denied') {
        toast({
          title: "Clipboard Permission Denied",
          description: "Please allow clipboard access or use the 'Browse Files' button instead.",
          variant: "destructive",
        });
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      let hasImage = false;
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            hasImage = true;
            toast({
              title: "Clipboard Image Detected",
              description: "Image found in clipboard. Use the upload area below to process it.",
            });
            break;
          }
        }
        if (hasImage) break;
      }
      
      if (!hasImage) {
        toast({
          title: "No Images Found",
          description: "No images detected in clipboard. Copy an image first, then try again.",
        });
      }
    } catch (error) {
      toast({
        title: "Clipboard Access Failed",
        description: "Unable to access clipboard. Please use the 'Browse Files' button to select images instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-trading-card border-trading-border max-w-4xl max-h-[90vh] overflow-y-auto mx-4" aria-describedby="upload-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-bold text-white flex items-center">
            <i className="fas fa-cloud-upload-alt mr-2 md:mr-3 text-trading-accent"></i>
            <span className="hidden sm:inline">Bulk Upload & Categorization</span>
            <span className="sm:hidden">Upload Screenshots</span>
          </DialogTitle>
        </DialogHeader>
        <div id="upload-dialog-description" className="sr-only">
          Upload and categorize your trading screenshots with strategy types, instruments, and session timing.
        </div>
        
        <div className="space-y-4 md:space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-trading-accent rounded-xl p-4 md:p-8 text-center bg-gradient-to-br from-trading-accent from-opacity-5 to-trading-gold to-opacity-5">
            <i className="fas fa-images text-3xl md:text-4xl text-trading-accent mb-3 md:mb-4"></i>
            <h3 className="text-white font-semibold mb-2 text-base md:text-lg">Upload Trading Screenshots</h3>
            <p className="text-trading-text mb-4 text-sm md:text-base">
              <span className="hidden sm:inline">Drag & drop or browse for images</span>
              <span className="sm:hidden">Select images from your photo gallery</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <ObjectUploader
                maxNumberOfFiles={5}
                maxFileSize={10485760} // 10MB
                onComplete={handleUploadComplete}
                buttonClassName="bg-trading-accent hover:bg-opacity-80 text-trading-dark px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base"
              >
                <i className="fas fa-folder-open mr-2"></i>
                Browse Files
              </ObjectUploader>
              
              {/* Hidden file input for mobile */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                data-testid="input-mobile-file"
              />
              
              {/* Mobile-friendly file select button */}
              <Button
                onClick={handleMobileFileSelect}
                className="bg-trading-gold hover:bg-opacity-80 text-trading-dark px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base sm:hidden"
                data-testid="button-mobile-select"
              >
                <i className="fas fa-camera mr-2"></i>
                Select from Gallery
              </Button>
              
              <Button
                onClick={handleClipboardPaste}
                variant="outline"
                className="bg-trading-border hover:bg-trading-accent hover:text-trading-dark text-white border-trading-border text-sm md:text-base hidden sm:flex"
                data-testid="button-paste-from-clipboard"
              >
                <i className="fas fa-clipboard mr-2"></i>
                Paste from Clipboard
              </Button>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-trading-border rounded-lg">
                <p className="text-bullish font-medium text-sm md:text-base">
                  <i className="fas fa-check-circle mr-2"></i>
                  {uploadedFiles.length} file(s) uploaded successfully
                </p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy" className="text-white text-sm md:text-base">Strategy Type *</Label>
              <Select value={formData.strategyType} onValueChange={(value) => setFormData({ ...formData, strategyType: value })}>
                <SelectTrigger className="bg-trading-card text-white border-trading-border text-sm md:text-base" data-testid="select-strategy-type">
                  <SelectValue placeholder="Select Strategy Type" />
                </SelectTrigger>
                <SelectContent className="bg-trading-card border-trading-border max-h-60 text-white">
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">📉 MAAW Pattern (Bearish)</div>
                  {strategyTypes.filter(s => s.category === "BIAS" && ["M", "A1", "A2", "W"].includes(s.value)).map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {strategy.label}
                    </SelectItem>
                  ))}
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">📈 WVVM Pattern (Bullish)</div>
                  {strategyTypes.filter(s => s.category === "BIAS" && ["V1", "V2", "W2", "M2"].includes(s.value)).map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {strategy.label}
                    </SelectItem>
                  ))}
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">⚡ BTMM Market Maker Cycles</div>
                  {strategyTypes.filter(s => s.category === "BIAS" && (s.value.startsWith("MM_") || s.value === "PEAK_FORMATION")).map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {strategy.label}
                    </SelectItem>
                  ))}
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">📊 Range & Volatility Analysis</div>
                  {strategyTypes.filter(s => s.category === "BIAS" && ["ABS", "3XADR"].includes(s.value)).map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {strategy.label}
                    </SelectItem>
                  ))}
                  <div className="text-blue-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">📈 EMA Crossover Levels</div>
                  {strategyTypes.filter(s => s.category === "BIAS" && s.value.startsWith("L")).map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {strategy.label}
                    </SelectItem>
                  ))}
                  <div className="text-green-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">🟢 LEVEL 2: SETUP - Market Conditions</div>
                  {strategyTypes.filter(s => s.category === "SETUP").map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {strategy.label}
                    </SelectItem>
                  ))}
                  <div className="text-purple-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">🟣 LEVEL 3: PATTERN - Chart Patterns</div>
                  {strategyTypes.filter(s => s.category === "PATTERN").map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {strategy.label}
                    </SelectItem>
                  ))}
                  <div className="text-orange-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">🟠 LEVEL 4: ENTRY'S - Entry Strategies</div>
                  {strategyTypes.filter(s => s.category === "ENTRY").map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value} className="text-white hover:bg-trading-border text-sm focus:bg-trading-accent focus:text-trading-dark">
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instrument" className="text-white text-sm md:text-base">Trading Instrument *</Label>
              <Select value={formData.tradingInstrument} onValueChange={(value) => setFormData({ ...formData, tradingInstrument: value })}>
                <SelectTrigger className="bg-trading-card text-white border-trading-border text-sm md:text-base" data-testid="select-trading-instrument">
                  <SelectValue placeholder="Select Instrument" />
                </SelectTrigger>
                <SelectContent className="bg-trading-card border-trading-border max-h-60">
                  <div className="text-trading-accent font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">FOREX PAIRS</div>
                  {forexPairs.map((pair) => (
                    <SelectItem key={pair.value} value={pair.value} className="text-white hover:bg-trading-border text-sm">
                      {pair.label}
                    </SelectItem>
                  ))}
                  <div className="text-trading-gold font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">COMMODITIES</div>
                  {commodities.map((commodity) => (
                    <SelectItem key={commodity.value} value={commodity.value} className="text-white hover:bg-trading-border text-sm">
                      {commodity.label}
                    </SelectItem>
                  ))}
                  <div className="text-purple-400 font-semibold px-2 py-1 text-xs sticky top-0 bg-trading-card border-b border-trading-border">INDICES</div>
                  {indices.map((index) => (
                    <SelectItem key={index.value} value={index.value} className="text-white hover:bg-trading-border text-sm">
                      {index.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session" className="text-white text-sm md:text-base">Session Timing</Label>
              <Select value={formData.sessionTiming} onValueChange={(value) => setFormData({ ...formData, sessionTiming: value })}>
                <SelectTrigger className="bg-trading-card text-white border-trading-border text-sm md:text-base" data-testid="select-session-timing">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent className="bg-trading-card border-trading-border">
                  {sessionTimings.map((session) => (
                    <SelectItem key={session.value} value={session.value} className="text-white hover:bg-trading-border text-sm">
                      {session.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Trade Info Display */}
            <div className="space-y-2 md:col-span-2">
              <div className="bg-trading-border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-trading-text text-sm">Trade Result</div>
                    <div className="text-bullish font-bold text-lg">✓ Winner</div>
                  </div>
                  <div>
                    <div className="text-trading-text text-sm">Risk/Reward</div>
                    <div className="text-trading-accent font-bold text-lg">+2R</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleClose}
              className="text-trading-text hover:text-white w-full sm:w-auto text-sm md:text-base"
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createScreenshotMutation.isPending}
              className="bg-trading-accent hover:bg-opacity-80 text-trading-dark font-semibold w-full sm:w-auto text-sm md:text-base"
              data-testid="button-upload-categorize"
            >
              {createScreenshotMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-2"></i>
                  <span className="hidden sm:inline">Upload & Categorize</span>
                  <span className="sm:hidden">Upload</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
