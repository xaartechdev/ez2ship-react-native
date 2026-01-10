/**
 * GlobalAutoLocationTracker Component
 * Background component that automatically starts location tracking
 * when orders are added to Redux state (from GlobalLocationTracker).
 * 
 * This component should be added to your main App.tsx or root component
 * to ensure location tracking starts immediately when eligible orders
 * are detected, without requiring visits to individual order screens.
 */

import React from 'react';
import { useGlobalAutoLocationTracker } from '../hooks/useGlobalAutoLocationTracker';

const GlobalAutoLocationTracker: React.FC = () => {
  const { 
    isTracking, 
    activeOrderCount, 
    activeOrderIds 
  } = useGlobalAutoLocationTracker();

  // This component runs in the background and doesn't render anything visible
  // It just monitors Redux state and automatically starts/stops location tracking

  return null;
};

export default GlobalAutoLocationTracker;