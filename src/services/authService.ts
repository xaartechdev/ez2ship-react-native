import { apiService } from './apiService';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  User,
  ApiResponse,
} from '../types';

class AuthService {
  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    }
    apiService.removeAuthToken();
  }

  async refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/refresh', request);
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async verifyToken(): Promise<User> {
    const response = await apiService.get<User>('/auth/verify');
    return response.data;
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/auth/profile', profileData);
    return response.data;
  }

  async uploadProfileImage(imageUri: string): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await apiService.upload<{ imageUrl: string }>('/auth/profile/image', formData);
    return response.data;
  }

  async deleteAccount(): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>('/auth/account');
    return response.data;
  }

  // Device management
  async registerDevice(deviceToken: string, deviceType: 'ios' | 'android'): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>('/auth/devices', {
      deviceToken,
      deviceType,
    });
    return response.data;
  }

  async unregisterDevice(deviceToken: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(`/auth/devices/${deviceToken}`);
    return response.data;
  }
}

export const authService = new AuthService();
export default authService;