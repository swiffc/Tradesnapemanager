import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  calculateRange, 
  calculateSDLevels, 
  calculateSDFromEquilibrium,
  formatPrice,
  convertToPips,
  validateRangeQuality,
  getPairRecommendations
} from '@/utils/ict/ictCalculations';
import { ForexPrice } from './LivePrices';

export interface SDCalculatorProps {
  selectedPair: string;
  prices: ForexPrice[];
}

export const SDCalculator: React.FC<SDCalculatorProps> = ({
  selectedPair,
  prices
}) => {
  const [cbdrHigh, setCbdrHigh] = useState('');
  const [cbdrLow, setCbdrLow] = useState('');
  const [asianHigh, setAsianHigh] = useState('');
  const [asianLow, setAsianLow] = useState('');
  const [floutHigh, setFloutHigh] = useState('');
  const [floutLow, setFloutLow] = useState('');

  const [cbdrResults, setCbdrResults] = useState<any>(null);
  const [asianResults, setAsianResults] = useState<any>(null);
  const [floutResults, setFloutResults] = useState<any>(null);

  const calculateCBDR = () => {
    const high = parseFloat(cbdrHigh);
    const low = parseFloat(cbdrLow);
    
    if (isNaN(high) || isNaN(low) || high <= low) {
      alert('Please enter valid high and low values (high must be greater than low)');
      return;
    }

    const rangeData = calculateRange(high, low, selectedPair);
    const sdLevels = calculateSDLevels(rangeData);
    const quality = validateRangeQuality(rangeData, 'cbdr', selectedPair);
    const recommendations = getPairRecommendations(selectedPair, 'cbdr');

    setCbdrResults({
      rangeData,
      sdLevels,
      quality,
      recommendations,
      pips: convertToPips(rangeData.range, selectedPair)
    });
  };

  const calculateAsian = () => {
    const high = parseFloat(asianHigh);
    const low = parseFloat(asianLow);
    
    if (isNaN(high) || isNaN(low) || high <= low) {
      alert('Please enter valid high and low values (high must be greater than low)');
      return;
    }

    const rangeData = calculateRange(high, low, selectedPair);
    const sdLevels = calculateSDLevels(rangeData);
    const quality = validateRangeQuality(rangeData, 'asian', selectedPair);
    const recommendations = getPairRecommendations(selectedPair, 'asian');

    setAsianResults({
      rangeData,
      sdLevels,
      quality,
      recommendations,
      pips: convertToPips(rangeData.range, selectedPair)
    });
  };

  const calculateFlout = () => {
    const high = parseFloat(floutHigh);
    const low = parseFloat(floutLow);
    
    if (isNaN(high) || isNaN(low) || high <= low) {
      alert('Please enter valid high and low values (high must be greater than low)');
      return;
    }

    const rangeData = calculateRange(high, low, selectedPair);
    const sdLevels = calculateSDFromEquilibrium(rangeData);
    const quality = validateRangeQuality(rangeData, 'flout', selectedPair);
    const recommendations = getPairRecommendations(selectedPair, 'flout');

    setFloutResults({
      rangeData,
      sdLevels,
      quality,
      recommendations,
      pips: convertToPips(rangeData.range, selectedPair)
    });
  };

  const renderSDResults = (results: any, method: string) => {
    if (!results) return null;

    const { rangeData, sdLevels, quality, recommendations, pips } = results;

    return (
      <div className="space-y-4">
        {/* Range Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-600">Range Size</div>
              <div className="text-lg font-bold">{pips.toFixed(1)} pips</div>
            </div>
            <div>
              <div className="font-semibold text-gray-600">High</div>
              <div className="font-mono">{formatPrice(rangeData.high, selectedPair)}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-600">Low</div>
              <div className="font-mono">{formatPrice(rangeData.low, selectedPair)}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-600">Equilibrium</div>
              <div className="font-mono">{formatPrice(rangeData.equilibrium, selectedPair)}</div>
            </div>
          </div>
        </div>

        {/* Quality Score */}
        <div className="flex items-center gap-4">
          <div className="font-semibold">Range Quality:</div>
          <Badge 
            variant={quality.score >= 70 ? 'default' : quality.score >= 50 ? 'secondary' : 'destructive'}
            className="text-sm"
          >
            {quality.score}/100
          </Badge>
          <div className="text-sm text-gray-600">
            {quality.isValid ? '✅ Valid Range' : '❌ Invalid Range'}
          </div>
        </div>

        {/* SD Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-green-700">Bullish Targets (SD Highs)</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>+1 SD:</span>
                <span className="font-mono">{formatPrice(sdLevels.sd1High, selectedPair)}</span>
              </div>
              <div className="flex justify-between">
                <span>+2 SD:</span>
                <span className="font-mono">{formatPrice(sdLevels.sd2High, selectedPair)}</span>
              </div>
              <div className="flex justify-between">
                <span>+3 SD:</span>
                <span className="font-mono">{formatPrice(sdLevels.sd3High, selectedPair)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>+4 SD:</span>
                <span className="font-mono">{formatPrice(sdLevels.sd4High, selectedPair)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-red-700">Bearish Targets (SD Lows)</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>-1 SD:</span>
                <span className="font-mono">{formatPrice(sdLevels.sd1Low, selectedPair)}</span>
              </div>
              <div className="flex justify-between">
                <span>-2 SD:</span>
                <span className="font-mono">{formatPrice(sdLevels.sd2Low, selectedPair)}</span>
              </div>
              <div className="flex justify-between">
                <span>-3 SD:</span>
                <span className="font-mono">{formatPrice(sdLevels.sd3Low, selectedPair)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>-4 SD:</span>
                <span className="font-mono">{formatPrice(sdLevels.sd4Low, selectedPair)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Instructor Recommendations:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Quality Recommendations */}
        {quality.recommendations.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Quality Analysis:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {quality.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const getCurrentPrice = () => {
    const currentPrice = prices.find(p => p.pair === selectedPair);
    return currentPrice ? (currentPrice.bid + currentPrice.ask) / 2 : 0;
  };

  const fillCurrentPrice = (setter: (value: string) => void) => {
    const price = getCurrentPrice();
    if (price > 0) {
      setter(formatPrice(price, selectedPair));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧮 Standard Deviation Calculator
          <Badge variant="outline">{selectedPair}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cbdr" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cbdr">CBDR</TabsTrigger>
            <TabsTrigger value="asian">Asian Range</TabsTrigger>
            <TabsTrigger value="flout">Flout Session</TabsTrigger>
          </TabsList>

          {/* CBDR Tab */}
          <TabsContent value="cbdr" className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">CBDR Range Analysis (2:00-8:00 PM EST)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cbdr-high">CBDR High</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cbdr-high"
                      type="number"
                      step="0.00001"
                      value={cbdrHigh}
                      onChange={(e) => setCbdrHigh(e.target.value)}
                      placeholder="Enter high price"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => fillCurrentPrice(setCbdrHigh)}
                    >
                      Current
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cbdr-low">CBDR Low</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cbdr-low"
                      type="number"
                      step="0.00001"
                      value={cbdrLow}
                      onChange={(e) => setCbdrLow(e.target.value)}
                      placeholder="Enter low price"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => fillCurrentPrice(setCbdrLow)}
                    >
                      Current
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={calculateCBDR} variant="ict" size="sm" className="w-full">
                    Calculate CBDR SDs
                  </Button>
                </div>
              </div>
            </div>
            {renderSDResults(cbdrResults, 'CBDR')}
          </TabsContent>

          {/* Asian Range Tab */}
          <TabsContent value="asian" className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Asian Range Analysis (7:00 PM-12:00 AM EST)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="asian-high">Asian High</Label>
                  <div className="flex gap-2">
                    <Input
                      id="asian-high"
                      type="number"
                      step="0.00001"
                      value={asianHigh}
                      onChange={(e) => setAsianHigh(e.target.value)}
                      placeholder="Enter high price"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => fillCurrentPrice(setAsianHigh)}
                    >
                      Current
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="asian-low">Asian Low</Label>
                  <div className="flex gap-2">
                    <Input
                      id="asian-low"
                      type="number"
                      step="0.00001"
                      value={asianLow}
                      onChange={(e) => setAsianLow(e.target.value)}
                      placeholder="Enter low price"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => fillCurrentPrice(setAsianLow)}
                    >
                      Current
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={calculateAsian} variant="ict" size="sm" className="w-full">
                    Calculate Asian SDs
                  </Button>
                </div>
              </div>
            </div>
            {renderSDResults(asianResults, 'Asian Range')}
          </TabsContent>

          {/* Flout Session Tab */}
          <TabsContent value="flout" className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Flout Session Analysis (3:00 PM-Midnight EST)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="flout-high">Flout High</Label>
                  <div className="flex gap-2">
                    <Input
                      id="flout-high"
                      type="number"
                      step="0.00001"
                      value={floutHigh}
                      onChange={(e) => setFloutHigh(e.target.value)}
                      placeholder="Enter high price"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => fillCurrentPrice(setFloutHigh)}
                    >
                      Current
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="flout-low">Flout Low</Label>
                  <div className="flex gap-2">
                    <Input
                      id="flout-low"
                      type="number"
                      step="0.00001"
                      value={floutLow}
                      onChange={(e) => setFloutLow(e.target.value)}
                      placeholder="Enter low price"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => fillCurrentPrice(setFloutLow)}
                    >
                      Current
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={calculateFlout} variant="ict" size="sm" className="w-full">
                    Calculate Flout SDs
                  </Button>
                </div>
              </div>
            </div>
            {renderSDResults(floutResults, 'Flout Session')}
          </TabsContent>
        </Tabs>

        {/* Current Price Reference */}
        {getCurrentPrice() > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-sm text-gray-600">Current {selectedPair} Price</div>
            <div className="text-lg font-bold font-mono">{formatPrice(getCurrentPrice(), selectedPair)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
