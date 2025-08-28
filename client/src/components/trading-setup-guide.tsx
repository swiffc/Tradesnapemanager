import type { Screenshot, Note } from "@shared/schema";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TradingSetupGuideProps {
  screenshot: Screenshot | null;
  isMobile?: boolean;
  onUpdateScreenshot?: (updates: Partial<Screenshot>) => void;
}

interface SetupInfo {
  title: string;
  subtitle: string;
  description: string;
  entryRules: string[];
  optimalLocations: string[];
  verificationChecklist: {
    category: string;
    items: string[];
  }[];
}

const tradingSetups: Record<string, SetupInfo> = {
  "1a": {
    title: "Type 1A: Full 13 EMA Rules",
    subtitle: "Reversal Setup",
    description: "Both legs strictly respect the 13 EMA with clean apex formation",
    entryRules: [
      "Both legs strictly respect the 13 EMA; no break or violation allowed",
      "Apex forms with clean rejection candlestick pattern",
      "Found at trending markets with clear structure",
      "Dynamic EMA acts as support/resistance"
    ],
    optimalLocations: [
      "Session High of Day (HOD) or Low of Day (LOD)",
      "PSH/PSL, PDH/PDL levels",
      "PWH/PWL, PMH/PML levels",
      "PYH/PYL or 5-day averaged ADR levels"
    ],
    verificationChecklist: [
      {
        category: "Structure Analysis",
        items: [
          "Both legs respect 13 EMA completely",
          "Clean apex formation present",
          "Clear M or W structure visible"
        ]
      },
      {
        category: "Location & Timing",
        items: [
          "At key reversal level (HOD/LOD/PDH/PDL)",
          "Within optimal session timing",
          "In trending market with clear structure"
        ]
      },
      {
        category: "Confirmation Signals",
        items: [
          "Rejection candlestick pattern confirmed",
          "TDI indicators aligned",
          "Volume supports the setup"
        ]
      }
    ]
  },
  "1b": {
    title: "Type 1B: 13 EMA Tap",
    subtitle: "Reversal Setup",
    description: "First leg taps 13 EMA but doesn't break, second leg forms rejection",
    entryRules: [
      "First leg taps the 13 EMA but does not break it",
      "Second leg forms rejection candlestick pattern",
      "Found during consolidation phases",
      "Liquidity sweeps align with key EMAs"
    ],
    optimalLocations: [
      "Brinks Trade: 9:45 PM, 3:45 AM, 9:45 AM EST",
      "London/NY session extremes",
      "PSH/PSL, PDH/PDL, PWH/PWL levels",
      "Level 3 areas in BTMM methodology"
    ],
    verificationChecklist: [
      {
        category: "EMA Interaction",
        items: [
          "First leg taps but doesn't break 13 EMA",
          "No violation of 13 EMA on first leg",
          "EMA acting as dynamic support/resistance"
        ]
      },
      {
        category: "Timing & Location",
        items: [
          "Within Brinks timing window",
          "London/NY session extremes",
          "At key reversal level"
        ]
      },
      {
        category: "Pattern Confirmation",
        items: [
          "Second leg shows rejection pattern",
          "Morning Star/Railroad Tracks pattern",
          "Liquidity sweep aligns with setup"
        ]
      }
    ]
  },
  "1c": {
    title: "Type 1C: Leg Does Not Touch 13 EMA",
    subtitle: "Reversal Setup", 
    description: "First leg remains entirely above/below 13 EMA, second leg closes inside",
    entryRules: [
      "First leg remains entirely above (buy) or below (sell) 13 EMA",
      "Second leg closes back inside the 13 EMA",
      "Confirms with candlestick rejection pattern",
      "13 EMA acts as dynamic resistance/support level"
    ],
    optimalLocations: [
      "Near session HOD/LOD",
      "Targeting liquidity sweeps before reversal",
      "Trending markets with clear EMA respect",
      "Dynamic support/resistance zones"
    ],
    verificationChecklist: [
      {
        category: "EMA Relationship",
        items: [
          "First leg doesn't touch 13 EMA",
          "Second leg closes inside 13 EMA",
          "13 EMA acting as dynamic level"
        ]
      },
      {
        category: "Market Context",
        items: [
          "Near session HOD/LOD",
          "In trending market conditions", 
          "Liquidity sweep setup present"
        ]
      },
      {
        category: "Entry Confirmation",
        items: [
          "Rejection pattern confirmed",
          "Railroad Tracks or COW pattern",
          "Momentum aligns with setup"
        ]
      }
    ]
  },
  "2a": {
    title: "Type 2A: Symmetrical Legs",
    subtitle: "Symmetrical Setup",
    description: "Both legs of M or W pattern are symmetrical in length and structure",
    entryRules: [
      "Both legs symmetrical in length and structure",
      "Apex forms with clear rejection candlestick pattern",
      "Clear double top/bottom structure",
      "Perfect for session extreme reversals"
    ],
    optimalLocations: [
      "Near session HOD or LOD",
      "After liquidity sweep during session extremes",
      "Key psychological levels",
      "Major support/resistance zones"
    ],
    verificationChecklist: [
      {
        category: "Structure Analysis",
        items: [
          "Legs are symmetrical in length",
          "Similar structure in both legs",
          "Clear apex formation"
        ]
      },
      {
        category: "Location & Context",
        items: [
          "Near session HOD/LOD",
          "After liquidity sweep",
          "At session extremes"
        ]
      },
      {
        category: "Confirmation",
        items: [
          "Rejection pattern at apex",
          "Clear double top/bottom",
          "Proper session timing"
        ]
      }
    ]
  },
  "2b": {
    title: "Type 2B: Extended Second Leg",
    subtitle: "Extended Setup",
    description: "Second leg extends further than first leg with rejection at apex",
    entryRules: [
      "Second leg extended further than first leg",
      "Apex forms with candlestick rejection pattern",
      "Railroad Tracks, Morning/Evening Star patterns",
      "Effective during Brinks timing or large sweeps"
    ],
    optimalLocations: [
      "Major session extremes with extended moves",
      "After significant liquidity sweeps",
      "Key psychological round numbers",
      "Previous day/week/month highs and lows"
    ],
    verificationChecklist: [
      {
        category: "Structure Analysis",
        items: [
          "Second leg clearly extended beyond first",
          "Significant extension from first leg",
          "Clear M or W formation maintained"
        ]
      },
      {
        category: "Timing & Context",
        items: [
          "During Brinks timing windows",
          "After major liquidity sweeps",
          "At significant session extremes"
        ]
      },
      {
        category: "Pattern Confirmation", 
        items: [
          "Railroad Tracks pattern present",
          "Morning/Evening Star formation",
          "Strong rejection candlestick"
        ]
      }
    ]
  },
  "2c": {
    title: "Type 2C: Pattern at Key EMA Levels",
    subtitle: "EMA Level Setup",
    description: "M/W pattern formation at key EMA levels with confluence",
    entryRules: [
      "Pattern forms at key EMA confluence levels",
      "13, 21, 50 EMA alignment supports setup",
      "EMA levels act as dynamic support/resistance",
      "Confluence with additional EMA levels"
    ],
    optimalLocations: [
      "13, 21, 50 EMA confluence zones", 
      "EMA cluster areas with multiple timeframes",
      "Dynamic support/resistance at EMA levels",
      "Session extremes with EMA alignment"
    ],
    verificationChecklist: [
      {
        category: "EMA Analysis",
        items: [
          "Pattern at key EMA levels",
          "Multiple EMA confluence present",
          "EMAs acting as dynamic levels"
        ]
      },
      {
        category: "Pattern Structure",
        items: [
          "Clean M or W formation",
          "Pattern respects EMA levels",
          "Clear apex at EMA confluence"
        ]
      },
      {
        category: "Confirmation",
        items: [
          "EMA alignment supports direction",
          "Rejection pattern at confluence",
          "Proper session timing alignment"
        ]
      }
    ]
  }
};

// Add more setups for remaining types
const additionalSetups: Record<string, SetupInfo> = {
  "3a": {
    title: "Type 3A: 50 EMA Bounce",
    subtitle: "Continuation Setup",
    description: "Trend continuation bounce off 50 EMA with momentum",
    entryRules: [
      "Clean bounce off 50 EMA level",
      "Trending market with clear direction",
      "50 EMA acting as dynamic support/resistance",
      "Momentum confirms trend continuation"
    ],
    optimalLocations: [
      "50 EMA dynamic support/resistance",
      "In context of higher timeframe trends",
      "After pullback in trending market",
      "Session continuation moves"
    ],
    verificationChecklist: [
      {
        category: "EMA Interaction",
        items: [
          "Clean bounce off 50 EMA",
          "50 EMA acting as dynamic level",
          "No break of 50 EMA"
        ]
      },
      {
        category: "Trend Context",
        items: [
          "Clear trending market conditions",
          "Higher timeframe alignment",
          "Pullback scenario confirmed"
        ]
      },
      {
        category: "Momentum",
        items: [
          "Momentum supports continuation",
          "Volume confirms bounce",
          "Clear rejection from 50 EMA"
        ]
      }
    ]
  },
  "3b": {
    title: "Type 3B: Asian Range Bounce",
    subtitle: "Range Bounce Setup",
    description: "Bounce from Asian range boundaries during trending sessions",
    entryRules: [
      "Clear Asian range established",
      "Bounce from range high/low boundaries",
      "Occurs during London/NY sessions",
      "Range acts as support/resistance"
    ],
    optimalLocations: [
      "Asian session range highs/lows",
      "During London/NY active sessions", 
      "Range boundary confluence levels",
      "Previous Asian range extremes"
    ],
    verificationChecklist: [
      {
        category: "Range Analysis",
        items: [
          "Clear Asian range identified",
          "Bounce from range boundaries",
          "Range highs/lows respected"
        ]
      },
      {
        category: "Session Timing",
        items: [
          "During London/NY sessions",
          "Outside Asian session hours",
          "Active market conditions"
        ]
      },
      {
        category: "Confirmation",
        items: [
          "Strong rejection from boundary",
          "Volume supports the bounce",
          "Momentum aligns with direction"
        ]
      }
    ]
  },
  "3c": {
    title: "Type 3C: ADR/Key Level Rejection",
    subtitle: "Key Level Setup",
    description: "Rejection from ADR levels or key psychological levels",
    entryRules: [
      "Clear rejection from ADR levels",
      "Key psychological level confluence",
      "Previous support/resistance alignment",
      "Strong rejection candlestick pattern"
    ],
    optimalLocations: [
      "Average Daily Range (ADR) levels",
      "Key psychological round numbers",
      "Previous day/week/month levels",
      "Confluence of multiple levels"
    ],
    verificationChecklist: [
      {
        category: "Level Analysis",
        items: [
          "At significant ADR level",
          "Key psychological level present",
          "Previous level confluence"
        ]
      },
      {
        category: "Rejection Quality",
        items: [
          "Strong rejection candlestick",
          "Clear reversal pattern",
          "Volume supports rejection"
        ]
      },
      {
        category: "Market Context",
        items: [
          "Level respected historically",
          "Proper session timing",
          "Market structure supports"
        ]
      }
    ]
  }
};

// Merge additional setups
Object.assign(tradingSetups, additionalSetups);

// Define the selection options
const SETUP_OPTIONS = [
  { value: "ANCHORS", label: "Anchors" },
  { value: "ASIAN_RANGE", label: "Asian Range" },
  { value: "BOX_SETUPS", label: "Box Setups" },
  { value: "HARMONICS_P1", label: "Harmonics Part 1" },
  { value: "RESET_SAFETY", label: "Reset Safety Trades" },
  { value: "RESETS", label: "Resets" },
];

const BIAS_OPTIONS = [
  // MAAW Pattern (Upward Bias)
  { value: "M", label: "M - Reversal Level/Peak Formation High", group: "MAAW Pattern (Upward Bias)" },
  { value: "A1", label: "A1 - Stop Hunt High Level 1", group: "MAAW Pattern (Upward Bias)" },
  { value: "A2", label: "A2 - Stop Hunt Level 2", group: "MAAW Pattern (Upward Bias)" },
  { value: "W", label: "W - Level 3 Reversal Area (includes PFL)", group: "MAAW Pattern (Upward Bias)" },
  
  // WVVM Pattern (Downward Bias) 
  { value: "W2", label: "W - Level 3 Reversal Area (includes PFH)", group: "WVVM Pattern (Downward Bias)" },
  { value: "V1", label: "V1 - Stop Hunt Low Level 1", group: "WVVM Pattern (Downward Bias)" },
  { value: "V2", label: "V2 - Stop Hunt Level 2", group: "WVVM Pattern (Downward Bias)" },
  { value: "M2", label: "M - Reversal Level/Peak Formation Low", group: "WVVM Pattern (Downward Bias)" },
  
  // Range & Volatility Analysis
  { value: "ABS", label: "Asian Box Stacking", group: "Range & Volatility Analysis" },
  { value: "3XADR", label: "3X ADR", group: "Range & Volatility Analysis" },
  
  // EMA Crossover Levels
  { value: "L1_LOCK", label: "L1 Lock/Confirmation", group: "EMA Crossover Levels" },
  { value: "L2_CONF", label: "L2 Confirmation", group: "EMA Crossover Levels" },
  { value: "M1_13_50", label: "M1 13/50 Cross", group: "EMA Crossover Levels" },
  { value: "M1_50_200", label: "M1 50/200 Cross", group: "EMA Crossover Levels" },
];


const PATTERN_OPTIONS = {
  "ANCHORS": [
    { value: "1H_50_50_BOUNCE", label: "1H 50/50 Bounce" },
    { value: "2ND_LEG_HALF_BAT", label: "2nd Leg Half Bat" },
    { value: "3_DRIVES_3_DAY", label: "3 Drives 3 Day" },
    { value: "3_HITS_TRADE", label: "3 Hits Trade" },
    { value: "HALF_BATS", label: "Half Bats" },
    { value: "HEAD_SHOULDERS", label: "Head & Shoulders" },
    { value: "ID_50", label: "ID 50" },
    { value: "LONDON_PATTERNS", label: "London Patterns" },
    { value: "TYPE1", label: "Type 1" },
    { value: "TYPE2", label: "Type 2" },
    { value: "TYPE3", label: "Type 3" },
    { value: "TYPE4", label: "Type 4" },
    { value: "W&M_PATTERNS", label: "W&M Patterns" },
  ],
  "ASIAN_RANGE": [
    { value: "1H_50_50_BOUNCE", label: "1H 50/50 Bounce" },
    { value: "2ND_LEG_HALF_BAT", label: "2nd Leg Half Bat" },
    { value: "3_DRIVES_3_DAY", label: "3 Drives 3 Day" },
    { value: "3_HITS_TRADE", label: "3 Hits Trade" },
    { value: "HALF_BATS", label: "Half Bats" },
    { value: "HEAD_SHOULDERS", label: "Head & Shoulders" },
    { value: "ID_50", label: "ID 50" },
    { value: "LONDON_PATTERNS", label: "London Patterns" },
    { value: "TYPE1", label: "Type 1" },
    { value: "TYPE2", label: "Type 2" },
    { value: "TYPE3", label: "Type 3" },
    { value: "TYPE4", label: "Type 4" },
    { value: "W&M_PATTERNS", label: "W&M Patterns" },
  ],
  "BOX_SETUPS": [
    { value: "1H_50_50_BOUNCE", label: "1H 50/50 Bounce" },
    { value: "2ND_LEG_HALF_BAT", label: "2nd Leg Half Bat" },
    { value: "3_DRIVES_3_DAY", label: "3 Drives 3 Day" },
    { value: "3_HITS_TRADE", label: "3 Hits Trade" },
    { value: "HALF_BATS", label: "Half Bats" },
    { value: "HEAD_SHOULDERS", label: "Head & Shoulders" },
    { value: "ID_50", label: "ID 50" },
    { value: "LONDON_PATTERNS", label: "London Patterns" },
    { value: "TYPE1", label: "Type 1" },
    { value: "TYPE2", label: "Type 2" },
    { value: "TYPE3", label: "Type 3" },
    { value: "TYPE4", label: "Type 4" },
    { value: "W&M_PATTERNS", label: "W&M Patterns" },
  ],
  "HARMONICS_P1": [
    { value: "1H_50_50_BOUNCE", label: "1H 50/50 Bounce" },
    { value: "2ND_LEG_HALF_BAT", label: "2nd Leg Half Bat" },
    { value: "3_DRIVES_3_DAY", label: "3 Drives 3 Day" },
    { value: "3_HITS_TRADE", label: "3 Hits Trade" },
    { value: "HALF_BATS", label: "Half Bats" },
    { value: "HEAD_SHOULDERS", label: "Head & Shoulders" },
    { value: "ID_50", label: "ID 50" },
    { value: "LONDON_PATTERNS", label: "London Patterns" },
    { value: "TYPE1", label: "Type 1" },
    { value: "TYPE2", label: "Type 2" },
    { value: "TYPE3", label: "Type 3" },
    { value: "TYPE4", label: "Type 4" },
    { value: "W&M_PATTERNS", label: "W&M Patterns" },
  ],
  "RESET_SAFETY": [
    { value: "1H_50_50_BOUNCE", label: "1H 50/50 Bounce" },
    { value: "2ND_LEG_HALF_BAT", label: "2nd Leg Half Bat" },
    { value: "3_DRIVES_3_DAY", label: "3 Drives 3 Day" },
    { value: "3_HITS_TRADE", label: "3 Hits Trade" },
    { value: "HALF_BATS", label: "Half Bats" },
    { value: "HEAD_SHOULDERS", label: "Head & Shoulders" },
    { value: "ID_50", label: "ID 50" },
    { value: "LONDON_PATTERNS", label: "London Patterns" },
    { value: "TYPE1", label: "Type 1" },
    { value: "TYPE2", label: "Type 2" },
    { value: "TYPE3", label: "Type 3" },
    { value: "TYPE4", label: "Type 4" },
    { value: "W&M_PATTERNS", label: "W&M Patterns" },
  ],
  "RESETS": [
    { value: "1H_50_50_BOUNCE", label: "1H 50/50 Bounce" },
    { value: "2ND_LEG_HALF_BAT", label: "2nd Leg Half Bat" },
    { value: "3_DRIVES_3_DAY", label: "3 Drives 3 Day" },
    { value: "3_HITS_TRADE", label: "3 Hits Trade" },
    { value: "HALF_BATS", label: "Half Bats" },
    { value: "HEAD_SHOULDERS", label: "Head & Shoulders" },
    { value: "ID_50", label: "ID 50" },
    { value: "LONDON_PATTERNS", label: "London Patterns" },
    { value: "TYPE1", label: "Type 1" },
    { value: "TYPE2", label: "Type 2" },
    { value: "TYPE3", label: "Type 3" },
    { value: "TYPE4", label: "Type 4" },
    { value: "W&M_PATTERNS", label: "W&M Patterns" },
  ],
};

const ENTRY_VARIANTS = [
  { value: "RAILROAD_TRACKS", label: "Railroad Tracks" },
  { value: "CORD_OF_WOODS", label: "Cord of Woods" },
  { value: "EVENING_STAR", label: "Evening Star" },
  { value: "MORNING_STAR", label: "Morning Star" },
  { value: "SHIFT_CANDLE", label: "Shift Candle" },
];

// BTMM Comprehensive Explanation Database
const BTMM_EXPLANATIONS = {
  // BIAS Level Explanations
  BIAS: {
    // MAAW Pattern (Upward Bias)
    "M": {
      title: "M - Reversal Level/Peak Formation High",
      category: "MAAW Pattern (Upward Bias)",
      explanation: "The 'M' represents a bearish reversal pattern at key resistance levels. Market makers create this double-top formation to trap bullish traders before initiating downward moves. This is the first phase of the MAAW sequence, indicating potential upward bias as MM accumulates short positions.",
      context: "Used when price reaches significant resistance and forms rejection patterns. Look for volume confirmation and institutional selling pressure.",
      tradingNotes: "Wait for complete M-pattern formation with clear rejection at second peak. Enter short positions after neckline break with stops above pattern high."
    },
    "A1": {
      title: "A1 - Stop Hunt High Level 1",
      category: "MAAW Pattern (Upward Bias)", 
      explanation: "A1 represents the first stop hunt level where market makers sweep liquidity above previous highs. This aggressive move triggers retail stops and creates the setup for the next phase of manipulation. It's designed to trap breakout traders.",
      context: "Occurs during low liquidity periods or session transitions. Watch for sharp spikes with immediate reversals and high volume.",
      tradingNotes: "Don't chase the breakout. Wait for price to return inside previous structure. Use wide stops to avoid being caught in the hunt."
    },
    "A2": {
      title: "A2 - Stop Hunt Level 2", 
      category: "MAAW Pattern (Upward Bias)",
      explanation: "A2 is the second stop hunt level, typically more aggressive than A1. Market makers are clearing remaining liquidity and building larger positions. This creates the final accumulation phase before true directional move.",
      context: "Often seen at psychological levels or major resistance zones. Look for engulfing candles and volume spikes.",
      tradingNotes: "This is usually the last chance for MM accumulation. Position for reversal after liquidity sweep is complete."
    },
    "W": {
      title: "W - Level 3 Reversal Area (includes PFL)",
      category: "MAAW Pattern (Upward Bias)",
      explanation: "The 'W' completes the MAAW sequence, representing a bullish reversal at significant support levels. This double-bottom formation signals the end of manipulation and beginning of true upward trend. PFL (Previous Failure Low) confirms institutional buying.",
      context: "Forms at major support levels after extended downward manipulation. Look for morning star patterns and volume confirmation.",
      tradingNotes: "Enter long positions after W-pattern confirmation. This typically leads to 6-8 hour trend runs in BTMM methodology."
    },
    
    // WVVM Pattern (Downward Bias)
    "W2": {
      title: "W - Level 3 Reversal Area (includes PFH)",
      category: "WVVM Pattern (Downward Bias)",
      explanation: "In the WVVM sequence, 'W' represents bullish manipulation at support levels. Market makers create this double-bottom to trap long traders before initiating downward moves. PFH (Previous Failure High) indicates institutional selling pressure.",
      context: "Forms at significant support levels during bearish campaigns. Watch for false breakdowns and immediate reversals.",
      tradingNotes: "This is a bull trap within a larger bearish context. Prepare for downward continuation after pattern completion."
    },
    "V1": {
      title: "V1 - Stop Hunt Low Level 1",
      category: "WVVM Pattern (Downward Bias)",
      explanation: "V1 represents the first stop hunt below key support levels. Market makers aggressively sweep buy-stops and long position stops to create liquidity for their short positions. This initiates the bearish manipulation sequence.",
      context: "Occurs at obvious support levels where retail traders place protective stops. Look for sharp rejection wicks.",
      tradingNotes: "Avoid buying the 'dip' at these levels. MM is accumulating short positions for larger bearish move."
    },
    "V2": {
      title: "V2 - Stop Hunt Level 2",
      category: "WVVM Pattern (Downward Bias)", 
      explanation: "V2 is the second and typically more aggressive stop hunt below support. This clears remaining long positions and creates maximum liquidity for institutional short accumulation. Represents final manipulation before trend continuation.",
      context: "Often at round numbers or major support confluences. Volume spikes confirm institutional activity.",
      tradingNotes: "This usually signals completion of accumulation phase. Position for continued downward movement."
    },
    "M2": {
      title: "M - Reversal Level/Peak Formation Low",
      category: "WVVM Pattern (Downward Bias)",
      explanation: "M2 completes the WVVM sequence with a bearish reversal at resistance levels. This double-top formation confirms institutional distribution and signals continuation of downward trend after manipulation phases.",
      context: "Forms at key resistance after upward manipulation. Look for evening star patterns and selling volume.",
      tradingNotes: "Enter short positions after M-pattern break. This typically initiates extended bearish trends lasting 6-8 hours."
    },
    
    // Range & Volatility Analysis
    "ABS": {
      title: "Asian Box Stacking",
      category: "Range & Volatility Analysis", 
      explanation: "ABS refers to the consolidation pattern during Asian session where market makers 'stack' orders within defined ranges. This creates the setup for London session manipulation by establishing clear boundaries for stop hunts.",
      context: "Occurs during Asian session (00:00-08:00 GMT). Range boundaries become key levels for London breakouts.",
      tradingNotes: "Mark Asian range highs/lows as they become targets for London session manipulation. Trade the false breakout reversals."
    },
    "3XADR": {
      title: "3X ADR",
      category: "Range & Volatility Analysis",
      explanation: "Three times the Average Daily Range represents extreme volatility levels. When price extends beyond 3X ADR, market makers typically initiate reversal sequences as the move becomes unsustainable and retail traders become over-extended.",
      context: "Calculate based on previous 20-day ADR. Extreme moves often signal exhaustion and reversal opportunities.",
      tradingNotes: "Use as reversal signal when combined with other BTMM factors. High probability fade opportunities at these levels."
    },
    
    // EMA Crossover Levels
    "L1_LOCK": {
      title: "L1 Lock/Confirmation",
      category: "EMA Crossover Levels",
      explanation: "Level 1 Lock represents the first confirmation when 13 EMA crosses above/below 50 EMA. This signals potential trend change but requires additional confirmation before MM commits to major directional move.",
      context: "Early trend signal requiring patience. False signals common without additional confluence factors.",
      tradingNotes: "Don't trade on L1 alone. Wait for L2 confirmation or other BTMM pattern completion before entry."
    },
    "L2_CONF": {
      title: "L2 Confirmation", 
      category: "EMA Crossover Levels",
      explanation: "Level 2 Confirmation occurs when both 13/50 EMA cross AND 50/200 EMA show alignment. This represents strong institutional commitment to directional bias and typically precedes extended trend runs.",
      context: "High-probability signal when combined with session timing and market structure. Institutional money follows this signal.",
      tradingNotes: "Strong trend continuation signal. Enter in direction of EMA alignment with confidence. Expect 6-8 hour runs."
    },
    "M1_13_50": {
      title: "M1 13/50 Cross",
      category: "EMA Crossover Levels",
      explanation: "1-minute chart 13/50 EMA cross provides micro-level trend confirmation. Market makers use this for precise entry timing within larger bias context. Helps identify exact entry points for institutional positions.",
      context: "Use for fine-tuning entries within established bias. Particularly effective during session transitions.",
      tradingNotes: "Combine with higher timeframe bias for precision entries. Don't use as standalone signal."
    },
    "M1_50_200": {
      title: "M1 50/200 Cross",
      category: "EMA Crossover Levels",
      explanation: "1-minute chart 50/200 EMA cross represents significant momentum shift at micro level. When this aligns with daily bias, it creates high-probability continuation signals for institutional trend following.",
      context: "Strong momentum signal on lower timeframes. Most effective during active trading sessions (London/NY).",
      tradingNotes: "Powerful continuation signal when aligned with daily bias. Enter aggressively with tight risk management."
    }
  },
  
  // SETUP Level Explanations  
  SETUPS: {
    "ANCHORS": {
      title: "Anchor Levels",
      explanation: "Anchor levels are significant price points that market makers use as reference for major directional moves. These include major previous highs/lows, psychological levels, and institutional order clusters. Market makers 'anchor' their manipulation campaigns around these levels.",
      characteristics: [
        "Major swing highs and lows from previous sessions",
        "Psychological round numbers (00, 50 levels)", 
        "Previous day/week/month extremes",
        "High-volume consolidation areas"
      ],
      identification: "Look for areas where price previously showed strong reactions, high volume, or multiple touches. These become magnets for future price action.",
      tradingStrategy: "Use anchors as targets for moves and reversal areas. Market makers often manipulate price to these levels before true directional moves."
    },
    "ASIAN_RANGE": {
      title: "Asian Range Setups",
      explanation: "Asian Range represents the consolidation period during Asian trading session (00:00-08:00 GMT). Market makers use this low-volatility period to establish ranges that become manipulation zones for London session. The range boundaries become key levels for stop hunts.",
      characteristics: [
        "Low volatility consolidation during Asian hours",
        "Clear range boundaries with multiple touches",
        "Volume decreases during range formation", 
        "Sets up London session manipulation"
      ],
      identification: "Mark the highest high and lowest low during Asian session. These become your range boundaries for London trading.",
      tradingStrategy: "Trade the false breakouts of Asian range during London open. MM will sweep both sides before true directional move."
    },
    "BOX_SETUPS": {
      title: "Box Setups",
      explanation: "Box Setups are rectangular consolidation patterns where market makers accumulate positions within defined boundaries. These boxes become distribution or accumulation zones depending on overall bias. The longer the box, the more significant the eventual breakout.",
      characteristics: [
        "Clear support and resistance boundaries",
        "Multiple touches of range extremes",
        "Decreasing volatility within the box",
        "Volume accumulation at boundaries"
      ],
      identification: "Look for at least 3 touches of both support and resistance levels. Box should span minimum 20 pips for significance.",
      tradingStrategy: "Trade the breakout direction but expect initial false break. True move comes after stop hunt of obvious level."
    },
    "HARMONICS_P1": {
      title: "Harmonics Part 1", 
      explanation: "Harmonic patterns represent mathematical relationships in price action that market makers exploit. Part 1 focuses on basic ABCD patterns and Fibonacci retracements that institutions use for position sizing and entry timing.",
      characteristics: [
        "Fibonacci-based retracement levels (38.2%, 50%, 61.8%)",
        "ABCD pattern completion zones",
        "Mathematical price relationships",
        "Volume confirmation at completion points"
      ],
      identification: "Use Fibonacci tools to identify potential reversal zones. Look for confluence with other BTMM levels.",
      tradingStrategy: "Enter at harmonic completion zones when aligned with overall bias and session timing. Use pattern failure as stop loss."
    },
    "RESET_SAFETY": {
      title: "Reset Safety Trades",
      explanation: "Reset Safety represents low-risk entry opportunities when market makers 'reset' price action after manipulation phases. These trades offer favorable risk/reward as they align with institutional intentions rather than fighting manipulation.",
      characteristics: [
        "Occurs after completed manipulation sequences",
        "Price returns to fair value after stop hunts", 
        "Lower risk due to alignment with smart money",
        "Clear stop loss levels outside manipulation zones"
      ],
      identification: "Wait for completion of MAAW/WVVM sequences. Enter when price retraces to institutional cost basis.",
      tradingStrategy: "Conservative position sizing with wide stops. These are 'follow smart money' trades with high probability."
    },
    "RESETS": {
      title: "Reset Patterns",
      explanation: "Resets occur when market makers complete major manipulation campaigns and establish new directional bias. These represent major structural changes in market sentiment and often lead to extended trend moves lasting days or weeks.",
      characteristics: [
        "Major structural breaks of key levels",
        "Volume expansion confirming institutional participation",
        "EMA realignment supporting new direction", 
        "Session-wide commitment to new bias"
      ],
      identification: "Look for decisive breaks of major levels with volume. Old resistance becomes new support (or vice versa).",
      tradingStrategy: "Aggressive position sizing in direction of reset. These moves often extend well beyond normal daily ranges."
    }
  },
  
  // PATTERN Level Explanations
  PATTERNS: {
    "1H_50_50_BOUNCE": {
      title: "1H 50/50 Bounce Pattern",
      explanation: "A precise bounce pattern off the 50 EMA on 1-hour charts with 50% retracement characteristics. Market makers use this to test institutional commitment levels and create entries for continuation moves.",
      formation: "Price retraces exactly 50% of previous move and finds support/resistance at 50 EMA confluence.",
      psychology: "Tests the conviction of institutions in current trend direction while providing entry for smart money."
    },
    "2ND_LEG_HALF_BAT": {
      title: "Second Leg Half Bat",
      explanation: "A harmonic pattern where the second leg of a move completes at 50% of the first leg, creating bat-like structure. Market makers use this for precise reversal timing.",
      formation: "AB leg followed by BC retracement, then CD leg completing at 50% of AB move.",
      psychology: "Provides mathematical precision for institutional entry/exit timing based on Fibonacci relationships."
    },
    "3_DRIVES_3_DAY": {
      title: "3 Drives 3 Day Setup",
      explanation: "A three-drive pattern that develops over three trading days, with each drive reaching progressively higher/lower levels. Represents complete institutional accumulation/distribution campaign.",
      formation: "Three distinct impulsive moves in same direction, each separated by corrective retracements.",
      psychology: "Allows maximum position accumulation while maintaining illusion of continued trend for retail traders."
    },
    "3_HITS_TRADE": {
      title: "3 Hits Trade Pattern",
      explanation: "A pattern where price tests a significant level three times before breaking. The third hit often represents final institutional accumulation before major move.",
      formation: "Three distinct touches of support/resistance level, with third touch showing different characteristics.",
      psychology: "Third time's the charm - institutions complete their positioning and initiate trend move."
    },
    "HALF_BATS": {
      title: "Half Bat Patterns",
      explanation: "Incomplete bat harmonic patterns that reverse before completing full structure. Market makers use these for surprise reversals that trap pattern traders.",
      formation: "Partial bat structure that reverses at 50% completion rather than full harmonic ratios.",
      psychology: "Catches harmonic traders off-guard by reversing before expected completion point."
    },
    "HEAD_SHOULDERS": {
      title: "Head and Shoulders Patterns", 
      explanation: "Classic reversal pattern with three peaks, middle one highest. Market makers create these at major turning points to signal trend changes and trap breakout traders.",
      formation: "Left shoulder, higher head, right shoulder with neckline support/resistance.",
      psychology: "Most recognized pattern by retail traders, making it perfect for institutional manipulation."
    },
    "ID_50": {
      title: "ID 50 Pattern",
      explanation: "Institutional Distribution at 50% levels. Market makers distribute positions at 50% retracement levels of major moves, creating reversal opportunities.",
      formation: "Price reaches 50% retracement of significant move and shows distribution characteristics.",
      psychology: "Institutions take profits at mathematical levels while retail traders expect trend continuation."
    },
    "LONDON_PATTERNS": {
      title: "London Session Patterns",
      explanation: "Specific patterns that form during London trading session (08:00-16:00 GMT). These include stop hunts of Asian range and manipulation setups for NY session.",
      formation: "Range breakouts, false breakdowns, and manipulation patterns specific to London session.",
      psychology: "London institutions manipulate Asian ranges and set up directional bias for NY session."
    },
    "TYPE1": {
      title: "Type 1 Reversal Patterns",
      explanation: "Primary reversal patterns that form at major structural levels. These represent complete trend changes backed by institutional volume and commitment.",
      formation: "Major structural breaks with volume confirmation and EMA realignment.", 
      psychology: "Institutional money commits to new directional bias, creating sustained trend moves."
    },
    "TYPE2": {
      title: "Type 2 Continuation Patterns",
      explanation: "Continuation patterns within established trends. Market makers create these to add to existing positions and trap counter-trend traders.",
      formation: "Pullback patterns within trends that hold key moving average support/resistance.",
      psychology: "Institutions add to winning positions while retail traders attempt counter-trend trades."
    },
    "TYPE3": {
      title: "Type 3 Consolidation Patterns",
      explanation: "Consolidation patterns that precede major breakouts. Market makers accumulate positions within tight ranges before initiating large moves.",
      formation: "Tight consolidation with decreasing volatility followed by expansion breakout.",
      psychology: "Calm before the storm - institutions quietly accumulate before major campaign."
    },
    "TYPE4": {
      title: "Type 4 Manipulation Patterns",
      explanation: "Pure manipulation patterns designed to trap retail traders. These include fake breakouts, stop hunts, and false reversal signals.",
      formation: "Obvious setups that fail immediately after retail traders enter positions.",
      psychology: "Direct retail trader exploitation through false signals and trap setups."
    },
    "W&M_PATTERNS": {
      title: "W&M Combined Patterns",
      explanation: "Complex patterns combining W (double bottom) and M (double top) structures. Represents complete manipulation cycles from accumulation to distribution.",
      formation: "Sequential W and M patterns creating comprehensive manipulation campaigns.",
      psychology: "Complete retail trader psychology exploitation through multiple false signals."
    }
  },
  
  // ENTRY Level Explanations (Candlestick Patterns)
  "ENTRY'S": {
    "RAILROAD_TRACKS": {
      title: "Railroad Tracks Entry",
      explanation: "Two parallel candlesticks of opposite colors with similar bodies, resembling railroad tracks. This pattern signals strong reversal when found at key levels with institutional confluence.",
      formation: "Bearish followed by bullish candle (or vice versa) with bodies of similar size appearing side by side.",
      entry: "Enter on close of second candle in direction of reversal with stop beyond pattern high/low.",
      psychology: "Represents institutional disagreement at key levels, leading to directional change.",
      btmmContext: "Most effective at completion of MAAW/WVVM sequences and major structural levels."
    },
    "CORD_OF_WOODS": {
      title: "Cord of Woods Entry", 
      explanation: "Multiple small-bodied candles stacked together like a cord of wood. Indicates consolidation before major institutional move. Often precedes explosive breakouts.",
      formation: "Series of 3-5 small doji-like candles with minimal body sizes and overlapping ranges.",
      entry: "Enter on breakout of consolidation range with confirmation candle.",
      psychology: "Institutional indecision resolved with sudden directional commitment.",
      btmmContext: "Common during Asian range formation and before London session manipulation."
    },
    "EVENING_STAR": {
      title: "Evening Star Entry",
      explanation: "Three-candle bearish reversal pattern. First candle bullish, second small-bodied (indecision), third bearish. Signals end of uptrend and institutional selling pressure.",
      formation: "Large bullish candle, followed by small indecision candle, completed by large bearish candle.", 
      entry: "Enter short on close of third candle with stop above pattern high.",
      psychology: "Bulls lose control as institutions begin distribution campaign.",
      btmmContext: "Powerful at resistance levels during completion of M-patterns in MAAW sequences."
    },
    "MORNING_STAR": {
      title: "Morning Star Entry",
      explanation: "Three-candle bullish reversal pattern. First candle bearish, second small-bodied (indecision), third bullish. Signals end of downtrend and institutional buying pressure.",
      formation: "Large bearish candle, followed by small indecision candle, completed by large bullish candle.",
      entry: "Enter long on close of third candle with stop below pattern low.", 
      psychology: "Bears lose control as institutions begin accumulation campaign.",
      btmmContext: "Highly effective at support levels during completion of W-patterns in MAAW sequences."
    },
    "SHIFT_CANDLE": {
      title: "Shift Candle Entry",
      explanation: "Single candle that dramatically shifts market sentiment through size and placement. Represents sudden institutional commitment to new direction. Often appears after manipulation phases.",
      formation: "Large-bodied candle that engulfs previous price action and closes beyond key structural levels.",
      entry: "Enter in direction of shift candle on any pullback to its body.",
      psychology: "Sudden institutional decision creates momentum shift that retail traders must follow.",
      btmmContext: "Marks transition from manipulation phase to trend phase in BTMM methodology."
    }
  }
};

// Function to map new fields to legacy strategyType
function buildStrategyType(tradeType?: string, entry?: string): string {
  if (!tradeType || !entry) return "";
  return `${tradeType}${entry}`;
}

// Function to parse legacy strategyType to new fields
function parseStrategyType(strategyType?: string) {
  if (!strategyType) return { tradeType: "", entry: "" };
  const match = strategyType.match(/^(\d+)([abc])$/);
  if (match) {
    return { tradeType: match[1], entry: match[2] };
  }
  return { tradeType: "", entry: "" };
}

export function TradingSetupGuide({ screenshot, isMobile = false, onUpdateScreenshot }: TradingSetupGuideProps) {
  // Local state for the 4 selections
  const [bias, setBias] = useState<string>("");
  const [setup, setSetup] = useState<string>("");
  const [pattern, setPattern] = useState<string>("");
  const [entry, setEntry] = useState<string>("");
  const [noteContent, setNoteContent] = useState<string>("");
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  
  const queryClient = useQueryClient();
  
  // Fetch notes for the current screenshot
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['/api/screenshots', screenshot?.id, 'notes'],
    queryFn: async () => {
      if (!screenshot?.id) return [];
      const response = await apiRequest('GET', `/api/screenshots/${screenshot.id}/notes`);
      return response.json();
    },
    enabled: !!screenshot?.id,
  });
  
  // Create or update note mutation
  const notesMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!screenshot?.id) throw new Error('No screenshot selected');
      
      const existingNote = notes.find(note => note.screenshotId === screenshot.id);
      
      if (existingNote) {
        // Update existing note
        const response = await apiRequest('PUT', `/api/notes/${existingNote.id}`, { content });
        return response.json();
      } else {
        // Create new note
        const response = await apiRequest('POST', `/api/screenshots/${screenshot.id}/notes`, {
          content
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/screenshots', screenshot?.id, 'notes'] });
      setIsEditingNote(false);
    },
  });

  // Initialize from screenshot data
  useEffect(() => {
    if (screenshot) {
      setBias(screenshot.bias || "");
      setSetup(screenshot.tradeType || "");
      setPattern(screenshot.setupPattern || "");
      setEntry(screenshot.entry || "");
    } else {
      setBias("");
      setSetup("");
      setPattern("");
      setEntry("");
    }
  }, [screenshot]);
  
  // Initialize note content when notes are loaded
  useEffect(() => {
    const existingNote = notes.find(note => note.screenshotId === screenshot?.id);
    if (existingNote) {
      setNoteContent(existingNote.content);
    } else {
      setNoteContent("");
    }
  }, [notes, screenshot?.id]);
  
  const handleSaveNote = () => {
    if (noteContent.trim()) {
      notesMutation.mutate({ content: noteContent.trim() });
    }
  };
  
  const handleCancelEdit = () => {
    const existingNote = notes.find(note => note.screenshotId === screenshot?.id);
    setNoteContent(existingNote?.content || "");
    setIsEditingNote(false);
  };

  // Get relevant BTMM explanations based on screenshot categories
  const getRelevantExplanations = (screenshot: Screenshot) => {
    const explanations: Array<{type: string, title: string, content: any}> = [];
    
    // Add BIAS explanation if present
    if (screenshot.bias && (BTMM_EXPLANATIONS.BIAS as any)[screenshot.bias]) {
      explanations.push({
        type: '🔵 BIAS',
        title: (BTMM_EXPLANATIONS.BIAS as any)[screenshot.bias].title,
        content: (BTMM_EXPLANATIONS.BIAS as any)[screenshot.bias]
      });
    }
    
    // Add SETUP explanation if present 
    if (screenshot.tradeType && (BTMM_EXPLANATIONS.SETUPS as any)[screenshot.tradeType]) {
      explanations.push({
        type: '🟢 SETUP',
        title: (BTMM_EXPLANATIONS.SETUPS as any)[screenshot.tradeType].title,
        content: (BTMM_EXPLANATIONS.SETUPS as any)[screenshot.tradeType]
      });
    }
    
    // Add PATTERN explanation if present
    if (screenshot.setupPattern && (BTMM_EXPLANATIONS.PATTERNS as any)[screenshot.setupPattern]) {
      explanations.push({
        type: '🟣 PATTERN', 
        title: (BTMM_EXPLANATIONS.PATTERNS as any)[screenshot.setupPattern].title,
        content: (BTMM_EXPLANATIONS.PATTERNS as any)[screenshot.setupPattern]
      });
    }
    
    // Add ENTRY explanation if present
    if (screenshot.entry && (BTMM_EXPLANATIONS["ENTRY'S"] as any)[screenshot.entry]) {
      explanations.push({
        type: '🟠 ENTRY\'S',
        title: (BTMM_EXPLANATIONS["ENTRY'S"] as any)[screenshot.entry].title, 
        content: (BTMM_EXPLANATIONS["ENTRY'S"] as any)[screenshot.entry]
      });
    }
    
    return explanations;
  };

  // Handle updates to selections
  const handleUpdate = (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Clear pattern when setup changes
    if (field === 'setup' || field === 'tradeType') {
      setPattern("");
      updates.setupPattern = "";
    }
    
    // Map our fields to the screenshot schema
    if (field === 'setup') {
      updates.tradeType = value;
    } else if (field === 'pattern') {
      updates.setupPattern = value;
    }
    
    // Update legacy strategyType for backwards compatibility
    const newSetup = field === 'setup' ? value : setup;
    const newEntry = field === 'entry' ? value : entry;
    if (newSetup && newEntry) {
      updates.strategyType = buildStrategyType(newSetup, newEntry);
    }
    
    onUpdateScreenshot?.(updates);
  };
  if (!screenshot) {
    return (
      <div className="flex flex-col bg-trading-dark h-full">
        <div className={`bg-trading-card border-b border-trading-border ${isMobile ? 'p-3' : 'p-4'}`}>
          <h2 className={`text-white font-semibold flex items-center ${isMobile ? 'text-base' : 'text-lg'}`}>
            <i className="fas fa-book-open mr-2 text-trading-accent"></i>
            Trading Setup Guide
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-trading-text">
            <i className="fas fa-chart-line text-4xl mb-4 text-trading-accent"></i>
            <p className="text-lg">Select a screenshot to configure setup</p>
            <p className="text-sm">Choose trade type, bias, setup pattern, and entry variant</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which setup info to show based on current selections
  const currentStrategyType = buildStrategyType(setup, entry);
  const setupInfo = currentStrategyType ? tradingSetups[currentStrategyType] : null;
  
  // Get available patterns for current setup type
  const availablePatterns = setup ? PATTERN_OPTIONS[setup as keyof typeof PATTERN_OPTIONS] || [] : [];

  return (
    <div className="flex flex-col bg-trading-dark h-full">
      {/* Header */}
      <div className={`bg-trading-card border-b border-trading-border ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-white font-semibold flex items-center ${isMobile ? 'text-base' : 'text-lg'}`}>
            <i className="fas fa-book-open mr-2 text-trading-accent"></i>
            Trading Setup Guide
          </h2>
          <div className="flex items-center space-x-2">
            {currentStrategyType && (
              <span className="bg-trading-accent text-trading-dark px-3 py-1 rounded-full text-xs font-semibold">
                {currentStrategyType}
              </span>
            )}
            <span className="bg-bullish text-white px-2 py-1 rounded text-xs">
              +2R 🏆
            </span>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className={`bg-trading-card border-b border-trading-border ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 lg:grid-cols-4 gap-4'}`}>
          {/* Bias */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Bias</label>
            <Select value={bias} onValueChange={(value) => { setBias(value); handleUpdate('bias', value); }}>
              <SelectTrigger className="bg-trading-border border-trading-border text-white">
                <SelectValue placeholder="Select bias" />
              </SelectTrigger>
              <SelectContent>
                {BIAS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Setup */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Setup</label>
            <Select value={setup} onValueChange={(value) => { setSetup(value); handleUpdate('setup', value); }}>
              <SelectTrigger className="bg-trading-border border-trading-border text-white">
                <SelectValue placeholder="Select setup" />
              </SelectTrigger>
              <SelectContent>
                {SETUP_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pattern */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Pattern</label>
            <Select 
              value={pattern} 
              onValueChange={(value) => { setPattern(value); handleUpdate('pattern', value); }}
              disabled={!setup}
            >
              <SelectTrigger className="bg-trading-border border-trading-border text-white">
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                {availablePatterns.map((patternOption: any) => (
                  <SelectItem key={patternOption.value} value={patternOption.value}>{patternOption.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Entry */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Entry</label>
            <Select value={entry} onValueChange={(value) => { setEntry(value); handleUpdate('entry', value); }}>
              <SelectTrigger className="bg-trading-border border-trading-border text-white">
                <SelectValue placeholder="Select entry" />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_VARIANTS.map(variant => (
                  <SelectItem key={variant.value} value={variant.value}>{variant.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
        {!setupInfo ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-trading-text">
              <i className="fas fa-cog text-4xl mb-4 text-trading-accent"></i>
              <p className="text-lg">Configure your setup</p>
              <p className="text-sm">Select trade type and entry variant to view detailed guide</p>
            </div>
          </div>
        ) : (
          <>
        {/* Setup Title */}
        <div className="mb-6 p-4 bg-trading-card rounded-lg border border-trading-border">
          <h3 className="text-xl font-bold text-trading-accent mb-2">{setupInfo.title}</h3>
          <p className="text-trading-gold font-semibold mb-2">{setupInfo.subtitle}</p>
          <p className="text-white">{setupInfo.description}</p>
        </div>

        {/* Entry Rules */}
        <div className="mb-6 p-4 bg-trading-card rounded-lg border border-trading-border">
          <h4 className="text-lg font-semibold text-trading-accent mb-3 flex items-center">
            <i className="fas fa-clipboard-list mr-2"></i>
            Entry Rules
          </h4>
          <div className="space-y-2">
            {setupInfo.entryRules.map((rule, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-trading-border rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-trading-accent text-trading-dark rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <p className="text-white flex-1">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Optimal Locations */}
        <div className="mb-6 p-4 bg-trading-card rounded-lg border border-trading-border">
          <h4 className="text-lg font-semibold text-trading-gold mb-3 flex items-center">
            <i className="fas fa-map-marker-alt mr-2"></i>
            Optimal Locations
          </h4>
          <div className="space-y-2">
            {setupInfo.optimalLocations.map((location, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-trading-border rounded-lg">
                <i className="fas fa-crosshairs text-trading-gold flex-shrink-0"></i>
                <p className="text-white">{location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="mb-4 p-4 bg-trading-card rounded-lg border border-trading-border">
          <h4 className="text-lg font-semibold text-bullish mb-3 flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            Pre-Entry Verification
          </h4>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}>
            {setupInfo.verificationChecklist.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-trading-border rounded-lg p-4">
                <h5 className="text-white font-semibold mb-3">{category.category}</h5>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-3 p-2 hover:bg-trading-card rounded transition-colors">
                      <i className="fas fa-circle text-bullish text-xs flex-shrink-0"></i>
                      <p className="text-trading-text text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Information */}
        <div className="mb-6 p-4 bg-trading-card rounded-lg border border-trading-border">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <i className="fas fa-chart-line mr-2 text-trading-accent"></i>
            Trade Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-trading-border p-3 rounded-lg">
              <div className="text-trading-text text-sm">Instrument</div>
              <div className="text-white font-bold">{screenshot.currencyPair}</div>
            </div>
            <div className="bg-trading-border p-3 rounded-lg">
              <div className="text-trading-text text-sm">Session</div>
              <div className="text-white font-bold">{screenshot.sessionTiming || 'N/A'}</div>
            </div>
            <div className="bg-bullish/20 p-3 rounded-lg">
              <div className="text-trading-text text-sm">Result</div>
              <div className="text-bullish font-bold">Winner 🏆</div>
            </div>
            <div className="bg-trading-accent/20 p-3 rounded-lg">
              <div className="text-trading-text text-sm">Risk/Reward</div>
              <div className="text-trading-accent font-bold">+2R</div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="p-4 bg-trading-card rounded-lg border border-trading-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <i className="fas fa-sticky-note mr-2 text-trading-accent"></i>
              Trading Notes
            </h4>
            {!isEditingNote && (
              <Button
                onClick={() => setIsEditingNote(true)}
                variant="outline"
                size="sm"
                className="border-trading-accent text-trading-accent hover:bg-trading-accent hover:text-trading-dark"
              >
                <i className="fas fa-edit mr-1"></i>
                {notes.length > 0 ? 'Edit' : 'Add Note'}
              </Button>
            )}
          </div>
          
          {isEditingNote ? (
            <div className="space-y-3">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add your trading notes, observations, and lessons learned..."
                className="bg-trading-border border-trading-border text-white placeholder-trading-text min-h-[120px] resize-none"
                data-testid="textarea-note-content"
              />
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSaveNote}
                  disabled={!noteContent.trim() || notesMutation.isPending}
                  className="bg-trading-accent text-trading-dark hover:bg-trading-accent/80"
                  data-testid="button-save-note"
                >
                  {notesMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-1"></i>
                      Save Note
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="border-trading-text text-trading-text hover:bg-trading-text hover:text-trading-dark"
                  data-testid="button-cancel-edit"
                >
                  <i className="fas fa-times mr-1"></i>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className="p-3 bg-trading-border rounded-lg">
                    <p className="text-white whitespace-pre-wrap">{note.content}</p>
                    <div className="text-trading-text text-xs mt-2">
                      {note.updatedAt ? 
                        `Updated: ${new Date(note.updatedAt).toLocaleDateString()} ${new Date(note.updatedAt).toLocaleTimeString()}` :
                        note.createdAt ? `Created: ${new Date(note.createdAt).toLocaleDateString()} ${new Date(note.createdAt).toLocaleTimeString()}` : 'Just created'
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-trading-text">
                  <i className="fas fa-sticky-note text-2xl mb-2 opacity-50"></i>
                  <p>No notes yet. Click "Add Note" to document your analysis.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BTMM Explanations Section */}
        {(() => {
          const explanations = getRelevantExplanations(screenshot);
          if (explanations.length === 0) return null;
          
          return (
            <div className="p-4 bg-trading-card rounded-lg border border-trading-border">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-graduation-cap mr-2 text-trading-accent"></i>
                BTMM Strategy Analysis
              </h4>
              <div className="space-y-4">
                {explanations.map((explanation, index) => (
                  <div key={index} className="bg-trading-border rounded-lg p-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-trading-accent bg-trading-accent/20 px-2 py-1 rounded">
                          {explanation.type}
                        </span>
                        {explanation.content.category && (
                          <span className="text-xs text-trading-text bg-trading-card px-2 py-1 rounded">
                            {explanation.content.category}
                          </span>
                        )}
                      </div>
                      <h5 className="text-white font-bold text-sm mb-2">
                        {explanation.title}
                      </h5>
                    </div>
                    
                    <div className="text-trading-text text-xs space-y-2">
                      {/* Main explanation */}
                      {explanation.content.explanation && (
                        <p className="leading-relaxed">
                          <strong className="text-white">Explanation:</strong> {explanation.content.explanation}
                        </p>
                      )}
                      
                      {/* Context */}
                      {explanation.content.context && (
                        <p className="leading-relaxed">
                          <strong className="text-white">Context:</strong> {explanation.content.context}
                        </p>
                      )}
                      
                      {/* Formation (for patterns) */}
                      {explanation.content.formation && (
                        <p className="leading-relaxed">
                          <strong className="text-white">Formation:</strong> {explanation.content.formation}
                        </p>
                      )}
                      
                      {/* Entry (for entry patterns) */}
                      {explanation.content.entry && (
                        <p className="leading-relaxed">
                          <strong className="text-white">Entry:</strong> {explanation.content.entry}
                        </p>
                      )}
                      
                      {/* Psychology */}
                      {explanation.content.psychology && (
                        <p className="leading-relaxed">
                          <strong className="text-white">Psychology:</strong> {explanation.content.psychology}
                        </p>
                      )}
                      
                      {/* Trading Notes */}
                      {explanation.content.tradingNotes && (
                        <p className="leading-relaxed">
                          <strong className="text-white">Trading Notes:</strong> {explanation.content.tradingNotes}
                        </p>
                      )}
                      
                      {/* Trading Strategy (for setups) */}
                      {explanation.content.tradingStrategy && (
                        <p className="leading-relaxed">
                          <strong className="text-white">Strategy:</strong> {explanation.content.tradingStrategy}
                        </p>
                      )}
                      
                      {/* BTMM Context (for entries) */}
                      {explanation.content.btmmContext && (
                        <p className="leading-relaxed">
                          <strong className="text-white">BTMM Context:</strong> {explanation.content.btmmContext}
                        </p>
                      )}
                      
                      {/* Characteristics (for setups) */}
                      {explanation.content.characteristics && (
                        <div>
                          <strong className="text-white">Characteristics:</strong>
                          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            {explanation.content.characteristics.map((char: string, i: number) => (
                              <li key={i}>{char}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Identification (for setups) */}
                      {explanation.content.identification && (
                        <p className="leading-relaxed">
                          <strong className="text-white">Identification:</strong> {explanation.content.identification}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {explanations.length > 0 && (
                <div className="mt-4 p-3 bg-trading-accent/10 rounded-lg border border-trading-accent/20">
                  <p className="text-xs text-trading-text">
                    <i className="fas fa-info-circle mr-2 text-trading-accent"></i>
                    <strong className="text-white">BTMM Flow:</strong> Analysis flows from BIAS → SETUP → PATTERN → ENTRY for complete market maker understanding. Each level builds upon the previous to create comprehensive trading strategies.
                  </p>
                </div>
              )}
            </div>
          );
        })()}
        </>
        )}
      </div>
    </div>
  );
}