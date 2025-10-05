/**
 * Location Tracking Hook
 * Automatically manages location tracking based on order status
 */

import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { locationTrackingService } from '../services/locationTrackingService';

export const useLocationTracking = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);

  /**
   * Check if any task requires location tracking
   */
  const getTrackingRequiredTasks = useCallback(() => {
    return tasks.filter(task => 
      task.status === 'in_transit' || 
      task.status === 'arrived_at_destination'
    );
  }, [tasks]);

  /**
   * Start tracking for orders that require location tracking
   */
  const startTrackingIfNeeded = useCallback(async () => {
    const trackingRequiredTasks = getTrackingRequiredTasks();
    const trackingStatus = locationTrackingService.getTrackingStatus();

    if (trackingRequiredTasks.length > 0 && !trackingStatus.isTracking) {
      // Start tracking with the first order that requires tracking
      const firstTask = trackingRequiredTasks[0];
      console.log(`🚀 Auto-starting location tracking for order: ${firstTask.order_id}`);
      
      const started = await locationTrackingService.startTracking(firstTask.order_id);
      
      if (started) {
        console.log(`✅ Location tracking started successfully for order: ${firstTask.order_id}`);
      }
    } else if (trackingRequiredTasks.length === 0 && trackingStatus.isTracking) {
      // Stop tracking if no orders require location tracking
      console.log('🛑 Auto-stopping location tracking - no orders requiring tracking');
      locationTrackingService.stopTracking();
      
      console.log('✅ Location tracking stopped - no orders requiring tracking');
    } else if (trackingRequiredTasks.length > 0 && trackingStatus.isTracking) {
      // Check if we need to switch to a different order
      const currentlyTrackedOrder = trackingStatus.orderId;
      const isCurrentOrderStillRequiringTracking = trackingRequiredTasks.some(task => task.order_id === currentlyTrackedOrder);
      
      if (!isCurrentOrderStillRequiringTracking && trackingRequiredTasks.length > 0) {
        console.log(`🔄 Switching tracking to new order: ${trackingRequiredTasks[0].order_id}`);
        locationTrackingService.stopTracking();
        await locationTrackingService.startTracking(trackingRequiredTasks[0].order_id);
      }
    }
  }, [getTrackingRequiredTasks]);

  /**
   * Handle manual start tracking
   */
  const startTracking = useCallback(async (orderId: string): Promise<boolean> => {
    console.log(`🚀 Manually starting location tracking for order: ${orderId}`);
    
    const started = await locationTrackingService.startTracking(orderId);
    
    if (started) {
      console.log(`✅ Manual location tracking started for order: ${orderId}`);
    } else {
      console.log('❌ Failed to start location tracking - check permissions');
    }
    
    return started;
  }, []);

  /**
   * Handle manual stop tracking
   */
  const stopTracking = useCallback(() => {
    console.log('🛑 Manually stopping location tracking');
    locationTrackingService.stopTracking();
    
    console.log('✅ Location tracking stopped successfully');
  }, []);

  /**
   * Get current tracking status
   */
  const getTrackingStatus = useCallback(() => {
    return locationTrackingService.getTrackingStatus();
  }, []);

  /**
   * Force immediate location update
   */
  const forceLocationUpdate = useCallback(async () => {
    await locationTrackingService.forceLocationUpdate();
  }, []);

  /**
   * Check location permissions
   */
  const checkLocationPermissions = useCallback(async (): Promise<boolean> => {
    return await locationTrackingService.hasLocationPermissions();
  }, []);

  /**
   * Request location permissions
   */
  const requestLocationPermissions = useCallback(async (): Promise<boolean> => {
    return await locationTrackingService.requestLocationPermissions();
  }, []);

  // Auto-start/stop tracking based on task status changes
  useEffect(() => {
    startTrackingIfNeeded();
  }, [startTrackingIfNeeded, tasks]);

  return {
    startTracking,
    stopTracking,
    getTrackingStatus,
    forceLocationUpdate,
    checkLocationPermissions,
    requestLocationPermissions,
    trackingRequiredTasks: getTrackingRequiredTasks(),
  };
};

export default useLocationTracking;