/**
 * GlobalLocationTracker Component
 * Monitors Redux state for active orders and automatically starts/stops location tracking
 * Now supports multiple active orders simultaneously
 */

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import SimpleLocationService from '../services/SimpleLocationService';
import { 
  addActiveOrder, 
  removeActiveOrder, 
  cleanupCompletedOrders,
  selectActiveOrders 
} from '../store/slices/locationTrackingSlice';

const GlobalLocationTracker: React.FC = () => {
  const dispatch = useDispatch();
  const locationService = SimpleLocationService.getInstance();
  const previousRequiredIdsRef = useRef<string[]>([]);

  // Initialize high precision mode for better accuracy
  useEffect(() => {
    locationService.setTrackingPrecision('high');
    console.log('🎯 GlobalLocationTracker: Initialized with high precision tracking for multiple orders');
  }, [locationService]);

  // Get all tasks from Redux store
  const tasks = useSelector((state: RootState) => state.tasks?.tasks || []);
  const activeTrackingOrders = useSelector(selectActiveOrders);

  useEffect(() => {
    // Find all orders that should be tracked
    const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
    
    const ordersRequiringTracking = tasks.filter(task => {
      const hasTrackingStatus = trackingStatuses.includes(task.status);
      const hasLiveTracking = task.live_tracking_enabled === true || task.live_tracking_enabled === 1;
      return hasTrackingStatus && hasLiveTracking;
    });

    const requiredTrackingIds = ordersRequiringTracking.map(o => o.id.toString()).sort();
    const currentTrackingIds = activeTrackingOrders.map(o => o.orderId).sort();
    const previousRequiredIds = previousRequiredIdsRef.current;

    // Only proceed if there are actual changes
    const hasChanges = 
      requiredTrackingIds.length !== previousRequiredIds.length ||
      requiredTrackingIds.some((id, index) => id !== previousRequiredIds[index]) ||
      requiredTrackingIds.length !== currentTrackingIds.length ||
      requiredTrackingIds.some((id, index) => id !== currentTrackingIds[index]);

    if (!hasChanges) {
      return; // No changes, skip processing
    }

    console.log('🌍 GlobalLocationTracker: Detected tracking changes', {
      totalTasks: tasks.length,
      ordersRequiringTracking: ordersRequiringTracking.length,
      currentlyTracked: activeTrackingOrders.length,
      requiredTrackingIds,
      currentTrackingIds,
      previousRequiredIds
    });

    // Update the ref with current required IDs
    previousRequiredIdsRef.current = requiredTrackingIds;

    // Add orders that need tracking but aren't currently tracked
    requiredTrackingIds.forEach(orderId => {
      if (!currentTrackingIds.includes(orderId)) {
        const task = ordersRequiringTracking.find(t => t.id.toString() === orderId);
        if (task) {
          console.log(`🚀 Adding order ${orderId} to location tracking`);
          dispatch(addActiveOrder({
            orderId,
            status: task.status,
            live_tracking_enabled: true
          }));
        }
      }
    });

    // Remove orders that are being tracked but no longer need it
    currentTrackingIds.forEach(orderId => {
      if (!requiredTrackingIds.includes(orderId)) {
        console.log(`🛑 Removing order ${orderId} from location tracking`);
        dispatch(removeActiveOrder(orderId));
      }
    });

  }, [tasks, activeTrackingOrders, dispatch]); // Keep original dependencies but use ref to prevent unnecessary dispatches

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 GlobalLocationTracker unmounting, stopping all tracking');
      locationService.stopTracking();
    };
  }, [locationService]);

  // Log periodic tracking status for multiple orders
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const status = locationService.getTrackingStatus();
      if (status.isTracking && status.activeOrderIds.length > 0) {
        console.log('🌍 Multi-order tracking status:', {
          isTracking: status.isTracking,
          activeOrderCount: status.orderCount,
          activeOrderIds: status.activeOrderIds,
          totalTasksInProgress: tasks.filter(t => ['in_progress', 'picked_up', 'in_transit'].includes(t.status)).length
        });
      }
    }, 30000); // Log every 30 seconds

    return () => clearInterval(statusInterval);
  }, [tasks, locationService]);

  // This component doesn't render anything
  return null;
};

export default GlobalLocationTracker;