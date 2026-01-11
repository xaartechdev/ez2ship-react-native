import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import { LoginResponse, RegisterResponse } from '../config/api';
import { deviceService } from './deviceService';

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
  device_id?: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
  device_id?: string;
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
  status?: string;
  onboarding_progress?: number;
  is_first_login?: number;
  on_time_rate?: string;
  profile_image?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    driver: User;
    token: string;
    token_type: string;
    refresh_token?: string;
    expires_at?: string;
    refresh_expires_at?: string;
  };
  errors?: Record<string, string[]>;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private refreshTokenKey = 'refresh_token';
  private tokenExpiryKey = 'token_expires_at';
  private refreshExpiryKey = 'refresh_expires_at';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Generate or get existing device ID with timeout protection
      let deviceId: string;
      try {
        deviceId = await Promise.race([
          deviceService.getDeviceId(),
          new Promise<string>((resolve) => {
            setTimeout(() => {
              console.warn('⚠️ Device ID generation taking too long, using fallback');
              resolve(`fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
            }, 3000);
          })
        ]);
      } catch (error) {
        console.error('Device ID error, using fallback:', error);
        deviceId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      }
      
      const response = await apiClient.login(
        credentials.email,
        credentials.password,
        credentials.device_name || 'React Native App',
        deviceId
      );

      console.log('AuthService login response:', response);

      if (response.success && response.data) {
        const loginData = response.data as any; // Use any to access all properties
        console.log('Login data:', loginData);
        
        // Store token, user data, and refresh token
        await this.storeAuthData(
          loginData.token, 
          loginData.driver, 
          loginData.refresh_token,
          loginData.expires_at,
          loginData.refresh_expires_at
        );
        
        return {
          success: true,
          message: 'Login successful',
          data: {
            driver: loginData.driver,
            token: loginData.token,
            token_type: loginData.token_type,
            refresh_token: loginData.refresh_token,
            expires_at: loginData.expires_at,
            refresh_expires_at: loginData.refresh_expires_at,
          },
        };
      }

      return {
        success: false,
        message: response.message || 'Login failed',
        errors: response.errors,
      };
    } catch (error: any) {
      console.error('AuthService login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Generate or get existing device ID
      const deviceId = await deviceService.getDeviceId();
      const dataWithDeviceId = { ...data, device_id: deviceId };
      
      const response = await apiClient.register(dataWithDeviceId);

      if (response.success && response.data) {
        const registerData = response.data as RegisterResponse;
        // Store token and user data (register might also return refresh token)
        const regData = response.data as any;
        await this.storeAuthData(
          registerData.token, 
          registerData.driver,
          regData.refresh_token,
          regData.expires_at,
          regData.refresh_expires_at
        );
        
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
      // Stop location tracking before logout
      const SimpleLocationService = (await import('./SimpleLocationService')).default;
      const locationService = SimpleLocationService.getInstance();
      locationService.forceStopTracking();
      console.log('✅ Location tracking force stopped during logout');
      
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

  async forceLogout(): Promise<{ success: boolean; message: string }> {
    try {
      // Stop location tracking before force logout
      const SimpleLocationService = (await import('./SimpleLocationService')).default;
      const locationService = SimpleLocationService.getInstance();
      locationService.forceStopTracking();
      console.log('✅ Location tracking force stopped during force logout');
      
      // Force logout without API call (for invalid token scenarios)
      await this.clearAuthData();
      
      return {
        success: true,
        message: 'Logged out due to invalid token',
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to clear auth data',
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
      // Add timeout protection
      const timeoutPromise = new Promise<string | null>((resolve) => {
        setTimeout(() => resolve(null), 2000); // 2 second timeout
      });
      
      const tokenPromise = AsyncStorage.getItem(this.tokenKey);
      
      return await Promise.race([tokenPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      // Add timeout protection
      const timeoutPromise = new Promise<string | null>((resolve) => {
        setTimeout(() => resolve(null), 2000); // 2 second timeout
      });
      
      const userPromise = AsyncStorage.getItem(this.userKey);
      const userString = await Promise.race([userPromise, timeoutPromise]);
      
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Add timeout protection to prevent ANR during startup
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn('⚠️ Auth check timeout, assuming not authenticated');
          resolve(false);
        }, 3000); // 3 second timeout
      });
      
      const authCheckPromise = this.performAuthCheck();
      
      return await Promise.race([authCheckPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
  
  private async performAuthCheck(): Promise<boolean> {
    // Use Promise.all to run storage operations in parallel
    const [token, user] = await Promise.all([
      this.getStoredToken().catch(() => null),
      this.getStoredUser().catch(() => null)
    ]);
    
    return !!(token && user);
  }

  private async storeAuthData(
    token: string, 
    user: User | any, 
    refreshToken?: string,
    expiresAt?: string,
    refreshExpiresAt?: string
  ): Promise<void> {
    try {
      console.log('AuthService storing auth data:', {
        user,
        hasRefreshToken: !!refreshToken,
        expiresAt,
        refreshExpiresAt
      });
      
      await AsyncStorage.setItem(this.tokenKey, token);
      await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
      
      if (refreshToken) {
        await AsyncStorage.setItem(this.refreshTokenKey, refreshToken);
      }
      
      if (expiresAt) {
        await AsyncStorage.setItem(this.tokenExpiryKey, expiresAt);
      }
      
      if (refreshExpiresAt) {
        await AsyncStorage.setItem(this.refreshExpiryKey, refreshExpiresAt);
      }
      
      console.log('AuthService auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.tokenKey, 
        this.userKey, 
        this.refreshTokenKey,
        this.tokenExpiryKey,
        this.refreshExpiryKey
      ]);
      console.log('🧹 All auth data cleared from storage');
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

  // Get stored refresh token
  async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Error getting stored refresh token:', error);
      return null;
    }
  }

  // Check if access token is expired
  async isTokenExpired(): Promise<boolean> {
    try {
      const expiryString = await AsyncStorage.getItem(this.tokenExpiryKey);
      if (!expiryString) return false;
      
      const expiryDate = new Date(expiryString);
      const now = new Date();
      
      // Check if token expires in the next 5 minutes (buffer for network delays)
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      
      return expiryDate <= fiveMinutesFromNow;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }

  // Check if refresh token is expired
  async isRefreshTokenExpired(): Promise<boolean> {
    try {
      const expiryString = await AsyncStorage.getItem(this.refreshExpiryKey);
      if (!expiryString) return false;
      
      const expiryDate = new Date(expiryString);
      const now = new Date();
      
      return expiryDate <= now;
    } catch (error) {
      console.error('Error checking refresh token expiry:', error);
      return false;
    }
  }

  // Refresh access token using refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting to refresh access token...');
      
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        console.log('❌ No refresh token available');
        return {
          success: false,
          message: 'No refresh token available',
        };
      }

      // Check if refresh token is expired
      if (await this.isRefreshTokenExpired()) {
        console.log('❌ Refresh token is expired');
        return {
          success: false,
          message: 'Refresh token expired',
        };
      }

      const response = await apiClient.refreshToken(refreshToken);
      console.log('🔄 Refresh token response:', response);

      if (response.success && response.data) {
        const tokenData = response.data as any;
        const currentUser = await this.getStoredUser();
        
        // Store new token data (keep existing user data)
        await this.storeAuthData(
          tokenData.access_token || tokenData.token,
          currentUser,
          tokenData.refresh_token,
          tokenData.expires_at,
          tokenData.refresh_expires_at
        );

        console.log('✅ Token refreshed successfully');
        return {
          success: true,
          message: 'Token refreshed successfully',
          data: {
            driver: currentUser!,
            token: tokenData.access_token || tokenData.token,
            token_type: tokenData.token_type || 'Bearer',
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_at,
            refresh_expires_at: tokenData.refresh_expires_at,
          },
        };
      }

      console.log('❌ Token refresh failed:', response.message);
      return {
        success: false,
        message: response.message || 'Token refresh failed',
      };
    } catch (error: any) {
      console.error('❌ Token refresh error:', error);
      return {
        success: false,
        message: error.message || 'Token refresh failed',
      };
    }
  }

  // Proactively refresh token if it's about to expire
  async ensureValidToken(): Promise<boolean> {
    try {
      const isExpired = await this.isTokenExpired();
      
      if (isExpired) {
        console.log('🔄 Token is expiring soon, refreshing proactively...');
        const refreshResult = await this.refreshToken();
        
        if (refreshResult.success) {
          console.log('✅ Proactive token refresh successful');
          return true;
        } else {
          console.log('❌ Proactive token refresh failed');
          return false;
        }
      }
      
      return true; // Token is still valid
    } catch (error) {
      console.error('Error ensuring valid token:', error);
      return false;
    }
  }

  // Helper method to get user's full name
  async getUserFullName(): Promise<string> {
    const user = await this.getStoredUser();
    if (user) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return 'User';
  }

  // Password change methods
  async updatePassword(
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await apiClient.updatePassword(newPassword, newPasswordConfirmation);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update password',
      };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.changePassword(currentPassword, newPassword, newPasswordConfirmation);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to change password',
      };
    }
  }
}

export const authService = new AuthService();
export default authService;