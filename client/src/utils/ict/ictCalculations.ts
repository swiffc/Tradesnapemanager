export interface RangeData {
  high: number;
  low: number;
  range: number;
  equilibrium: number;
  isValid: boolean;
  invalidationReason?: string;
}

export interface SDLevels {
  sd1High: number;
  sd1Low: number;
  sd2High: number;
  sd2Low: number;
  sd3High: number;
  sd3Low: number;
  sd4High: number;
  sd4Low: number;
}

/**
 * Calculate range data from high and low prices
 */
export const calculateRange = (high: number, low: number, pair: string): RangeData => {
  const range = high - low;
  const equilibrium = (high + low) / 2;
  
  // Convert to pips based on pair type
  const pips = convertToPips(range, pair);
  
  // Validate range size
  const isValid = pips >= 15 && pips <= 60; // General range validation
  let invalidationReason: string | undefined;
  
  if (pips < 15) {
    invalidationReason = 'Range too small (<15 pips) - insufficient liquidity';
  } else if (pips > 60) {
    invalidationReason = 'Range too large (>60 pips) - high volatility, avoid trading';
  }
  
  return {
    high,
    low,
    range,
    equilibrium,
    isValid,
    invalidationReason
  };
};

/**
 * Calculate Standard Deviation levels from range data
 */
export const calculateSDLevels = (rangeData: RangeData): SDLevels => {
  const { high, low, equilibrium, range } = rangeData;
  
  return {
    sd1High: high + range,
    sd1Low: low - range,
    sd2High: high + (range * 2),
    sd2Low: low - (range * 2),
    sd3High: high + (range * 3),
    sd3Low: low - (range * 3),
    sd4High: high + (range * 4),
    sd4Low: low - (range * 4)
  };
};

/**
 * Calculate Standard Deviation levels from equilibrium (for Flout method)
 */
export const calculateSDFromEquilibrium = (rangeData: RangeData): SDLevels => {
  const { high, low, equilibrium } = rangeData;
  const halfRange = (high - low) / 2;
  
  return {
    sd1High: equilibrium + halfRange,
    sd1Low: equilibrium - halfRange,
    sd2High: equilibrium + (halfRange * 2),
    sd2Low: equilibrium - (halfRange * 2),
    sd3High: equilibrium + (halfRange * 3),
    sd3Low: equilibrium - (halfRange * 3),
    sd4High: equilibrium + (halfRange * 4),
    sd4Low: equilibrium - (halfRange * 4)
  };
};

/**
 * Convert price difference to pips based on currency pair
 */
export const convertToPips = (priceDifference: number, pair: string): number => {
  // JPY pairs have different pip values
  if (pair.includes('JPY')) {
    return priceDifference * 100; // For JPY pairs, 1 pip = 0.01
  } else {
    return priceDifference * 10000; // For other pairs, 1 pip = 0.0001
  }
};

/**
 * Format price to appropriate decimal places
 */
export const formatPrice = (price: number, pair: string): string => {
  const decimals = pair.includes('JPY') ? 3 : 5;
  return price.toFixed(decimals);
};

/**
 * Calculate optimal position size based on range and risk
 */
export const calculatePositionSize = (
  accountBalance: number,
  riskPercentage: number,
  stopLossDistance: number,
  pair: string
): number => {
  const riskAmount = accountBalance * (riskPercentage / 100);
  const stopLossPips = convertToPips(stopLossDistance, pair);
  
  // Standard lot calculation (varies by broker and pair)
  const pipValue = pair.includes('JPY') ? 1 : 10; // Simplified pip value
  const positionSize = riskAmount / (stopLossPips * pipValue);
  
  return Math.round(positionSize * 100) / 100; // Round to 2 decimal places
};

/**
 * Validate range quality for different methods
 */
export const validateRangeQuality = (
  rangeData: RangeData,
  method: 'cbdr' | 'asian' | 'flout',
  pair: string
): { isValid: boolean; score: number; recommendations: string[] } => {
  const pips = convertToPips(rangeData.range, pair);
  let score = 0;
  const recommendations: string[] = [];
  
  // Method-specific validation
  switch (method) {
    case 'cbdr':
      if (pips >= 20 && pips <= 40) {
        score += 40;
      } else if (pips > 40) {
        recommendations.push('CBDR range too wide - consider Asian Range or Flout');
        score -= 20;
      } else {
        recommendations.push('CBDR range too narrow - wait for better setup');
        score -= 10;
      }
      break;
      
    case 'asian':
      if (pips >= 20 && pips <= 30) {
        score += 35;
      } else if (pips > 30) {
        recommendations.push('Asian range wide - expect choppy London session');
        score -= 15;
      }
      break;
      
    case 'flout':
      if (pips >= 30 && pips <= 50) {
        score += 30;
      } else if (pips > 50) {
        recommendations.push('Flout range very wide - high volatility expected');
        score -= 10;
      }
      break;
  }
  
  // General quality factors
  if (rangeData.isValid) {
    score += 20;
  }
  
  // Pair-specific adjustments
  if (pair === 'GBPUSD' && pips > 35) {
    score += 10; // GBP/USD naturally more volatile
    recommendations.push('GBP/USD volatility within normal range');
  } else if (pair === 'USDJPY' && pips < 25) {
    score += 10; // USD/JPY typically has tighter ranges
    recommendations.push('USD/JPY tight range - good for scalping');
  }
  
  // Add general recommendations
  if (score >= 70) {
    recommendations.push('High-quality range - proceed with full position size');
  } else if (score >= 50) {
    recommendations.push('Moderate quality range - consider reduced position size');
  } else {
    recommendations.push('Low-quality range - avoid or wait for better setup');
  }
  
  return {
    isValid: score >= 50,
    score: Math.max(0, Math.min(100, score)),
    recommendations
  };
};

/**
 * Calculate expected targets based on historical performance
 */
export const calculateExpectedTargets = (
  sdLevels: SDLevels,
  method: 'cbdr' | 'asian' | 'flout',
  session: 'london' | 'ny' | 'asian'
): { primary: number; secondary: number; extension: number } => {
  // Historical probabilities based on ICT methodology
  const probabilities = {
    cbdr: { london: { primary: 0.75, secondary: 0.45, extension: 0.25 } },
    asian: { london: { primary: 0.70, secondary: 0.40, extension: 0.20 } },
    flout: { london: { primary: 0.65, secondary: 0.35, extension: 0.15 } }
  };
  
  const sessionProb = probabilities[method][session] || probabilities[method].london;
  
  return {
    primary: sessionProb.primary,
    secondary: sessionProb.secondary,
    extension: sessionProb.extension
  };
};

/**
 * Get pair-specific trading recommendations
 */
export const getPairRecommendations = (pair: string, method: 'cbdr' | 'asian' | 'flout') => {
  const recommendations: { [key: string]: { [key: string]: string[] } } = {
    EURUSD: {
      cbdr: [
        'EUR/USD CBDR sweet spot: 20-30 pips',
        'Use 20-30 pip stops for optimal risk management',
        'Target 2-3 SD levels in London session',
        'Check COT report for commercial bias alignment'
      ],
      asian: [
        'Asian Range: 20-30 pips ideal for EUR/USD',
        'Lower volatility allows for tighter stops',
        'Sets up clean Judas Swings in London',
        'Align with Market Profile for confluence'
      ],
      flout: [
        'Flout Range: 20-40 pips for equilibrium analysis',
        'Project to London session for 4 SD fills',
        'Use for confluence with CBDR analysis',
        'Monitor EUR crosses for additional confirmation'
      ]
    },
    GBPUSD: {
      cbdr: [
        'GBP/USD CBDR: 30-40 pips due to higher volatility',
        'Use wider stops (40+ pips) for GBP pairs',
        'Expect stronger moves during London session',
        'Monitor Brexit-related news for volatility spikes'
      ],
      asian: [
        'Asian Range: 30-40 pips for GBP/USD',
        'Wider ranges common due to overnight volatility',
        'Strong London reversals expected',
        'Check UK economic calendar for data releases'
      ],
      flout: [
        'Flout Range: 30-50 pips for GBP pairs',
        'Higher volatility requires wider targets',
        'Good for confluence with other methods',
        'Monitor GBP crosses for correlation'
      ]
    }
  };
  
  return recommendations[pair]?.[method] || [
    `${method.toUpperCase()} analysis for ${pair}`,
    'Use standard range guidelines',
    'Monitor for confluence with other methods',
    'Adjust position size based on volatility'
  ];
};
