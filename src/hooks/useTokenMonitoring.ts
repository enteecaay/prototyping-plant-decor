import { useEffect, useState } from 'react';
import { useAuthStore, startTokenMonitoring, getTokenTimeRemaining, formatTokenTimeRemaining } from '@/store/auth';

/**
 * Hook to monitor token expiration in real-time
 * Automatically refreshes token before it expires
 */
export const useTokenMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [formattedTime, setFormattedTime] = useState<string>('');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Start token monitoring
    const cleanup = startTokenMonitoring();

    // Update time remaining every second
    const interval = setInterval(() => {
      const remaining = getTokenTimeRemaining();
      const formatted = formatTokenTimeRemaining();
      setTimeRemaining(remaining);
      setFormattedTime(formatted);
    }, 1000);

    return () => {
      if (cleanup) cleanup();
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return {
    timeRemaining,
    formattedTime,
    isExpired: timeRemaining === 0,
  };
};

/**
 * Hook to subscribe to specific token changes
 */
export const useTokenSubscriber = (callback: (token: string | null) => void) => {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    callback(token);
  }, [token, callback]);
};

/**
 * Hook to get token expiration status
 */
export const useTokenStatus = () => {
  const { isTokenExpired, lastTokenRefresh, token } = useAuthStore((state) => ({
    isTokenExpired: state.isTokenExpired,
    lastTokenRefresh: state.lastTokenRefresh,
    token: state.token,
  }));

  const [status, setStatus] = useState<'valid' | 'expiring' | 'expired'>('valid');

  useEffect(() => {
    if (!token) {
      setStatus('expired');
      return;
    }

    const checkStatus = () => {
      const remaining = getTokenTimeRemaining();
      
      if (remaining === 0) {
        setStatus('expired');
      } else if (remaining < 5 * 60 * 1000) { // Less than 5 minutes
        setStatus('expiring');
      } else {
        setStatus('valid');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [token, lastTokenRefresh]);

  return {
    status,
    isExpired: isTokenExpired(),
    timeRemaining: getTokenTimeRemaining(),
    formattedTime: formatTokenTimeRemaining(),
  };
};
