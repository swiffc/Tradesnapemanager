import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface SessionData {
  currentSession: string;
  nextKillzone: string;
  rangePhase: string;
  protractionPhase: string;
  currentTime: Date;
}

export interface LiveStatusBarProps {
  sessionData: SessionData;
  timeUpdatesEnabled: boolean;
}

export const LiveStatusBar: React.FC<LiveStatusBarProps> = ({
  sessionData,
  timeUpdatesEnabled
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!timeUpdatesEnabled) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUpdatesEnabled]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isActivePhase = (phase: string) => {
    return phase.includes('ACTIVE') || phase.includes('Forming');
  };

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
      <CardContent className="pt-6">
        {/* Live Clock */}
        <div className="text-center mb-6">
          <div className="text-xl font-bold">
            NY Time: {formatTime(currentTime)} | {formatDate(currentTime)}
          </div>
          {!timeUpdatesEnabled && (
            <Badge variant="destructive" className="mt-2">
              Updates Paused
            </Badge>
          )}
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-15 rounded-lg p-4 text-center">
            <div className="text-sm opacity-80 mb-2">Current Session</div>
            <div className="text-lg font-bold">{sessionData.currentSession}</div>
          </div>

          <div className="bg-white bg-opacity-15 rounded-lg p-4 text-center">
            <div className="text-sm opacity-80 mb-2">Next Kill Zone</div>
            <div className="text-lg font-bold">{sessionData.nextKillzone}</div>
          </div>

          <div className={`bg-white bg-opacity-15 rounded-lg p-4 text-center ${
            isActivePhase(sessionData.rangePhase) ? 'ring-2 ring-green-400 animate-pulse' : ''
          }`}>
            <div className="text-sm opacity-80 mb-2">Range Formation</div>
            <div className="text-lg font-bold">{sessionData.rangePhase}</div>
            {isActivePhase(sessionData.rangePhase) && (
              <Badge className="mt-2 bg-green-500">ACTIVE</Badge>
            )}
          </div>

          <div className={`bg-white bg-opacity-15 rounded-lg p-4 text-center ${
            isActivePhase(sessionData.protractionPhase) ? 'ring-2 ring-yellow-400 animate-pulse' : ''
          }`}>
            <div className="text-sm opacity-80 mb-2">Protraction Watch</div>
            <div className="text-lg font-bold">{sessionData.protractionPhase}</div>
            {isActivePhase(sessionData.protractionPhase) && (
              <Badge className="mt-2 bg-yellow-500">WATCH</Badge>
            )}
          </div>
        </div>

        {/* Session Indicators */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <SessionIndicator 
            name="Asian Range" 
            active={sessionData.currentSession === 'Asian Range'}
            time="7:00 PM - 12:00 AM EST"
          />
          <SessionIndicator 
            name="London Open" 
            active={sessionData.currentSession === 'London Open'}
            time="2:00 AM - 5:00 AM EST"
          />
          <SessionIndicator 
            name="NY Open" 
            active={sessionData.currentSession === 'NY Open'}
            time="8:30 AM - 11:00 AM EST"
          />
          <SessionIndicator 
            name="London Close" 
            active={sessionData.currentSession === 'London Close'}
            time="10:00 AM - 12:00 PM EST"
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface SessionIndicatorProps {
  name: string;
  active: boolean;
  time: string;
}

const SessionIndicator: React.FC<SessionIndicatorProps> = ({ name, active, time }) => {
  return (
    <div className={`px-3 py-2 rounded-lg text-sm ${
      active 
        ? 'bg-green-500 text-white font-bold animate-pulse' 
        : 'bg-white bg-opacity-10 text-gray-300'
    }`}>
      <div className="font-semibold">{name}</div>
      <div className="text-xs opacity-80">{time}</div>
    </div>
  );
};
