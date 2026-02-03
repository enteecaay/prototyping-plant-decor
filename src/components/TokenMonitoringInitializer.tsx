'use client';

import { useEffect } from 'react';
import { startTokenMonitoring, stopTokenMonitoring } from '@/store/auth';

/**
 * Initialize token monitoring when app starts
 * This component should be placed in the root layout
 */
export default function TokenMonitoringInitializer() {
  useEffect(() => {
    // Start monitoring when component mounts
    const cleanup = startTokenMonitoring();

    // Cleanup on unmount
    return (): void => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      stopTokenMonitoring();
    };
  }, []);

  return null; // This component doesn't render anything
}
