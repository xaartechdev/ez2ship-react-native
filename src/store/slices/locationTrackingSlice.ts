/**
 * Location Tracking Slice
 * Manages active order IDs that are being location tracked
 */
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

export interface ActiveOrder {
  orderId: string;
  status: string;
  live_tracking_enabled: boolean;
  addedAt: string;
}

interface LocationTrackingState {
  activeOrders: ActiveOrder[];
  isGlobalTrackingEnabled: boolean;
  lastLocationUpdate: string | null;
}

const initialState: LocationTrackingState = {
  activeOrders: [],
  isGlobalTrackingEnabled: false,
  lastLocationUpdate: null,
};

const locationTrackingSlice = createSlice({
  name: 'locationTracking',
  initialState,
  reducers: {
    addActiveOrder: (state, action: PayloadAction<{ orderId: string; status: string; live_tracking_enabled: boolean }>) => {
      const { orderId, status, live_tracking_enabled } = action.payload;
      
      // Check if already exists to prevent unnecessary updates
      const existingOrderIndex = state.activeOrders.findIndex(order => order.orderId === orderId);
      
      if (existingOrderIndex >= 0) {
        // Update existing entry if status changed
        const existingOrder = state.activeOrders[existingOrderIndex];
        if (existingOrder.status !== status || existingOrder.live_tracking_enabled !== live_tracking_enabled) {
          state.activeOrders[existingOrderIndex] = {
            ...existingOrder,
            status,
            live_tracking_enabled,
          };
          console.log(`📍 Updated existing order ${orderId} in tracking list. Status: ${status}`);
        }
        // If nothing changed, don't modify state
        return;
      }
      
      // Add new entry
      state.activeOrders.push({
        orderId,
        status,
        live_tracking_enabled,
        addedAt: new Date().toISOString(),
      });
      
      console.log(`📍 Added order ${orderId} to active tracking list. Total active: ${state.activeOrders.length}`);
    },
    
    removeActiveOrder: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      const initialCount = state.activeOrders.length;
      state.activeOrders = state.activeOrders.filter(order => order.orderId !== orderId);
      
      if (state.activeOrders.length < initialCount) {
        console.log(`📍 Removed order ${orderId} from active tracking list. Remaining active: ${state.activeOrders.length}`);
      }
    },
    
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: string }>) => {
      const { orderId, status } = action.payload;
      const order = state.activeOrders.find(o => o.orderId === orderId);
      if (order) {
        order.status = status;
        console.log(`📍 Updated order ${orderId} status to ${status} in tracking list`);
      }
    },
    
    clearActiveOrders: (state) => {
      console.log(`📍 Clearing all active orders from tracking list (${state.activeOrders.length} orders)`);
      state.activeOrders = [];
    },
    
    clearAllActiveOrders: (state) => {
      const clearedCount = state.activeOrders.length;
      console.log(`📍 Force clearing ALL active orders from tracking (${clearedCount} orders) - typically on logout`);
      state.activeOrders = [];
      state.isGlobalTrackingEnabled = false;
      state.lastLocationUpdate = null;
    },
    
    setGlobalTrackingEnabled: (state, action: PayloadAction<boolean>) => {
      state.isGlobalTrackingEnabled = action.payload;
      console.log(`📍 Global tracking enabled: ${action.payload}`);
    },
    
    updateLastLocationUpdate: (state) => {
      state.lastLocationUpdate = new Date().toISOString();
    },
    
    // Clean up completed or delivered orders from active tracking
    cleanupCompletedOrders: (state) => {
      const completedStatuses = ['completed', 'delivered', 'cancelled'];
      const beforeCount = state.activeOrders.length;
      state.activeOrders = state.activeOrders.filter(order => !completedStatuses.includes(order.status));
      const cleanedCount = beforeCount - state.activeOrders.length;
      
      if (cleanedCount > 0) {
        console.log(`📍 Cleaned up ${cleanedCount} completed orders from tracking list. Remaining: ${state.activeOrders.length}`);
      }
    },
  },
});

export const {
  addActiveOrder,
  removeActiveOrder,
  updateOrderStatus,
  clearActiveOrders,
  clearAllActiveOrders,
  setGlobalTrackingEnabled,
  updateLastLocationUpdate,
  cleanupCompletedOrders,
} = locationTrackingSlice.actions;

export default locationTrackingSlice.reducer;

// Properly memoized selectors to prevent unnecessary re-renders
const selectLocationTrackingState = (state: { locationTracking: LocationTrackingState }) => state.locationTracking;

export const selectActiveOrders = createSelector(
  [selectLocationTrackingState],
  (locationTracking) => locationTracking.activeOrders
);

export const selectActiveOrderIds = createSelector(
  [selectActiveOrders],
  (activeOrders) => activeOrders.map(order => order.orderId)
);

export const selectIsGlobalTrackingEnabled = createSelector(
  [selectLocationTrackingState],
  (locationTracking) => locationTracking.isGlobalTrackingEnabled
);

export const selectLastLocationUpdate = createSelector(
  [selectLocationTrackingState],
  (locationTracking) => locationTracking.lastLocationUpdate
);

export const selectActiveOrderCount = createSelector(
  [selectActiveOrders],
  (activeOrders) => activeOrders.length
);