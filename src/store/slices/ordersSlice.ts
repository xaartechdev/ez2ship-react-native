import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrdersState, Order, UpdateOrderStatusRequest } from '../../types';
import { mockOrders, mockApiDelay } from '../../services/mockData';

// Async thunks with mock data
export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      await mockApiDelay(600);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 20, status }: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      await mockApiDelay(800);
      let filteredOrders = [...mockOrders];
      
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return filteredOrders.slice(startIndex, endIndex);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async (request: UpdateOrderStatusRequest, { rejectWithValue }) => {
    try {
      await mockApiDelay(600);
      const order = mockOrders.find(o => o.id === request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      return {
        ...order,
        status: request.status,
        updatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

export const pickupOrder = createAsyncThunk(
  'orders/pickupOrder',
  async ({ orderId, notes }: { orderId: string; notes?: string }, { rejectWithValue }) => {
    try {
      await mockApiDelay(500);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      return {
        ...order,
        status: 'picked-up' as const,
        updatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to pickup order');
    }
  }
);

export const deliverOrder = createAsyncThunk(
  'orders/deliverOrder',
  async (
    {
      orderId,
      proofOfDelivery,
      notes,
    }: {
      orderId: string;
      proofOfDelivery: {
        otp?: string;
        signature?: string;
        photos?: string[];
        recipientName?: string;
      };
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await mockApiDelay(800);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      return {
        ...order,
        status: 'delivered' as const,
        actualDeliveryTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to deliver order');
    }
  }
);

export const uploadProofPhotos = createAsyncThunk(
  'orders/uploadProofPhotos',
  async ({ orderId, photos }: { orderId: string; photos: string[] }, { rejectWithValue }) => {
    try {
      await mockApiDelay(1200);
      // Mock photo upload - return mock URLs
      const photoUrls = photos.map((_, index) => `https://mock-storage.com/proof/${orderId}_${index}.jpg`);
      return { orderId, photoUrls };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload proof photos');
    }
  }
);

export const reportOrderIssue = createAsyncThunk(
  'orders/reportOrderIssue',
  async (
    { orderId, issue, description }: { orderId: string; issue: string; description: string },
    { rejectWithValue }
  ) => {
    try {
      await mockApiDelay(600);
      return { message: 'Issue reported successfully' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to report order issue');
    }
  }
);

export const fetchOrderTracking = createAsyncThunk(
  'orders/fetchOrderTracking',
  async (orderId: string, { rejectWithValue }) => {
    try {
      await mockApiDelay(500);
      // Mock tracking data
      const tracking = {
        currentLocation: { 
          latitude: 37.7749, 
          longitude: -122.4194, 
          address: 'San Francisco, CA' 
        },
        estimatedArrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        route: [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.7849, longitude: -122.4094 }
        ]
      };
      return { orderId, tracking };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order tracking');
    }
  }
);

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  orderHistory: [],
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    updateOrderInList: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
      if (state.currentOrder?.id === action.payload) {
        state.currentOrder = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Order
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Order Status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Pickup Order
    builder
      .addCase(pickupOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      });

    // Deliver Order
    builder
      .addCase(deliverOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        // Move to order history when delivered
        if (action.payload.status === 'delivered') {
          state.orderHistory.unshift(action.payload);
        }
      });

    // Upload Proof Photos
    builder
      .addCase(uploadProofPhotos.fulfilled, (state, action) => {
        // Handle successful photo upload
      });

    // Report Order Issue
    builder
      .addCase(reportOrderIssue.fulfilled, (state, action) => {
        // Handle successful issue reporting
      });

    // Fetch Order Tracking
    builder
      .addCase(fetchOrderTracking.fulfilled, (state, action) => {
        // Handle tracking information
      });
  },
});

export const {
  clearError,
  setCurrentOrder,
  updateOrderInList,
  addOrder,
  removeOrder,
  setLoading,
} = ordersSlice.actions;

export default ordersSlice.reducer;