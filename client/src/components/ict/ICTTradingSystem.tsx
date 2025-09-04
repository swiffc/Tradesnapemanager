import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ICTNavigation } from './ICTNavigation';
import { LiveStatusBar } from './LiveStatusBar';
import { RangeAnalysis } from './RangeAnalysis';
import { ProtractionTimer } from './ProtractionTimer';
import { PairSelector } from './PairSelector';
import { LivePrices } from './LivePrices';
import { SDCalculator } from './SDCalculator';
import { useICTData } from '@/hooks/ict/useICTData';
import { useLivePrices } from '@/hooks/ict/useLivePrices';

export interface ICTTradingSystemProps {
  className?: string;
}

export const ICTTradingSystem: React.FC<ICTTradingSystemProps> = ({ className }) => {
  const [selectedPair, setSelectedPair] = useState<string>('EURUSD');
  const [timeUpdatesEnabled, setTimeUpdatesEnabled] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showInvalidationAlert, setShowInvalidationAlert] = useState(false);
  
  const { sessionData, protractionData, updateProgress } = useICTData(selectedPair);
  const { prices, isLoading: pricesLoading } = useLivePrices();
  
  // Track completed analysis steps
  const [completedSteps, setCompletedSteps] = useState({
    cbdr: false,
    asian: false,
    flout: false,
    bias: false,
    news: false,
    protraction: false
  });

  // Calculate progress based on completed steps
  useEffect(() => {
    const totalSteps = Object.keys(completedSteps).length;
    const completed = Object.values(completedSteps).filter(Boolean).length;
    const progress = Math.round((completed / totalSteps) * 100);
    setAnalysisProgress(progress);
    updateProgress(progress);
  }, [completedSteps, updateProgress]);

  const handleStepComplete = (step: keyof typeof completedSteps, completed: boolean) => {
    setCompletedSteps(prev => ({
      ...prev,
      [step]: completed
    }));
  };

  const handleRangeInvalidation = (reason: string) => {
    setShowInvalidationAlert(true);
    console.warn('Range invalidation:', reason);
  };

  const resetAnalysis = () => {
    setCompletedSteps({
      cbdr: false,
      asian: false,
      flout: false,
      bias: false,
      news: false,
      protraction: false
    });
    setAnalysisProgress(0);
    setShowInvalidationAlert(false);
  };

  const toggleTimeUpdates = () => {
    setTimeUpdatesEnabled(!timeUpdatesEnabled);
  };

  return (
    <div className={`ict-trading-system min-h-screen bg-gray-50 p-4 ${className}`}>
      {/* Navigation */}
      <ICTNavigation />
      
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">
            ICT Live Trading Decision System
          </CardTitle>
          <p className="text-lg opacity-90">
            Your Instructor for Real-Time Market Analysis & Execution Guide (2025)
          </p>
          <div className="mt-4">
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Instructor Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              i
            </div>
            Instructor Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            As your ICT trading instructor, I'll guide you step-by-step through live trading for your selected pair. 
            Follow the if-this-then-that instructions for CBDR, Asian Range, Flout, and protraction patterns, 
            incorporating weekly bias and commercial hedging from top-down analysis. Use live prices to measure 
            ranges and calculate SDs, aiming to fill 4 SD levels daily per IPDA. Check boxes to confirm steps. 
            Discipline is key—trade high-confluence setups only.
          </p>
        </CardContent>
      </Card>

      {/* Pair Selection */}
      <PairSelector
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
      />

      {/* Live Prices */}
      <LivePrices
        prices={prices}
        isLoading={pricesLoading}
        selectedPair={selectedPair}
      />

      {/* Invalidation Alert */}
      {showInvalidationAlert && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Instructor Warning:</strong> Range exceeds optimal size (&gt;60 pips), 
            high-impact news detected, or sentiment conflicts. Avoid trade or reduce position 
            size to 0.5%. Review setup.
          </AlertDescription>
        </Alert>
      )}

      {/* Live Status Bar */}
      <LiveStatusBar
        sessionData={sessionData}
        timeUpdatesEnabled={timeUpdatesEnabled}
      />

      {/* Progress Tracking */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">
                Market Analysis Progress: {analysisProgress}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Instructor Note: Complete checks for the selected pair to progress. 
                Aim for 100% before execution to fill 4 SD levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Range Analysis Section */}
      <RangeAnalysis
        selectedPair={selectedPair}
        prices={prices}
        onStepComplete={handleStepComplete}
        onRangeInvalidation={handleRangeInvalidation}
        completedSteps={completedSteps}
      />

      {/* Protraction Timer */}
      {analysisProgress > 50 && (
        <ProtractionTimer
          sessionData={sessionData}
          protractionData={protractionData}
          selectedPair={selectedPair}
          onStepComplete={handleStepComplete}
          timeUpdatesEnabled={timeUpdatesEnabled}
        />
      )}

      {/* SD Calculator */}
      <SDCalculator
        selectedPair={selectedPair}
        prices={prices}
      />

      {/* Control Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={resetAnalysis}
              variant="outline"
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Reset Analysis
            </Button>
            <Button 
              onClick={toggleTimeUpdates}
              variant="outline"
              className={timeUpdatesEnabled ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {timeUpdatesEnabled ? "Disable" : "Enable"} Live Updates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gray-800 text-white">
        <CardContent className="pt-6 text-center">
          <p>
            <strong>ICT Trading System (2025):</strong> Precision market analysis and execution. 
            Data sources: x-rates.com, ICT Sharks Forum, Notion.
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
