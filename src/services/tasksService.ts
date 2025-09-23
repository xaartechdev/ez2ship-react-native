import { apiClient } from './apiClient';

export interface Task {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  type: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | '';
  pickup_address: string;
  delivery_address: string;
  scheduled_pickup: string;
  delivery_date: string | null;
  amount: string;
  distance: number;
  is_overdue: boolean;
  can_accept: boolean;
  can_reject: boolean;
  can_update_status: boolean;
  // Keep the original customer structure for backward compatibility
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
}

export interface TasksResponse {
  success: boolean;
  message: string;
  data?: {
    summary: {
      pending: number;
      in_progress: number;
      completed: number;
    };
    filtered_summary: {
      pending: number;
      in_progress: number;
      completed: number;
    };
    tasks: Task[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more: boolean;
    };
    filter_applied: string | null;
    search_applied: string | null;
  };
}

export interface TaskStatusUpdate {
  status: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

class TasksService {
  async getTasks(params?: {
    status?: 'all' | 'pending' | 'in_progress' | 'completed';
    search?: string;
    per_page?: number;
  }): Promise<TasksResponse> {
    try {
      console.log('TasksService: Calling getTasks with params:', params);
      const response = await apiClient.getTasks(params);
      console.log('TasksService: API response:', JSON.stringify(response, null, 2));
      
      // Transform the response to include customer object
      if (response.success && response.data && (response.data as any).tasks) {
        const apiData = response.data as any;
        const transformedTasks = apiData.tasks.map((task: any) => ({
          ...task,
          customer: {
            id: 0, // API doesn't provide customer ID
            name: task.customer_name,
            phone: task.customer_phone,
            email: '', // API doesn't provide customer email
          }
        }));
        
        console.log('TasksService: Transformed tasks:', transformedTasks.length);
        
        return {
          ...response,
          data: {
            ...apiData,
            tasks: transformedTasks
          }
        } as TasksResponse;
      }
      
      console.log('TasksService: No tasks in response or response not successful');
      return response as TasksResponse;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch tasks',
      };
    }
  }

  async getTaskDetails(taskId: number): Promise<{
    success: boolean;
    message: string;
    data?: Task;
  }> {
    try {
      const response = await apiClient.getTaskDetails(taskId);
      return response as { success: boolean; message: string; data?: Task };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch task details',
      };
    }
  }

  async acceptTask(taskId: number): Promise<{
    success: boolean;
    message: string;
    data?: Task;
  }> {
    try {
      const response = await apiClient.acceptTask(taskId);
      return response as { success: boolean; message: string; data?: Task };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to accept task',
      };
    }
  }

  async rejectTask(taskId: number, reason: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.rejectTask(taskId, reason);
      return response as { success: boolean; message: string };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to reject task',
      };
    }
  }

  async updateTaskStatus(taskId: number, data: TaskStatusUpdate): Promise<{
    success: boolean;
    message: string;
    data?: Task;
  }> {
    try {
      const response = await apiClient.updateTaskStatus(taskId, data);
      return response as { success: boolean; message: string; data?: Task };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update task status',
      };
    }
  }

  // Helper methods for common task operations
  async startPickup(taskId: number, location?: { latitude: number; longitude: number }): Promise<{
    success: boolean;
    message: string;
    data?: Task;
  }> {
    return this.updateTaskStatus(taskId, {
      status: 'in_progress',
      notes: 'Started pickup',
      location,
    });
  }

  async confirmPickup(taskId: number, location?: { latitude: number; longitude: number }): Promise<{
    success: boolean;
    message: string;
    data?: Task;
  }> {
    return this.updateTaskStatus(taskId, {
      status: 'picked_up',
      notes: 'Package picked up',
      location,
    });
  }

  async startDelivery(taskId: number, location?: { latitude: number; longitude: number }): Promise<{
    success: boolean;
    message: string;
    data?: Task;
  }> {
    return this.updateTaskStatus(taskId, {
      status: 'in_transit',
      notes: 'Started delivery',
      location,
    });
  }

  async confirmDelivery(taskId: number, notes?: string, location?: { latitude: number; longitude: number }): Promise<{
    success: boolean;
    message: string;
    data?: Task;
  }> {
    return this.updateTaskStatus(taskId, {
      status: 'delivered',
      notes: notes || 'Package delivered successfully',
      location,
    });
  }

  // Get tasks by status
  async getPendingTasks(): Promise<TasksResponse> {
    return this.getTasks({ status: 'pending' });
  }

  async getInProgressTasks(): Promise<TasksResponse> {
    return this.getTasks({ status: 'in_progress' });
  }

  async getCompletedTasks(): Promise<TasksResponse> {
    return this.getTasks({ status: 'completed' });
  }

  // Search tasks
  async searchTasks(query: string): Promise<TasksResponse> {
    return this.getTasks({ search: query });
  }
}

export const tasksService = new TasksService();
export default tasksService;