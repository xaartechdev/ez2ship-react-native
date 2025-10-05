/**
 * Location Tracking Hook
 * Automatically manages location tracking based on order status
 */

import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { RootState } from '../store';
import { locationTrackingService } from '../services/locationTrackingService';

export const useLocationTracking = () => {
  const { tasks } = useSelector((state: RootState) => state.tasks);

  /**
   * Check if any task has in_transit status
   */
  const getInTransitTasks = useCallback(() => {
    return tasks.filter(task => 
      task.status === 'in_transit' || 
      task.status === 'picked_up'
    );
  }, [tasks]);

  /**
   * Start tracking for in-transit orders
   */
  const startTrackingIfNeeded = useCallback(async () => {
    const inTransitTasks = getInTransitTasks();
    const trackingStatus = locationTrackingService.getTrackingStatus();

    if (inTransitTasks.length > 0 && !trackingStatus.isTracking) {
      // Start tracking with the first in-transit order
      const firstTask = inTransitTasks[0];
      console.log(`🚀 Auto-starting location tracking for order: ${firstTask.order_id}`);
      
      const started = await locationTrackingService.startTracking(firstTask.order_id);
      
      if (started) {
        Alert.alert(
          'Location Tracking Started',
          `Now tracking your delivery route for order ${firstTask.order_id}`,
          [{ text: 'OK' }]
        );
      }
    } else if (inTransitTasks.length === 0 && trackingStatus.isTracking) {
      // Stop tracking if no in-transit orders
      console.log('🛑 Auto-stopping location tracking - no in-transit orders');
      locationTrackingService.stopTracking();
      
      Alert.alert(
        'Location Tracking Stopped',
        'Delivery tracking has been stopped as there are no active deliveries.',
        [{ text: 'OK' }]
      );
    } else if (inTransitTasks.length > 0 && trackingStatus.isTracking) {
      // Check if we need to switch to a different order
      const currentlyTrackedOrder = trackingStatus.orderId;
      const isCurrentOrderStillInTransit = inTransitTasks.some(task => task.order_id === currentlyTrackedOrder);
      
      if (!isCurrentOrderStillInTransit && inTransitTasks.length > 0) {
        console.log(`🔄 Switching tracking to new order: ${inTransitTasks[0].order_id}`);
        locationTrackingService.stopTracking();
        await locationTrackingService.startTracking(inTransitTasks[0].order_id);
      }
    }
  }, [getInTransitTasks]);

  /**
   * Handle manual start tracking
   */
  const startTracking = useCallback(async (orderId: string): Promise<boolean> => {
    console.log(`🚀 Manually starting location tracking for order: ${orderId}`);
    
    const started = await locationTrackingService.startTracking(orderId);
    
    if (started) {
      Alert.alert(
        'Location Tracking Started',
        `Now tracking your delivery route for order ${orderId}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Failed to Start Tracking',
        'Could not start location tracking. Please check your location permissions.',
        [{ text: 'OK' }]
      );
    }
    
    return started;
  }, []);

  /**
   * Handle manual stop tracking
   */
  const stopTracking = useCallback(() => {
    console.log('🛑 Manually stopping location tracking');
    locationTrackingService.stopTracking();
    
    Alert.alert(
      'Location Tracking Stopped',
      'Delivery tracking has been stopped.',
      [{ text: 'OK' }]
    );
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
    inTransitTasks: getInTransitTasks(),
  };
};

export default useLocationTracking;