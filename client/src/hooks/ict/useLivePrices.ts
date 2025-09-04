import { useState, useEffect, useCallback } from 'react';
import { ForexPrice } from '@/components/ict/LivePrices';

interface UseLivePricesHook {
  prices: ForexPrice[];
  isLoading: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
}

// Mock data for development - replace with real API integration
const MOCK_PRICES: ForexPrice[] = [
  {
    pair: 'EURUSD',
    bid: 1.0847,
    ask: 1.0849,
    spread: 2,
    change: 0.0012,
    changePercent: 0.11,
    lastUpdate: new Date()
  },
  {
    pair: 'GBPUSD',
    bid: 1.3102,
    ask: 1.3105,
    spread: 3,
    change: -0.0023,
    changePercent: -0.18,
    lastUpdate: new Date()
  },
  {
    pair: 'USDJPY',
    bid: 148.245,
    ask: 148.265,
    spread: 2,
    change: 0.387,
    changePercent: 0.26,
    lastUpdate: new Date()
  },
  {
    pair: 'AUDUSD',
    bid: 0.6734,
    ask: 0.6737,
    spread: 3,
    change: 0.0045,
    changePercent: 0.67,
    lastUpdate: new Date()
  },
  {
    pair: 'NZDUSD',
    bid: 0.6089,
    ask: 0.6092,
    spread: 3,
    change: -0.0012,
    changePercent: -0.20,
    lastUpdate: new Date()
  }
];

export const useLivePrices = (): UseLivePricesHook => {
  const [prices, setPrices] = useState<ForexPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateRandomVariation = useCallback((basePrice: number, maxVariation: number = 0.001) => {
    const variation = (Math.random() - 0.5) * 2 * maxVariation;
    return basePrice + variation;
  }, []);

  const updatePrices = useCallback(() => {
    try {
      const updatedPrices = MOCK_PRICES.map(price => {
        const bidVariation = generateRandomVariation(price.bid, price.pair.includes('JPY') ? 0.1 : 0.001);
        const askVariation = bidVariation + (price.spread * (price.pair.includes('JPY') ? 0.01 : 0.00001));
        
        const newChange = bidVariation - price.bid;
        const newChangePercent = (newChange / price.bid) * 100;

        return {
          ...price,
          bid: bidVariation,
          ask: askVariation,
          change: newChange,
          changePercent: newChangePercent,
          lastUpdate: new Date()
        };
      });

      setPrices(updatedPrices);
      setError(null);
    } catch (err) {
      setError('Failed to update prices');
      console.error('Error updating prices:', err);
    }
  }, [generateRandomVariation]);

  const refreshPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll simulate an API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updatePrices();
    } catch (err) {
      setError('Failed to fetch prices');
      console.error('Error fetching prices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updatePrices]);

  // Initial load
  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  // Update prices every 30 seconds to simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        updatePrices();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [updatePrices, isLoading]);

  // Simulate more frequent updates during active trading hours
  useEffect(() => {
    const now = new Date();
    const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hour = nyTime.getHours();
    
    // More frequent updates during London (2-5 AM) and NY (8-11 AM) sessions
    const isActiveSession = (hour >= 2 && hour <= 5) || (hour >= 8 && hour <= 11);
    
    if (isActiveSession) {
      const fastInterval = setInterval(() => {
        if (!isLoading) {
          updatePrices();
        }
      }, 10000); // Update every 10 seconds during active sessions

      return () => clearInterval(fastInterval);
    }
  }, [updatePrices, isLoading]);

  return {
    prices,
    isLoading,
    error,
    refreshPrices
  };
};

// Real API integration function (placeholder)
export const fetchLivePrices = async (): Promise<ForexPrice[]> => {
  // This would integrate with a real forex data provider
  // Examples: Alpha Vantage, Fixer.io, X-Rates API, etc.
  
  try {
    // Example API call structure:
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    // const data = await response.json();
    
    // For now, return mock data
    return MOCK_PRICES;
  } catch (error) {
    console.error('Error fetching live prices:', error);
    throw new Error('Failed to fetch live forex prices');
  }
};
