import { apiService } from './apiService';
import {
  Notification,
  NotificationListRequest,
  MarkNotificationReadRequest,
  ApiResponse,
} from '../types';

class NotificationsService {
  // Get notifications list
  async getNotifications(params: NotificationListRequest = {}): Promise<Notification[]> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

    const response = await apiService.get<Notification[]>(`/notifications?${queryParams.toString()}`);
    return response.data;
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiService.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  }

  // Mark notification as read/unread
  async markNotificationRead(request: MarkNotificationReadRequest): Promise<Notification> {
    const response = await apiService.patch<Notification>(
      `/notifications/${request.notificationId}/read`,
      { isRead: request.isRead }
    );
    return response.data;
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const response = await apiService.post<{ message: string; count: number }>('/notifications/mark-all-read');
    return response.data;
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(`/notifications/${notificationId}`);
    return response.data;
  }

  // Delete all read notifications
  async deleteAllRead(): Promise<{ message: string; count: number }> {
    const response = await apiService.delete<{ message: string; count: number }>('/notifications/read');
    return response.data;
  }

  // Get notifications by type
  async getNotificationsByType(type: string): Promise<Notification[]> {
    return this.getNotifications({ type });
  }

  // Get unread notifications
  async getUnreadNotifications(): Promise<Notification[]> {
    return this.getNotifications({ isRead: false });
  }

  // Register for push notifications
  async registerForPushNotifications(deviceToken: string, platform: 'ios' | 'android'): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/notifications/register-device', {
      deviceToken,
      platform,
    });
    return response.data;
  }

  // Unregister from push notifications
  async unregisterFromPushNotifications(deviceToken: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/notifications/unregister-device', {
      deviceToken,
    });
    return response.data;
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: {
    orderUpdates: boolean;
    taskAssignments: boolean;
    promotions: boolean;
    systemMessages: boolean;
  }): Promise<{ message: string }> {
    const response = await apiService.put<{ message: string }>('/notifications/preferences', preferences);
    return response.data;
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<{
    orderUpdates: boolean;
    taskAssignments: boolean;
    promotions: boolean;
    systemMessages: boolean;
  }> {
    const response = await apiService.get<{
      orderUpdates: boolean;
      taskAssignments: boolean;
      promotions: boolean;
      systemMessages: boolean;
    }>('/notifications/preferences');
    return response.data;
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;