import { useState, useEffect, useCallback } from 'react';

export interface SessionData {
  currentSession: string;
  nextKillzone: string;
  rangePhase: string;
  protractionPhase: string;
  currentTime: Date;
}

export interface ProtractionData {
  type: 'normal' | 'delayed' | 'none';
  phase: string;
  nextAction: string;
  timeUntilNext: number;
  isActive: boolean;
}

export interface ICTDataHook {
  sessionData: SessionData;
  protractionData: ProtractionData;
  updateProgress: (progress: number) => void;
  getCurrentNYTime: () => Date;
}

export const useICTData = (selectedPair: string): ICTDataHook => {
  const [sessionData, setSessionData] = useState<SessionData>({
    currentSession: 'Market Closed',
    nextKillzone: 'Asian Range',
    rangePhase: 'Analysis Needed',
    protractionPhase: 'Standby',
    currentTime: new Date()
  });

  const [protractionData, setProtractionData] = useState<ProtractionData>({
    type: 'none',
    phase: 'Waiting',
    nextAction: 'Monitor for setup',
    timeUntilNext: 0,
    isActive: false
  });

  const getCurrentNYTime = useCallback(() => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  }, []);

  const updateSessionData = useCallback(() => {
    const nyTime = getCurrentNYTime();
    const hour = nyTime.getHours();
    const minute = nyTime.getMinutes();
    const currentMinutes = hour * 60 + minute;

    // Define session times in minutes from midnight
    const sessions = {
      'Asian Range': { start: 19 * 60, end: 24 * 60, next: 'London Open' }, // 7 PM - 12 AM
      'London Open': { start: 2 * 60, end: 5 * 60, next: 'NY Open' }, // 2 AM - 5 AM
      'NY Open': { start: 8.5 * 60, end: 11 * 60, next: 'London Close' }, // 8:30 AM - 11 AM
      'London Close': { start: 10 * 60, end: 12 * 60, next: 'Asian Range' } // 10 AM - 12 PM
    };

    let currentSession = 'Market Closed';
    let nextKillzone = 'Asian Range';
    let rangePhase = 'Analysis Needed';
    let protractionPhase = 'Standby';

    // Determine current session
    for (const [name, times] of Object.entries(sessions)) {
      if (currentMinutes >= times.start && currentMinutes < times.end) {
        currentSession = name;
        nextKillzone = times.next;
        break;
      }
    }

    // Determine range formation phase
    if (currentMinutes >= 14 * 60 && currentMinutes < 20 * 60) {
      rangePhase = 'CBDR Forming';
    } else if (currentMinutes >= 19 * 60 || currentMinutes < 2 * 60) {
      rangePhase = 'Asian Range Active';
    } else if (currentMinutes >= 15 * 60 && currentMinutes < 24 * 60) {
      rangePhase = 'Flout Session';
    }

    // Determine protraction phase
    if (currentMinutes >= 23.5 * 60 || currentMinutes < 4 * 60) {
      protractionPhase = 'ACTIVE WATCH';
      updateProtractionData(currentMinutes);
    }

    setSessionData({
      currentSession,
      nextKillzone,
      rangePhase,
      protractionPhase,
      currentTime: nyTime
    });
  }, [getCurrentNYTime]);

  const updateProtractionData = useCallback((currentMinutes: number) => {
    let type: 'normal' | 'delayed' | 'none' = 'none';
    let phase = 'Waiting';
    let nextAction = 'Monitor for setup';
    let timeUntilNext = 0;
    let isActive = false;

    if (currentMinutes >= 23.5 * 60 || currentMinutes < 2 * 60) {
      // Normal protraction window (11:30 PM - 2:00 AM)
      type = 'normal';
      isActive = true;
      
      if (currentMinutes >= 23.5 * 60) {
        // Pre-midnight
        phase = 'Pre-Midnight Setup';
        nextAction = 'Watch for Judas swing at midnight';
        timeUntilNext = (24 * 60) - currentMinutes;
      } else if (currentMinutes < 15) {
        // Post-midnight, early
        phase = 'Judas Swing Window';
        nextAction = 'Confirm swing and prepare for reversal';
        timeUntilNext = 15 - currentMinutes;
      } else if (currentMinutes < 2 * 60) {
        // Pre-London
        phase = 'Pre-London Setup';
        nextAction = 'Prepare for London open entry';
        timeUntilNext = (2 * 60) - currentMinutes;
      }
    } else if (currentMinutes >= 2 * 60 && currentMinutes < 4 * 60) {
      // Delayed protraction window (2:00 AM - 4:00 AM)
      type = 'delayed';
      isActive = true;
      phase = 'London IPDA Window';
      nextAction = 'Watch for delayed protraction';
      timeUntilNext = (4 * 60) - currentMinutes;
    }

    setProtractionData({
      type,
      phase,
      nextAction,
      timeUntilNext,
      isActive
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    // This can be used to update any progress-related state
    // Currently just a placeholder for future enhancements
    console.log(`Analysis progress updated: ${progress}%`);
  }, []);

  // Update session data every minute
  useEffect(() => {
    updateSessionData();
    const interval = setInterval(updateSessionData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [updateSessionData]);

  // Update more frequently during active protraction periods
  useEffect(() => {
    if (protractionData.isActive) {
      const interval = setInterval(updateSessionData, 30000); // Update every 30 seconds when active
      return () => clearInterval(interval);
    }
  }, [protractionData.isActive, updateSessionData]);

  return {
    sessionData,
    protractionData,
    updateProgress,
    getCurrentNYTime
  };
};
