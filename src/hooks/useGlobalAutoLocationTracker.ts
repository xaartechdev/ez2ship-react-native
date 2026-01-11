/**
 * GlobalAutoLocationTracker Hook
 * Monitors Redux state for active orders and automatically starts location tracking
 * without requiring individual order configurations or screen visits.
 * 
 * This hook should be used in a global component (like App.tsx) to ensure
 * tracking starts immediately when orders become eligible.
 */

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import SimpleLocationService from '../services/SimpleLocationService';
import { 
  selectActiveOrders,
  updateLastLocationUpdate,
  cleanupCompletedOrders,
} from '../store/slices/locationTrackingSlice';
import { fetchTasksForLocationTracking } from '../store/slices/tasksSlice';

export const useGlobalAutoLocationTracker = () => {
  const dispatch = useDispatch();
  const locationService = SimpleLocationService.getInstance();
  const trackingIntervalRef = useRef<any>(null);
  const isGlobalTrackingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  
  // Get active orders from Redux state
  const activeOrders = useSelector(selectActiveOrders);
  const activeOrderIds = activeOrders.map(order => order.orderId);
  
  // Get task data to check if we need to fetch
  const inProgressTasks = useSelector((state: RootState) => state.tasks?.inProgressTasks || []);
  const isTasksLoading = useSelector((state: RootState) => state.tasks?.isLoading || false);
  
  // Get auth state to ensure user is logged in before fetching
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated || false);

  // Initialize by fetching in-progress tasks for location tracking
  useEffect(() => {
    // Reset initialization flag when user logs out and stop tracking
    if (!isAuthenticated) {
      hasInitializedRef.current = false;
      if (isGlobalTrackingRef.current) {
        console.log('🚪 GLOBAL AUTO-TRACKER: User logged out - stopping all location tracking');
        stopGlobalTracking();
      }
      return;
    }
    
    if (!hasInitializedRef.current && !isTasksLoading && inProgressTasks.length === 0 && isAuthenticated) {
      console.log('🔄 GLOBAL AUTO-TRACKER: Initializing - fetching in-progress tasks for location tracking');
      hasInitializedRef.current = true;
      dispatch(fetchTasksForLocationTracking('in_progress'));
    } else if (!hasInitializedRef.current && !isTasksLoading && isAuthenticated) {
      // Force fetch even if there are cached tasks (maybe they're stale)
      console.log('🔄 GLOBAL AUTO-TRACKER: Force initializing - ensuring fresh in-progress tasks for location tracking');
      hasInitializedRef.current = true;
      dispatch(fetchTasksForLocationTracking('in_progress'));
    }
  }, [dispatch, inProgressTasks.length, isTasksLoading, isAuthenticated]);

  /**
   * Start global location tracking for all active orders in Redux
   */
  const startGlobalTracking = async () => {
    if (isGlobalTrackingRef.current) {
      console.log('🔄 Global tracking already active - ensuring sync');
      return;
    }

    try {
      isGlobalTrackingRef.current = true;
      console.log(`🚀 GLOBAL AUTO-TRACKER: Starting location tracking for ${activeOrderIds.length} orders`);
      console.log(`🚀 Order IDs: [${activeOrderIds.join(', ')}]`);
      
      // Request permissions first
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        console.error('❌ GLOBAL AUTO-TRACKER: Location permission denied');
        isGlobalTrackingRef.current = false;
        return;
      }

      console.log('✅ GLOBAL AUTO-TRACKER: Location permission granted');
      
      // Add all orders to location service
      for (const orderId of activeOrderIds) {
        console.log(`🔧 GLOBAL AUTO-TRACKER: Adding order ${orderId} to location service`);
        await locationService.startTrackingForOrder(orderId);
      }

      // Send initial location update
      await sendLocationForAllActiveOrders();

      // Set up interval for continuous tracking
      trackingIntervalRef.current = setInterval(async () => {
        const currentActiveOrders = locationService.getActiveOrderIds();
        console.log(`⏰ GLOBAL AUTO-TRACKER: 5-second interval - tracking ${currentActiveOrders.length} orders`);
        await sendLocationForAllActiveOrders();
        
        // Update timestamp in Redux
        dispatch(updateLastLocationUpdate());
        dispatch(cleanupCompletedOrders());
      }, 5000);

      console.log('✅ GLOBAL AUTO-TRACKER: Location tracking started successfully');

    } catch (error) {
      console.error('❌ GLOBAL AUTO-TRACKER: Error starting tracking:', error);
      isGlobalTrackingRef.current = false;
    }
  };

  /**
   * Stop global location tracking
   */
  const stopGlobalTracking = () => {
    if (!isGlobalTrackingRef.current) {
      return;
    }

    console.log('🛑 GLOBAL AUTO-TRACKER: Stopping location tracking');
    
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    
    // Stop location service
    locationService.stopTracking();
    isGlobalTrackingRef.current = false;
    
    console.log('✅ GLOBAL AUTO-TRACKER: Location tracking stopped');
  };

  /**
   * Send location for all active orders using Redux state
   */
  const sendLocationForAllActiveOrders = async () => {
    try {
      if (activeOrderIds.length === 0) {
        console.log('⚠️ GLOBAL AUTO-TRACKER: No active orders to track');
        return;
      }

      console.log(`📍 GLOBAL AUTO-TRACKER: Getting location for ${activeOrderIds.length} orders`);
      const location = await locationService.getCurrentLocation();
      
      if (location) {
        console.log(`📍 GLOBAL AUTO-TRACKER: Got location - ${location.latitude}, ${location.longitude}`);
        console.log(`📤 GLOBAL AUTO-TRACKER: Sending to API for orders: ${activeOrderIds.join(',')}`);
        
        // Send location with explicit order IDs from Redux
        const success = await locationService.sendLocationToAPI(
          location.latitude,
          location.longitude,
          activeOrderIds.join(',') // Pass all active order IDs directly
        );
        
        if (success) {
          console.log(`✅ GLOBAL AUTO-TRACKER: Location sent successfully for ${activeOrderIds.length} orders`);
        } else {
          console.error(`❌ GLOBAL AUTO-TRACKER: Failed to send location for ${activeOrderIds.length} orders`);
        }
      } else {
        console.warn('⚠️ GLOBAL AUTO-TRACKER: Could not get current location');
      }
    } catch (error) {
      console.error('❌ GLOBAL AUTO-TRACKER: Error sending location:', error);
    }
  };

  /**
   * Monitor Redux state changes and start/stop tracking accordingly
   */
  useEffect(() => {
    console.log(`🔍 GLOBAL AUTO-TRACKER: State change detected - ${activeOrderIds.length} active orders`);
    console.log(`🔍 Orders: [${activeOrderIds.join(', ')}]`);
    console.log(`🔍 Currently tracking: ${isGlobalTrackingRef.current}`);

    if (activeOrderIds.length > 0 && !isGlobalTrackingRef.current) {
      console.log('🚀 GLOBAL AUTO-TRACKER: Starting tracking - orders detected');
      startGlobalTracking();
    } else if (activeOrderIds.length === 0 && isGlobalTrackingRef.current) {
      console.log('🛑 GLOBAL AUTO-TRACKER: Stopping tracking - no orders');
      stopGlobalTracking();
    } else if (activeOrderIds.length > 0 && isGlobalTrackingRef.current) {
      console.log('🔄 GLOBAL AUTO-TRACKER: Syncing service with Redux state');
      // Ensure service has all active orders
      activeOrderIds.forEach(async (orderId) => {
        if (!locationService.isOrderBeingTracked(orderId)) {
          console.log(`🔧 GLOBAL AUTO-TRACKER: Adding missing order ${orderId} to service`);
          await locationService.startTrackingForOrder(orderId);
        }
      });
    }
  }, [activeOrderIds.length, activeOrderIds.join(',')]); // Monitor both count and order IDs

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  return {
    isTracking: isGlobalTrackingRef.current,
    activeOrderCount: activeOrderIds.length,
    activeOrderIds,
    startGlobalTracking,
    stopGlobalTracking
  };
};