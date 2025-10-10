import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ApiResponse } from '../config/api';
import store from '../store';
import { forceLogoutAsync } from '../store/slices/authSlice';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private refreshAttemptCount: number = 0;
  private maxRefreshAttempts: number = 3;
  private requestCache: Map<string, { promise: Promise<any>; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 1000; // 1 second deduplication window

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

  private async clearStoredAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'auth_user', 'refresh_token', 'token_expires_at', 'refresh_expires_at']);
      
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  private generateCacheKey(endpoint: string, method: string, body?: any): string {
    const bodyStr = body ? JSON.stringify(body) : '';
    return `${method}:${endpoint}:${bodyStr}`;
  }

  private getCachedRequest<T>(cacheKey: string): Promise<ApiResponse<T>> | null {
    const cached = this.requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      
      return cached.promise;
    }
    return null;
  }

  private setCachedRequest<T>(cacheKey: string, promise: Promise<ApiResponse<T>>): void {
    this.requestCache.set(cacheKey, { 
      promise, 
      timestamp: Date.now() 
    });
    
    // Clean up old cache entries to prevent memory leaks
    setTimeout(() => {
      this.requestCache.delete(cacheKey);
    }, this.CACHE_DURATION * 2);
  }

  private async attemptTokenRefresh(): Promise<{ success: boolean; message: string }> {
    try {
      // Check if we've exceeded maximum refresh attempts
      if (this.refreshAttemptCount >= this.maxRefreshAttempts) {
        
        this.refreshAttemptCount = 0; // Reset counter
        return { success: false, message: 'Maximum refresh attempts exceeded' };
      }

      this.refreshAttemptCount++;

      // Get refresh token directly from storage to avoid circular imports
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      const refreshExpiryString = await AsyncStorage.getItem('refresh_expires_at');
      
      if (!refreshToken) {
        this.refreshAttemptCount = 0; // Reset counter
        return { success: false, message: 'No refresh token available' };
      }

      // Check if refresh token is expired
      if (refreshExpiryString) {
        const expiryDate = new Date(refreshExpiryString);
        const now = new Date();
        if (expiryDate <= now) {
          this.refreshAttemptCount = 0; // Reset counter
          return { success: false, message: 'Refresh token expired' };
        }
      }
      
      const refreshResult = await this.refreshToken(refreshToken);
      
      if (refreshResult.success && refreshResult.data) {
        const tokenData = refreshResult.data as any;
        const currentUser = await AsyncStorage.getItem('auth_user');
        
        // Store new token data
        await AsyncStorage.setItem('auth_token', tokenData.access_token || tokenData.token);
        
        if (tokenData.refresh_token) {
          await AsyncStorage.setItem('refresh_token', tokenData.refresh_token);
        }
        
        if (tokenData.expires_at) {
          await AsyncStorage.setItem('token_expires_at', tokenData.expires_at);
        }
        
        if (tokenData.refresh_expires_at) {
          await AsyncStorage.setItem('refresh_expires_at', tokenData.refresh_expires_at);
        }
        
        
        this.refreshAttemptCount = 0; // Reset counter on success
        return { success: true, message: 'Token refreshed successfully' };
      } else {
        
        this.refreshAttemptCount = 0; // Reset counter on final failure
        return { success: false, message: refreshResult.message || 'Token refresh failed' };
      }
    } catch (error: any) {
      
      this.refreshAttemptCount = 0; // Reset counter on error
      return { success: false, message: error.message || 'Token refresh failed' };
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      requireAuth?: boolean;
      isRefreshRequest?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
      isRefreshRequest = false
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    // Check for duplicate requests (only for GET requests to prevent caching side effects)
    if (method === 'GET') {
      const cacheKey = this.generateCacheKey(endpoint, method, body);
      const cachedRequest = this.getCachedRequest<T>(cacheKey);
      if (cachedRequest) {
        return cachedRequest;
      }
    }
    
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
        console.log('📋 MAKE REQUEST - Detected FormData body, removing Content-Type header');
        delete requestHeaders['Content-Type'];
        requestConfig.body = body;
        
        // Log FormData entries (for debugging)
        console.log('📋 MAKE REQUEST - FormData entries:');
        try {
          // Note: FormData.entries() might not be available in all React Native versions
          // This is just for debugging purposes
          if (body.entries) {
            let entryCount = 0;
            for (const [key, value] of body.entries()) {
              entryCount++;
              console.log(`  Entry ${entryCount}: ${key} = ${typeof value === 'object' ? 'File object' : value}`);
            }
            console.log(`📋 Total FormData entries: ${entryCount}`);
          } else {
            console.log('  FormData.entries() not available - cannot enumerate entries');
          }
        } catch (e) {
          console.log('  Unable to enumerate FormData entries (this is normal in React Native)');
        }
        
      } else {
        console.log('📋 MAKE REQUEST - JSON body detected');
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

      // Check for invalid token response and attempt refresh
      // Skip token refresh logic for refresh token requests to prevent infinite loop
      if (!isRefreshRequest && 
          typeof responseData === 'object' && responseData && 
          responseData.success === false && 
          (responseData.error_code === 'INVALID_TOKEN' || 
           responseData.message === 'Invalid or expired token' ||
           responseData.message === 'Unauthenticated' ||
           responseData.message?.includes('token') ||
           response.status === 401)) {
        
        console.log('🔒 Invalid/expired token detected, attempting refresh...', {
          error_code: responseData.error_code,
          message: responseData.message,
          status: response.status
        });

        // Try to refresh the token
        const refreshResult = await this.attemptTokenRefresh();
        
        if (refreshResult.success) {
          console.log('✅ Token refreshed successfully, retrying original request...');
          // Retry the original request with the new token
          return this.makeRequest(endpoint, options);
        } else {
          console.log('❌ Token refresh failed, logging out user...', refreshResult.message);
          // If refresh fails, force logout
          store.dispatch(forceLogoutAsync());
          await this.clearStoredAuth();
          return responseData;
        }
      }

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
  async login(email: string, password: string, deviceName: string = 'React Native App', deviceId: string) {
    return this.makeRequest('/driver/login', {
      method: 'POST',
      body: { 
        email, 
        password, 
        device_name: deviceName,
        device_id: deviceId 
      },
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
    device_id?: string;
  }) {
    return this.makeRequest('/driver/register', {
      method: 'POST',
      body: {
        ...data,
        device_name: data.device_name || 'React Native App',
        device_id: data.device_id,
      },
      requireAuth: false,
    });
  }

  async logout() {
    return this.makeRequest('/driver/logout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string, deviceName: string = 'React Native App') {
    return this.makeRequest('/driver/refresh-token', {
      method: 'POST',
      body: { 
        refresh_token: refreshToken,
        device_name: deviceName 
      },
      requireAuth: false, // Don't require auth for refresh token endpoint
      isRefreshRequest: true, // Flag to prevent token validation loop
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

  async updateTaskStatusWithDocuments(taskId: number, data: {
    status: string;
    notes?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    otp?: string;
    delivery_documents: any[];
  }) {
    try {
      console.log('� API CLIENT - updateTaskStatusWithDocuments called');
      console.log('📄 Task ID:', taskId);
      console.log('�📄 Request data received:', {
        status: data.status,
        notes: data.notes,
        otp: data.otp,
        hasLocation: !!data.location,
        documentsCount: data.delivery_documents?.length || 0
      });
      
      console.log('📄 Preparing multipart form data for task:', taskId);
      
      // Create FormData object
      const formData = new FormData();
      
      // Add basic fields
      console.log('📝 Adding basic form fields...');
      formData.append('status', data.status);
      console.log('  ✓ status:', data.status);
      
      if (data.notes) {
        formData.append('notes', data.notes);
        console.log('  ✓ notes:', data.notes);
      }
      
      if (data.otp) {
        formData.append('otp', data.otp);
        console.log('  ✓ otp:', data.otp);
      }
      
      if (data.location) {
        formData.append('latitude', data.location.latitude.toString());
        formData.append('longitude', data.location.longitude.toString());
        console.log('  ✓ location:', data.location);
      }
      
      // Add delivery documents
      console.log('📎 Processing delivery documents...');
      console.log('📎 Documents array:', data.delivery_documents);
      
      if (!data.delivery_documents || data.delivery_documents.length === 0) {
        console.log('⚠️ WARNING: No delivery documents provided!');
      } else {
        console.log(`📎 Processing ${data.delivery_documents.length} documents for multipart upload`);
        data.delivery_documents.forEach((doc, index) => {
          console.log(`📄 Processing document ${index}:`, {
            name: doc.name,
            type: doc.type,
            uri: doc.uri ? `${doc.uri.substring(0, 50)}...` : 'No URI',
            hasSize: !!doc.size,
            fullDoc: doc
          });
          
          // Validate required fields for multipart upload
          if (!doc.uri) {
            console.error(`❌ Document ${index} missing URI - this will cause upload failure!`);
            return;
          }
          
          if (!doc.name) {
            console.warn(`⚠️ Document ${index} missing name - using fallback`);
          }
          
          if (!doc.type) {
            console.warn(`⚠️ Document ${index} missing type - using fallback`);
          }
          
          // React Native FormData requires specific file object structure
          const fileData = {
            uri: doc.uri,
            type: doc.type || 'application/octet-stream',
            name: doc.name || `document_${index}_${Date.now()}`,
          } as any;
          
          console.log(`📎 Creating React Native file object for document ${index}:`, fileData);
          console.log(`📎 File data validation:`, {
            uriValid: !!fileData.uri && fileData.uri.length > 0,
            typeValid: !!fileData.type && fileData.type.length > 0,
            nameValid: !!fileData.name && fileData.name.length > 0,
            uriFormat: fileData.uri?.startsWith('file://') ? 'file://' : 
                      fileData.uri?.startsWith('content://') ? 'content://' : 
                      fileData.uri?.startsWith('http') ? 'http/https' : 'unknown'
          });
          
          // For React Native, append the file object directly
          formData.append(`delivery_documents[${index}]`, fileData);
          console.log(`✅ Added document ${index} to FormData with key: delivery_documents[${index}]`);
          
          // Additional logging to verify FormData content
          console.log(`🔍 Verifying FormData entry ${index}:`, {
            key: `delivery_documents[${index}]`,
            hasUri: !!fileData.uri,
            hasType: !!fileData.type,
            hasName: !!fileData.name,
            isFileObject: typeof fileData === 'object' && fileData.uri
          });
        });
      }
      
      console.log('📋 FormData preparation complete');
      console.log('📋 MULTIPART UPLOAD SUMMARY:');
      console.log('  📍 Endpoint:', `/driver/tasks/${taskId}/status`);
      console.log('  📍 Method: PUT');
      console.log('  📍 Content-Type: multipart/form-data (auto-set)');
      console.log('  📍 Form Fields:');
      console.log('    - status:', data.status);
      if (data.notes) console.log('    - notes:', data.notes);
      if (data.otp) console.log('    - otp:', data.otp);
      if (data.location) console.log('    - location: lat/lng provided');
      console.log('  📍 File Fields:');
      if (data.delivery_documents && data.delivery_documents.length > 0) {
        data.delivery_documents.forEach((doc, index) => {
          console.log(`    - delivery_documents[${index}]: ${doc.name} (${doc.type})`);
        });
      } else {
        console.log('    - No file fields');
      }
      
      console.log('📤 Sending multipart request...');
      
      const response = await this.makeRequest(`/driver/tasks/${taskId}/status`, {
        method: 'PUT',
        body: formData,
      });
      
      console.log('📨 API CLIENT - Response received:', response);
      return response;
      
    } catch (error) {
      console.error('❌ API CLIENT ERROR in updateTaskStatusWithDocuments:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
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

  // Location tracking methods
  // NOTE: This method is currently bypassed in locationTrackingService.ts for testing
  async sendLocationUpdate(locationData: {
    order_id: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    speed?: number | null;
    heading?: number | null;
    altitude?: number | null;
  }) {
    return this.makeRequest('/driver/location-update', {
      method: 'POST',
      body: locationData,
    });
  }

  // Generic POST method for location service
  async post(endpoint: string, data: any) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data,
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;