import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationsService, Notification, NotificationsResponse } from '../../services/notificationsService';

export interface NotificationsState {
  notifications: Notification[];
  counts: {
    all: number;
    unread: number;
  };
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more: boolean;
  } | null;
  filters: {
    available_filters: string[];
  } | null;
  lastFetch: number | null;
}

const initialState: NotificationsState = {
  notifications: [],
  counts: {
    all: 0,
    unread: 0,
  },
  loading: false,
  error: null,
  pagination: null,
  filters: null,
  lastFetch: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params?: {
    filter?: 'all' | 'unread' | 'read';
    per_page?: number;
    page?: number;
  }) => {
    const response = await notificationsService.getNotifications(params);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch notifications');
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
      state.counts = { all: 0, unread: 0 };
      state.pagination = null;
      state.filters = null;
      state.lastFetch = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification to the beginning of the list
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.counts.unread += 1;
      }
      state.counts.all += 1;
    },
    updateNotificationLocally: (state, action: PayloadAction<{ id: number; updates: Partial<Notification> }>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].is_read;
        const willBeRead = action.payload.updates.is_read || action.payload.updates.read_at;
        
        state.notifications[index] = {
          ...state.notifications[index],
          ...action.payload.updates,
        };

        // Update unread count if read status changed
        if (wasUnread && willBeRead) {
          state.counts.unread = Math.max(0, state.counts.unread - 1);
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
          state.counts = action.payload.data.counts;
          state.pagination = action.payload.data.pagination;
          state.filters = action.payload.data.filters;
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
        if (notification && !notification.is_read) {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
          state.counts.unread = Math.max(0, state.counts.unread - 1);
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
          if (!notification.is_read) {
            notification.is_read = true;
            notification.read_at = currentTime;
          }
        });
        state.counts.unread = 0;
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
          if (!notification.is_read) {
            state.counts.unread = Math.max(0, state.counts.unread - 1);
          }
          state.counts.all = Math.max(0, state.counts.all - 1);
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
export const selectUnreadCount = (state: { notifications: NotificationsState }) => {
  return state.notifications.counts.unread;
};
export const selectAllCount = (state: { notifications: NotificationsState }) => state.notifications.counts.all;
export const selectNotificationsCounts = (state: { notifications: NotificationsState }) => state.notifications.counts;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) => state.notifications.loading;
export const selectNotificationsError = (state: { notifications: NotificationsState }) => state.notifications.error;
export const selectUnreadNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications.notifications.filter(n => !n.is_read);
export const selectNotificationsPagination = (state: { notifications: NotificationsState }) => state.notifications.pagination;
export const selectNotificationsFilters = (state: { notifications: NotificationsState }) => state.notifications.filters;
export const selectLastFetch = (state: { notifications: NotificationsState }) => state.notifications.lastFetch;