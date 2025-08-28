import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Screenshot } from '@shared/schema';

interface BTMMAnalysisPanelProps {
  screenshot: Screenshot | null;
  onAnnotate?: (annotation: any) => void;
}

// BTMM Analysis Data
const BTMM_BIAS_INFO = {
  'M': { 
    name: 'Market Structure', 
    description: 'Overall market direction based on higher timeframe analysis',
    keyPoints: ['Weekly/Daily trend', 'Major S/R levels', 'Market sentiment'],
    color: 'bg-blue-500'
  },
  'A1': { 
    name: 'Asian High Break', 
    description: 'Bullish bias when Asian session high is broken',
    keyPoints: ['Asian range identified', 'High break confirmed', 'Volume expansion'],
    color: 'bg-blue-600'
  },
  'A2': { 
    name: 'Asian Low Break', 
    description: 'Bearish bias when Asian session low is broken',
    keyPoints: ['Asian range identified', 'Low break confirmed', 'Volume expansion'],
    color: 'bg-blue-700'
  },
  'W': { 
    name: 'Weekly Bias', 
    description: 'Weekly timeframe directional bias',
    keyPoints: ['Weekly trend direction', 'Key weekly levels', 'Weekly close analysis'],
    color: 'bg-blue-800'
  },
  'V1': { 
    name: 'V-Pattern Bullish', 
    description: 'Sharp V-shaped bullish reversal pattern',
    keyPoints: ['Sharp decline', 'Quick reversal', 'Volume confirmation'],
    color: 'bg-purple-500'
  },
  'V2': { 
    name: 'V-Pattern Bearish', 
    description: 'Sharp V-shaped bearish reversal pattern',
    keyPoints: ['Sharp incline', 'Quick reversal', 'Volume confirmation'],
    color: 'bg-purple-600'
  },
  'ABS': { 
    name: 'Asian Box Stacking', 
    description: 'Manipulation of Asian session range',
    keyPoints: ['Asian range manipulation', 'Liquidity hunt', 'Reversal setup'],
    color: 'bg-yellow-500'
  },
  '3XADR': { 
    name: '3X ADR Extension', 
    description: 'Three times Average Daily Range extension',
    keyPoints: ['Extended move', 'Exhaustion signals', 'Reversal potential'],
    color: 'bg-red-500'
  }
};

const ENTRY_PATTERNS_INFO = {
  'RAILROAD_TRACKS': {
    name: 'Railroad Tracks',
    description: 'Two parallel opposite-colored candles indicating reversal',
    signals: ['Opposite colored candles', 'Similar size', 'At key level'],
    icon: 'fas fa-train'
  },
  'CORD_OF_WOODS': {
    name: 'Cord of Woods',
    description: 'Multiple rejection candles at a key level',
    signals: ['Multiple rejections', 'Long wicks', 'Volume decline'],
    icon: 'fas fa-tree'
  },
  'EVENING_STAR': {
    name: 'Evening Star',
    description: 'Three-candle bearish reversal pattern',
    signals: ['Bullish candle', 'Doji/small body', 'Bearish candle'],
    icon: 'fas fa-star'
  },
  'MORNING_STAR': {
    name: 'Morning Star', 
    description: 'Three-candle bullish reversal pattern',
    signals: ['Bearish candle', 'Doji/small body', 'Bullish candle'],
    icon: 'fas fa-sun'
  },
  'SHIFT_CANDLE': {
    name: 'Market Shift Candle',
    description: 'Candle that shifts market structure',
    signals: ['Structure break', 'Strong momentum', 'Volume spike'],
    icon: 'fas fa-exchange-alt'
  }
};

export function BTMMAnalysisPanel({ screenshot, onAnnotate }: BTMMAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [annotations, setAnnotations] = useState<any[]>([]);

  if (!screenshot) {
    return (
      <div className="flex items-center justify-center h-full bg-trading-dark border border-trading-border rounded-lg">
        <div className="text-center text-trading-text">
          <i className="fas fa-chart-line text-4xl mb-4 text-trading-accent"></i>
          <h3 className="text-lg font-semibold mb-2">Select a Screenshot</h3>
          <p className="text-sm">Choose a trade screenshot to analyze with BTMM methodology</p>
        </div>
      </div>
    );
  }

  const biasInfo = screenshot.bias ? BTMM_BIAS_INFO[screenshot.bias as keyof typeof BTMM_BIAS_INFO] : null;
  const entryInfo = screenshot.entry ? ENTRY_PATTERNS_INFO[screenshot.entry as keyof typeof ENTRY_PATTERNS_INFO] : null;

  return (
    <div className="bg-trading-dark border border-trading-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-trading-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <i className="fas fa-microscope mr-2 text-trading-accent"></i>
            BTMM Analysis
          </h3>
          <div className="flex items-center space-x-2">
            {screenshot.result === 'win' && (
              <Badge className="bg-green-500 text-white">
                <i className="fas fa-trophy mr-1"></i>
                Winner
              </Badge>
            )}
            {screenshot.riskReward && (
              <Badge className="bg-trading-accent text-white">
                {screenshot.riskReward}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-trading-text mt-1">{screenshot.title}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-trading-border">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="bias" className="text-xs">Bias</TabsTrigger>
          <TabsTrigger value="setup" className="text-xs">Setup</TabsTrigger>
          <TabsTrigger value="entry" className="text-xs">Entry</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="overview" className="space-y-4">
            {/* Trade Summary */}
            <Card className="p-4 bg-trading-card border-trading-border">
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <i className="fas fa-chart-bar mr-2 text-trading-gold"></i>
                Trade Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-trading-text">Pair:</span>
                  <span className="text-white ml-2 font-semibold">{screenshot.currencyPair}</span>
                </div>
                <div>
                  <span className="text-trading-text">Session:</span>
                  <span className="text-white ml-2">{screenshot.sessionTiming}</span>
                </div>
                <div>
                  <span className="text-trading-text">Type:</span>
                  <span className="text-white ml-2">{screenshot.tradeType}</span>
                </div>
                <div>
                  <span className="text-trading-text">Result:</span>
                  <span className={`ml-2 font-semibold ${
                    screenshot.result === 'win' ? 'text-green-400' : 
                    screenshot.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {screenshot.result?.toUpperCase()}
                  </span>
                </div>
              </div>
            </Card>

            {/* BTMM Flow */}
            <Card className="p-4 bg-trading-card border-trading-border">
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <i className="fas fa-route mr-2 text-trading-accent"></i>
                BTMM Flow Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-compass text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="text-white font-medium">Bias: {screenshot.bias}</div>
                    <div className="text-xs text-trading-text">{biasInfo?.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-cog text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="text-white font-medium">Setup: {screenshot.setupPattern}</div>
                    <div className="text-xs text-trading-text">Pattern recognition</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-line text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="text-white font-medium">Pattern: {screenshot.strategyType}</div>
                    <div className="text-xs text-trading-text">Chart pattern analysis</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-crosshairs text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="text-white font-medium">Entry: {screenshot.entry}</div>
                    <div className="text-xs text-trading-text">{entryInfo?.name}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Metrics */}
            <Card className="p-4 bg-trading-card border-trading-border">
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <i className="fas fa-calculator mr-2 text-trading-gold"></i>
                Performance Metrics
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-trading-text">Risk:Reward</span>
                  <span className="text-white font-semibold">{screenshot.riskReward || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-trading-text">Trade Bucket</span>
                  <span className="text-white">{screenshot.studyBucket}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-trading-text">Upload Date</span>
                  <span className="text-white">{new Date(screenshot.uploadedAt!).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bias" className="space-y-4">
            {biasInfo ? (
              <>
                <Card className="p-4 bg-trading-card border-trading-border">
                  <div className="flex items-center mb-3">
                    <div className={`w-4 h-4 rounded-full ${biasInfo.color} mr-3`}></div>
                    <h4 className="font-semibold text-white">{biasInfo.name}</h4>
                  </div>
                  <p className="text-trading-text text-sm mb-4">{biasInfo.description}</p>
                  
                  <div className="space-y-2">
                    <h5 className="text-white font-medium text-sm">Key Analysis Points:</h5>
                    {biasInfo.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <i className="fas fa-check text-trading-accent mr-2"></i>
                        <span className="text-trading-text">{point}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-trading-card border-trading-border">
                  <h4 className="font-semibold text-white mb-3">Steve Mauro BTMM Notes</h4>
                  <div className="text-sm text-trading-text space-y-2">
                    <p>• Market bias should be confirmed across multiple timeframes</p>
                    <p>• Look for institutional order flow confirmation</p>
                    <p>• Consider session timing and market hours impact</p>
                    <p>• Validate bias against major S/R levels</p>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-4 bg-trading-card border-trading-border">
                <div className="text-center text-trading-text">
                  <i className="fas fa-compass text-2xl mb-2"></i>
                  <p>No bias information available for this trade</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <Card className="p-4 bg-trading-card border-trading-border">
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <i className="fas fa-cog mr-2 text-green-400"></i>
                Setup Analysis: {screenshot.setupPattern}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-white font-medium text-sm mb-2">Setup Checklist:</h5>
                  <div className="space-y-2">
                    {[
                      'Market structure confirmation',
                      'Key level identification', 
                      'Volume analysis',
                      'Session timing alignment',
                      'Risk management setup'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <input 
                          type="checkbox" 
                          className="mr-2" 
                          id={`setup-check-${index}`}
                          title={`Mark ${item} as complete`}
                        />
                        <label htmlFor={`setup-check-${index}`} className="text-trading-text cursor-pointer">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-white font-medium text-sm mb-2">BTMM Setup Principles:</h5>
                  <div className="text-sm text-trading-text space-y-1">
                    <p>• Wait for clear institutional manipulation</p>
                    <p>• Confirm with multiple timeframe analysis</p>
                    <p>• Look for liquidity grabs and reversals</p>
                    <p>• Validate against daily/weekly levels</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="entry" className="space-y-4">
            {entryInfo ? (
              <>
                <Card className="p-4 bg-trading-card border-trading-border">
                  <div className="flex items-center mb-3">
                    <i className={`${entryInfo.icon} text-orange-400 mr-3`}></i>
                    <h4 className="font-semibold text-white">{entryInfo.name}</h4>
                  </div>
                  <p className="text-trading-text text-sm mb-4">{entryInfo.description}</p>
                  
                  <div className="space-y-2">
                    <h5 className="text-white font-medium text-sm">Entry Signals:</h5>
                    {entryInfo.signals.map((signal, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <i className="fas fa-bullseye text-orange-400 mr-2"></i>
                        <span className="text-trading-text">{signal}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-trading-card border-trading-border">
                  <h4 className="font-semibold text-white mb-3">Entry Execution</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-trading-text">Session:</span>
                      <span className="text-white ml-2">{screenshot.sessionTiming}</span>
                    </div>
                    <div>
                      <span className="text-trading-text">Pair:</span>
                      <span className="text-white ml-2">{screenshot.currencyPair}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-trading-dark rounded border border-trading-border">
                    <h5 className="text-white font-medium text-sm mb-2">Steve Mauro Entry Rules:</h5>
                    <div className="text-xs text-trading-text space-y-1">
                      <p>• Never chase price - wait for confirmation</p>
                      <p>• Use proper position sizing (1-2% risk)</p>
                      <p>• Set stop loss before entry</p>
                      <p>• Target minimum 1:2 R:R ratio</p>
                      <p>• Consider session-specific volatility</p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-4 bg-trading-card border-trading-border">
                <div className="text-center text-trading-text">
                  <i className="fas fa-crosshairs text-2xl mb-2"></i>
                  <p>No entry pattern information available</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Action Buttons */}
      <div className="p-4 border-t border-trading-border">
        <div className="flex space-x-2">
          <Button size="sm" className="flex-1 bg-trading-accent hover:bg-trading-accent/80">
            <i className="fas fa-bookmark mr-1"></i>
            Bookmark
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-trading-border">
            <i className="fas fa-edit mr-1"></i>
            Edit
          </Button>
          <Button size="sm" variant="outline" className="border-trading-border">
            <i className="fas fa-share"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
