/**
 * useAutoLocationTracking Hook
 * Automatically starts/stops location tracking based on order status and live_tracking_enabled flag
 * Now supports multiple active orders through global state management
 * Sends location to API every 5 seconds when tracking is active
 */

import { useEffect, useRef, useMemo } from 'react';
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
  
  // Get active orders from global state with memoization to prevent unnecessary re-renders
  const activeOrderIds = useSelector(selectActiveOrderIds);
  const activeOrders = useSelector(selectActiveOrders);
  
  // Stable reference for activeOrderIds to prevent infinite re-renders
  const stableActiveOrderIds = useMemo(() => activeOrderIds, [JSON.stringify(activeOrderIds.sort())]);

  // Separate ref to track the last processed config to prevent unnecessary updates
  const lastConfigRef = useRef<string>('');
  const currentConfigStr = `${config.orderId}-${config.status}-${config.live_tracking_enabled}`;

  useEffect(() => {
    // Prevent processing the same config multiple times
    if (lastConfigRef.current === currentConfigStr) {
      return;
    }
    lastConfigRef.current = currentConfigStr;

    // Check if we should start/stop tracking for this specific order
    const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
    const liveTrackingValue = config.live_tracking_enabled === 1 || config.live_tracking_enabled === true;
    const shouldTrack = trackingStatuses.includes(config.status) && liveTrackingValue;
    const isCurrentlyInActiveList = activeOrderIds.includes(config.orderId); // Use activeOrderIds directly

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
  }, [config.status, config.live_tracking_enabled, config.orderId]); // Remove stableActiveOrderIds dependency

  // Effect to manage global location tracking based on active orders
  useEffect(() => {    
    // Use a stable value and prevent rapid changes
    const currentActiveCount = stableActiveOrderIds.length;
    
    if (currentActiveCount > 0 && !isGlobalTrackingRef.current) {
      console.log(`🌍 Starting global location tracking for ${currentActiveCount} orders: [${stableActiveOrderIds.join(', ')}]`);
      startGlobalTracking();
    } else if (currentActiveCount === 0 && isGlobalTrackingRef.current) {
      console.log(`🌍 Stopping global location tracking - no active orders`);
      stopGlobalTracking();
    } else if (currentActiveCount > 0 && isGlobalTrackingRef.current) {
      // Ensure service has all active orders
      stableActiveOrderIds.forEach(async (orderId) => {
        if (!locationService.isOrderBeingTracked(orderId)) {
          console.log(`🔧 Adding missing order ${orderId} to location service`);
          await locationService.startTrackingForOrder(orderId);
        }
      });
    }
  }, [stableActiveOrderIds.length]); // Only depend on length, not full array

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

      // CRITICAL: Ensure location service has all active orders before starting
      
      for (const orderId of stableActiveOrderIds) {
        if (!locationService.isOrderBeingTracked(orderId)) {
          console.log(`🔧 Adding missing order ${orderId} to location service`);
          await locationService.startTrackingForOrder(orderId);
        }
      }
      console.log('✅ Location service sync complete');

      // Initial location update for all active orders
      await sendLocationToAPIForActiveOrders();

      // Send location every 5 seconds for all active orders
      trackingIntervalRef.current = setInterval(async () => {
        console.log(`⏰ Global 5-second interval - sending location for ${stableActiveOrderIds.length} active orders`);
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
      if (stableActiveOrderIds.length === 0) {
        console.log('⚠️ No active orders for location tracking');
        return;
      }

      
      const location = await locationService.getCurrentLocation();
      
      if (location) {
       
        
        // CRITICAL FIX: Ensure SimpleLocationService has the same active orders as Redux
        const serviceActiveOrders = locationService.getActiveOrderIds();
       
        
        // Sync orders if they don't match
        if (serviceActiveOrders.length !== activeOrderIds.length || !activeOrderIds.every(id => serviceActiveOrders.includes(id))) {
         
          // Add missing orders to service
          for (const orderId of activeOrderIds) {
            if (!serviceActiveOrders.includes(orderId)) {
              console.log('🔄 Adding missing order to service:', orderId);
              await locationService.startTrackingForOrder(orderId);
            }
          }
          
        }
        
        let success = false;
        try {
          
          // Send location with explicit order IDs from Redux (bypass service internal tracking)
          success = await locationService.sendLocationToAPI(
            location.latitude,
            location.longitude,
            activeOrderIds.join(',') // Pass order IDs directly as comma-separated string
          );
          
        } catch (apiError) {
         
          success = false;
        }
        
      } else {
        console.warn(`⚠️ Could not get current location for active orders: [${stableActiveOrderIds.join(', ')}]`);
      }
    } catch (error) {
      console.error(`❌ Error sending location for active orders:`, error);
    }
  };

  return {
    isTracking: isGlobalTrackingRef.current,
    activeOrderIds: stableActiveOrderIds,
    activeOrderCount: stableActiveOrderIds.length,
  };
};
