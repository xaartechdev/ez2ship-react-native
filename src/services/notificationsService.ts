import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  type: 'new_order' | 'trip_update' | 'message' | 'cancelled' | 'task_accepted' | 'task_completed';
  title: string;
  message: string;
  data?: any;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data?: {
    notifications: Notification[];
    unread_count: number;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more: boolean;
    };
  };
}

class NotificationsService {
  // Since there's no specific notifications endpoint in the API docs,
  // I'll create a mock service that can be easily replaced when the real endpoint is available
  
  async getNotifications(params?: {
    per_page?: number;
    page?: number;
    unread_only?: boolean;
  }): Promise<NotificationsResponse> {
    try {
      // Mock notifications data for now
      // In real implementation, this would call the actual API endpoint
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'new_order',
          title: 'New Order Assigned',
          message: 'A new delivery order has been assigned to you',
          data: { order_id: 'ORD-001' },
          read_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'trip_update',
          title: 'Trip Status Update',
          message: 'Your current trip status has been updated',
          data: { trip_id: 'TRP-001' },
          read_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          type: 'task_completed',
          title: 'Task Completed',
          message: 'You have successfully completed a delivery task',
          data: { task_id: 123 },
          read_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ];

      let filteredNotifications = mockNotifications;
      
      if (params?.unread_only) {
        filteredNotifications = mockNotifications.filter(n => !n.read_at);
      }

      const unreadCount = mockNotifications.filter(n => !n.read_at).length;

      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          notifications: filteredNotifications,
          unread_count: unreadCount,
          pagination: {
            current_page: 1,
            per_page: 15,
            total: filteredNotifications.length,
            last_page: 1,
            has_more: false,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch notifications',
      };
    }
  }

  async markAsRead(notificationId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Mock marking as read
      // In real implementation, this would call the actual API endpoint
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        message: 'Notification marked as read',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to mark notification as read',
      };
    }
  }

  async markAllAsRead(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Mock marking all as read
      // In real implementation, this would call the actual API endpoint
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'All notifications marked as read',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to mark all notifications as read',
      };
    }
  }

  async deleteNotification(notificationId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Mock deleting notification
      // In real implementation, this would call the actual API endpoint
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to delete notification',
      };
    }
  }

  // Helper methods
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'new_order': return '📦';
      case 'trip_update': return '🚚';
      case 'message': return '💬';
      case 'cancelled': return '❌';
      case 'task_accepted': return '✅';
      case 'task_completed': return '🎉';
      default: return '🔔';
    }
  }

  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'new_order': return '#007AFF';
      case 'trip_update': return '#FF9500';
      case 'message': return '#34C759';
      case 'cancelled': return '#FF3B30';
      case 'task_accepted': return '#30D158';
      case 'task_completed': return '#5856D6';
      default: return '#8E8E93';
    }
  }

  formatNotificationDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;