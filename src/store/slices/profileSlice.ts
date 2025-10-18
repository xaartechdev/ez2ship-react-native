import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  driver_id: string;
  profile_image: string | null;
  status: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string | null;
  license_number?: string;
  license_expiry?: string | null;
  license_class?: string;
  vehicle_number?: string;
  vehicle_type?: string;
  vehicle_make_model?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  vehicle_fuel_type?: string;
  vehicle_max_weight?: string;
  vehicle_cargo_volume?: string;
  vehicle_max_packages?: string;
  vehicle_dimensions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  rating?: number;
  total_trips?: number;
  on_time_rate?: number;
  join_date?: string | null;
  [key: string]: any;
}

interface ProfileState {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
}

// Async thunk for updating profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<ProfileData>, { rejectWithValue, dispatch, getState }) => {
    try {
      console.log('=== PROFILE UPDATE START ===');
      console.log('📝 Profile data to update:', JSON.stringify(profileData, null, 2));
      
      // Import profile service dynamically to avoid circular dependencies
      const { profileService } = await import('../../services/profileService');
      
      // Filter out fields that are not supported by the update profile API
      const allowedFields = [
        'first_name', 'last_name', 'phone', 'street_address', 'city', 'state', 
        'zip_code', 'emergency_contact_name', 'emergency_contact_phone', 'vehicle_number'
      ];
      
      const apiUpdateData = Object.keys(profileData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          const value = profileData[key];
          // Only include non-empty values to avoid validation issues with empty strings
          if (value !== null && value !== undefined && value !== '') {
            obj[key] = value;
          }
          return obj;
        }, {} as any);
      
      console.log('🚀 REDUX - Calling API to update profile...');
      console.log('📝 REDUX - Filtered API data (excluding unsupported fields):', JSON.stringify(apiUpdateData, null, 2));
      
      const updatedProfile = await profileService.updateProfile(apiUpdateData);
      
      console.log('✅ REDUX - Profile updated successfully via API:', {
        profileKeys: Object.keys(updatedProfile),
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        email: updatedProfile.email
      });
      
      // Update auth user data as well since profile and user data should stay in sync
      const state = getState() as any;
      const currentUser = state.auth.user;
      
      if (currentUser) {
        // Import auth slice action
        const { updateUser } = await import('./authSlice');
        dispatch(updateUser({
          ...currentUser,
          ...profileData
        }));
        console.log('🔄 REDUX - Auth user data synchronized with profile update');
      }
      
      return updatedProfile;
    } catch (error: any) {
      console.log('❌ Profile update failed:', error?.message);
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('🚀 REDUX - fetchProfile thunk started');
      
      // Get user data from auth state
      const state = getState() as any;
      const user = state.auth.user;
      console.log('*********User profile complete data ***************',user)
      console.log('📋 REDUX - Auth state user data:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        firstName: user?.first_name,
        lastName: user?.last_name,
        fullUser: user
      });
      
      if (user) {
        const profileData = {
          first_name: user.first_name || 'Driver',
          last_name: user.last_name || 'Driver User',
          email: user.email || 'driver@example.com',
          phone: user.phone || '+1234567890',
          driver_id: user.driver_id || 'DRV001',
          profile_image: user.profile_image || null,
          status: user.status || 'active',
          street_address: user.street_address || '',
          city: user.city || '',
          state: user.state || '',
          zip_code: user.zip_code || '',
          date_of_birth: user.date_of_birth || null,
          license_number: user.license_number || '',
          license_expiry: user.license_expiry || null,
          license_class: user.license_class || '',
          vehicle_number: user.vehicle_number || '',
          vehicle_type: user.vehicle_type || 'Delivery Truck',
          vehicle_make_model: user.vehicle_make_model || 'Ford Transit',
          vehicle_year: user.vehicle_year || '2023',
          vehicle_color: user.vehicle_color || 'White',
          vehicle_fuel_type: user.vehicle_fuel_type || 'Diesel',
          vehicle_max_weight: user.vehicle_max_weight || '3,500 kg',
          vehicle_cargo_volume: user.vehicle_cargo_volume || '15.1 m³',
          vehicle_max_packages: user.vehicle_max_packages || '150 packages',
          vehicle_dimensions: user.vehicle_dimensions || 'L: 6.2m, W: 2.1m, H: 2.8m',
          emergency_contact_name: user.emergency_contact_name || '',
          emergency_contact_phone: user.emergency_contact_phone || '',
          emergency_contact_relationship: user.emergency_contact_relationship || '',
          rating: user.rating || 0,
          total_trips: user.total_trips || 0,
          on_time_rate: user.on_time_rate || 0,
          join_date: user.join_date || null
        };
        
        console.log('✅ REDUX - Profile data constructed successfully:', {
          profileKeys: Object.keys(profileData),
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          email: profileData.email,
          driverId: profileData.driver_id,
          constructedProfile: profileData
        });
        
        return profileData;
      } else {
        console.log('❌ REDUX - No user data available in auth state');
        return rejectWithValue('No user data available');
      }
    } catch (error) {
      console.error('❌ REDUX - Error in fetchProfile thunk:', error);
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        
        // Convert DriverProfile to ProfileData, handling type differences
        const driverProfile = action.payload;
        const profileData: ProfileData = {
          ...driverProfile,
          rating: typeof driverProfile.rating === 'string' ? parseFloat(driverProfile.rating) : driverProfile.rating,
          total_trips: typeof driverProfile.total_trips === 'string' ? parseInt(driverProfile.total_trips, 10) : driverProfile.total_trips,
          on_time_rate: typeof driverProfile.on_time_rate === 'string' ? parseFloat(driverProfile.on_time_rate) : driverProfile.on_time_rate,
        };
        
        state.profile = profileData;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;
