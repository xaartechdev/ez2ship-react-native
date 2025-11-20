/**
 * useAutoLocationTracking Hook
 * Automatically starts/stops location tracking based on order status and live_tracking_enabled flag
 * Sends location to API every 5 seconds when tracking is active
 */

import { useEffect, useRef } from 'react';
import SimpleLocationService from '../services/SimpleLocationService';

interface TrackingConfig {
  orderId: string;
  status: string;
  live_tracking_enabled?: number | boolean;
}

export const useAutoLocationTracking = (config: TrackingConfig) => {
  const locationService = SimpleLocationService.getInstance();
  const trackingIntervalRef = useRef<any>(null);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    // Check if we should start/stop tracking
    // Track when status is in_progress, picked_up, or in_transit and live_tracking_enabled = 1
    const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
    const liveTrackingValue = config.live_tracking_enabled === 1 || config.live_tracking_enabled === true;
    const shouldTrack = 
      trackingStatuses.includes(config.status) && 
      liveTrackingValue;

    console.log(`📍 Auto-tracking check:
      - orderId: ${config.orderId}
      - status: ${config.status}
      - live_tracking_enabled: ${config.live_tracking_enabled} (type: ${typeof config.live_tracking_enabled})
      - trackingStatuses includes status: ${trackingStatuses.includes(config.status)}
      - liveTrackingValue: ${liveTrackingValue}
      - shouldTrack: ${shouldTrack}
      - isCurrentlyTracking: ${isTrackingRef.current}`);

    if (shouldTrack && !isTrackingRef.current) {
      // Start tracking
      console.log(`🚀 Auto-tracking enabled for order ${config.orderId}`);
      startAutoTracking();
    } else if (!shouldTrack && isTrackingRef.current) {
      // Stop tracking
      console.log(`🛑 Auto-tracking disabled for order ${config.orderId}`);
      stopAutoTracking();
    }

    return () => {
      // Cleanup on unmount
      if (isTrackingRef.current) {
        stopAutoTracking();
      }
    };
  }, [config.status, config.live_tracking_enabled, config.orderId]);

  const startAutoTracking = async () => {
    try {
      isTrackingRef.current = true;
      console.log('✅ Starting auto location tracking...');
      
      // Request permissions first
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        console.error('❌ Location permission denied');
        isTrackingRef.current = false;
        return;
      }

      console.log('✅ Location permission granted');
      console.log('✅ Location tracking started for automatic location updates');

      // Initial location update
      await sendLocationToAPI();

      // Send location every 5 seconds
      trackingIntervalRef.current = setInterval(async () => {
        console.log('⏰ 5-second interval triggered, sending location...');
        await sendLocationToAPI();
      }, 5000); // 5 seconds
    } catch (error) {
      console.error('❌ Error starting auto-tracking:', error);
      isTrackingRef.current = false;
    }
  };

  const stopAutoTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    isTrackingRef.current = false;
    console.log('✅ Location tracking stopped');
  };

  const sendLocationToAPI = async () => {
    try {
      console.log(`📍 Fetching current location for order ID: ${config.orderId}`);
      const location = await locationService.getCurrentLocation();
      if (location) {
        console.log(`📍 Got location: ${location.latitude}, ${location.longitude}`);
        console.log(`📤 Sending location to API for order ID: ${config.orderId}`);
        
        const success = await locationService.sendLocationToAPI(
          location.latitude,
          location.longitude,
          config.orderId
        );
        
        if (!success) {
          console.warn(`⚠️ Failed to send location to API for order ${config.orderId}`);
        } else {
          console.log(`✅ Location successfully sent to API for order ${config.orderId}`);
        }
      } else {
        console.warn(`⚠️ Could not get current location for order ${config.orderId}`);
      }
    } catch (error) {
      console.error(`❌ Error sending location for order ${config.orderId}:`, error);
    }
  };

  return {
    isTracking: isTrackingRef.current,
  };
};
