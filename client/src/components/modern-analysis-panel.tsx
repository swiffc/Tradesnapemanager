import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Screenshot } from '@shared/schema';

interface ModernAnalysisPanelProps {
  screenshot: Screenshot | null;
  onAnnotate?: (annotation: any) => void;
}

export function ModernAnalysisPanel({ screenshot, onAnnotate }: ModernAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!screenshot) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Select a Trade</h3>
          <p className="text-white/60 text-sm">Choose a screenshot to analyze with BTMM methodology</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Trade Analysis</h3>
          <div className="flex items-center space-x-2">
            {screenshot.result === 'win' && (
              <Badge className="bg-green-500 text-white">
                <i className="fas fa-trophy mr-1"></i>
                Winner
              </Badge>
            )}
            {screenshot.riskReward && (
              <Badge className="bg-purple-500 text-white">
                {screenshot.riskReward}
              </Badge>
            )}
          </div>
        </div>
        <h4 className="text-white/80 font-medium">{screenshot.title}</h4>
        <div className="flex items-center space-x-4 mt-2 text-sm text-white/60">
          <span>{screenshot.currencyPair}</span>
          <span>•</span>
          <span>{screenshot.sessionTiming}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-6 mt-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-500">
              Overview
            </TabsTrigger>
            <TabsTrigger value="btmm" className="text-white data-[state=active]:bg-purple-500">
              BTMM
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-white data-[state=active]:bg-purple-500">
              Notes
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Trade Summary */}
              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <h5 className="font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-chart-bar mr-2 text-blue-400"></i>
                  Trade Summary
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/60 block">Pair</span>
                      <span className="text-white font-semibold">{screenshot.currencyPair}</span>
                    </div>
                    <div>
                      <span className="text-white/60 block">Session</span>
                      <span className="text-white">{screenshot.sessionTiming}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/60 block">Result</span>
                      <span className={`font-semibold ${
                        screenshot.result === 'win' ? 'text-green-400' : 
                        screenshot.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {screenshot.result?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60 block">R:R</span>
                      <span className="text-white font-semibold">{screenshot.riskReward || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Performance Metrics */}
              <Card className="p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm border-green-400/30">
                <h5 className="font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-trophy mr-2 text-green-400"></i>
                  Performance
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-xl font-bold text-green-400">
                      {screenshot.result === 'win' ? '+' : screenshot.result === 'loss' ? '-' : '0'}
                      {screenshot.riskReward?.replace(/[+-]/, '') || '0R'}
                    </div>
                    <div className="text-xs text-white/60">Outcome</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-xl font-bold text-white">1</div>
                    <div className="text-xs text-white/60">Trade</div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="btmm" className="space-y-4 mt-0">
              {/* BTMM Flow */}
              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <h5 className="font-semibold text-white mb-4 flex items-center">
                  <i className="fas fa-route mr-2 text-purple-400"></i>
                  BTMM Flow Analysis
                </h5>
                <div className="space-y-4">
                  {[
                    { step: 'Bias', value: screenshot.bias, icon: 'fas fa-compass', color: 'blue' },
                    { step: 'Setup', value: screenshot.setupPattern, icon: 'fas fa-cog', color: 'green' },
                    { step: 'Pattern', value: screenshot.strategyType, icon: 'fas fa-chart-line', color: 'purple' },
                    { step: 'Entry', value: screenshot.entry, icon: 'fas fa-crosshairs', color: 'orange' }
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-center space-x-4">
                      <div className={`w-10 h-10 bg-${item.color}-500 rounded-xl flex items-center justify-center shadow-lg`}>
                        <i className={`${item.icon} text-white`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{item.step}</div>
                        <div className="text-white/60 text-sm">{item.value || 'Not set'}</div>
                      </div>
                      {index < 3 && (
                        <i className="fas fa-arrow-down text-white/30"></i>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* BTMM Checklist */}
              <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-400/30">
                <h5 className="font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-check-circle mr-2 text-purple-400"></i>
                  BTMM Checklist
                </h5>
                <div className="space-y-2">
                  {[
                    'Market structure confirmed',
                    'Bias identified',
                    'Setup pattern recognized',
                    'Entry signal validated',
                    'Risk management applied'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded bg-white/20 border-white/30"
                        id={`check-${index}`}
                        defaultChecked={index < 3}
                      />
                      <label htmlFor={`check-${index}`} className="text-white/80 text-sm cursor-pointer">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-0">
              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <h5 className="font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-sticky-note mr-2 text-yellow-400"></i>
                  Trade Notes
                </h5>
                <div className="space-y-3">
                  <textarea 
                    placeholder="Add your trade notes..."
                    className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:border-purple-400"
                  />
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    <i className="fas fa-save mr-2"></i>
                    Save Notes
                  </Button>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-blue-400/30">
                <h5 className="font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-lightbulb mr-2 text-yellow-400"></i>
                  BTMM Insights
                </h5>
                <div className="space-y-2 text-sm text-white/80">
                  <p>• Market makers hunt stops before reversals</p>
                  <p>• Look for institutional order flow confirmation</p>
                  <p>• Session timing affects volatility patterns</p>
                  <p>• Risk management is key to long-term success</p>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-3">
          <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <i className="fas fa-bookmark"></i>
          </Button>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            <i className="fas fa-edit"></i>
          </Button>
          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
            <i className="fas fa-share"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
