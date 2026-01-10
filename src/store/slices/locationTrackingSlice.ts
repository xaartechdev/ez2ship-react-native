/**
 * Location Tracking Slice
 * Manages active order IDs that are being location tracked
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
      
      // Remove existing entry if it exists
      state.activeOrders = state.activeOrders.filter(order => order.orderId !== orderId);
      
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
  setGlobalTrackingEnabled,
  updateLastLocationUpdate,
  cleanupCompletedOrders,
} = locationTrackingSlice.actions;

export default locationTrackingSlice.reducer;

// Selectors
export const selectActiveOrders = (state: { locationTracking: LocationTrackingState }) => state.locationTracking.activeOrders;
export const selectActiveOrderIds = (state: { locationTracking: LocationTrackingState }) => 
  state.locationTracking.activeOrders.map(order => order.orderId);
export const selectIsGlobalTrackingEnabled = (state: { locationTracking: LocationTrackingState }) => 
  state.locationTracking.isGlobalTrackingEnabled;
export const selectLastLocationUpdate = (state: { locationTracking: LocationTrackingState }) => 
  state.locationTracking.lastLocationUpdate;
export const selectActiveOrderCount = (state: { locationTracking: LocationTrackingState }) => 
  state.locationTracking.activeOrders.length;