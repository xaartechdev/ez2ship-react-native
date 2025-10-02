import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationsService, Notification, NotificationsResponse } from '../../services/notificationsService';

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
  } | null;
  lastFetch: number | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: null,
  lastFetch: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params?: {
    per_page?: number;
    page?: number;
    unread_only?: boolean;
  }) => {
    const response = await notificationsService.getNotifications(params);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: number) => {
    const response = await notificationsService.markAsRead(notificationId);
    if (!response.success) {
      throw new Error(response.message);
    }
    return { notificationId, response };
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    const response = await notificationsService.markAllAsRead();
    if (!response.success) {
      throw new Error(response.message);
    }
    return response;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: number) => {
    const response = await notificationsService.deleteNotification(notificationId);
    if (!response.success) {
      throw new Error(response.message);
    }
    return { notificationId, response };
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = null;
      state.lastFetch = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification to the beginning of the list
      state.notifications.unshift(action.payload);
      if (!action.payload.read_at) {
        state.unreadCount += 1;
      }
    },
    updateNotificationLocally: (state, action: PayloadAction<{ id: number; updates: Partial<Notification> }>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read_at;
        const willBeRead = action.payload.updates.read_at;
        
        state.notifications[index] = {
          ...state.notifications[index],
          ...action.payload.updates,
        };

        // Update unread count if read status changed
        if (wasUnread && willBeRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.data) {
          state.notifications = action.payload.data.notifications;
          state.unreadCount = action.payload.data.unread_count;
          state.pagination = action.payload.data.pagination;
        }
        state.lastFetch = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })

      // Mark as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read_at) {
          notification.read_at = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark notification as read';
      })

      // Mark all as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        const currentTime = new Date().toISOString();
        state.notifications.forEach(notification => {
          if (!notification.read_at) {
            notification.read_at = currentTime;
          }
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to mark all notifications as read';
      })

      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
          const notification = state.notifications[notificationIndex];
          if (!notification.read_at) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(notificationIndex, 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete notification';
      });
  },
});

export const {
  clearError,
  clearNotifications,
  addNotification,
  updateNotificationLocally,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationsState }) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) => state.notifications.loading;
export const selectNotificationsError = (state: { notifications: NotificationsState }) => state.notifications.error;
export const selectUnreadNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications.notifications.filter(n => !n.read_at);
export const selectNotificationsPagination = (state: { notifications: NotificationsState }) => state.notifications.pagination;
export const selectLastFetch = (state: { notifications: NotificationsState }) => state.notifications.lastFetch;