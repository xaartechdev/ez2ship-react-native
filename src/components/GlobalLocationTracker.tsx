/**
 * GlobalLocationTracker Component
 * Monitors Redux state for active orders and automatically starts/stops location tracking
 * based on order status and live_tracking_enabled flag
 */

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import SimpleLocationService from '../services/SimpleLocationService';

const GlobalLocationTracker: React.FC = () => {
  const locationService = SimpleLocationService.getInstance();
  const currentTrackingOrderRef = useRef<string | null>(null);

  // Initialize high precision mode for better accuracy
  useEffect(() => {
    locationService.setTrackingPrecision('high');
    console.log('🎯 GlobalLocationTracker: Initialized with high precision tracking');
  }, [locationService]);

  // Get all tasks from Redux store
  const tasks = useSelector((state: RootState) => state.tasks?.tasks || []);

  useEffect(() => {
    // Find the active order that should be tracked
    // Priority: in_progress > picked_up > in_transit
    // Only track if live_tracking_enabled is true/1
    const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
    
    const activeTrackingOrder = tasks.find(task => {
      const hasTrackingStatus = trackingStatuses.includes(task.status);
      const hasLiveTracking = task.live_tracking_enabled === true || task.live_tracking_enabled === 1;
      
      return hasTrackingStatus && hasLiveTracking;
    });

    const shouldTrackOrderId = activeTrackingOrder?.id?.toString();
    const currentlyTracking = currentTrackingOrderRef.current;

    console.log('🌍 GlobalLocationTracker: Checking tracking requirements', {
      tasksCount: tasks.length,
      activeTrackingOrder: activeTrackingOrder ? {
        id: activeTrackingOrder.id,
        order_id: activeTrackingOrder.order_id,
        status: activeTrackingOrder.status,
        live_tracking_enabled: activeTrackingOrder.live_tracking_enabled,
        trackingId: activeTrackingOrder.id // This is what we'll send to API
      } : null,
      shouldTrackOrderId,
      currentlyTracking,
      trackingService: locationService.getTrackingStatus()
    });

    if (shouldTrackOrderId && shouldTrackOrderId !== currentlyTracking) {
      // Start tracking for new order
      console.log(`🚀 Starting location tracking for order ${shouldTrackOrderId}`);
      currentTrackingOrderRef.current = shouldTrackOrderId;
      locationService.startTrackingForOrder(shouldTrackOrderId);
      
    } else if (!shouldTrackOrderId && currentlyTracking) {
      // Stop tracking as no active orders require it
      console.log('🛑 Stopping location tracking - no active orders require tracking');
      currentTrackingOrderRef.current = null;
      locationService.stopTracking();
      
    } else if (shouldTrackOrderId === currentlyTracking) {
      // Continue tracking same order
      console.log(`✅ Continuing location tracking for order ID ${shouldTrackOrderId} (order_id: ${activeTrackingOrder?.order_id})`);
    } else {
      // No tracking required
      console.log('📍 No location tracking required');
    }

  }, [tasks, locationService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentTrackingOrderRef.current) {
        console.log('🧹 GlobalLocationTracker unmounting, stopping tracking');
        locationService.stopTracking();
        currentTrackingOrderRef.current = null;
      }
    };
  }, [locationService]);

  // Log periodic tracking status
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const status = locationService.getTrackingStatus();
      if (status.isTracking) {
        console.log('🌍 Tracking status:', {
          isTracking: status.isTracking,
          orderId: status.orderId,
          activeTasksCount: tasks.filter(t => ['in_progress', 'picked_up', 'in_transit'].includes(t.status)).length
        });
      }
    }, 30000); // Log every 30 seconds

    return () => clearInterval(statusInterval);
  }, [tasks, locationService]);

  // This component doesn't render anything
  return null;
};

export default GlobalLocationTracker;