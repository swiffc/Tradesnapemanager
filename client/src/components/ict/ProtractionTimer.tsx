import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SessionData, ProtractionData } from '@/hooks/ict/useICTData';

export interface ProtractionTimerProps {
  sessionData: SessionData;
  protractionData: ProtractionData;
  selectedPair: string;
  onStepComplete: (step: string, completed: boolean) => void;
  timeUpdatesEnabled: boolean;
}

export const ProtractionTimer: React.FC<ProtractionTimerProps> = ({
  sessionData,
  protractionData,
  selectedPair,
  onStepComplete,
  timeUpdatesEnabled
}) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = (timeRange: string, currentTime: Date) => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const currentMinutes = hour * 60 + minute;

    // Define time ranges
    const ranges = {
      '11:50 PM': 23 * 60 + 50,
      '12:00 AM': 0,
      '12:15 AM': 15,
      '2:00 AM': 2 * 60,
      '1:30 AM': 1 * 60 + 30,
      '2:30 AM': 2 * 60 + 30
    };

    // Determine if we're in the active time range
    // This is a simplified version - you'd want more sophisticated logic
    return 'WAIT'; // Default status
  };

  const TimelineStep = ({ 
    time, 
    action, 
    status, 
    isActive = false 
  }: { 
    time: string; 
    action: string; 
    status: string;
    isActive?: boolean;
  }) => (
    <div className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
      isActive ? 'bg-yellow-100 border-l-4 border-yellow-500 animate-pulse' : 'bg-gray-50'
    }`}>
      <div className="font-mono font-bold text-gray-700 min-w-[70px]">
        {time}
      </div>
      <div className="flex-1 text-gray-600">
        {action}
      </div>
      <Badge 
        variant={
          status === 'EXECUTE' ? 'default' : 
          status === 'WATCH' ? 'secondary' : 
          status === 'READY' ? 'outline' : 'secondary'
        }
        className={`text-xs ${
          status === 'EXECUTE' ? 'bg-green-500' :
          status === 'WATCH' ? 'bg-yellow-500' :
          status === 'READY' ? 'bg-blue-500' : 'bg-gray-500'
        }`}
      >
        {status}
      </Badge>
    </div>
  );

  const CheckItem = ({ 
    id, 
    title, 
    description, 
    liveTip, 
    recommendations 
  }: {
    id: string;
    title: string;
    description: string;
    liveTip: string;
    recommendations: string[];
  }) => (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <Checkbox
          id={id}
          onCheckedChange={(checked) => onStepComplete(id, checked as boolean)}
        />
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      
      <div className="bg-blue-50 rounded p-3 mb-3">
        <div className="text-xs font-semibold text-blue-800 mb-1">👁️ LIVE TIP:</div>
        <div className="text-xs text-blue-700">{liveTip}</div>
      </div>

      <div className="space-y-1">
        {recommendations.map((rec, index) => (
          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
            {rec}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⏰ STEP 2: Live Protraction Timing
          <Badge variant="secondary" className="animate-pulse">WATCH</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-700">
          <strong>Instructor Guidance:</strong> Protraction sets up London entries for the selected pair. 
          Normal is pre-London manipulation; delayed is during London open. Use live prices to measure SD reach, 
          aiming for 4 SD fills. Confirm with MSS on lower timeframes. Pair-specific considerations below.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Normal Protraction */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ⏰
                </div>
                <h3 className="font-semibold">London Normal Protraction</h3>
              </div>
              <Badge variant="outline" className="bg-purple-100">
                12:00-2:00 AM EST (Pre-London)
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <TimelineStep 
                time="11:50 PM" 
                action="Prepare for midnight NY open" 
                status="WAIT"
                isActive={protractionData.type === 'normal' && protractionData.phase === 'Pre-Midnight Setup'}
              />
              <TimelineStep 
                time="12:00 AM" 
                action="Watch for Judas swing" 
                status="WATCH"
                isActive={protractionData.type === 'normal' && protractionData.phase === 'Judas Swing Window'}
              />
              <TimelineStep 
                time="12:15 AM" 
                action="Confirm Judas swing (1-2 SD)" 
                status="READY"
                isActive={protractionData.type === 'normal' && protractionData.phase === 'Pre-London Setup'}
              />
              <TimelineStep 
                time="2:00 AM" 
                action="Enter on reversal as London opens" 
                status="EXECUTE"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CheckItem
                id="normal1"
                title="Post-Midnight Movement"
                description="Instructor: Watch for immediate price reaction against bias post-midnight. This traps retail before London, filling 1-2 SDs."
                liveTip="Monitor 12:00-12:30 AM: price moves against daily bias using live prices."
                recommendations={[
                  "✅ If immediate move against bias: Confirm Judas Swing; measure to 1-2 SD of selected range.",
                  "⚠️ If no move by 12:30 AM: Switch to delayed protraction; prepare for 2:00 AM.",
                  "✅ If move <2 SD: High probability reversal; wait for MSS on 5M chart.",
                  "❌ If exceeds 3 SD: Displacement; avoid entry, monitor for pullback."
                ]}
              />

              <CheckItem
                id="normal2"
                title="Judas Swing Confirmation"
                description="Instructor: Confirm manipulative swing reaches 1-2 SD before reversing into London momentum, filling 4 SDs daily."
                liveTip="Measure protraction: 1-2 SDs of range using live prices."
                recommendations={[
                  "✅ If swing at 1-2 SD: Enter reversal with stop beyond extreme; target 2-3 SD opposite.",
                  "⚠️ If no reversal by 2:00 AM: Shift to delayed protraction for London open.",
                  "✅ If MSS confirms reversal: Execute trade; partial at 1:1, trail to 3 SD.",
                  "❌ If false breakout: Invalid; exit and reassess with Flout."
                ]}
              />
            </div>
          </div>

          {/* Delayed Protraction */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ⏰
                </div>
                <h3 className="font-semibold">London Delayed Protraction</h3>
              </div>
              <Badge variant="outline" className="bg-orange-100">
                2:00-4:00 AM EST (During London)
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <TimelineStep 
                time="12:00 AM" 
                action="No significant movement" 
                status="WAIT"
              />
              <TimelineStep 
                time="1:30 AM" 
                action="Prepare for delayed protraction" 
                status="READY"
                isActive={protractionData.type === 'delayed' && protractionData.phase === 'London IPDA Window'}
              />
              <TimelineStep 
                time="2:00 AM" 
                action="Watch IPDA protraction at London open" 
                status="WATCH"
                isActive={protractionData.type === 'delayed' && protractionData.isActive}
              />
              <TimelineStep 
                time="2:30 AM" 
                action="Enter on reversal during London" 
                status="EXECUTE"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CheckItem
                id="delayed1"
                title="No Midnight Movement"
                description="Instructor: Confirm lack of protraction post-midnight, indicating delayed action into London open."
                liveTip="Confirm: price stays tight 12:00-1:30 AM using live prices."
                recommendations={[
                  "✅ If tight range no move: Prepare for IPDA-driven protraction at 2:00 AM London open.",
                  "⚠️ If sudden move pre-2:00 AM: Revert to normal protraction checks.",
                  "✅ If CBDR suboptimal: Delayed common; focus on London kill zone (2-5 AM).",
                  "⚠️ If volatility spikes at open: Wait for 2:33 AM IPDA window to fill 4 SDs."
                ]}
              />

              <CheckItem
                id="delayed2"
                title="IPDA Protraction Start"
                description="Instructor: Watch for delayed manipulation during London open, aligned with IPDA timing to fill 4 SDs."
                liveTip="Watch 2:00+ AM: delayed protraction begins; sync with 2:33-3:00 AM window."
                recommendations={[
                  "✅ If protraction at 2:33 AM: Align with 20/40/60/90-day lookback; enter on reversal at 1-2 SD.",
                  "❌ If no IPDA alignment: Skip entry; wait for MSS confirmation on 5M.",
                  "✅ If sweep during kill zone: High edge; target 3-4 SD extension to fill daily levels.",
                  "❌ If false reversal: Exit immediately; reassess with Flout."
                ]}
              />
            </div>
          </div>
        </div>

        {/* Current Status */}
        {protractionData.isActive && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-500">ACTIVE</Badge>
              <h4 className="font-semibold">Current Protraction Status</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-600">Type</div>
                <div className="capitalize">{protractionData.type} Protraction</div>
              </div>
              <div>
                <div className="font-semibold text-gray-600">Phase</div>
                <div>{protractionData.phase}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-600">Next Action</div>
                <div>{protractionData.nextAction}</div>
              </div>
            </div>
          </div>
        )}

        {/* Pair-Specific Notes */}
        {selectedPair !== 'general' && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              📝 {selectedPair} Protraction Notes
            </h4>
            <div className="text-sm text-blue-700">
              Specific protraction behavior and timing considerations for {selectedPair} based on 
              historical patterns and current market conditions.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
