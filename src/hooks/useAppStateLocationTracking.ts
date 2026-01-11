/**
 * useAppStateLocationTracking Hook
 * Automatically checks and starts location tracking when:
 * 1. App comes to foreground from background
 * 2. User logs in
 * 3. App starts fresh
 * 
 * This ensures tracking is always active for eligible orders without requiring
 * users to visit order detail screens manually.
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import SimpleLocationService from '../services/SimpleLocationService';
import { 
  addActiveOrder, 
  selectActiveOrderIds,
  clearAllActiveOrders 
} from '../store/slices/locationTrackingSlice';

interface TrackableOrder {
  id: string;
  status: 'in_progress' | 'picked_up' | 'in_transit';
  live_tracking_enabled: boolean | number;
}

export const useAppStateLocationTracking = () => {
  const dispatch = useDispatch();
  const locationService = SimpleLocationService.getInstance();
  const appState = useRef(AppState.currentState);
  const hasCheckedOnStartup = useRef(false);
  const isLoggedIn = useSelector((state: any) => state.auth?.isAuthenticated || false);
  const currentActiveOrders = useSelector(selectActiveOrderIds);

  /**
   * Check all orders in the app and start tracking for eligible ones
   */
  const checkAndStartTrackingForEligibleOrders = async (source: string = 'unknown') => {
    try {
      console.log(`🔄 AUTO-TRACKING CHECK (${source}):`, {
        timestamp: new Date().toISOString(),
        isLoggedIn,
        currentActiveOrders: currentActiveOrders.length,
        source
      });

      if (!isLoggedIn) {
        console.log('⚠️ User not logged in, skipping auto-tracking check');
        return;
      }

      // Get all orders from your data source (adjust this based on your app structure)
      const trackableOrders = await getTrackableOrders();
      
      console.log(`📊 Found ${trackableOrders.length} potentially trackable orders:`, 
        trackableOrders.map(o => `${o.id}(${o.status})`));

      if (trackableOrders.length === 0) {
        console.log('📍 No trackable orders found, stopping any existing tracking');
        
        // Stop any existing tracking if no orders are trackable
        if (currentActiveOrders.length > 0) {
          dispatch(clearAllActiveOrders());
          locationService.stopTracking();
        }
        
        return;
      }

      // Check which orders need to be added to tracking
      let ordersToAdd = [];
      let ordersAlreadyTracking = [];

      for (const order of trackableOrders) {
        if (currentActiveOrders.includes(order.id)) {
          ordersAlreadyTracking.push(order.id);
        } else {
          ordersToAdd.push(order);
        }
      }

      console.log(`📋 Tracking analysis:`, {
        ordersToAdd: ordersToAdd.length,
        ordersAlreadyTracking: ordersAlreadyTracking.length,
        newOrders: ordersToAdd.map(o => o.id),
        existingOrders: ordersAlreadyTracking
      });

      // Add new orders to tracking
      for (const order of ordersToAdd) {
        console.log(`🚀 Auto-adding order ${order.id} to tracking (status: ${order.status})`);
        
        // Add to Redux store
        dispatch(addActiveOrder({
          orderId: order.id,
          status: order.status,
          live_tracking_enabled: order.live_tracking_enabled
        }));

        // Add to location service
        await locationService.startTrackingForOrder(order.id);
      }

      // Remove orders that are no longer trackable
      const ordersToRemove = currentActiveOrders.filter(activeId => 
        !trackableOrders.some(trackable => trackable.id === activeId)
      );

      for (const orderIdToRemove of ordersToRemove) {
        console.log(`🛑 Auto-removing order ${orderIdToRemove} from tracking (no longer eligible)`);
        locationService.stopTrackingForOrder(orderIdToRemove);
      }

      const totalTrackingOrders = trackableOrders.length;
      console.log(`✅ AUTO-TRACKING SETUP COMPLETE:`, {
        totalTrackingOrders,
        addedOrders: ordersToAdd.length,
        removedOrders: ordersToRemove.length,
        source,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error in auto-tracking check:', error);
    }
  };

  /**
   * Get all orders that are eligible for location tracking
   * Adjust this function based on your app's data structure
   */
  const getTrackableOrders = async (): Promise<TrackableOrder[]> => {
    try {
      // TODO: Replace this with your actual data fetching logic
      // This could be from Redux store, AsyncStorage, API call, etc.
      
      // Example implementation - adjust based on your app structure:
      // Option 1: From Redux store
      // const allOrders = useSelector(state => state.orders.allOrders);
      
      // Option 2: From API
      // const response = await apiService.get('/driver/orders');
      // const allOrders = response.data;
      
      // Option 3: From AsyncStorage
      // const ordersJson = await AsyncStorage.getItem('user_orders');
      // const allOrders = ordersJson ? JSON.parse(ordersJson) : [];

      // For now, returning empty array - you need to implement this
      console.log('⚠️ getTrackableOrders needs to be implemented with your data source');
      
      // Here's how it should work once implemented:
      /*
      const trackableOrders = allOrders.filter(order => {
        const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
        const hasValidStatus = trackingStatuses.includes(order.status);
        const hasTrackingEnabled = order.live_tracking_enabled === 1 || order.live_tracking_enabled === true;
        
        return hasValidStatus && hasTrackingEnabled;
      }).map(order => ({
        id: order.id.toString(),
        status: order.status,
        live_tracking_enabled: order.live_tracking_enabled
      }));

      return trackableOrders;
      */

      return []; // Temporary - replace with actual implementation
      
    } catch (error) {
      console.error('❌ Error fetching trackable orders:', error);
      return [];
    }
  };

  /**
   * Handle app state changes (foreground/background)
   */
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log(`📱 App state change: ${appState.current} → ${nextAppState}`);
    
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('🌟 App came to foreground - checking tracking status');
      checkAndStartTrackingForEligibleOrders('foreground');
    }
    
    appState.current = nextAppState;
  };

  /**
   * Check tracking on startup (once)
   */
  const checkTrackingOnStartup = () => {
    if (!hasCheckedOnStartup.current && isLoggedIn) {
      console.log('🚀 Initial app startup - checking tracking status');
      hasCheckedOnStartup.current = true;
      checkAndStartTrackingForEligibleOrders('startup');
    }
  };

  // Set up app state listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, []);

  // Check tracking when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      console.log('🔑 User logged in - checking tracking status');
      checkAndStartTrackingForEligibleOrders('login');
      checkTrackingOnStartup();
    } else {
      // User logged out - clear tracking
      console.log('🚪 User logged out - clearing all tracking');
      dispatch(clearAllActiveOrders());
      locationService.stopTracking();
      hasCheckedOnStartup.current = false;
    }
  }, [isLoggedIn]);

  // Expose manual check function for external use
  return {
    checkAndStartTrackingForEligibleOrders,
    isLoggedIn,
    currentActiveOrdersCount: currentActiveOrders.length
  };
};