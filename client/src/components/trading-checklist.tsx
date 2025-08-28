import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Target, TrendingUp, MapPin, RotateCcw, ArrowRight, CheckCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistColumn {
  title: string;
  items: ChecklistItem[];
}

interface ChecklistData {
  title: string;
  description: string;
  columns: ChecklistColumn[];
  proTip: string;
}

interface TradingChecklistProps {
  bucketType: string;
  onComplete?: () => void;
}

const CHECKLIST_DATA: Record<string, ChecklistData> = {
  // SETUPS subcategories
  "BOX_SETUPS": {
    title: "✅ Box Setup Analysis",
    description: "Verify box setup configuration and parameters",
    columns: [
      {
        title: "Box Structure",
        items: [
          { id: "box-12-level", label: "12 level properly identified", checked: false },
          { id: "box-21-level", label: "21 level confirmation", checked: false },
          { id: "box-22-level", label: "22 level validation", checked: false }
        ]
      },
      {
        title: "Range Validation",
        items: [
          { id: "box-range-clear", label: "Range boundaries clearly defined", checked: false },
          { id: "box-volume", label: "Volume confirmation within range", checked: false },
          { id: "box-timeframe", label: "Timeframe alignment confirmed", checked: false }
        ]
      }
    ],
    proTip: "Box setups require precise level identification and range validation for optimal execution."
  },
  "ANCHORS": {
    title: "✅ Anchor Level Analysis", 
    description: "Validate anchor points and key support/resistance levels",
    columns: [
      {
        title: "Anchor Identification",
        items: [
          { id: "anchor-key-levels", label: "Key anchor levels identified", checked: false },
          { id: "anchor-historical", label: "Historical significance confirmed", checked: false },
          { id: "anchor-confluence", label: "Multiple confluence factors present", checked: false }
        ]
      },
      {
        title: "Level Validation",
        items: [
          { id: "anchor-strength", label: "Anchor strength verified", checked: false },
          { id: "anchor-reaction", label: "Previous price reactions confirmed", checked: false },
          { id: "anchor-timeframe", label: "Multi-timeframe validation", checked: false }
        ]
      }
    ],
    proTip: "Strong anchor levels provide reliable reference points for entries and exits."
  },
  "ASIAN_RANGE": {
    title: "✅ Asian Range Analysis",
    description: "Analyze Asian session range parameters and breakout potential", 
    columns: [
      {
        title: "Range Parameters",
        items: [
          { id: "asian-high-low", label: "Asian high/low levels identified", checked: false },
          { id: "asian-volatility", label: "Low volatility period confirmed", checked: false },
          { id: "asian-time-window", label: "Proper time window (000-0800)", checked: false }
        ]
      },
      {
        title: "Breakout Setup",
        items: [
          { id: "asian-breakout-direction", label: "Breakout direction anticipated", checked: false },
          { id: "asian-volume", label: "Volume buildup analysis", checked: false },
          { id: "asian-session-gap", label: "Session gap opportunity identified", checked: false }
        ]
      }
    ],
    proTip: "Asian range setups often provide clean breakout opportunities during London/NY sessions."
  },
  "HARMONICS_P1": {
    title: "✅ Harmonics Part 1 Analysis",
    description: "Validate basic harmonic pattern structures",
    columns: [
      {
        title: "Pattern Structure",
        items: [
          { id: "harmonic-ratios", label: "Fibonacci ratios confirmed", checked: false },
          { id: "harmonic-points", label: "Key harmonic points identified", checked: false },
          { id: "harmonic-completion", label: "Pattern completion zone established", checked: false }
        ]
      },
      {
        title: "Entry Criteria",
        items: [
          { id: "harmonic-reversal-zone", label: "Potential reversal zone mapped", checked: false },
          { id: "harmonic-confluence", label: "Additional confluence factors", checked: false },
          { id: "harmonic-risk-reward", label: "Favorable risk/reward ratio", checked: false }
        ]
      }
    ],
    proTip: "Harmonic patterns require precise ratio measurements and patience for pattern completion."
  },
  "RESET_SAFETY": {
    title: "✅ Reset Safety Trade Analysis",
    description: "Verify conservative reset-based trading conditions",
    columns: [
      {
        title: "Reset Conditions",
        items: [
          { id: "reset-clear-structure", label: "Clear market structure reset", checked: false },
          { id: "reset-low-risk", label: "Low-risk entry opportunity", checked: false },
          { id: "reset-conservative-size", label: "Conservative position sizing", checked: false }
        ]
      },
      {
        title: "Safety Measures",
        items: [
          { id: "reset-tight-stops", label: "Tight stop loss placement", checked: false },
          { id: "reset-quick-profit", label: "Quick profit-taking plan", checked: false },
          { id: "reset-market-calm", label: "Calm market conditions", checked: false }
        ]
      }
    ],
    proTip: "Safety trades prioritize capital preservation over maximum profits."
  },
  "RESETS": {
    title: "✅ Reset Pattern Analysis",
    description: "Identify and validate market structure resets",
    columns: [
      {
        title: "Reset Identification",
        items: [
          { id: "reset-structure-break", label: "Previous structure broken", checked: false },
          { id: "reset-new-levels", label: "New support/resistance forming", checked: false },
          { id: "reset-trend-change", label: "Trend change confirmation", checked: false }
        ]
      },
      {
        title: "Reset Validation",
        items: [
          { id: "reset-volume-confirm", label: "Volume confirmation present", checked: false },
          { id: "reset-time-element", label: "Adequate time for reset", checked: false },
          { id: "reset-multiple-tf", label: "Multiple timeframe alignment", checked: false }
        ]
      }
    ],
    proTip: "Resets provide fresh trading opportunities after major structure changes."
  },

  // PATTERNS subcategories  
  "1H_50_50_BOUNCE": {
    title: "✅ 1H 50 50 Bounce Analysis",
    description: "Validate hourly 50/50 bounce pattern criteria",
    columns: [
      {
        title: "Bounce Setup",
        items: [
          { id: "1h-50-level", label: "50% retracement level identified", checked: false },
          { id: "1h-bounce-confirmation", label: "Bounce confirmation signals", checked: false },
          { id: "1h-timeframe", label: "1-hour timeframe alignment", checked: false }
        ]
      },
      {
        title: "Pattern Validation",
        items: [
          { id: "1h-support-resistance", label: "Support/resistance at 50% level", checked: false },
          { id: "1h-volume-spike", label: "Volume spike at bounce level", checked: false },
          { id: "1h-continuation", label: "Trend continuation potential", checked: false }
        ]
      }
    ],
    proTip: "50% bounces often provide reliable continuation entries in trending markets."
  },
  "2ND_LEG_HALF_BAT": {
    title: "✅ 2nd Leg Half Bat Analysis",
    description: "Validate second leg half bat harmonic formation",
    columns: [
      {
        title: "Half Bat Structure",
        items: [
          { id: "2nd-leg-ratio", label: "Second leg ratio confirmed (88.6%)", checked: false },
          { id: "2nd-leg-points", label: "B and D points properly identified", checked: false },
          { id: "2nd-leg-completion", label: "Pattern near completion zone", checked: false }
        ]
      },
      {
        title: "Entry Criteria",
        items: [
          { id: "2nd-leg-reversal", label: "Reversal signals at D point", checked: false },
          { id: "2nd-leg-confluence", label: "Additional technical confluence", checked: false },
          { id: "2nd-leg-targets", label: "Profit targets identified", checked: false }
        ]
      }
    ],
    proTip: "Second leg half bats require precise measurement and patience for optimal entries."
  },

  // Add abbreviated versions for other patterns to avoid excessive length
  "3_DRIVES_3_DAY": {
    title: "✅ 3 Drives / 3 Day Setup Analysis",
    description: "Validate three-drive or three-day pattern configurations",
    columns: [
      {
        title: "Drive Pattern",
        items: [
          { id: "3-drives-structure", label: "Three distinct drives identified", checked: false },
          { id: "3-drives-exhaustion", label: "Exhaustion signals present", checked: false }
        ]
      },
      {
        title: "Time Element", 
        items: [
          { id: "3-day-timeframe", label: "Three-day time structure", checked: false },
          { id: "3-day-completion", label: "Pattern completion criteria met", checked: false }
        ]
      }
    ],
    proTip: "Three-drive patterns often signal trend exhaustion and potential reversals."
  },

  // Continue with other pattern types with similar abbreviated structure
  "3_HITS_TRADE": {
    title: "✅ 3 Hits Trade Analysis", 
    description: "Validate triple hit pattern formation",
    columns: [
      {
        title: "Hit Pattern",
        items: [
          { id: "3-hits-level", label: "Same level hit three times", checked: false },
          { id: "3-hits-rejection", label: "Multiple rejections confirmed", checked: false }
        ]
      },
      {
        title: "Breakout Setup",
        items: [
          { id: "3-hits-weakness", label: "Level weakness developing", checked: false },
          { id: "3-hits-breakout", label: "Breakout potential identified", checked: false }
        ]
      }
    ],
    proTip: "Three hits often weaken key levels, setting up potential breakout trades."
  },

  // Add remaining pattern checklists
  "HALF_BATS": {
    title: "✅ Half Bats Pattern Analysis",
    description: "Validate half bat harmonic pattern formations",
    columns: [
      {
        title: "Pattern Structure",
        items: [
          { id: "half-bat-ratios", label: "Half bat ratios confirmed (88.6% CD)", checked: false },
          { id: "half-bat-points", label: "A, B, C, D points identified", checked: false }
        ]
      },
      {
        title: "Entry Setup",
        items: [
          { id: "half-bat-completion", label: "Pattern completion zone reached", checked: false },
          { id: "half-bat-reversal", label: "Reversal signals present", checked: false }
        ]
      }
    ],
    proTip: "Half bats provide precise reversal opportunities at harmonic completion zones."
  },

  "HEAD_SHOULDERS": {
    title: "✅ Head and Shoulders Analysis",
    description: "Validate classic head and shoulders reversal patterns",
    columns: [
      {
        title: "Pattern Formation",
        items: [
          { id: "h-s-left-shoulder", label: "Left shoulder formation", checked: false },
          { id: "h-s-head", label: "Head formation (higher high)", checked: false },
          { id: "h-s-right-shoulder", label: "Right shoulder formation", checked: false },
          { id: "h-s-neckline", label: "Neckline clearly defined", checked: false }
        ]
      },
      {
        title: "Breakout Criteria",
        items: [
          { id: "h-s-volume", label: "Volume confirmation on breakdown", checked: false },
          { id: "h-s-target", label: "Price target calculated", checked: false }
        ]
      }
    ],
    proTip: "Head and shoulders patterns signal trend reversal with measurable price targets."
  },

  "ID_50": {
    title: "✅ ID 50 Pattern Analysis",
    description: "Validate ID 50 specialized pattern criteria",
    columns: [
      {
        title: "ID 50 Structure",
        items: [
          { id: "id-50-formation", label: "ID 50 pattern formation confirmed", checked: false },
          { id: "id-50-criteria", label: "All ID 50 criteria met", checked: false }
        ]
      },
      {
        title: "Execution Setup",
        items: [
          { id: "id-50-entry", label: "Entry point identified", checked: false },
          { id: "id-50-targets", label: "Target levels established", checked: false }
        ]
      }
    ],
    proTip: "ID 50 patterns require precise identification of specialized criteria."
  },

  "LONDON_PATTERNS": {
    title: "✅ London Patterns Analysis",
    description: "Validate London session specific pattern types",
    columns: [
      {
        title: "Session Timing",
        items: [
          { id: "london-session", label: "London session timing (1100-1600)", checked: false },
          { id: "london-volatility", label: "London session volatility confirmed", checked: false }
        ]
      },
      {
        title: "Pattern Recognition",
        items: [
          { id: "london-breakout", label: "London breakout pattern identified", checked: false },
          { id: "london-reversal", label: "London reversal pattern confirmed", checked: false }
        ]
      }
    ],
    proTip: "London patterns capitalize on European session volatility and liquidity."
  },

  "WSM_PATTERNS": {
    title: "✅ WSM Patterns Analysis",
    description: "Validate WSM methodology pattern formations",
    columns: [
      {
        title: "WSM Structure",
        items: [
          { id: "wsm-formation", label: "WSM pattern structure identified", checked: false },
          { id: "wsm-criteria", label: "WSM methodology criteria met", checked: false }
        ]
      },
      {
        title: "Pattern Validation",
        items: [
          { id: "wsm-confirmation", label: "Pattern confirmation signals", checked: false },
          { id: "wsm-targets", label: "WSM target levels established", checked: false }
        ]
      }
    ],
    proTip: "WSM patterns follow specific methodology requirements for optimal execution."
  },

  "3_PUSHES": {
    title: "✅ 3 Pushes Pattern Analysis",
    description: "Validate three-push pattern structures",
    columns: [
      {
        title: "Push Formation",
        items: [
          { id: "3-pushes-waves", label: "Three distinct push waves identified", checked: false },
          { id: "3-pushes-momentum", label: "Momentum divergence on third push", checked: false }
        ]
      },
      {
        title: "Reversal Setup",
        items: [
          { id: "3-pushes-exhaustion", label: "Trend exhaustion signals", checked: false },
          { id: "3-pushes-reversal", label: "Reversal confirmation present", checked: false }
        ]
      }
    ],
    proTip: "Three pushes often indicate trend exhaustion and reversal opportunities."
  },

  BIAS: {
    title: "✅ Market Bias Checklist",
    description: "Verify bias classification and market direction alignment",
    columns: [
      {
        title: "MAAW Pattern (Upward Bias)",
        items: [
          { id: "bias-m-reversal", label: "M - Reversal Level/Peak Formation High identified", checked: false },
          { id: "bias-a1-stop", label: "A1 - Stop Hunt High (Level 1) mapped", checked: false },
          { id: "bias-a2-stop", label: "A2 - Stop Hunt Level 2 confirmed", checked: false },
          { id: "bias-w-reversal", label: "W - Level 3 Reversal Area (PFL) established", checked: false }
        ]
      },
      {
        title: "WVVM Pattern (Downward Bias)", 
        items: [
          { id: "bias-w2-reversal", label: "W - Level 3 Reversal Area (PFH) identified", checked: false },
          { id: "bias-v1-stop", label: "V1 - Stop Hunt Low (Level 1) mapped", checked: false },
          { id: "bias-v2-stop", label: "V2 - Stop Hunt Level 2 confirmed", checked: false },
          { id: "bias-m2-reversal", label: "M - Reversal Level/Peak Formation Low established", checked: false }
        ]
      },
      {
        title: "Range & Volatility Analysis",
        items: [
          { id: "bias-asian-box", label: "Asian Box Stacking levels identified", checked: false },
          { id: "bias-3x-adr", label: "3X ADR range analysis completed", checked: false },
          { id: "bias-session-timing", label: "Optimal session timing for bias", checked: false }
        ]
      },
      {
        title: "EMA Crossover Levels",
        items: [
          { id: "bias-l1-13-50", label: "13/50 Cross - Level 1 Confirmation identified", checked: false },
          { id: "bias-l2-50-200", label: "50/200 Cross - Level 2 Confirmation established", checked: false }
        ]
      },
      {
        title: "Technical Confluence",
        items: [
          { id: "bias-multiple-timeframes", label: "Multiple timeframe alignment", checked: false },
          { id: "bias-ema-position", label: "EMA positioning supports bias", checked: false },
          { id: "bias-liquidity-zones", label: "Liquidity zones mapped correctly", checked: false }
        ]
      }
    ],
    proTip: "Choose the correct bias pattern (MAAW/WVVM) based on market structure. Asian Box Stacking and 3X ADR provide range context."
  },
  SETUPS: {
    title: "✅ Trading Setup Analysis", 
    description: "Verify setup quality and market conditions alignment",
    columns: [
      {
        title: "Box & Range Setups",
        items: [
          { id: "setup-box-setups", label: "Box Setup conditions met", checked: false },
          { id: "setup-asian-range", label: "Asian Range Setup parameters confirmed", checked: false },
          { id: "setup-range-boundaries", label: "Range boundaries clearly defined", checked: false }
        ]
      },
      {
        title: "Anchor & Support Levels",
        items: [
          { id: "setup-anchors", label: "Anchor levels identified and validated", checked: false },
          { id: "setup-key-levels", label: "Key support/resistance levels mapped", checked: false },
          { id: "setup-confluence", label: "Multiple confluence factors present", checked: false }
        ]
      },
      {
        title: "Advanced Setups",
        items: [
          { id: "setup-harmonics-p1", label: "Harmonics Part 1 pattern confirmed", checked: false },
          { id: "setup-reset-safety", label: "Reset Safety Trade conditions met", checked: false },
          { id: "setup-resets", label: "Reset patterns properly identified", checked: false }
        ]
      },
      {
        title: "Setup Validation",
        items: [
          { id: "setup-timeframe-alignment", label: "Multiple timeframe alignment confirmed", checked: false },
          { id: "setup-risk-reward", label: "Risk/reward ratio acceptable (min 1:2)", checked: false },
          { id: "setup-session-timing", label: "Optimal session timing for setup type", checked: false }
        ]
      }
    ],
    proTip: "Each setup type requires specific market conditions. Verify all criteria are met before considering entry."
  },
  PATTERNS: {
    title: "✅ Pattern Recognition Analysis",
    description: "Identify and validate specific trading patterns and formations", 
    columns: [
      {
        title: "Bounce & Bat Patterns",
        items: [
          { id: "pattern-1h-50-50-bounce", label: "1H 50 50 Bounce pattern confirmed", checked: false },
          { id: "pattern-2nd-leg-half-bat", label: "2nd leg half bat formation identified", checked: false },
          { id: "pattern-half-bats", label: "Half Bats pattern structure validated", checked: false }
        ]
      },
      {
        title: "Drive & Hits Patterns",
        items: [
          { id: "pattern-3-drives-3-day", label: "3 Drives 3 Day setups confirmed", checked: false },
          { id: "pattern-3-hits-trade", label: "3 Hits Trade pattern identified", checked: false }
        ]
      },
      {
        title: "Classic Patterns",
        items: [
          { id: "pattern-head-shoulders", label: "Head and Shoulders pattern validated", checked: false },
          { id: "pattern-id-50", label: "ID 50 pattern requirements met", checked: false }
        ]
      },
      {
        title: "Session-Specific & Type Patterns",
        items: [
          { id: "pattern-london", label: "London Patterns properly identified", checked: false },
          { id: "pattern-type1", label: "type1 pattern structure confirmed", checked: false },
          { id: "pattern-type2", label: "type2 pattern structure confirmed", checked: false },
          { id: "pattern-type3", label: "type3 pattern structure confirmed", checked: false },
          { id: "pattern-type4", label: "type4 pattern structure confirmed", checked: false },
          { id: "pattern-w-and-m", label: "W&M Patterns structure confirmed", checked: false }
        ]
      }
    ],
    proTip: "Each pattern has specific criteria and market conditions. Verify all elements are present before confirming the pattern."
  },
  "ENTRY'S": {
    title: "✅ Candlestick Entry Patterns",
    description: "Identify and execute entries based on specific candlestick patterns",
    columns: [
      {
        title: "Track Patterns",
        items: [
          { id: "entry-railroad-tracks", label: "Railroad Tracks pattern confirmed", checked: false },
          { id: "entry-track-formation", label: "Parallel track formation identified", checked: false },
          { id: "entry-track-rejection", label: "Strong rejection at tracks level", checked: false }
        ]
      },
      {
        title: "Wood & Star Patterns", 
        items: [
          { id: "entry-cord-of-woods", label: "Cord of Woods pattern validated", checked: false },
          { id: "entry-evening-star", label: "Evening Star pattern confirmed", checked: false },
          { id: "entry-morning-star", label: "Morning Star pattern identified", checked: false }
        ]
      },
      {
        title: "Shift Patterns",
        items: [
          { id: "entry-shift-candle", label: "Shift Candle pattern confirmed", checked: false },
          { id: "entry-shift-direction", label: "Market shift direction validated", checked: false },
          { id: "entry-shift-momentum", label: "Momentum shift confirmed", checked: false }
        ]
      },
      {
        title: "Pattern Validation",
        items: [
          { id: "entry-pattern-structure", label: "Pattern structure meets criteria", checked: false },
          { id: "entry-pattern-context", label: "Pattern context supports entry", checked: false },
          { id: "entry-pattern-timing", label: "Optimal timing for pattern entry", checked: false }
        ]
      }
    ],
    proTip: "Each candlestick pattern has specific formation rules. Wait for complete pattern confirmation before entry."
  }
};

export function TradingChecklist({ bucketType, onComplete }: TradingChecklistProps) {
  const checklistData = CHECKLIST_DATA[bucketType];
  const [checklist, setChecklist] = useState<ChecklistData>(checklistData || {
    title: "",
    description: "",
    columns: [],
    proTip: ""
  });

  const toggleItem = useCallback((columnIndex: number, itemIndex: number) => {
    setChecklist(prev => ({
      ...prev,
      columns: prev.columns.map((column, colIdx) => 
        colIdx === columnIndex 
          ? {
              ...column,
              items: column.items.map((item, itemIdx) =>
                itemIdx === itemIndex ? { ...item, checked: !item.checked } : item
              )
            }
          : column
      )
    }));
  }, []);

  const resetChecklist = useCallback(() => {
    setChecklist(prev => ({
      ...prev,
      columns: prev.columns.map(column => ({
        ...column,
        items: column.items.map(item => ({ ...item, checked: false }))
      }))
    }));
  }, []);

  const totalItems = checklist.columns.reduce((total, column) => total + column.items.length, 0);
  const completedItems = checklist.columns.reduce(
    (total, column) => total + column.items.filter(item => item.checked).length, 
    0
  );
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isComplete = completedItems === totalItems;

  if (!checklistData) {
    return (
      <div className="text-center py-8 text-trading-text">
        <p>No checklist available for this bucket type.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Checklist Header */}
      <div className="bg-trading-card border border-trading-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{checklist.title}</h2>
            <p className="text-trading-text">{checklist.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`px-3 py-1 text-sm ${
                  isComplete 
                    ? 'bg-green-500/20 text-green-400 border-green-400' 
                    : completionPercentage > 50 
                      ? 'bg-trading-gold/20 text-trading-gold border-trading-gold' 
                      : 'bg-trading-border text-trading-text'
                }`}
              >
                {completedItems}/{totalItems} Complete
              </Badge>
            </div>
            <div className="text-xs text-trading-text">
              {completionPercentage}% Complete
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-trading-border rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isComplete 
                ? 'bg-green-500' 
                : completionPercentage > 50 
                  ? 'bg-trading-gold' 
                  : 'bg-trading-accent'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {checklist.columns.map((column, columnIndex) => (
          <Card key={columnIndex} className="bg-trading-border border-trading-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-trading-accent">
                {column.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.items.map((item, itemIndex) => (
                <div 
                  key={item.id}
                  className="flex items-start space-x-3 group cursor-pointer hover:bg-trading-dark/50 p-2 rounded transition-colors"
                  onClick={() => toggleItem(columnIndex, itemIndex)}
                  data-testid={`checklist-item-${item.id}`}
                >
                  <Checkbox
                    checked={item.checked}
                    onChange={() => toggleItem(columnIndex, itemIndex)}
                    className="mt-0.5 data-[state=checked]:bg-trading-accent data-[state=checked]:border-trading-accent"
                  />
                  <label 
                    className={`text-xs leading-relaxed cursor-pointer transition-colors ${
                      item.checked 
                        ? 'text-trading-accent line-through' 
                        : 'text-white group-hover:text-trading-accent'
                    }`}
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={resetChecklist}
          className="border-trading-border text-trading-text hover:bg-trading-border hover:text-white"
          data-testid="button-reset-checklist"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Checklist
        </Button>
        
        {isComplete && onComplete && (
          <Button
            onClick={onComplete}
            className="bg-green-500 hover:bg-green-600 text-white"
            data-testid="button-complete-checklist"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        )}
      </div>

      {/* Pro Tip */}
      <div className="bg-trading-accent/10 border border-trading-accent/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-trading-accent font-bold text-sm">💡 Pro Tip:</div>
          <p className="text-trading-accent/90 text-sm leading-relaxed">
            {checklist.proTip}
          </p>
        </div>
      </div>
    </div>
  );
}