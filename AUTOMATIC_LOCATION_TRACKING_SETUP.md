# Automatic Location Tracking Setup

## Overview
This system automatically checks and starts location tracking when:
1. **App starts** (if user is logged in)
2. **User logs in**
3. **App comes to foreground** from background
4. **Orders change status** to trackable statuses

## Implementation Steps

### 1. Add the Background Component to Your App

Add `AppStateLocationTracker` to your main app component:

```tsx
// App.tsx or your root navigation component
import React from 'react';
import AppStateLocationTracker from './src/components/AppStateLocationTracker';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  return (
    <NavigationContainer>
      {/* Your existing navigation/routes */}
      
      {/* Add this component - it runs in background */}
      <AppStateLocationTracker />
    </NavigationContainer>
  );
};
```

### 2. Implement Data Fetching Logic

In `useAppStateLocationTracking.ts`, update the `getTrackableOrders` function with your actual data source:

**Option A: From Redux Store**
```typescript
const getTrackableOrders = async (): Promise<TrackableOrder[]> => {
  // Get from your existing orders Redux state
  const allOrders = useSelector(state => state.orders.userOrders); // Adjust path
  
  return allOrders.filter(order => {
    const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
    const hasValidStatus = trackingStatuses.includes(order.status);
    const hasTrackingEnabled = order.live_tracking_enabled === 1 || order.live_tracking_enabled === true;
    
    return hasValidStatus && hasTrackingEnabled;
  }).map(order => ({
    id: order.id.toString(),
    status: order.status,
    live_tracking_enabled: order.live_tracking_enabled
  }));
};
```

**Option B: From API Call**
```typescript
const getTrackableOrders = async (): Promise<TrackableOrder[]> => {
  try {
    const response = await apiService.get('/driver/orders/active'); // Your API endpoint
    const allOrders = response.data;
    
    return allOrders.filter(order => {
      const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
      return trackingStatuses.includes(order.status) && order.live_tracking_enabled;
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};
```

**Option C: From AsyncStorage**
```typescript
const getTrackableOrders = async (): Promise<TrackableOrder[]> => {
  try {
    const ordersJson = await AsyncStorage.getItem('driver_orders');
    const allOrders = ordersJson ? JSON.parse(ordersJson) : [];
    
    return allOrders.filter(order => {
      const trackingStatuses = ['in_progress', 'picked_up', 'in_transit'];
      return trackingStatuses.includes(order.status) && order.live_tracking_enabled;
    });
  } catch (error) {
    console.error('Error loading orders from storage:', error);
    return [];
  }
};
```

### 3. Hook into Login Flow

Make sure your login action updates the Redux auth state:

```typescript
// In your login action/reducer
const loginSuccess = (state, action) => {
  state.isAuthenticated = true;
  state.user = action.payload;
  // The useAppStateLocationTracking hook will automatically trigger
};

const logout = (state) => {
  state.isAuthenticated = false;
  state.user = null;
  // This will automatically clear all tracking
};
```

### 4. Integration with Existing Order Screens

Your existing `useAutoLocationTracking` hook will still work, but now you have automatic backup:

```tsx
// OrderDetailsScreen.tsx - this still works as before
const OrderDetailsScreen = ({ route }) => {
  const { orderId, status, live_tracking_enabled } = route.params;
  
  // This hook still handles individual order tracking
  useAutoLocationTracking({
    orderId,
    status,
    live_tracking_enabled
  });
  
  // Rest of your component...
};
```

## What This System Does

### 🚀 **On App Startup**
- Checks if user is logged in
- Fetches all orders with trackable status
- Automatically starts tracking for eligible orders

### 🔑 **On Login**
- Immediately checks for trackable orders
- Starts tracking without requiring user to visit order screens

### 📱 **On Foreground Return**
- Rechecks order statuses (in case they changed while app was backgrounded)
- Starts/stops tracking as needed
- Syncs with current state

### 🔄 **Continuous Sync**
- Automatically adds new orders that become trackable
- Removes orders that are no longer trackable
- Maintains sync between Redux state and LocationService

## Benefits

1. **No missed tracking** - Orders start tracking immediately when eligible
2. **Automatic recovery** - Tracking resumes when app returns from background
3. **Smart cleanup** - Removes completed orders automatically
4. **User-friendly** - No need to visit order screens to start tracking
5. **Battery efficient** - Only tracks when necessary

## Console Logs

You'll see logs like:
```
🔄 AUTO-TRACKING CHECK (login): {...}
📊 Found 3 potentially trackable orders: [5007(in_transit), 5020(picked_up)]
🚀 Auto-adding order 5007 to tracking
✅ AUTO-TRACKING SETUP COMPLETE: 2 orders now tracking
```

## Manual Trigger

You can also manually trigger the check from anywhere in your app:

```typescript
const { checkAndStartTrackingForEligibleOrders } = useAppStateLocationTracking();

// Trigger manual check (e.g., after order status update)
await checkAndStartTrackingForEligibleOrders('manual');
```