import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BTMMEducationProps {
  isMobile?: boolean;
}

export function BTMMEducation({ isMobile = false }: BTMMEducationProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          BTMM - Beat The Market Makers
        </h1>
        <p className="text-trading-text text-lg">
          Comprehensive market maker analysis and counter-manipulation strategies
        </p>
        <Badge variant="destructive" className="mt-2">
          Welcome to the Hardest Game in the World
        </Badge>
      </div>

      <Tabs defaultValue="fundamentals" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="fundamentals">Market Structure</TabsTrigger>
          <TabsTrigger value="sessions">Trading Sessions</TabsTrigger>
          <TabsTrigger value="manipulation">MM Tactics</TabsTrigger>
          <TabsTrigger value="strategy">Counter-Strategy</TabsTrigger>
          <TabsTrigger value="survival">Survival Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="fundamentals" className="space-y-4">
          <Card className="bg-trading-card border-trading-border">
            <CardHeader>
              <CardTitle className="text-white">Financial Market Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Market Types</h4>
                  <div className="space-y-2 text-sm text-trading-text">
                    <p><strong>Physical Asset Markets:</strong> Tangible products (wheat, autos, real estate)</p>
                    <p><strong>Financial Asset Markets:</strong> Stocks, bonds, derivatives</p>
                    <p><strong>Spot Markets:</strong> Immediate delivery (within days)</p>
                    <p><strong>Futures Markets:</strong> Future delivery contracts</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Market Classifications</h4>
                  <div className="space-y-2 text-sm text-trading-text">
                    <p><strong>Money Markets:</strong> Short-term, highly liquid debt</p>
                    <p><strong>Capital Markets:</strong> Long-term debt and stocks</p>
                    <p><strong>Primary Markets:</strong> New capital raising</p>
                    <p><strong>Secondary Markets:</strong> Existing securities trading</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-trading-card border-trading-border">
            <CardHeader>
              <CardTitle className="text-white">Market Manipulation Reality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">Critical Understanding</h4>
                <p className="text-trading-text text-sm">
                  The market is NOT free - it's manipulated like a puppet. The three major manipulators are:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-trading-text space-y-1">
                  <li>Liquidity Providers</li>
                  <li>Top Currency Traders (Banks & Hedge Funds)</li>
                  <li>Brokers</li>
                </ul>
              </div>
              <div className="space-y-2 text-sm text-trading-text">
                <p>Market makers are in business and every business needs to make money. Unfortunately, retail traders are "customers" to this business.</p>
                <p>Market makers constantly hunt your stop loss using algorithms that scan your entry point, stop loss, and take profit.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card className="bg-trading-card border-trading-border">
            <CardHeader>
              <CardTitle className="text-white">Global Trading Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">Asian Session</h4>
                  <p className="text-sm text-trading-text mb-2">000 - 0800 HRS</p>
                  <p className="text-xs text-trading-text">Gap Time: 1000 - 1100 HRS</p>
                  <Badge variant="outline" className="mt-2 text-xs">Lower Volatility</Badge>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">London Session</h4>
                  <p className="text-sm text-trading-text mb-2">1100 - 1600 HRS</p>
                  <p className="text-xs text-trading-text">Gap Time: 1530 - 1630 HRS</p>
                  <Badge variant="outline" className="mt-2 text-xs">High Volatility</Badge>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-2">New York Session</h4>
                  <p className="text-sm text-trading-text mb-2">1600 - 2000 HRS</p>
                  <Badge variant="outline" className="mt-2 text-xs">Highest Volatility</Badge>
                </div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-400 mb-2">Strategic Positioning</h4>
                <p className="text-sm text-trading-text">
                  There are 3 Market Makers positioned strategically around the world, one for each time zone.
                  Each session brings new targets and manipulation strategies.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manipulation" className="space-y-4">
          <Card className="bg-trading-card border-trading-border">
            <CardHeader>
              <CardTitle className="text-white">Market Maker Tactics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-400">Manipulation Strategies</h4>
                  <ul className="space-y-2 text-sm text-trading-text">
                    <li>• Induce traders to take positions</li>
                    <li>• Create panic and fear to induce emotional trading</li>
                    <li>• Generate quick moves and spike candles</li>
                    <li>• Use news releases for manipulation</li>
                    <li>• Create inexplicable price behavior</li>
                    <li>• Hit stops and clear the board</li>
                    <li>• Toy with the spread</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-400">Trap Move Timing</h4>
                  <ul className="space-y-2 text-sm text-trading-text">
                    <li>• Beginning and end of the week (Monday/Friday)</li>
                    <li>• Beginning and end of the day</li>
                    <li>• Beginning and end of each session</li>
                    <li>• Quarterly and seasonal transitions</li>
                  </ul>
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mt-3">
                    <p className="text-xs text-trading-text">
                      <strong>Trap Zones:</strong> Dealers use specific price ranges to trap liquidity, then swing the market leaving traders trapped.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-trading-card border-trading-border">
            <CardHeader>
              <CardTitle className="text-white">Market Maker Restrictions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-amber-400 mb-2">Regulatory Limitations</h4>
                <ul className="space-y-2 text-sm text-trading-text">
                  <li>• IMF restricts their ability to move price to a general range</li>
                  <li>• Limited to the Average Daily Range (ADR)</li>
                  <li>• Do not have unlimited equity</li>
                  <li>• Must close positions and regain balance periodically</li>
                </ul>
                <p className="text-xs text-trading-text mt-3 italic">
                  These restrictions exist to avoid market collapse and destruction of the world economy.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <Card className="bg-trading-card border-trading-border">
            <CardHeader>
              <CardTitle className="text-white">Anti-Market Maker Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">Core Principles</h4>
                <ul className="space-y-2 text-sm text-trading-text">
                  <li>• <strong>Map the Territory:</strong> Understand how the enemy thinks and acts</li>
                  <li>• <strong>Solid Game Plan:</strong> Have a comprehensive strategy before engaging</li>
                  <li>• <strong>Pick Battles Carefully:</strong> Only engage when conditions favor you</li>
                  <li>• <strong>Survival First:</strong> Your first goal is to stay in the game</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-400">Entry Strategies</h4>
                  <ul className="space-y-2 text-sm text-trading-text">
                    <li>• Session-based entries</li>
                    <li>• Post-liquidity grab entries</li>
                    <li>• Safe zone confirmations</li>
                    <li>• Anti-manipulation timing</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-400">Pattern Recognition</h4>
                  <ul className="space-y-2 text-sm text-trading-text">
                    <li>• Spike candles & panic moves</li>
                    <li>• Liquidity sweeps</li>
                    <li>• False breakout patterns</li>
                    <li>• Algorithmic hunt patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="survival" className="space-y-4">
          <Card className="bg-trading-card border-trading-border">
            <CardHeader>
              <CardTitle className="text-white">Survival Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-3">Your Competition</h4>
                <p className="text-sm text-trading-text mb-3">
                  You're up against some of the sharpest, fastest, most intelligent, well-informed, stubbornly irrational, and in many cases, unethical minds in the world:
                </p>
                <ul className="space-y-1 text-sm text-trading-text">
                  <li>• The computer that can react faster than you</li>
                  <li>• The trader who has more experience than you</li>
                  <li>• The fund that has more money than you</li>
                  <li>• The insider that has more information than you</li>
                  <li>• The others that will misinform you</li>
                  <li>• The inner voice that will do its best to undo you</li>
                </ul>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-3">Fundamental Rules</h4>
                <div className="space-y-3">
                  <div>
                    <Badge variant="destructive" className="mb-2">Rule #1</Badge>
                    <p className="text-sm text-trading-text">
                      Leave all your dreams of making quick and easy money behind.
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Rule #2</Badge>
                    <p className="text-sm text-trading-text">
                      The first aim is survival. Your absolute first goal is to learn how to stay in the game.
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">Rule #3</Badge>
                    <p className="text-sm text-trading-text">
                      This business is as cruel as any other business. It's a zero-sum game, and we are on the winning side.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-400 mb-2">Ready to Play?</h4>
                <p className="text-sm text-trading-text">
                  The hardest game in the world requires dedication, discipline, and deep understanding of market manipulation. 
                  Use this knowledge to position yourself on the winning side.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}