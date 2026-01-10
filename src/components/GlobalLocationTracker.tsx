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
import { fetchTasksForLocationTracking } from '../store/slices/tasksSlice';
import GlobalAutoLocationTracker from './GlobalAutoLocationTracker';

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
  const isLoading = useSelector((state: RootState) => state.tasks?.isLoading || false);
  
  // Get cached tasks by status for complete tracking state
  const pendingTasks = useSelector((state: RootState) => state.tasks?.pendingTasks || []);
  const inProgressTasks = useSelector((state: RootState) => state.tasks?.inProgressTasks || []);
  const completedTasks = useSelector((state: RootState) => state.tasks?.completedTasks || []);
  
  // Combine all tasks to ensure we don't lose tracking when switching screens
  const allTasks = [...tasks, ...pendingTasks, ...inProgressTasks, ...completedTasks].filter((task, index, array) => 
    // Remove duplicates by id
    array.findIndex(t => t.id === task.id) === index
  );

  // Check if we need to fetch background data for location tracking
  useEffect(() => {
    // Only fetch if we don't have in-progress tasks cached and we're not currently loading
    const hasInProgressTasks = inProgressTasks.length > 0;
    
    if (!hasInProgressTasks && !isLoading) {
      console.log('🔄 No in-progress tasks cached - fetching for location tracking...');
      dispatch(fetchTasksForLocationTracking('in_progress'));
    }
  }, []); // Only run once on mount

  console.log('📋 GlobalLocationTracker: Task sources', {
    currentScreenTasks: tasks.length,
    pendingTasks: pendingTasks.length,
    inProgressTasks: inProgressTasks.length,
    allTasks: allTasks.length,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // Find all orders that should be tracked using ALL available tasks
    const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
    
    const ordersRequiringTracking = allTasks.filter(task => {
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
      totalAllTasks: allTasks.length,
      currentScreenTasks: tasks.length,
      ordersRequiringTracking: ordersRequiringTracking.length,
      currentlyTracked: activeTrackingOrders.length,
      requiredTrackingIds,
      currentTrackingIds,
      previousRequiredIds,
      isScreenSwitch: tasks.length === 0 && allTasks.length > 0
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

    // CRITICAL FIX: Don't remove orders just because they're not in current screen
    // Only remove orders that are actually completed/cancelled, not when switching screens
    const ordersToRemove = currentTrackingIds.filter(orderId => {
      const task = allTasks.find(t => t.id.toString() === orderId);
      if (!task) {
        // Task not found in any task list - keep tracking for now
        console.log(`⚠️ Order ${orderId} not found in any task list - keeping tracking for now`);
        return false;
      }
      
      // Only remove if task status indicates it's truly finished
      const completedStatuses = ['completed', 'delivered', 'cancelled', 'failed'];
      const shouldRemove = completedStatuses.includes(task.status) || !task.live_tracking_enabled;
      
      if (shouldRemove) {
        console.log(`🛑 Removing order ${orderId} from tracking - Status: ${task.status}, Live tracking: ${task.live_tracking_enabled}`);
      }
      
      return shouldRemove;
    });

    // Remove only truly completed orders
    ordersToRemove.forEach(orderId => {
      dispatch(removeActiveOrder(orderId));
    });

  }, [tasks, activeTrackingOrders, pendingTasks, inProgressTasks, dispatch]); // Include cached tasks to trigger when background fetch completes

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

  // This component doesn't render anything visible, but includes the auto-tracker
  return <GlobalAutoLocationTracker />;
};

export default GlobalLocationTracker;