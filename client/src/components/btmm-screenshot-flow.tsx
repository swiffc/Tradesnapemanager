import React, { useState } from 'react';
import { Card } from './ui/card';
import type { Screenshot } from '@shared/schema';

interface BTMMFlowProps {
  screenshots: Screenshot[];
  onFilterChange: (filter: BTMMFilter) => void;
}

interface BTMMFilter {
  bias?: string;
  setupPattern?: string;
  entryType?: string;
  sessionTiming?: string;
}

// Steve Mauro BTMM Categories
const BTMM_BIAS_TYPES = {
  // Market Structure Bias
  'M': { name: 'Market Structure', color: 'bg-blue-500', description: 'Overall market direction analysis' },
  'A1': { name: 'Asian High Break', color: 'bg-blue-600', description: 'Asian session high break bullish bias' },
  'A2': { name: 'Asian Low Break', color: 'bg-blue-700', description: 'Asian session low break bearish bias' },
  'W': { name: 'Weekly Bias', color: 'bg-blue-800', description: 'Weekly timeframe directional bias' },
  
  // Reversal Patterns  
  'V1': { name: 'V-Pattern Bullish', color: 'bg-purple-500', description: 'V-shaped bullish reversal' },
  'V2': { name: 'V-Pattern Bearish', color: 'bg-purple-600', description: 'V-shaped bearish reversal' },
  'W2': { name: 'W-Pattern', color: 'bg-purple-700', description: 'Double bottom W pattern' },
  'M2': { name: 'M-Pattern', color: 'bg-purple-800', description: 'Double top M pattern' },
  
  // Special Setups
  'ABS': { name: 'Asian Box Stacking', color: 'bg-yellow-500', description: 'Asian range manipulation setup' },
  '3XADR': { name: '3X ADR Extension', color: 'bg-red-500', description: 'Three times average daily range' },
  'L1_13_50': { name: '13/50 EMA Cross', color: 'bg-cyan-500', description: '13 EMA crossing 50 EMA' },
  'L2_50_200': { name: '50/200 EMA Cross', color: 'bg-cyan-600', description: '50 EMA crossing 200 EMA' }
};

const BTMM_SETUPS = {
  'BOX_SETUPS': { name: 'Box Setups', icon: 'fas fa-square', description: 'Range bound trading setups' },
  'ANCHORS': { name: 'Anchor Points', icon: 'fas fa-anchor', description: 'Key support/resistance levels' },
  'ASIAN_RANGE': { name: 'Asian Range', icon: 'fas fa-compress-arrows-alt', description: 'Asian session range plays' },
  'HARMONICS_P1': { name: 'Harmonic Patterns', icon: 'fas fa-wave-square', description: 'Fibonacci harmonic patterns' },
  'RESET_SAFETY': { name: 'Reset Safety', icon: 'fas fa-shield-alt', description: 'Risk management resets' },
  'RESETS': { name: 'Standard Resets', icon: 'fas fa-undo', description: 'Price action resets' }
};

const BTMM_PATTERNS = {
  '1H_50_50_BOUNCE': { name: '1H 50/50 Bounce', description: '1-hour 50% retracement bounce' },
  '2ND_LEG_HALF_BAT': { name: '2nd Leg Half Bat', description: 'Second leg of harmonic bat pattern' },
  '3_DRIVES_3_DAY': { name: '3 Drives 3 Day', description: 'Three drives pattern over 3 days' },
  '3_HITS_TRADE': { name: '3 Hits Trade', description: 'Third touch of support/resistance' },
  'HALF_BATS': { name: 'Half Bat Patterns', description: 'Partial harmonic bat completion' },
  'HEAD_SHOULDERS': { name: 'Head & Shoulders', description: 'Classic reversal pattern' },
  'ID_50': { name: 'ID 50% Retracement', description: 'Institutional dealing 50% level' },
  'LONDON_PATTERNS': { name: 'London Session Patterns', description: 'London open specific patterns' },
  'TYPE1': { name: 'Type 1 Entry', description: 'Immediate entry on break' },
  'TYPE2': { name: 'Type 2 Entry', description: 'Retest entry pattern' },
  'TYPE3': { name: 'Type 3 Entry', description: 'Deep retracement entry' },
  'TYPE4': { name: 'Type 4 Entry', description: 'Counter-trend entry' },
  'W&M_PATTERNS': { name: 'W & M Patterns', description: 'Double bottom/top patterns' }
};

const BTMM_ENTRIES = {
  'RAILROAD_TRACKS': { name: 'Railroad Tracks', icon: 'fas fa-train', description: 'Parallel candlestick pattern' },
  'CORD_OF_WOODS': { name: 'Cord of Woods', icon: 'fas fa-tree', description: 'Multiple rejection candles' },
  'EVENING_STAR': { name: 'Evening Star', icon: 'fas fa-star', description: 'Bearish reversal candlestick' },
  'MORNING_STAR': { name: 'Morning Star', icon: 'fas fa-sun', description: 'Bullish reversal candlestick' },
  'SHIFT_CANDLE': { name: 'Shift Candle', icon: 'fas fa-exchange-alt', description: 'Market structure shift candle' }
};

export function BTMMScreenshotFlow({ screenshots, onFilterChange }: BTMMFlowProps) {
  const [activeStep, setActiveStep] = useState<'bias' | 'setup' | 'pattern' | 'entry'>('bias');
  const [selectedFilters, setSelectedFilters] = useState<BTMMFilter>({});

  const handleFilterSelect = (type: keyof BTMMFilter, value: string) => {
    const newFilters = { ...selectedFilters, [type]: value };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getStepStats = (step: string) => {
    const filteredCount = screenshots.filter(s => {
      switch (step) {
        case 'bias': return s.bias;
        case 'setup': return s.setupPattern;
        case 'pattern': return s.strategyType && BTMM_PATTERNS[s.strategyType as keyof typeof BTMM_PATTERNS];
        case 'entry': return s.entry;
        default: return false;
      }
    }).length;
    return filteredCount;
  };

  return (
    <div className="bg-trading-dark p-6 rounded-lg border border-trading-border">
      {/* BTMM Flow Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
          <i className="fas fa-route mr-3 text-trading-accent"></i>
          Steve Mauro BTMM Flow Analysis
        </h3>
        <p className="text-trading-text text-sm">
          Analyze your trades following the Bias → Setup → Pattern → Entry methodology
        </p>
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-1 mb-6 bg-trading-border rounded-lg p-1">
        {[
          { key: 'bias', label: 'Bias', icon: 'fas fa-compass', count: getStepStats('bias') },
          { key: 'setup', label: 'Setup', icon: 'fas fa-cog', count: getStepStats('setup') },
          { key: 'pattern', label: 'Pattern', icon: 'fas fa-chart-line', count: getStepStats('pattern') },
          { key: 'entry', label: 'Entry', icon: 'fas fa-crosshairs', count: getStepStats('entry') }
        ].map((step, index) => (
          <button
            key={step.key}
            onClick={() => setActiveStep(step.key as any)}
            className={`flex-1 px-4 py-3 rounded-md transition-all duration-200 ${
              activeStep === step.key
                ? 'bg-trading-accent text-white shadow-lg'
                : 'text-trading-text hover:text-white hover:bg-trading-dark'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <i className={step.icon}></i>
              <span className="font-medium">{step.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeStep === step.key ? 'bg-white text-trading-accent' : 'bg-trading-accent text-white'
              }`}>
                {step.count}
              </span>
            </div>
            {index < 3 && (
              <div className="flex justify-center mt-2">
                <i className="fas fa-chevron-right text-xs text-trading-text"></i>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {activeStep === 'bias' && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-compass mr-2 text-blue-400"></i>
              Market Bias Analysis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(BTMM_BIAS_TYPES).map(([key, bias]) => {
                const count = screenshots.filter(s => s.bias === key).length;
                const isSelected = selectedFilters.bias === key;
                return (
                  <Card
                    key={key}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? 'border-trading-accent bg-trading-accent/10' 
                        : 'border-trading-border hover:border-trading-accent/50'
                    }`}
                    onClick={() => handleFilterSelect('bias', key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-3 h-3 rounded-full ${bias.color}`}></div>
                      <span className="text-xs text-trading-text font-semibold">{count}</span>
                    </div>
                    <div className="text-sm font-medium text-white mb-1">{key}</div>
                    <div className="text-xs text-trading-text mb-2">{bias.name}</div>
                    <div className="text-xs text-trading-text opacity-75">{bias.description}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeStep === 'setup' && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-cog mr-2 text-green-400"></i>
              Setup Patterns
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(BTMM_SETUPS).map(([key, setup]) => {
                const count = screenshots.filter(s => s.setupPattern === key).length;
                const isSelected = selectedFilters.setupPattern === key;
                return (
                  <Card
                    key={key}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? 'border-trading-accent bg-trading-accent/10' 
                        : 'border-trading-border hover:border-trading-accent/50'
                    }`}
                    onClick={() => handleFilterSelect('setupPattern', key)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <i className={`${setup.icon} text-xl text-green-400`}></i>
                      <span className="text-sm text-trading-text font-semibold bg-trading-border px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-white mb-2">{setup.name}</div>
                    <div className="text-xs text-trading-text">{setup.description}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeStep === 'pattern' && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-chart-line mr-2 text-purple-400"></i>
              Chart Patterns
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(BTMM_PATTERNS).map(([key, pattern]) => {
                const count = screenshots.filter(s => s.strategyType === key).length;
                const isSelected = selectedFilters.entryType === key;
                return (
                  <Card
                    key={key}
                    className={`p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? 'border-trading-accent bg-trading-accent/10' 
                        : 'border-trading-border hover:border-trading-accent/50'
                    }`}
                    onClick={() => handleFilterSelect('entryType', key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-white">{pattern.name}</div>
                      <span className="text-xs text-trading-text bg-trading-border px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </div>
                    <div className="text-xs text-trading-text">{pattern.description}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeStep === 'entry' && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-crosshairs mr-2 text-orange-400"></i>
              Entry Patterns
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(BTMM_ENTRIES).map(([key, entry]) => {
                const count = screenshots.filter(s => s.entry === key).length;
                const isSelected = selectedFilters.entryType === key;
                return (
                  <Card
                    key={key}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? 'border-trading-accent bg-trading-accent/10' 
                        : 'border-trading-border hover:border-trading-accent/50'
                    }`}
                    onClick={() => handleFilterSelect('entryType', key)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <i className={`${entry.icon} text-xl text-orange-400`}></i>
                      <span className="text-sm text-trading-text font-semibold bg-trading-border px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-white mb-2">{entry.name}</div>
                    <div className="text-xs text-trading-text">{entry.description}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {Object.keys(selectedFilters).length > 0 && (
        <div className="mt-6 p-4 bg-trading-card rounded-lg border border-trading-border">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-semibold text-white">Active Filters</h5>
            <button
              onClick={() => {
                setSelectedFilters({});
                onFilterChange({});
              }}
              className="text-xs text-trading-accent hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([type, value]) => (
              <span
                key={`${type}-${value}`}
                className="bg-trading-accent text-white px-3 py-1 rounded-full text-xs flex items-center space-x-2"
              >
                <span>{type}: {value}</span>
                                  <button
                    onClick={() => {
                      const newFilters = { ...selectedFilters };
                      delete newFilters[type as keyof BTMMFilter];
                      setSelectedFilters(newFilters);
                      onFilterChange(newFilters);
                    }}
                    className="hover:bg-white hover:text-trading-accent rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                    title={`Remove ${type} filter`}
                  >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
