import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface PairSelectorProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
}

const TRADING_PAIRS = [
  { value: 'general', label: 'General (All Pairs)', flag: '🌍' },
  { value: 'EURUSD', label: 'EUR/USD', flag: '🇪🇺🇺🇸' },
  { value: 'GBPUSD', label: 'GBP/USD', flag: '🇬🇧🇺🇸' },
  { value: 'USDJPY', label: 'USD/JPY', flag: '🇺🇸🇯🇵' },
  { value: 'AUDUSD', label: 'AUD/USD', flag: '🇦🇺🇺🇸' },
  { value: 'NZDUSD', label: 'NZD/USD', flag: '🇳🇿🇺🇸' },
];

const PAIR_CHARACTERISTICS = {
  'EURUSD': {
    volatility: 'Medium',
    optimalRange: '20-30 pips',
    bestSessions: ['London', 'NY Open'],
    notes: 'Most liquid pair, clean price action, ideal for beginners'
  },
  'GBPUSD': {
    volatility: 'High',
    optimalRange: '30-40 pips',
    bestSessions: ['London', 'NY Open'],
    notes: 'Volatile, requires wider stops, strong trending moves'
  },
  'USDJPY': {
    volatility: 'Low-Medium',
    optimalRange: '20-30 pips',
    bestSessions: ['Asian', 'London'],
    notes: 'Trending pair, lower volatility, good for scalping'
  },
  'AUDUSD': {
    volatility: 'Medium',
    optimalRange: '20-30 pips',
    bestSessions: ['Asian', 'London'],
    notes: 'Risk-on/off sentiment, commodity correlation'
  },
  'NZDUSD': {
    volatility: 'Medium',
    optimalRange: '20-30 pips',
    bestSessions: ['Asian', 'London'],
    notes: 'Similar to AUD, dairy market influence'
  }
};

export const PairSelector: React.FC<PairSelectorProps> = ({
  selectedPair,
  onPairChange
}) => {
  const selectedPairData = TRADING_PAIRS.find(pair => pair.value === selectedPair);
  const characteristics = PAIR_CHARACTERISTICS[selectedPair as keyof typeof PAIR_CHARACTERISTICS];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Trading Pair Selection for Specific Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label htmlFor="pair-select" className="font-medium text-sm">
            Select Trading Pair:
          </label>
          <Select value={selectedPair} onValueChange={onPairChange}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a trading pair" />
            </SelectTrigger>
            <SelectContent>
              {TRADING_PAIRS.map((pair) => (
                <SelectItem key={pair.value} value={pair.value}>
                  <div className="flex items-center gap-2">
                    <span>{pair.flag}</span>
                    <span>{pair.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pair Characteristics */}
        {characteristics && selectedPair !== 'general' && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              {selectedPairData?.flag} {selectedPairData?.label} Characteristics
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-600">Volatility</div>
                <Badge variant={
                  characteristics.volatility === 'High' ? 'destructive' : 
                  characteristics.volatility === 'Medium' ? 'default' : 'secondary'
                }>
                  {characteristics.volatility}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-600">Optimal Range</div>
                <Badge variant="outline">{characteristics.optimalRange}</Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-600">Best Sessions</div>
                <div className="flex flex-wrap gap-1">
                  {characteristics.bestSessions.map((session) => (
                    <Badge key={session} variant="secondary" className="text-xs">
                      {session}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="text-sm font-medium text-gray-600 mb-1">Trading Notes</div>
              <p className="text-sm text-gray-700">{characteristics.notes}</p>
            </div>
          </div>
        )}

        {/* General Analysis Note */}
        {selectedPair === 'general' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2">🌍 General Analysis Mode</h4>
            <p className="text-sm text-gray-700">
              In general mode, the system provides universal ICT analysis applicable to all major pairs. 
              For specific pair optimizations and tailored range targets, select an individual currency pair above.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Instructor Tip:</strong> Each pair has unique characteristics. EUR/USD offers the cleanest price action 
          for beginners, while GBP/USD provides higher volatility for experienced traders. Select your pair based on 
          your risk tolerance and trading experience.
        </div>
      </CardContent>
    </Card>
  );
};
