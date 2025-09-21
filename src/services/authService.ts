import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import { LoginResponse, RegisterResponse } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
}

export interface User {
  id: number;
  driver_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_status?: string;
  rating?: string;
  total_trips?: number;
  status: string;
  onboarding_progress?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    driver: User;
    token: string;
    token_type: string;
  };
  errors?: Record<string, string[]>;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.login(
        credentials.email,
        credentials.password,
        credentials.device_name || 'React Native App'
      );

      if (response.success && response.data) {
        const loginData = response.data as LoginResponse;
        // Store token and user data
        await this.storeAuthData(loginData.token, loginData.driver);
        
        return {
          success: true,
          message: 'Login successful',
          data: {
            driver: loginData.driver,
            token: loginData.token,
            token_type: loginData.token_type,
          },
        };
      }

      return {
        success: false,
        message: response.message || 'Login failed',
        errors: response.errors,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.register(data);

      if (response.success && response.data) {
        const registerData = response.data as RegisterResponse;
        // Store token and user data
        await this.storeAuthData(registerData.token, registerData.driver);
        
        return {
          success: true,
          message: 'Registration successful',
          data: {
            driver: registerData.driver,
            token: registerData.token,
            token_type: registerData.token_type,
          },
        };
      }

      return {
        success: false,
        message: response.message || 'Registration failed',
        errors: response.errors,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      // Call logout endpoint
      await apiClient.logout();
      
      // Clear local auth data regardless of API response
      await this.clearAuthData();
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error: any) {
      // Still clear local data even if API call fails
      await this.clearAuthData();
      
      return {
        success: true,
        message: 'Logged out locally',
      };
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.forgotPassword(email);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send reset email',
      };
    }
  }

  async resetPassword(
    email: string,
    token: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.resetPassword(email, token, password, passwordConfirmation);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password reset failed',
      };
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem(this.userKey);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      const user = await this.getStoredUser();
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  private async storeAuthData(token: string, user: User | any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.tokenKey, token);
      await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.tokenKey, this.userKey]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Helper method to get current user info
  async getCurrentUser(): Promise<User | null> {
    return this.getStoredUser();
  }

  // Helper method to check if user needs to verify email
  async needsEmailVerification(): Promise<boolean> {
    const user = await this.getStoredUser();
    // For EZ2Ship API, we'll assume email verification is handled server-side
    // and not required for the mobile app
    return false;
  }

  // Helper method to get user's full name
  async getUserFullName(): Promise<string> {
    const user = await this.getStoredUser();
    if (user) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return 'User';
  }
}

export const authService = new AuthService();
export default authService;