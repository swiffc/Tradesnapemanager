import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export interface ForexPrice {
  pair: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  lastUpdate: Date;
}

export interface LivePricesProps {
  prices: ForexPrice[];
  isLoading: boolean;
  selectedPair: string;
}

export const LivePrices: React.FC<LivePricesProps> = ({
  prices,
  isLoading,
  selectedPair
}) => {
  const formatPrice = (price: number, pair: string) => {
    // JPY pairs typically have 3 decimal places, others have 5
    const decimals = pair.includes('JPY') ? 3 : 5;
    return price.toFixed(decimals);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(4)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Live Forex Prices
            <Badge variant="outline">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Live Forex Prices
          <Badge variant="default" className="animate-pulse">LIVE</Badge>
        </CardTitle>
        <div className="text-sm text-gray-600">
          Last Updated: {getCurrentTime()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold">Pair</th>
                <th className="text-right py-3 px-2 font-semibold">Bid</th>
                <th className="text-right py-3 px-2 font-semibold">Ask</th>
                <th className="text-right py-3 px-2 font-semibold">Spread</th>
                <th className="text-right py-3 px-2 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price) => (
                <tr 
                  key={price.pair} 
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    selectedPair === price.pair ? 'bg-blue-50 ring-2 ring-blue-200' : ''
                  }`}
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{price.pair}</span>
                      {selectedPair === price.pair && (
                        <Badge variant="default" size="sm">Selected</Badge>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 font-mono">
                    {formatPrice(price.bid, price.pair)}
                  </td>
                  <td className="text-right py-3 px-2 font-mono">
                    {formatPrice(price.ask, price.pair)}
                  </td>
                  <td className="text-right py-3 px-2 font-mono text-sm">
                    {price.spread.toFixed(1)}
                  </td>
                  <td className={`text-right py-3 px-2 font-mono text-sm ${getChangeColor(price.change)}`}>
                    {formatChange(price.change, price.changePercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructor Tip */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm">
            <strong>Instructor Tip:</strong> Use these prices to measure ranges for the selected pair. 
            For dynamic updates, the system integrates with live forex data feeds. Monitor the spread 
            and volatility to determine optimal range sizes for CBDR, Asian, and Flout analysis.
          </p>
        </div>

        {/* Range Guidelines */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="font-semibold text-red-800 mb-1">CBDR Range</div>
            <div className="text-red-700">Optimal: 20-40 pips</div>
            <div className="text-red-600 text-xs">2:00-8:00 PM EST</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="font-semibold text-yellow-800 mb-1">Asian Range</div>
            <div className="text-yellow-700">Optimal: 20-30 pips</div>
            <div className="text-yellow-600 text-xs">7:00 PM-12:00 AM EST</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-semibold text-green-800 mb-1">Flout Session</div>
            <div className="text-green-700">Optimal: 30-50 pips</div>
            <div className="text-green-600 text-xs">3:00 PM-Midnight EST</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
