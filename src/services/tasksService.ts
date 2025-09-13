import { apiService } from './apiService';
import {
  Task,
  TaskListRequest,
  UpdateTaskStatusRequest,
  ApiResponse,
} from '../types';

class TasksService {
  // Get tasks list with filters
  async getTasks(params: TaskListRequest = {}): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);

    const response = await apiService.get<Task[]>(`/tasks?${queryParams.toString()}`);
    return response.data;
  }

  // Get single task by ID
  async getTask(taskId: string): Promise<Task> {
    const response = await apiService.get<Task>(`/tasks/${taskId}`);
    return response.data;
  }

  // Update task status
  async updateTaskStatus(request: UpdateTaskStatusRequest): Promise<Task> {
    const response = await apiService.patch<Task>(`/tasks/${request.taskId}/status`, {
      status: request.status,
      notes: request.notes,
      location: request.location,
    });
    return response.data;
  }

  // Get tasks by status
  async getTasksByStatus(status: 'pending' | 'in-progress' | 'completed'): Promise<Task[]> {
    return this.getTasks({ status });
  }

  // Get today's tasks
  async getTodaysTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getTasks({ dateFrom: today, dateTo: today });
  }

  // Accept task
  async acceptTask(taskId: string): Promise<Task> {
    const response = await apiService.post<Task>(`/tasks/${taskId}/accept`);
    return response.data;
  }

  // Start task
  async startTask(taskId: string, location?: { latitude: number; longitude: number }): Promise<Task> {
    const response = await apiService.post<Task>(`/tasks/${taskId}/start`, { location });
    return response.data;
  }

  // Complete task
  async completeTask(taskId: string, notes?: string, location?: { latitude: number; longitude: number }): Promise<Task> {
    const response = await apiService.post<Task>(`/tasks/${taskId}/complete`, { notes, location });
    return response.data;
  }

  // Cancel task
  async cancelTask(taskId: string, reason: string): Promise<Task> {
    const response = await apiService.post<Task>(`/tasks/${taskId}/cancel`, { reason });
    return response.data;
  }

  // Add notes to task
  async addTaskNotes(taskId: string, notes: string): Promise<Task> {
    const response = await apiService.post<Task>(`/tasks/${taskId}/notes`, { notes });
    return response.data;
  }

  // Get task history
  async getTaskHistory(page: number = 1, limit: number = 20): Promise<Task[]> {
    return this.getTasks({ page, limit, status: 'completed' });
  }
}

export const tasksService = new TasksService();
export default tasksService;