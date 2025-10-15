import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  type: string; // 'order_assigned', etc.
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  icon?: string;
  order_id?: string;
  status?: string;
}

export interface NotificationsResponse {
  success: boolean;
  message?: string;
  data?: {
    counts: {
      all: number;
      unread: number;
    };
    notifications: Notification[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      has_more: boolean;
    };
    filters: {
      available_filters: string[];
    };
  };
}

class NotificationsService {
  async getNotifications(params?: {
    filter?: 'all' | 'unread' | 'read';
    per_page?: number;
    page?: number;
  }): Promise<NotificationsResponse> {
    try {
      console.log('🚀 NOTIFICATIONS SERVICE - getNotifications() started');
      console.log('📋 Parameters:', params);
      
      // Convert unread_only to filter for API compatibility
      const apiParams = {
        filter: params?.filter || 'all',
        per_page: params?.per_page || 15,
        page: params?.page || 1
      };
      
      const response = await apiClient.getNotifications(apiParams);
      
      console.log('📨 NOTIFICATIONS SERVICE - API response:', {
        success: response.success,
        hasData: !!response.data,
        notificationCount: (response.data as any)?.notifications?.length || 0,
        unreadCount: (response.data as any)?.counts?.unread || 0,
        totalCount: (response.data as any)?.counts?.all || 0
      });

      if (response.success && response.data) {
        const responseData = response.data as {
          counts: { all: number; unread: number; };
          notifications: Notification[];
          pagination: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            has_more: boolean;
          };
          filters: {
            available_filters: string[];
          };
        };
        
        return {
          success: true,
          data: responseData
        };
      } else {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
    } catch (error: any) {
      console.error('❌ NOTIFICATIONS SERVICE - Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch notifications'
      };
    }
  }
  async markAsRead(notificationId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🚀 NOTIFICATIONS SERVICE - markAsRead() started');
      console.log('📋 Notification ID:', notificationId);
      
      const response = await apiClient.markNotificationAsRead(notificationId);
      
      console.log('📨 NOTIFICATIONS SERVICE - Mark as read response:', response);
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Notification marked as read',
        };
      } else {
        throw new Error(response.message || 'Failed to mark notification as read');
      }
    } catch (error: any) {
      console.error('❌ NOTIFICATIONS SERVICE - Mark as read error:', error);
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
      console.log('🚀 NOTIFICATIONS SERVICE - markAllAsRead() started');
      
      const response = await apiClient.markAllNotificationsAsRead();
      
      console.log('📨 NOTIFICATIONS SERVICE - Mark all as read response:', response);
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'All notifications marked as read',
        };
      } else {
        throw new Error(response.message || 'Failed to mark all notifications as read');
      }
    } catch (error: any) {
      console.error('❌ NOTIFICATIONS SERVICE - Mark all as read error:', error);
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
      console.log('🚀 NOTIFICATIONS SERVICE - deleteNotification() started');
      console.log('📋 Notification ID:', notificationId);
      
      const response = await apiClient.deleteNotification(notificationId);
      
      console.log('📨 NOTIFICATIONS SERVICE - Delete response:', response);
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Notification deleted successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to delete notification');
      }
    } catch (error: any) {
      console.error('❌ NOTIFICATIONS SERVICE - Delete error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete notification',
      };
    }
  }

  // Helper methods
  getNotificationIcon(notification: Notification): string {
    // Use icon from API if available, otherwise determine by type
    if (notification.icon) {
      return this.convertIconName(notification.icon);
    }
    
    switch (notification.type) {
      case 'order_assigned': return '📦';
      case 'trip_update': return '🚚';
      case 'message': return '💬';
      case 'cancelled': return '❌';
      case 'task_accepted': return '✅';
      case 'task_completed': return '🎉';
      default: return '🔔';
    }
  }
  
  private convertIconName(iconName: string): string {
    switch (iconName) {
      case 'truck': return '🚚';
      case 'package': return '📦';
      case 'check': return '✅';
      case 'x': return '❌';
      case 'bell': return '🔔';
      case 'message': return '💬';
      default: return '🔔';
    }
  }

  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'order_assigned': return '#007AFF';
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