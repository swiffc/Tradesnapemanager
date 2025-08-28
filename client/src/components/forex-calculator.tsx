import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ForexCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Trade {
  number: number;
  result: 'WIN' | 'LOSS';
  riskAmount: number;
  riskType: string;
  lots: number;
  requiredMargin: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: string;
  pl: number;
  balanceAfter: number;
  runningPL: number;
  balanceBefore: number;
  cumulativeProfits: number;
  lossToRecover: number;
  recoveryMode: boolean;
}

export function ForexCalculator({ isOpen, onClose }: ForexCalculatorProps) {
  // Editable trading parameters (define these first)
  const [initialCapital, setInitialCapital] = useState(3000);
  const [leverage, setLeverage] = useState(500);
  const [initialRiskPercent, setInitialRiskPercent] = useState(10);
  const [afterWinRiskPercent, setAfterWinRiskPercent] = useState(25);
  const [recoveryRiskPercent, setRecoveryRiskPercent] = useState(5);
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentBalance, setCurrentBalance] = useState(3000);
  const [stopLoss, setStopLoss] = useState(20);
  const [riskReward, setRiskReward] = useState("2");
  const [customReward, setCustomReward] = useState("");
  const [pipValue, setPipValue] = useState(10);
  
  // Update currentBalance when initialCapital changes
  useEffect(() => {
    if (trades.length === 0) {
      setCurrentBalance(initialCapital);
      setHighestBalance(initialCapital);
      setLowestBalance(initialCapital);
    }
  }, [initialCapital, trades.length]);
  
  // Trading strategy state
  const [lastWinProfit, setLastWinProfit] = useState(0);
  const [isAfterWin, setIsAfterWin] = useState(false);
  const [highestBalance, setHighestBalance] = useState(3000);
  const [lowestBalance, setLowestBalance] = useState(3000);
  const [cumulativeWinProfits, setCumulativeWinProfits] = useState(0);
  const [lossToRecover, setLossToRecover] = useState(0);
  const [recoveryMode, setRecoveryMode] = useState(false);
  
  const standardLotSize = 100000;

  const getRiskReward = () => {
    if (customReward && !isNaN(parseFloat(customReward))) {
      return parseFloat(customReward);
    }
    return parseFloat(riskReward);
  };

  const calculatePositionSize = (riskAmount: number) => {
    const stopLossPips = stopLoss;
    const pipVal = pipValue;
    return riskAmount / (stopLossPips * pipVal);
  };

  const calculateMargin = (lots: number) => {
    const notionalValue = lots * standardLotSize;
    const requiredMargin = notionalValue / leverage;
    return { notionalValue, requiredMargin };
  };

  const calculateNextRisk = () => {
    let riskAmount: number;
    let riskType: string;
    
    if (trades.length === 0) {
      riskAmount = initialCapital * (initialRiskPercent / 100);
      riskType = `Initial ${initialRiskPercent}%`;
    } else {
      const lastTrade = trades[trades.length - 1];
      
      if (recoveryMode || lossToRecover > 0) {
        riskAmount = currentBalance * (recoveryRiskPercent / 100);
        riskType = `${recoveryRiskPercent}% recovery mode ($${lossToRecover.toFixed(2)} to recover)`;
      } else if (lastTrade.result === 'WIN' && !recoveryMode) {
        riskAmount = cumulativeWinProfits * (afterWinRiskPercent / 100);
        riskType = `${afterWinRiskPercent}% of total profits ($${cumulativeWinProfits.toFixed(2)})`;
      } else if (lastTrade.result === 'LOSS') {
        riskAmount = currentBalance * (recoveryRiskPercent / 100);
        riskType = `${recoveryRiskPercent}% of balance (post-loss)`;
      } else {
        riskAmount = currentBalance * (recoveryRiskPercent / 100);
        riskType = `${recoveryRiskPercent}% of balance`;
      }
    }
    
    return { riskAmount, riskType };
  };

  const getNextTradeInfo = () => {
    const { riskAmount, riskType } = calculateNextRisk();
    const rr = getRiskReward();
    const potentialProfit = riskAmount * rr;
    const takeProfitPips = stopLoss * rr;
    
    const lots = calculatePositionSize(riskAmount);
    const { notionalValue, requiredMargin } = calculateMargin(lots);
    const freeMargin = currentBalance - requiredMargin;
    const marginLevel = requiredMargin > 0 ? (currentBalance / requiredMargin * 100) : Infinity;
    const maxLotsAvailable = (currentBalance * leverage) / standardLotSize;
    
    return {
      riskAmount,
      riskType,
      potentialProfit,
      takeProfitPips,
      lots,
      notionalValue,
      requiredMargin,
      freeMargin,
      marginLevel,
      maxLotsAvailable
    };
  };

  const recordTrade = (result: 'WIN' | 'LOSS') => {
    const { riskAmount, riskType } = calculateNextRisk();
    const rr = getRiskReward();
    const takeProfitPips = stopLoss * rr;
    
    const lots = calculatePositionSize(riskAmount);
    const { notionalValue, requiredMargin } = calculateMargin(lots);
    
    let pl: number;
    let newCumulativeProfits = cumulativeWinProfits;
    let newLossToRecover = lossToRecover;
    let newRecoveryMode = recoveryMode;
    
    if (result === 'WIN') {
      pl = riskAmount * rr;
      setLastWinProfit(pl);
      
      if (recoveryMode || lossToRecover > 0) {
        newLossToRecover -= pl;
        if (newLossToRecover <= 0) {
          newRecoveryMode = false;
          newCumulativeProfits = Math.abs(newLossToRecover);
          newLossToRecover = 0;
        }
      } else {
        newCumulativeProfits += pl;
      }
    } else {
      pl = -riskAmount;
      newLossToRecover += Math.abs(pl);
      newRecoveryMode = true;
      newCumulativeProfits = 0;
    }
    
    const previousBalance = currentBalance;
    const newBalance = currentBalance + pl;
    
    setCurrentBalance(newBalance);
    setCumulativeWinProfits(newCumulativeProfits);
    setLossToRecover(newLossToRecover);
    setRecoveryMode(newRecoveryMode);
    
    if (newBalance > highestBalance) {
      setHighestBalance(newBalance);
    }
    if (newBalance < lowestBalance) {
      setLowestBalance(newBalance);
    }
    
    const trade: Trade = {
      number: trades.length + 1,
      result: result,
      riskAmount: riskAmount,
      riskType: riskType,
      lots: lots,
      requiredMargin: requiredMargin,
      stopLoss: stopLoss,
      takeProfit: takeProfitPips,
      riskReward: `1:${rr}`,
      pl: pl,
      balanceAfter: newBalance,
      runningPL: newBalance - initialCapital,
      balanceBefore: previousBalance,
      cumulativeProfits: newCumulativeProfits,
      lossToRecover: newLossToRecover,
      recoveryMode: newRecoveryMode
    };
    
    setTrades(prev => [...prev, trade]);
    setIsAfterWin(result === 'WIN');
  };

  const resetCalculator = () => {
    if (confirm('Are you sure you want to reset all trades?')) {
      setTrades([]);
      setCurrentBalance(initialCapital);
      setLastWinProfit(0);
      setIsAfterWin(false);
      setHighestBalance(initialCapital);
      setLowestBalance(initialCapital);
      setCumulativeWinProfits(0);
      setLossToRecover(0);
      setRecoveryMode(false);
    }
  };

  const getStats = () => {
    const wins = trades.filter(t => t.result === 'WIN').length;
    const winRate = trades.length > 0 ? (wins / trades.length * 100) : 0;
    const totalPL = currentBalance - initialCapital;
    const maxDrawdown = highestBalance - lowestBalance;
    
    return { wins, winRate, totalPL, maxDrawdown };
  };

  if (!isOpen) return null;

  const nextTradeInfo = getNextTradeInfo();
  const stats = getStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-trading-card border border-trading-border rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <i className="fas fa-chart-line mr-3 text-trading-accent"></i>
              🔷 Forex Compound Calculator ({leverage}:1 Leverage)
            </h2>
            <Button
              onClick={onClose}
              className="bg-bearish hover:bg-bearish/80 text-white font-bold px-4 py-2 min-h-[44px] touch-manipulation"
              data-testid="button-close-calculator"
            >
              ✕ Close
            </Button>
          </div>

          {/* Strategy Settings */}
          <Card className="bg-gradient-to-r from-trading-accent to-trading-gold text-trading-dark mb-6">
            <CardContent className="p-4">
              <h3 className="font-bold mb-4">Trading Strategy Settings:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-trading-dark font-medium">Initial Capital ($)</Label>
                  <Input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 3000)}
                    className="bg-white text-trading-dark border-trading-border"
                    min="100"
                    step="100"
                    data-testid="input-initial-capital"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-trading-dark font-medium">Leverage Ratio</Label>
                  <Input
                    type="number"
                    value={leverage}
                    onChange={(e) => setLeverage(parseFloat(e.target.value) || 500)}
                    className="bg-white text-trading-dark border-trading-border"
                    min="1"
                    step="1"
                    data-testid="input-leverage"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-trading-dark font-medium">Initial Risk (%)</Label>
                  <Input
                    type="number"
                    value={initialRiskPercent}
                    onChange={(e) => setInitialRiskPercent(parseFloat(e.target.value) || 10)}
                    className="bg-white text-trading-dark border-trading-border"
                    min="0.1"
                    max="100"
                    step="0.1"
                    data-testid="input-initial-risk"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-trading-dark font-medium">After Win Risk (%)</Label>
                  <Input
                    type="number"
                    value={afterWinRiskPercent}
                    onChange={(e) => setAfterWinRiskPercent(parseFloat(e.target.value) || 25)}
                    className="bg-white text-trading-dark border-trading-border"
                    min="0.1"
                    max="100"
                    step="0.1"
                    data-testid="input-after-win-risk"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-trading-dark font-medium">Recovery Risk (%)</Label>
                  <Input
                    type="number"
                    value={recoveryRiskPercent}
                    onChange={(e) => setRecoveryRiskPercent(parseFloat(e.target.value) || 5)}
                    className="bg-white text-trading-dark border-trading-border"
                    min="0.1"
                    max="100"
                    step="0.1"
                    data-testid="input-recovery-risk"
                  />
                </div>
              </div>
              <div className="mt-3 text-sm">
                <div className="font-medium mb-1">Current Strategy:</div>
                <div className="space-y-1 text-xs">
                  <div>• Initial capital: ${initialCapital.toLocaleString()} | Leverage: {leverage}:1</div>
                  <div>• First trade: Risk {initialRiskPercent}% of capital</div>
                  <div>• After WIN: Risk {afterWinRiskPercent}% of profit from win</div>
                  <div>• After LOSS: Risk {recoveryRiskPercent}% of balance until recovery</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-white">Stop Loss (pips)</Label>
              <Input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 20)}
                className="bg-trading-card text-white border-trading-border"
                min="1"
                step="1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Risk:Reward Ratio</Label>
              <Select value={riskReward} onValueChange={setRiskReward}>
                <SelectTrigger className="bg-trading-card text-white border-trading-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-trading-card border-trading-border">
                  <SelectItem value="1" className="text-white hover:bg-trading-border">1:1</SelectItem>
                  <SelectItem value="1.5" className="text-white hover:bg-trading-border">1:1.5</SelectItem>
                  <SelectItem value="2" className="text-white hover:bg-trading-border">1:2</SelectItem>
                  <SelectItem value="2.5" className="text-white hover:bg-trading-border">1:2.5</SelectItem>
                  <SelectItem value="3" className="text-white hover:bg-trading-border">1:3</SelectItem>
                  <SelectItem value="4" className="text-white hover:bg-trading-border">1:4</SelectItem>
                  <SelectItem value="5" className="text-white hover:bg-trading-border">1:5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Pip Value ($/pip per lot)</Label>
              <Input
                type="number"
                value={pipValue}
                onChange={(e) => setPipValue(parseFloat(e.target.value) || 10)}
                className="bg-trading-card text-white border-trading-border"
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Custom R:R (optional)</Label>
              <Input
                type="number"
                placeholder="e.g., 3.5"
                value={customReward}
                onChange={(e) => setCustomReward(e.target.value)}
                className="bg-trading-card text-white border-trading-border"
                step="0.1"
                min="0.1"
              />
            </div>
          </div>

          {/* Margin Info */}
          <Card className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white mb-6">
            <CardHeader>
              <CardTitle className="text-lg">📊 Position Sizing & Margin Requirements ({leverage}:1 Leverage)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white bg-opacity-10 p-3 rounded">
                  <div className="text-sm opacity-90">Position Size:</div>
                  <div className="font-bold">{nextTradeInfo.lots.toFixed(2)} lots</div>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded">
                  <div className="text-sm opacity-90">Notional Value:</div>
                  <div className="font-bold">${nextTradeInfo.notionalValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded">
                  <div className="text-sm opacity-90">Required Margin:</div>
                  <div className="font-bold">${nextTradeInfo.requiredMargin.toFixed(2)}</div>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded">
                  <div className="text-sm opacity-90">Free Margin:</div>
                  <div className="font-bold">${nextTradeInfo.freeMargin.toFixed(2)}</div>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded">
                  <div className="text-sm opacity-90">Margin Level:</div>
                  <div className="font-bold">{nextTradeInfo.marginLevel === Infinity ? '∞%' : `${nextTradeInfo.marginLevel.toFixed(0)}%`}</div>
                </div>
                <div className="bg-white bg-opacity-10 p-3 rounded">
                  <div className="text-sm opacity-90">Max Lots Available:</div>
                  <div className="font-bold">{nextTradeInfo.maxLotsAvailable.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Trade Risk */}
          <Card className="bg-orange-50 border-2 border-orange-400 mb-6">
            <CardHeader>
              <CardTitle className="text-orange-600">Next Trade Risk Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-gray-800">
                <div>
                  <div className="text-sm text-gray-600">Risk Amount:</div>
                  <div className="font-bold text-lg">${nextTradeInfo.riskAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Potential Profit:</div>
                  <div className="font-bold text-lg">${nextTradeInfo.potentialProfit.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Take Profit (pips):</div>
                  <div className="font-bold text-lg">{nextTradeInfo.takeProfitPips.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Risk Type:</div>
                  <div className="font-bold text-sm">{nextTradeInfo.riskType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Account Balance:</div>
                  <div className="font-bold text-lg">${currentBalance.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Loss to Recover:</div>
                  <div className={`font-bold text-lg ${lossToRecover > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {lossToRecover > 0 ? `$${lossToRecover.toFixed(2)}` : 'None'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button 
              onClick={() => recordTrade('WIN')}
              className="flex-1 bg-bullish hover:bg-bullish/80 text-white font-bold py-4 px-6 text-lg min-h-[50px] touch-manipulation"
              data-testid="button-record-win"
            >
              Record WIN ✓
            </Button>
            <Button 
              onClick={() => recordTrade('LOSS')}
              className="flex-1 bg-bearish hover:bg-bearish/80 text-white font-bold py-4 px-6 text-lg min-h-[50px] touch-manipulation"
              data-testid="button-record-loss"
            >
              Record LOSS ✗
            </Button>
            <Button 
              onClick={resetCalculator}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 text-lg min-h-[50px] touch-manipulation"
              data-testid="button-reset-calculator"
            >
              Reset Calculator
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-trading-accent to-trading-gold text-trading-dark">
              <CardContent className="p-4 text-center">
                <div className="text-sm opacity-90">Starting Capital</div>
                <div className="text-xl font-bold">$3,000.00</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-trading-accent to-trading-gold text-trading-dark">
              <CardContent className="p-4 text-center">
                <div className="text-sm opacity-90">Current Balance</div>
                <div className="text-xl font-bold">${currentBalance.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-trading-accent to-trading-gold text-trading-dark">
              <CardContent className="p-4 text-center">
                <div className="text-sm opacity-90">Total P&L</div>
                <div className={`text-xl font-bold ${stats.totalPL >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {stats.totalPL >= 0 ? '+' : ''}${stats.totalPL.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-trading-accent to-trading-gold text-trading-dark">
              <CardContent className="p-4 text-center">
                <div className="text-sm opacity-90">Win Rate</div>
                <div className="text-xl font-bold">{stats.winRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-trading-accent to-trading-gold text-trading-dark">
              <CardContent className="p-4 text-center">
                <div className="text-sm opacity-90">Total Trades</div>
                <div className="text-xl font-bold">{trades.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-trading-accent to-trading-gold text-trading-dark">
              <CardContent className="p-4 text-center">
                <div className="text-sm opacity-90">Max Drawdown</div>
                <div className="text-xl font-bold">${stats.maxDrawdown.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Margin Info Box */}
          <Card className="bg-blue-50 border-2 border-blue-400 mb-6">
            <CardContent className="p-4">
              <h4 className="text-blue-700 font-bold mb-2">💡 How Margin Calculation Works:</h4>
              <p className="text-gray-700 text-sm">
                With 500:1 leverage, you only need to put up 1/500th of the position value as margin. 
                For example: A 1 standard lot position (100,000 units) requires only $200 margin at 500:1 leverage.
                The calculator automatically sizes your positions based on your stop loss and risk amount, 
                ensuring you never risk more than your strategy dictates while maximizing the leverage available.
              </p>
            </CardContent>
          </Card>

          {/* Trades Table */}
          {trades.length > 0 && (
            <Card className="bg-trading-border border-trading-border">
              <CardHeader>
                <CardTitle className="text-white">Trade History</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-trading-accent to-trading-gold text-trading-dark">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Result</th>
                      <th className="p-2 text-left">Risk $</th>
                      <th className="p-2 text-left">Risk Type</th>
                      <th className="p-2 text-left">Lots</th>
                      <th className="p-2 text-left">Margin</th>
                      <th className="p-2 text-left">SL</th>
                      <th className="p-2 text-left">TP</th>
                      <th className="p-2 text-left">R:R</th>
                      <th className="p-2 text-left">P&L</th>
                      <th className="p-2 text-left">Balance</th>
                      <th className="p-2 text-left">Total P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.number} className={`${trade.result === 'WIN' ? 'bg-green-50' : 'bg-red-50'} hover:bg-gray-100`}>
                        <td className="p-2 text-gray-800">{trade.number}</td>
                        <td className="p-2 font-bold text-gray-800">{trade.result}</td>
                        <td className="p-2 text-gray-800">${trade.riskAmount.toFixed(2)}</td>
                        <td className="p-2 text-xs text-gray-600">{trade.riskType}</td>
                        <td className="p-2 text-gray-800">{trade.lots.toFixed(2)}</td>
                        <td className="p-2 text-gray-800">${trade.requiredMargin.toFixed(2)}</td>
                        <td className="p-2 text-gray-800">{trade.stopLoss} pips</td>
                        <td className="p-2 text-gray-800">{trade.takeProfit.toFixed(0)} pips</td>
                        <td className="p-2 text-gray-800">{trade.riskReward}</td>
                        <td className={`p-2 font-bold ${trade.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.pl >= 0 ? '+' : ''}${trade.pl.toFixed(2)}
                        </td>
                        <td className="p-2 text-gray-800">${trade.balanceAfter.toFixed(2)}</td>
                        <td className={`p-2 font-bold ${trade.runningPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.runningPL >= 0 ? '+' : ''}${trade.runningPL.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}