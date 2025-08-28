import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { InsertScreenshot } from '@shared/schema';

interface BTMMUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: InsertScreenshot & { file: File }) => void;
}

// BTMM Categories following Steve Mauro methodology
const BIAS_CATEGORIES = {
  // MAAW Pattern (Bullish)
  'M': 'Market Structure (M)',
  'A1': 'Asian High Break (A1)', 
  'A2': 'Asian Low Hold (A2)',
  'W': 'Weekly Bias (W)',
  
  // WVVM Pattern (Bearish)  
  'W2': 'Weekly Reversal (W2)',
  'V1': 'V-Pattern Bullish (V1)',
  'V2': 'V-Pattern Bearish (V2)', 
  'M2': 'M-Pattern Top (M2)',
  
  // Special Patterns
  'ABS': 'Asian Box Stacking (ABS)',
  '3XADR': '3X ADR Extension (3XADR)',
  'L1_13_50': '13/50 EMA Cross (L1)',
  'L2_50_200': '50/200 EMA Cross (L2)'
};

const SETUP_PATTERNS = {
  'BOX_SETUPS': 'Box Range Setups',
  'ANCHORS': 'Anchor Point Setups', 
  'ASIAN_RANGE': 'Asian Range Manipulation',
  'HARMONICS_P1': 'Harmonic Patterns Phase 1',
  'RESET_SAFETY': 'Reset Safety Patterns',
  'RESETS': 'Standard Reset Patterns'
};

const CHART_PATTERNS = {
  // Type Entries
  'TYPE1': 'Type 1 - Immediate Entry',
  'TYPE2': 'Type 2 - Retest Entry', 
  'TYPE3': 'Type 3 - Deep Retracement',
  'TYPE4': 'Type 4 - Counter Trend',
  
  // Specific Patterns
  '1H_50_50_BOUNCE': '1H 50/50 Bounce',
  '2ND_LEG_HALF_BAT': '2nd Leg Half Bat',
  '3_DRIVES_3_DAY': '3 Drives 3 Day Pattern',
  '3_HITS_TRADE': '3 Hits Trade Setup',
  'HALF_BATS': 'Half Bat Patterns',
  'HEAD_SHOULDERS': 'Head & Shoulders',
  'ID_50': 'ID 50% Retracement',
  'LONDON_PATTERNS': 'London Session Patterns',
  'W&M_PATTERNS': 'W & M Patterns'
};

const ENTRY_PATTERNS = {
  'RAILROAD_TRACKS': 'Railroad Tracks',
  'CORD_OF_WOODS': 'Cord of Woods',
  'EVENING_STAR': 'Evening Star',
  'MORNING_STAR': 'Morning Star', 
  'SHIFT_CANDLE': 'Market Shift Candle'
};

const SESSION_TIMINGS = {
  'ASIAN': 'Asian Session (21:00-06:00 GMT)',
  'LONDON': 'London Session (07:00-16:00 GMT)', 
  'NY': 'New York Session (12:00-21:00 GMT)',
  'LONDON_NY_OVERLAP': 'London/NY Overlap (12:00-16:00 GMT)',
  'GAP_TIMES': 'Gap Trading Times',
  'BRINKS': 'Brinks Timing (High Impact News)'
};

const CURRENCY_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'EURAUD', 'EURCHF', 'GBPCHF',
  'CADCHF', 'GBPCAD', 'AUDCAD', 'AUDCHF', 'AUDNZD', 'NZDJPY'
];

export function BTMMUploadModal({ isOpen, onClose, onUpload }: BTMMUploadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    bias: '',
    setupPattern: '',
    strategyType: '',
    entry: '',
    sessionTiming: '',
    currencyPair: '',
    result: '',
    riskReward: '',
    tags: [] as string[],
    metadata: {}
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    
    const uploadData: InsertScreenshot & { file: File } = {
      ...formData,
      file,
      imagePath: '', // Will be set by upload handler
      studyBucket: getBucketFromStep(),
      tags: formData.tags
    };
    
    onUpload(uploadData);
    onClose();
    resetForm();
  };

  const getBucketFromStep = () => {
    switch (currentStep) {
      case 2: return 'BIAS';
      case 3: return 'SETUPS'; 
      case 4: return 'PATTERNS';
      case 5: return 'ENTRYS';
      default: return 'PATTERNS';
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFile(null);
    setPreview(null);
    setFormData({
      title: '',
      bias: '',
      setupPattern: '',
      strategyType: '',
      entry: '',
      sessionTiming: '',
      currencyPair: '',
      result: '',
      riskReward: '',
      tags: [],
      metadata: {}
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return file && formData.title;
      case 2: return formData.bias;
      case 3: return formData.setupPattern;
      case 4: return formData.strategyType;
      case 5: return formData.entry && formData.sessionTiming && formData.currencyPair;
      default: return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-trading-dark border-trading-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            <i className="fas fa-route mr-3 text-trading-accent"></i>
            BTMM Trade Analysis Upload
          </DialogTitle>
          <p className="text-trading-text">
            Follow the BTMM methodology: Bias → Setup → Pattern → Entry
          </p>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[
            { step: 1, label: 'Screenshot', icon: 'fas fa-image' },
            { step: 2, label: 'Bias', icon: 'fas fa-compass' },
            { step: 3, label: 'Setup', icon: 'fas fa-cog' },
            { step: 4, label: 'Pattern', icon: 'fas fa-chart-line' },
            { step: 5, label: 'Entry', icon: 'fas fa-crosshairs' }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= item.step 
                  ? 'bg-trading-accent text-white' 
                  : 'bg-trading-border text-trading-text'
              }`}>
                <i className={item.icon}></i>
              </div>
              <div className="ml-2 text-sm">
                <div className={currentStep >= item.step ? 'text-white' : 'text-trading-text'}>
                  {item.label}
                </div>
              </div>
              {index < 4 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  currentStep > item.step ? 'bg-trading-accent' : 'bg-trading-border'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <Card className="p-6 bg-trading-card border-trading-border">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-image mr-2 text-blue-400"></i>
                Upload Screenshot
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Trade Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., EURUSD London Open M-Pattern Entry"
                    className="bg-trading-border border-trading-border text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="file" className="text-white">Screenshot File *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-trading-border border-trading-border text-white"
                  />
                </div>

                {preview && (
                  <div className="mt-4">
                    <img src={preview} alt="Preview" className="max-w-full h-64 object-contain rounded-lg border border-trading-border" />
                  </div>
                )}
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="p-6 bg-trading-card border-trading-border">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-compass mr-2 text-blue-400"></i>
                Market Bias Analysis
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(BIAS_CATEGORIES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFormData(prev => ({ ...prev, bias: key }))}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 hover:scale-105 ${
                      formData.bias === key
                        ? 'border-trading-accent bg-trading-accent/20 text-white'
                        : 'border-trading-border bg-trading-dark text-trading-text hover:border-trading-accent/50'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{key}</div>
                    <div className="text-xs">{label}</div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="p-6 bg-trading-card border-trading-border">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-cog mr-2 text-green-400"></i>
                Setup Pattern
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SETUP_PATTERNS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFormData(prev => ({ ...prev, setupPattern: key }))}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 hover:scale-105 ${
                      formData.setupPattern === key
                        ? 'border-trading-accent bg-trading-accent/20 text-white'
                        : 'border-trading-border bg-trading-dark text-trading-text hover:border-trading-accent/50'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{key}</div>
                    <div className="text-xs">{label}</div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="p-6 bg-trading-card border-trading-border">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-chart-line mr-2 text-purple-400"></i>
                Chart Pattern
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(CHART_PATTERNS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFormData(prev => ({ ...prev, strategyType: key }))}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 hover:scale-105 ${
                      formData.strategyType === key
                        ? 'border-trading-accent bg-trading-accent/20 text-white'
                        : 'border-trading-border bg-trading-dark text-trading-text hover:border-trading-accent/50'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{key}</div>
                    <div className="text-xs">{label}</div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="p-6 bg-trading-card border-trading-border">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-crosshairs mr-2 text-orange-400"></i>
                Entry Details
              </h3>
              
              <div className="space-y-6">
                {/* Entry Pattern */}
                <div>
                  <Label className="text-white mb-3 block">Entry Pattern *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(ENTRY_PATTERNS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setFormData(prev => ({ ...prev, entry: key }))}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          formData.entry === key
                            ? 'border-trading-accent bg-trading-accent/20 text-white'
                            : 'border-trading-border bg-trading-dark text-trading-text hover:border-trading-accent/50'
                        }`}
                      >
                        <div className="font-semibold text-sm">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session & Pair */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Session Timing *</Label>
                    <Select value={formData.sessionTiming} onValueChange={(value) => setFormData(prev => ({ ...prev, sessionTiming: value }))}>
                      <SelectTrigger className="bg-trading-border border-trading-border text-white">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent className="bg-trading-dark border-trading-border">
                        {Object.entries(SESSION_TIMINGS).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-white">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Currency Pair *</Label>
                    <Select value={formData.currencyPair} onValueChange={(value) => setFormData(prev => ({ ...prev, currencyPair: value }))}>
                      <SelectTrigger className="bg-trading-border border-trading-border text-white">
                        <SelectValue placeholder="Select pair" />
                      </SelectTrigger>
                      <SelectContent className="bg-trading-dark border-trading-border">
                        {CURRENCY_PAIRS.map((pair) => (
                          <SelectItem key={pair} value={pair} className="text-white">{pair}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Result & R:R */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Trade Result</Label>
                    <Select value={formData.result} onValueChange={(value) => setFormData(prev => ({ ...prev, result: value }))}>
                      <SelectTrigger className="bg-trading-border border-trading-border text-white">
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent className="bg-trading-dark border-trading-border">
                        <SelectItem value="win" className="text-green-400">Win 🏆</SelectItem>
                        <SelectItem value="loss" className="text-red-400">Loss ❌</SelectItem>
                        <SelectItem value="breakeven" className="text-yellow-400">Breakeven ⚖️</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="riskReward" className="text-white">Risk:Reward</Label>
                    <Input
                      id="riskReward"
                      value={formData.riskReward}
                      onChange={(e) => setFormData(prev => ({ ...prev, riskReward: e.target.value }))}
                      placeholder="e.g., +2.5R or -1R"
                      className="bg-trading-border border-trading-border text-white"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-trading-border">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="border-trading-border text-trading-text hover:text-white"
          >
            <i className="fas fa-chevron-left mr-2"></i>
            Previous
          </Button>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="border-trading-border text-trading-text hover:text-white">
              Cancel
            </Button>

            {currentStep === 5 ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="bg-trading-accent hover:bg-trading-accent/80 text-white"
              >
                <i className="fas fa-upload mr-2"></i>
                Upload Trade
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="bg-trading-accent hover:bg-trading-accent/80 text-white"
              >
                Next
                <i className="fas fa-chevron-right ml-2"></i>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
