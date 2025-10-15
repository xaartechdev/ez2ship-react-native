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

export interface ProfileResponse {
  success: boolean;
  data: {
    driver: DriverProfile;
  };
  message?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

class ProfileService {
  async getProfile(): Promise<DriverProfile> {
    try {
      console.log('🚀 PROFILE SERVICE - getProfile() started');
      
      const response = await apiClient.getProfile();
      
      console.log('📋 PROFILE SERVICE - Raw API response:', {
        success: response.success,
        message: response.message,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        rawData: response.data
      });
      
      if (response.success && response.data) {
        // Handle different response structures
        const data = response.data as any;
        const profile = data.driver || data;
        
        console.log('✅ PROFILE SERVICE - Profile data processed:', {
          profileKeys: Object.keys(profile),
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          processedProfile: profile
        });
        
        return profile;
      } else {
        console.error('❌ PROFILE SERVICE - Response indicates failure:', {
          success: response.success,
          message: response.message,
          data: response.data
        });
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (error: any) {
      console.error('❌ PROFILE SERVICE - Error occurred:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fullError: error
      });
      throw new Error(error.message || 'Failed to fetch profile');
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<DriverProfile> {
    try {
      const response = await apiClient.updateProfile(data);
      if (response.success && response.data) {
        // Handle different response structures
        const responseData = response.data as any;
        return responseData.driver || responseData;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await apiClient.changePassword(
        data.current_password,
        data.new_password,
        data.new_password_confirmation
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  async uploadProfileImage(imageFile: any): Promise<DriverProfile> {
    try {
      const response = await apiClient.uploadProfileImage(imageFile);
      if (response.success && response.data) {
        // Handle different response structures
        const responseData = response.data as any;
        return responseData.driver || responseData;
      } else {
        throw new Error(response.message || 'Failed to upload profile image');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload profile image');
    }
  }

  // Helper methods
  getFullName(profile: DriverProfile): string {
    return `${profile.first_name} ${profile.last_name}`.trim();
  }

  formatAddress(profile: DriverProfile): string {
    return profile.full_address || `${profile.street_address}, ${profile.city}, ${profile.state} ${profile.zip_code}`;
  }

  isVerified(profile: DriverProfile): boolean {
    return profile.status === 'active';
  }

  getOnboardingProgress(profile: DriverProfile): number {
    return profile.onboarding_progress;
  }

  formatRating(rating: string): string {
    return `${rating}/5.0`;
  }

  formatJoinDate(joinDate: string): string {
    return new Date(joinDate).toLocaleDateString();
  }

  isLicenseExpiringSoon(licenseExpiry: string): boolean {
    const expiryDate = new Date(licenseExpiry);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return expiryDate <= thirtyDaysFromNow;
  }
}

export const profileService = new ProfileService();