import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileService, DriverProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/profileService';

export interface ProfileState {
  profile: DriverProfile | null;
  loading: boolean;
  updating: boolean;
  uploading: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  updating: false,
  uploading: false,
  error: null,
  updateSuccess: false,
};

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile();
      return response.data.driver;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(profileData);
      return response.data.driver;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwordData: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await profileService.changePassword(passwordData);
      return response.message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async (imageFile: FormData, { rejectWithValue }) => {
    try {
      const response = await profileService.uploadProfileImage(imageFile);
      return response.data.driver;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload profile image');
    }
  }
);
  }) => {
    const response = await profileService.updateProfile(profileData);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

export const fetchStatistics = createAsyncThunk(
  'profile/fetchStatistics',
  async (period: 'week' | 'month' | 'year' = 'month') => {
    const response = await profileService.getStatistics(period);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async (imageFile: File | any) => {
    const response = await profileService.uploadProfileImage(imageFile);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

export const deleteProfileImage = createAsyncThunk(
  'profile/deleteProfileImage',
  async () => {
    const response = await profileService.deleteProfileImage();
    if (!response.success) {
      throw new Error(response.message);
    }
    return response;
  }
);

export const uploadDocuments = createAsyncThunk(
  'profile/uploadDocuments',
  async (documents: {
    license_front?: File | any;
    license_back?: File | any;
    insurance_certificate?: File | any;
    background_check?: File | any;
  }) => {
    const response = await profileService.uploadDocuments(documents);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

export const updatePreferences = createAsyncThunk(
  'profile/updatePreferences',
  async (preferences: {
    notifications_enabled?: boolean;
    push_notifications?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    preferred_language?: 'en' | 'es' | 'fr' | 'de';
    timezone?: string;
  }) => {
    const response = await profileService.updatePreferences(preferences);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data!;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.updating = action.payload;
    },
    clearProfileData: (state) => {
      state.profile = null;
      state.statistics = null;
      state.preferences = null;
      state.updateSuccess = false;
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
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message || 'Failed to update profile';
        state.updateSuccess = false;
      })

      // Fetch Statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch statistics';
      })

      // Upload Profile Image
      .addCase(uploadProfileImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.uploading = false;
        if (state.profile && action.payload.image_url) {
          state.profile.profile_image_url = action.payload.image_url;
        }
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message || 'Failed to upload profile image';
      })

      // Delete Profile Image
      .addCase(deleteProfileImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(deleteProfileImage.fulfilled, (state) => {
        state.uploading = false;
        if (state.profile) {
          state.profile.profile_image_url = null;
        }
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(deleteProfileImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message || 'Failed to delete profile image';
      })

      // Upload Documents
      .addCase(uploadDocuments.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        state.uploading = false;
        state.updateSuccess = true;
        state.error = null;
        // Documents would be updated in the profile on next fetch
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message || 'Failed to upload documents';
      })

      // Update Preferences
      .addCase(updatePreferences.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.updating = false;
        state.preferences = action.payload;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message || 'Failed to update preferences';
      });
  },
});

export const {
  clearError,
  clearUpdateSuccess,
  setLoading,
  setUpdating,
  clearProfileData,
} = profileSlice.actions;

export default profileSlice.reducer;

// Selectors
export const selectProfile = (state: { profile: ProfileState }) => state.profile.profile;
export const selectStatistics = (state: { profile: ProfileState }) => state.profile.statistics;
export const selectPreferences = (state: { profile: ProfileState }) => state.profile.preferences;
export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.loading;
export const selectProfileUpdating = (state: { profile: ProfileState }) => state.profile.updating;
export const selectProfileUploading = (state: { profile: ProfileState }) => state.profile.uploading;
export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;
export const selectUpdateSuccess = (state: { profile: ProfileState }) => state.profile.updateSuccess;