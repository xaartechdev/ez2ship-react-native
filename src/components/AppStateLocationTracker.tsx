/**
 * AppStateLocationTracker Component
 * Background component that handles automatic location tracking
 * based on app state changes and login status.
 * 
 * Add this component to your main App.tsx or root navigation component.
 */

import React from 'react';
import { useAppStateLocationTracking } from '../hooks/useAppStateLocationTracking';

const AppStateLocationTracker: React.FC = () => {
  // This hook handles all the automatic tracking logic
  const { 
    checkAndStartTrackingForEligibleOrders,
    isLoggedIn,
    currentActiveOrdersCount 
  } = useAppStateLocationTracking();

  // This component doesn't render anything visible
  // It just runs the tracking logic in the background
  return null;
};

export default AppStateLocationTracker;