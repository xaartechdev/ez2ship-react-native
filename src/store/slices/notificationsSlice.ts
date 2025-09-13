import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationsState, Notification, NotificationListRequest, MarkNotificationReadRequest } from '../../types';
import { mockNotifications, mockApiDelay } from '../../services/mockData';

// Async thunks with mock data
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: NotificationListRequest = {}, { rejectWithValue }) => {
    try {
      await mockApiDelay(500);
      
      let filteredNotifications = [...mockNotifications];
      
      // Filter by type if specified
      if (params.type) {
        filteredNotifications = filteredNotifications.filter(notif => notif.type === params.type);
      }
      
      // Filter by read status if specified
      if (params.isRead !== undefined) {
        filteredNotifications = filteredNotifications.filter(notif => notif.isRead === params.isRead);
      }
      
      // Sort by created date (newest first)
      filteredNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Apply pagination
      const { page = 1, limit = 20 } = params;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return filteredNotifications.slice(startIndex, endIndex);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      await mockApiDelay(300);
      const unreadCount = mockNotifications.filter(notif => !notif.isRead).length;
      return unreadCount;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (request: MarkNotificationReadRequest, { rejectWithValue }) => {
    try {
      await mockApiDelay(300);
      // Find the notification and update its read status
      const notification = mockNotifications.find(notif => notif.id === request.notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      return {
        ...notification,
        isRead: true,
        readAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await mockApiDelay(500);
      // Mark all notifications as read
      const updatedNotifications = mockNotifications.map(notif => ({
        ...notif,
        isRead: true,
        readAt: notif.readAt || new Date().toISOString()
      }));
      
      return updatedNotifications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await mockApiDelay(400);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await mockApiDelay(600);
      return { message: 'All notifications deleted successfully' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete all notifications');
    }
  }
);

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  hasMore: true,
  lastFetch: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(notif => notif.id === action.payload.id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        const isNowRead = action.payload.isRead;
        
        state.notifications[index] = action.payload;
        
        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && !isNowRead) {
          state.unreadCount += 1;
        }
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(notif => notif.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.lastFetch = new Date().toISOString();
        state.hasMore = action.payload.length >= 20; // Assume more if we got full page
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Mark Notification Read
    builder
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(notif => notif.id === action.payload.id);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].isRead;
          state.notifications[index] = action.payload;
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });

    // Mark All Notifications Read
    builder
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = 0;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(notif => notif.id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      });

    // Delete All Notifications
    builder
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  },
});

export const {
  clearError,
  addNotification,
  updateNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  updateUnreadCount,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;