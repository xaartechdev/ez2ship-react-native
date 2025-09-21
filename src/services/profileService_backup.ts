import { apiClient } from './apiClient';

export interface DriverProfile {
  id: number;
  driver_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  full_address: string;
  location_string: string;
  license_number: string;
  license_expiry: string;
  license_class: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  status: string;
  current_status: string;
  vehicle_number: string;
  rating: string;
  total_trips: number;
  on_time_rate: string;
  join_date: string;
  onboarding_progress: number;
  onboarding_status: string;
  last_active_at: string;
  profile_image: string | null;
  license_front: string | null;
  license_back: string | null;
  insurance_certificate: string | null;
  background_check: string | null;
  preferences: any[];
}

export interface ProfileStatistics {
  total_deliveries: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  total_earnings: number;
  average_rating: number;
  on_time_percentage: number;
  period_earnings: {
    today: number;
    week: number;
    month: number;
  };
  recent_activity: {
    date: string;
    deliveries: number;
    earnings: number;
  }[];
}

export interface UserPreferences {
  notifications_enabled: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  preferred_language: 'en' | 'es' | 'fr' | 'de';
  timezone: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    driver: DriverProfile;
  };
  message?: string;
}

export interface StatisticsResponse {
  success: boolean;
  message: string;
  data?: ProfileStatistics;
}

export interface PreferencesResponse {
  success: boolean;
  message: string;
  data?: UserPreferences;
}

class ProfileService {
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.getProfile();
      return response as ProfileResponse;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch profile',
      };
    }
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
  }): Promise<ProfileResponse> {
    try {
      const response = await apiClient.updateProfile(data);
      return response as ProfileResponse;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update profile',
      };
    }
  }

  async uploadProfileImage(imageFile: File | any): Promise<{
    success: boolean;
    message: string;
    data?: { image_url: string };
  }> {
    try {
      const response = await apiClient.uploadProfileImage(imageFile);
      return response as { success: boolean; message: string; data?: { image_url: string } };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to upload profile image',
      };
    }
  }

  async deleteProfileImage(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.deleteProfileImage();
      return response as { success: boolean; message: string };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to delete profile image',
      };
    }
  }

  async uploadDocuments(documents: {
    license_front?: File | any;
    license_back?: File | any;
    insurance_certificate?: File | any;
    background_check?: File | any;
  }): Promise<{
    success: boolean;
    message: string;
    data?: { uploaded_documents: string[] };
  }> {
    try {
      const response = await apiClient.uploadDocuments(documents);
      return response as { success: boolean; message: string; data?: { uploaded_documents: string[] } };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to upload documents',
      };
    }
  }

  async getStatistics(period: 'week' | 'month' | 'year' = 'month'): Promise<StatisticsResponse> {
    try {
      const response = await apiClient.getStatistics(period);
      return response as StatisticsResponse;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch statistics',
      };
    }
  }

  async updatePreferences(preferences: {
    notifications_enabled?: boolean;
    push_notifications?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    preferred_language?: 'en' | 'es' | 'fr' | 'de';
    timezone?: string;
  }): Promise<PreferencesResponse> {
    try {
      const response = await apiClient.updatePreferences(preferences);
      return response as PreferencesResponse;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update preferences',
      };
    }
  }

  // Helper methods
  async getFullName(): Promise<string> {
    try {
      const response = await this.getProfile();
      if (response.success && response.data) {
        return `${response.data.first_name} ${response.data.last_name}`.trim();
      }
      return 'User';
    } catch (error) {
      return 'User';
    }
  }

  async isVerified(): Promise<boolean> {
    try {
      const response = await this.getProfile();
      return response.success && response.data?.verification_status === 'verified';
    } catch (error) {
      return false;
    }
  }

  async getTodayEarnings(): Promise<number> {
    try {
      const response = await this.getStatistics();
      return response.success && response.data ? response.data.period_earnings.today : 0;
    } catch (error) {
      return 0;
    }
  }

  async getWeekEarnings(): Promise<number> {
    try {
      const response = await this.getStatistics();
      return response.success && response.data ? response.data.period_earnings.week : 0;
    } catch (error) {
      return 0;
    }
  }

  async getMonthEarnings(): Promise<number> {
    try {
      const response = await this.getStatistics();
      return response.success && response.data ? response.data.period_earnings.month : 0;
    } catch (error) {
      return 0;
    }
  }
}

// Create singleton instance
export const profileService = new ProfileService();
export default profileService;