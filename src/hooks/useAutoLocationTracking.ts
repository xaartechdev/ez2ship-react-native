/**
 * useAutoLocationTracking Hook
 * Automatically starts/stops location tracking based on order status and live_tracking_enabled flag
 * Now supports multiple active orders through global state management
 * Sends location to API every 5 seconds when tracking is active
 */

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SimpleLocationService from '../services/SimpleLocationService';
import { 
  addActiveOrder, 
  removeActiveOrder, 
  updateOrderStatus, 
  selectActiveOrderIds,
  selectActiveOrders,
  cleanupCompletedOrders,
  updateLastLocationUpdate 
} from '../store/slices/locationTrackingSlice';

interface TrackingConfig {
  orderId: string;
  status: string;
  live_tracking_enabled?: number | boolean;
}

export const useAutoLocationTracking = (config: TrackingConfig) => {
  const dispatch = useDispatch();
  const locationService = SimpleLocationService.getInstance();
  const trackingIntervalRef = useRef<any>(null);
  const isGlobalTrackingRef = useRef(false);
  
  // Get active orders from global state
  const activeOrderIds = useSelector(selectActiveOrderIds);
  const activeOrders = useSelector(selectActiveOrders);

  useEffect(() => {
    // Check if we should start/stop tracking for this specific order
    const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
    const liveTrackingValue = config.live_tracking_enabled === 1 || config.live_tracking_enabled === true;
    const shouldTrack = trackingStatuses.includes(config.status) && liveTrackingValue;
    const isCurrentlyInActiveList = activeOrderIds.includes(config.orderId);

    console.log(`📍 Auto-tracking check for order ${config.orderId}:
      - status: ${config.status}
      - live_tracking_enabled: ${config.live_tracking_enabled}
      - shouldTrack: ${shouldTrack}
      - isCurrentlyInActiveList: ${isCurrentlyInActiveList}
      - totalActiveOrders: ${activeOrderIds.length}`);

    if (shouldTrack && !isCurrentlyInActiveList) {
      // Add this order to active tracking
      console.log(`🚀 Adding order ${config.orderId} to active tracking list`);
      dispatch(addActiveOrder({
        orderId: config.orderId,
        status: config.status,
        live_tracking_enabled: liveTrackingValue
      }));
      
      // Start location service for this order
      locationService.startTrackingForOrder(config.orderId);
    } else if (!shouldTrack && isCurrentlyInActiveList) {
      // Remove this order from active tracking
      console.log(`🛑 Removing order ${config.orderId} from active tracking list`);
      dispatch(removeActiveOrder(config.orderId));
      
      // Stop location service for this order
      locationService.stopTrackingForOrder(config.orderId);
    } else if (shouldTrack && isCurrentlyInActiveList) {
      // Update status if order is still being tracked
      dispatch(updateOrderStatus({ orderId: config.orderId, status: config.status }));
    }

    return () => {
      // Don't cleanup on unmount - let the global state manage lifecycle
    };
  }, [config.status, config.live_tracking_enabled, config.orderId, activeOrderIds]);

  // Effect to manage global location tracking based on active orders
  useEffect(() => {
    if (activeOrderIds.length > 0 && !isGlobalTrackingRef.current) {
      console.log(`🌍 Starting global location tracking for ${activeOrderIds.length} orders: [${activeOrderIds.join(', ')}]`);
      startGlobalTracking();
    } else if (activeOrderIds.length === 0 && isGlobalTrackingRef.current) {
      console.log(`🌍 Stopping global location tracking - no active orders`);
      stopGlobalTracking();
    }
  }, [activeOrderIds.length]);

  const startGlobalTracking = async () => {
    try {
      isGlobalTrackingRef.current = true;
      console.log('✅ Starting global location tracking...');
      
      // Request permissions first
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        console.error('❌ Location permission denied');
        isGlobalTrackingRef.current = false;
        return;
      }

      console.log('✅ Location permission granted for global tracking');

      // Initial location update for all active orders
      await sendLocationToAPIForActiveOrders();

      // Send location every 5 seconds for all active orders
      trackingIntervalRef.current = setInterval(async () => {
        console.log(`⏰ Global 5-second interval - sending location for ${activeOrderIds.length} active orders`);
        await sendLocationToAPIForActiveOrders();
        
        // Update last location timestamp in store
        dispatch(updateLastLocationUpdate());
        
        // Clean up any completed orders
        dispatch(cleanupCompletedOrders());
      }, 5000); // 5 seconds
    } catch (error) {
      console.error('❌ Error starting global tracking:', error);
      isGlobalTrackingRef.current = false;
    }
  };

  const stopGlobalTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    isGlobalTrackingRef.current = false;
    console.log('✅ Global location tracking stopped');
  };

  const sendLocationToAPIForActiveOrders = async () => {
    try {
      if (activeOrderIds.length === 0) {
        console.log('⚠️ No active orders for location tracking');
        return;
      }

      console.log(`📍 Fetching location for ${activeOrderIds.length} active orders: [${activeOrderIds.join(', ')}]`);
      const location = await locationService.getCurrentLocation();
      
      if (location) {
        console.log(`📍 Got location: ${location.latitude}, ${location.longitude}`);
        console.log(`📤 Sending location to API for orders: ${activeOrderIds.join(', ')}`);
        
        // Send location with all active order IDs (will be comma-separated in the service)
        const success = await locationService.sendLocationToAPI(
          location.latitude,
          location.longitude
          // No specific orderId - will use all active orders from service
        );
        
        if (!success) {
          console.warn(`⚠️ Failed to send location to API for active orders: [${activeOrderIds.join(', ')}]`);
        } else {
          console.log(`✅ Location successfully sent to API for ${activeOrderIds.length} active orders`);
        }
      } else {
        console.warn(`⚠️ Could not get current location for active orders: [${activeOrderIds.join(', ')}]`);
      }
    } catch (error) {
      console.error(`❌ Error sending location for active orders:`, error);
    }
  };

  return {
    isTracking: isGlobalTrackingRef.current,
    activeOrderIds,
    activeOrderCount: activeOrderIds.length,
  };
};
