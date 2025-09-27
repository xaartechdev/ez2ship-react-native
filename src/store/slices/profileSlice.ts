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

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get user data from auth state
      const state = getState() as any;
      const user = state.auth.user;
      
      if (user) {
        return {
          first_name: user.first_name || 'Driver',
          last_name: user.last_name || 'User',
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
      } else {
        return rejectWithValue('No user data available');
      }
    } catch (error) {
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
      });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;
