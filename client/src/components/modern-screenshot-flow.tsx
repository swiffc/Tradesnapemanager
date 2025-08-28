import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Screenshot } from '@shared/schema';

interface ModernScreenshotFlowProps {
  screenshots: Screenshot[];
  onFilterChange: (filter: BTMMFilter) => void;
  activeFilters: BTMMFilter;
}

interface BTMMFilter {
  bias?: string;
  setupPattern?: string;
  entryType?: string;
  sessionTiming?: string;
}

// Modern BTMM Categories with enhanced styling
const BIAS_CATEGORIES = {
  'M': { name: 'Market Structure', color: 'from-blue-400 to-blue-600', icon: 'fas fa-mountain' },
  'A1': { name: 'Asian High Break', color: 'from-cyan-400 to-cyan-600', icon: 'fas fa-arrow-up' },
  'A2': { name: 'Asian Low Break', color: 'from-teal-400 to-teal-600', icon: 'fas fa-arrow-down' },
  'W': { name: 'Weekly Bias', color: 'from-indigo-400 to-indigo-600', icon: 'fas fa-calendar-week' },
  'V1': { name: 'V-Pattern Bull', color: 'from-green-400 to-green-600', icon: 'fas fa-chart-line' },
  'V2': { name: 'V-Pattern Bear', color: 'from-red-400 to-red-600', icon: 'fas fa-chart-line' },
  'ABS': { name: 'Asian Box Stack', color: 'from-yellow-400 to-orange-500', icon: 'fas fa-layer-group' },
  '3XADR': { name: '3X ADR', color: 'from-purple-400 to-purple-600', icon: 'fas fa-expand-arrows-alt' }
};

const SETUP_CATEGORIES = {
  'BOX_SETUPS': { name: 'Box Setups', icon: 'fas fa-square' },
  'ANCHORS': { name: 'Anchors', icon: 'fas fa-anchor' },
  'ASIAN_RANGE': { name: 'Asian Range', icon: 'fas fa-compress-arrows-alt' },
  'HARMONICS_P1': { name: 'Harmonics', icon: 'fas fa-wave-square' },
  'RESET_SAFETY': { name: 'Reset Safety', icon: 'fas fa-shield-alt' },
  'RESETS': { name: 'Resets', icon: 'fas fa-undo' }
};

const ENTRY_CATEGORIES = {
  'RAILROAD_TRACKS': { name: 'Railroad Tracks', icon: 'fas fa-train' },
  'CORD_OF_WOODS': { name: 'Cord of Woods', icon: 'fas fa-tree' },
  'EVENING_STAR': { name: 'Evening Star', icon: 'fas fa-star' },
  'MORNING_STAR': { name: 'Morning Star', icon: 'fas fa-sun' },
  'SHIFT_CANDLE': { name: 'Shift Candle', icon: 'fas fa-exchange-alt' }
};

export function ModernScreenshotFlow({ screenshots, onFilterChange, activeFilters }: ModernScreenshotFlowProps) {
  const [activeStep, setActiveStep] = useState<'bias' | 'setup' | 'entry'>('bias');

  const getStepStats = (step: string, value: string) => {
    return screenshots.filter(s => {
      switch (step) {
        case 'bias': return s.bias === value;
        case 'setup': return s.setupPattern === value;
        case 'entry': return s.entry === value;
        default: return false;
      }
    }).length;
  };

  const handleFilterSelect = (type: keyof BTMMFilter, value: string) => {
    const newFilters = { ...activeFilters };
    if (newFilters[type] === value) {
      delete newFilters[type];
    } else {
      newFilters[type] = value;
    }
    onFilterChange(newFilters);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">BTMM Flow</h2>
        <p className="text-white/60 text-sm">Steve Mauro's methodology</p>
      </div>

      {/* Step Navigation */}
      <div className="space-y-2">
        {[
          { key: 'bias', label: 'Bias', icon: 'fas fa-compass', color: 'from-blue-500 to-purple-500' },
          { key: 'setup', label: 'Setup', icon: 'fas fa-cog', color: 'from-green-500 to-blue-500' },
          { key: 'entry', label: 'Entry', icon: 'fas fa-crosshairs', color: 'from-orange-500 to-red-500' }
        ].map((step) => (
          <Button
            key={step.key}
            onClick={() => setActiveStep(step.key as any)}
            className={`w-full justify-start p-4 h-auto transition-all duration-300 ${
              activeStep === step.key
                ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-105`
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <i className={`${step.icon} mr-3 text-lg`}></i>
            <div className="text-left">
              <div className="font-semibold">{step.label}</div>
              <div className="text-xs opacity-75">
                {screenshots.filter(s => {
                  if (step.key === 'bias') return s.bias;
                  if (step.key === 'setup') return s.setupPattern;
                  if (step.key === 'entry') return s.entry;
                  return false;
                }).length} trades
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-3">
        {activeStep === 'bias' && (
          <>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center">
              <i className="fas fa-compass mr-2 text-blue-400"></i>
              Market Bias
            </h3>
            {Object.entries(BIAS_CATEGORIES).map(([key, bias]) => {
              const count = getStepStats('bias', key);
              const isActive = activeFilters.bias === key;
              return (
                <Card
                  key={key}
                  className={`p-3 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/50 shadow-lg' 
                      : 'bg-white/10 hover:bg-white/20 border-white/20'
                  } backdrop-blur-sm`}
                  onClick={() => handleFilterSelect('bias', key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${bias.color} flex items-center justify-center shadow-lg`}>
                        <i className={`${bias.icon} text-white text-sm`}></i>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{key}</div>
                        <div className="text-white/60 text-xs">{bias.name}</div>
                      </div>
                    </div>
                    <Badge className={`${isActive ? 'bg-purple-500' : 'bg-white/20'} text-white`}>
                      {count}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {activeStep === 'setup' && (
          <>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center">
              <i className="fas fa-cog mr-2 text-green-400"></i>
              Setup Patterns
            </h3>
            {Object.entries(SETUP_CATEGORIES).map(([key, setup]) => {
              const count = getStepStats('setup', key);
              const isActive = activeFilters.setupPattern === key;
              return (
                <Card
                  key={key}
                  className={`p-3 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-400/50 shadow-lg' 
                      : 'bg-white/10 hover:bg-white/20 border-white/20'
                  } backdrop-blur-sm`}
                  onClick={() => handleFilterSelect('setupPattern', key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                        <i className={`${setup.icon} text-white text-sm`}></i>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{setup.name}</div>
                      </div>
                    </div>
                    <Badge className={`${isActive ? 'bg-green-500' : 'bg-white/20'} text-white`}>
                      {count}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {activeStep === 'entry' && (
          <>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center">
              <i className="fas fa-crosshairs mr-2 text-orange-400"></i>
              Entry Patterns
            </h3>
            {Object.entries(ENTRY_CATEGORIES).map(([key, entry]) => {
              const count = getStepStats('entry', key);
              const isActive = activeFilters.entryType === key;
              return (
                <Card
                  key={key}
                  className={`p-3 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isActive 
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/50 shadow-lg' 
                      : 'bg-white/10 hover:bg-white/20 border-white/20'
                  } backdrop-blur-sm`}
                  onClick={() => handleFilterSelect('entryType', key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                        <i className={`${entry.icon} text-white text-sm`}></i>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{entry.name}</div>
                      </div>
                    </div>
                    <Badge className={`${isActive ? 'bg-orange-500' : 'bg-white/20'} text-white`}>
                      {count}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </>
        )}
      </div>

      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold text-sm">Active Filters</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFilterChange({})}
              className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-2">
            {Object.entries(activeFilters).map(([type, value]) => (
              <div key={`${type}-${value}`} className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                <span className="text-white text-sm">{type}: {value}</span>
                <Button
                  size="sm"
                  onClick={() => handleFilterSelect(type as keyof BTMMFilter, value)}
                  className="w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white"
                >
                  <i className="fas fa-times text-xs"></i>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* BTMM Flow Visualization */}
      <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border-purple-400/30">
        <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
          <i className="fas fa-route mr-2 text-purple-400"></i>
          BTMM Flow
        </h4>
        <div className="space-y-2">
          {['Bias', 'Setup', 'Pattern', 'Entry'].map((step, index) => (
            <div key={step} className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <span className="text-white text-sm">{step}</span>
              {index < 3 && <i className="fas fa-arrow-right text-white/40 text-xs"></i>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
