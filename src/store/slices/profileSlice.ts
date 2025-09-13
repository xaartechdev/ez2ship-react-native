import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProfileState, User } from '../../types';
import { mockApiDelay } from '../../services/mockData';

// Async thunks with mock data
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue, getState }) => {
    try {
      await mockApiDelay(800);
      
      // Get current user from auth state
      const state = getState() as any;
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Merge the updates with current user data
      const updatedUser = {
        ...currentUser,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'profile/uploadProfileImage',
  async (imageUri: string, { rejectWithValue }) => {
    try {
      await mockApiDelay(1500); // Simulate file upload delay
      
      // Mock image upload - return a mock URL
      const mockImageUrl = `https://mock-storage.com/profiles/${Date.now()}.jpg`;
      return mockImageUrl;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload profile image');
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      await mockApiDelay(600);
      
      // Mock password validation
      if (currentPassword !== 'password123') {
        throw new Error('Current password is incorrect');
      }
      
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }
      
      return { message: 'Password changed successfully' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'profile/updateNotificationSettings',
  async (
    settings: {
      pushNotifications: boolean;
      emailNotifications: boolean;
      smsNotifications: boolean;
      orderUpdates: boolean;
      promotions: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      await mockApiDelay(500);
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update notification settings');
    }
  }
);

export const updatePrivacySettings = createAsyncThunk(
  'profile/updatePrivacySettings',
  async (
    settings: {
      profileVisibility: 'public' | 'private';
      shareLocationData: boolean;
      shareUsageData: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      await mockApiDelay(400);
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update privacy settings');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'profile/deleteAccount',
  async (password: string, { rejectWithValue }) => {
    try {
      await mockApiDelay(1000);
      
      // Mock password validation
      if (password !== 'password123') {
        throw new Error('Password is incorrect');
      }
      
      return { message: 'Account deleted successfully' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete account');
    }
  }
);

const initialState: ProfileState = {
  isLoading: false,
  error: null,
  isUpdating: false,
  updateSuccess: false,
  notificationSettings: {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false,
  },
  privacySettings: {
    profileVisibility: 'public',
    shareLocationData: true,
    shareUsageData: false,
  },
};

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
      state.isLoading = action.payload;
    },
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },
    updateLocalNotificationSettings: (state, action: PayloadAction<Partial<typeof initialState.notificationSettings>>) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload };
    },
    updateLocalPrivacySettings: (state, action: PayloadAction<Partial<typeof initialState.privacySettings>>) => {
      state.privacySettings = { ...state.privacySettings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      });

    // Upload Profile Image
    builder
      .addCase(uploadProfileImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Notification Settings
    builder
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.notificationSettings = action.payload;
        state.updateSuccess = true;
      });

    // Update Privacy Settings
    builder
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.privacySettings = action.payload;
        state.updateSuccess = true;
      });

    // Delete Account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearUpdateSuccess,
  setLoading,
  setUpdating,
  updateLocalNotificationSettings,
  updateLocalPrivacySettings,
} = profileSlice.actions;

export default profileSlice.reducer;