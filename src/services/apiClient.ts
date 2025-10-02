import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ApiResponse } from '../config/api';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      requireAuth?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    // Default headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };

    // Add auth token if required
    if (requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // For file uploads, remove Content-Type to let browser set boundary
        delete requestHeaders['Content-Type'];
        requestConfig.body = body;
      } else {
        requestConfig.body = JSON.stringify(body);
      }
    }

    try {
      const requestStart = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const requestDuration = Date.now() - requestStart;

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Enhanced logging: Request headers, params and response
      console.log(`🌐 ${method} ${endpoint}`, {
        url: url,
        headers: requestHeaders,
        params: body && !(body instanceof FormData) ? body : undefined,
        response: responseData,
        status: response.status,
        duration: `${requestDuration}ms`
      });

      // Handle different response formats
      if (response.ok) {
        // Success response
        if (typeof responseData === 'object' && responseData.success !== undefined) {
          return responseData;
        } else {
          // Fallback for non-standard success responses
          return {
            success: true,
            message: 'Request successful',
            data: responseData,
          };
        }
      } else {
        // Error response
        if (typeof responseData === 'object' && responseData.success !== undefined) {
          return responseData;
        } else {
          return {
            success: false,
            message: responseData.message || `HTTP Error ${response.status}`,
            errors: responseData.errors || {},
          };
        }
      }
    } catch (error: any) {
      console.error('API Request failed:', error);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timeout',
        };
      }

      return {
        success: false,
        message: error.message || 'Network error occurred',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string, deviceName: string = 'React Native App') {
    return this.makeRequest('/driver/login', {
      method: 'POST',
      body: { email, password, device_name: deviceName },
      requireAuth: false,
    });
  }

  async register(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    device_name?: string;
  }) {
    return this.makeRequest('/driver/register', {
      method: 'POST',
      body: {
        ...data,
        device_name: data.device_name || 'React Native App',
      },
      requireAuth: false,
    });
  }

  async logout() {
    return this.makeRequest('/driver/logout', {
      method: 'POST',
    });
  }

  async forgotPassword(email: string) {
    return this.makeRequest('/driver/forgot-password', {
      method: 'POST',
      body: { email },
      requireAuth: false,
    });
  }

  async resetPassword(email: string, token: string, password: string, passwordConfirmation: string) {
    return this.makeRequest('/reset-password', {
      method: 'POST',
      body: {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      },
      requireAuth: false,
    });
  }

  // Tasks methods
  async getTasks(params?: {
    status?: 'all' | 'pending' | 'in_progress' | 'completed';
    search?: string;
    per_page?: number;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      const statusMapping = {
        'all': 'all',
        'pending': 'pending',
        'in_progress': 'in_progress',
        'completed': 'completed'
      };
      const apiStatus = statusMapping[params.status] || params.status;
      queryParams.append('status', apiStatus);
    }
    if (params?.search) queryParams.append('search', params.search);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/driver/tasks?${queryString}` : '/driver/tasks';
    
    return this.makeRequest(endpoint);
  }

  async getTaskDetails(taskId: number) {
    return this.makeRequest(`/driver/tasks/${taskId}`);
  }

  async acceptTask(taskId: number) {
    return this.makeRequest(`/driver/tasks/${taskId}/accept`, {
      method: 'POST',
    });
  }

  async rejectTask(taskId: number, reason: string) {
    return this.makeRequest(`/driver/tasks/${taskId}/reject`, {
      method: 'POST',
      body: { reason },
    });
  }

  async updateTaskStatus(taskId: number, data: {
    status: string;
    notes?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    otp?: string;
  }) {
    return this.makeRequest(`/driver/tasks/${taskId}/status`, {
      method: 'PUT',
      body: data,
    });
  }

  // Profile methods
  async getProfile() {
    return this.makeRequest('/driver/profile');
  }

  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    vehicle_number?: string;
  }) {
    return this.makeRequest('/driver/profile', {
      method: 'PUT',
      body: data,
    });
  }

  async uploadProfileImage(imageFile: File | any) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.makeRequest('/driver/profile/upload-image', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteProfileImage() {
    return this.makeRequest('/driver/profile/image', {
      method: 'DELETE',
    });
  }

  async uploadDocuments(documents: {
    license_front?: File | any;
    license_back?: File | any;
    insurance_certificate?: File | any;
    background_check?: File | any;
  }) {
    const formData = new FormData();
    
    Object.entries(documents).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    return this.makeRequest('/driver/profile/upload-documents', {
      method: 'POST',
      body: formData,
    });
  }

  async getStatistics(period?: 'week' | 'month' | 'year') {
    const endpoint = period ? `/driver/profile/statistics?period=${period}` : '/driver/profile/statistics';
    return this.makeRequest(endpoint);
  }

  async updatePreferences(preferences: {
    notifications_enabled?: boolean;
    push_notifications?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    preferred_language?: 'en' | 'es' | 'fr' | 'de';
    timezone?: string;
  }) {
    return this.makeRequest('/driver/profile/preferences', {
      method: 'PUT',
      body: preferences,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ) {
    console.log('🔐 ChangePassword API Call - Headers will be shown above');
    return this.makeRequest('/driver/change-password', {
      method: 'POST',
      body: {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      },
    });
  }

  async updatePassword(
    newPassword: string,
    newPasswordConfirmation: string
  ) {
    return this.makeRequest('/driver/change-password', {
      method: 'POST',
      body: {
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      },
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;