import React, { useEffect } from 'react';
import { messengerApi } from '../utils/api';

interface ActivityTrackerProps {
  enabled?: boolean;
  intervalMs?: number;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({ 
  enabled = true, 
  intervalMs = 30000 
}) => {
  useEffect(() => {
    if (!enabled) return;

    // Update activity every interval
    const interval = setInterval(async () => {
      try {
        await messengerApi.updateActivity();
      } catch (error) {
        console.error('Failed to update activity:', error);
      }
    }, intervalMs);

    // Update activity on user interaction
    const handleUserActivity = () => {
      messengerApi.updateActivity().catch(console.error);
    };

    // Listen for user interactions
    document.addEventListener('mousedown', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);

    // Initial activity update
    handleUserActivity();

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
    };
  }, [enabled, intervalMs]);

  return null; // This component doesn't render anything
};

export default ActivityTracker;