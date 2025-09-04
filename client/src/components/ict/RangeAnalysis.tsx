import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ForexPrice } from './LivePrices';

export interface RangeAnalysisProps {
  selectedPair: string;
  prices: ForexPrice[];
  onStepComplete: (step: string, completed: boolean) => void;
  onRangeInvalidation: (reason: string) => void;
  completedSteps: { [key: string]: boolean };
}

export const RangeAnalysis: React.FC<RangeAnalysisProps> = ({
  selectedPair,
  prices,
  onStepComplete,
  onRangeInvalidation,
  completedSteps
}) => {
  const handleCheckboxChange = (step: string, checked: boolean) => {
    onStepComplete(step, checked);
  };

  const RangeCheckItem = ({ 
    id, 
    title, 
    description, 
    liveTip, 
    recommendations,
    borderColor = "border-l-blue-500"
  }: {
    id: string;
    title: string;
    description: string;
    liveTip: string;
    recommendations: string[];
    borderColor?: string;
  }) => (
    <div className={`bg-white rounded-lg p-4 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <Checkbox
          id={id}
          checked={completedSteps[id] || false}
          onCheckedChange={(checked) => handleCheckboxChange(id, checked as boolean)}
          className="mt-1"
        />
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      
      <div className="bg-blue-50 rounded p-3 mb-3">
        <div className="text-xs font-semibold text-blue-800 mb-1">👁️ LIVE TIP:</div>
        <div className="text-xs text-blue-700">{liveTip}</div>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
            {rec}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 STEP 1: Live Range Analysis
            <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-6">
            <strong>Instructor Guidance:</strong> Start with CBDR as priority for the selected pair, using weekly bias from COT and market sentiment. 
            If suboptimal, switch to Asian or Flout. Measure using body prices from live data. Calculate SDs to fill 4 levels daily. 
            Pair-specific notes below each section.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CBDR Analysis */}
            <RangeCheckItem
              id="cbdr1"
              title="CBDR Range Check (2:00-8:00 PM EST)"
              description="Instructor: Measure high-low distance during 2-8 PM EST using live prices. Ideal: 20-40 pips, clean consolidation. Use candle bodies only (ignore wicks). Align with weekly commercial bias."
              liveTip="Open 15M chart → Mark body high/low from 2:00-8:00 PM → Calculate range = high - low. Example: EUR/USD high 1.1650, low 1.1620 = 30 pips."
              recommendations={[
                "✅ If range <40 pips: Calculate SDs (1 SD = range height). High accuracy for daily projections; fill 4 SDs.",
                "❌ If range >40 pips: Avoid CBDR; switch to Asian Range or Flout. Trigger invalidation alert.",
                "✅ If consolidation is clean: Confirm institutional positioning with COT; proceed to protraction.",
                "❌ If trending or choppy: Avoid and check Flout for equilibrium-based projections."
              ]}
              borderColor="border-l-red-500"
            />

            <RangeCheckItem
              id="cbdr2"
              title="CBDR Consolidation Pattern"
              description="Instructor: Confirm sideways movement, no trending during 2-8 PM EST. Bodies show commitment; wicks are liquidity grabs. Check COT for commercial hedging."
              liveTip="Look for: horizontal action, multiple boundary touches, low volatility. Use live prices to verify."
              recommendations={[
                "✅ If sideways with multiple touches: High probability; calculate SDs (2 SD = 2x range).",
                "❌ If trending through window: Invalid; avoid and fallback to Asian Range.",
                "✅ If volatility low (<40 pips): Set daily high/low targets at 2-3 SD.",
                "⚠️ If high volatility: Reduce position size to 0.5% or skip session."
              ]}
              borderColor="border-l-red-500"
            />

            {/* Asian Range Analysis */}
            <RangeCheckItem
              id="asian1"
              title="Asian Range Assessment (7:00 PM-12:00 AM EST)"
              description="Instructor: Evaluate overnight consolidation if CBDR suboptimal. Sweet spot: 20-30 pips for EUR/USD. Use body prices from live data."
              liveTip="Mark 7 PM high/low using live prices → Measure range. Example: GBP/USD high 1.3450, low 1.3420 = 30 pips."
              recommendations={[
                "✅ If range 20-30 pips: Calculate SDs (1 SD = range). Ideal for London sweeps; aim for 4 SD fills.",
                "❌ If range >50 pips: Choppy; avoid or use Flout for equilibrium-based targets.",
                "✅ If clear consolidation: Sets liquidity pools for London; proceed to protraction.",
                "❌ If no consolidation: Check CBDR or Flout; uncheck box."
              ]}
              borderColor="border-l-yellow-500"
            />

            <RangeCheckItem
              id="asian2"
              title="Asian Consolidation Quality"
              description="Instructor: Confirm tight ranging behavior for London setup. Focus on bodies for commitment. Use Intermarket Analysis for context."
              liveTip="Watch 7 PM-12 AM: price respects boundaries, minimal trending. Monitor live prices."
              recommendations={[
                "✅ If tight range with boundary respects: High-probability Judas Swing; calculate 1-4 SD for targets.",
                "❌ If trending or wide wicks: Liquidity grabs likely; avoid or confirm with Flout.",
                "✅ If aligns with CBDR SDs: Confluence increases win rate to 65%; use for entry.",
                "⚠️ If conflicts with CBDR: Resolve with Flout; reduce trade size."
              ]}
              borderColor="border-l-yellow-500"
            />

            {/* Flout Session Analysis */}
            <RangeCheckItem
              id="flout1"
              title="Flout Session Check (3:00 PM-Midnight EST)"
              description="Instructor: Measure equilibrium-based range for late-day positioning. Equilibrium = midpoint of high/low bodies from live prices."
              liveTip="Mark high/low from 3 PM-Midnight → Equilibrium = (high + low)/2. Example: USD/JPY high 148.70, low 148.30 = equilibrium 148.50."
              recommendations={[
                "✅ If range 30-50 pips: Calculate SDs from equilibrium (1 SD = equilibrium to high/low).",
                "❌ If range >60 pips: High volatility; avoid or use for confluence; trigger alert.",
                "✅ If aligns with CBDR/Asian: Highest probability; project 2-3 SD targets to fill 4 SDs.",
                "⚠️ If no alignment: Prioritize CBDR; use Flout as secondary confirmation."
              ]}
              borderColor="border-l-green-500"
            />

            <RangeCheckItem
              id="flout2"
              title="Flout Equilibrium Pattern"
              description="Instructor: Confirm equilibrium for projections to next session. Ignore wicks; focus on bodies. Check Market Profile for structure."
              liveTip="From equilibrium to high/low = 1 SD. Use live prices for precision."
              recommendations={[
                "✅ If equilibrium clear: Extend SDs (2 SD = 2x distance); target 4 SDs in London.",
                "❌ If choppy pattern: Invalid; fallback to Asian Range.",
                "⚠️ If post-news volatility: Enhance confluence with CBDR; monitor for 3-4 SD displacement.",
                "✅ If low volatility: Tight projections for scalps; align with protraction."
              ]}
              borderColor="border-l-green-500"
            />

            {/* General Checks */}
            <RangeCheckItem
              id="bias1"
              title="Higher Timeframe Bias"
              description="Instructor: Confirm Daily/4H directional bias using BOS, MSS, and PD Arrays before range setup. Use COT for weekly bias."
              liveTip="Check Daily/4H: BOS/MSS direction, PD Array alignment, seasonal bias"
              recommendations={[
                "✅ If bullish BOS on Daily: Favor buy setups after low liquidity sweeps in ranges.",
                "✅ If bearish MSS on 4H: Favor sell setups after high grabs; align with protraction.",
                "❌ If no clear bias: Avoid trading; wait for structure shift.",
                "✅ If COT shows commercial bias: Align with large funds for 65-75% win rate."
              ]}
              borderColor="border-l-gray-500"
            />

            <RangeCheckItem
              id="news1"
              title="News Event Check"
              description="Instructor: Ensure no major news during range periods to avoid invalidation. Check Market Sentiment for disruptions."
              liveTip="Check economic calendar: avoid FOMC, NFP, CPI"
              recommendations={[
                "✅ If no news: Proceed with full 1-2% risk per trade.",
                "⚠️ If high-impact news: Avoid or use single-range focus with 0.5% risk.",
                "❌ If news during protraction: Skip entry; monitor for post-news displacement.",
                "⚠️ If sentiment shifts: Reassess using Intermarket Analysis."
              ]}
              borderColor="border-l-gray-500"
            />
          </div>

          {/* Pair-Specific Notes */}
          {selectedPair !== 'general' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                📝 {selectedPair} Specific Notes
              </h4>
              <div className="text-sm text-blue-700">
                Pair-specific analysis and recommendations for {selectedPair} will be displayed here based on 
                the selected range method and current market conditions.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
