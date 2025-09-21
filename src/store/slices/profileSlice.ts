import { createSlice, PayloadAction } from '@reduxjs/toolkit';import { createSlice, PayloadAction } from '@reduxjs/toolkit';import { createSlice, PayloadAction } from '@reduxjs/toolkit';import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';



interface ProfileState {

  user: any | null;

  loading: boolean;export interface ProfileState {

  error: string | null;

}  user: any | null;



const initialState: ProfileState = {  loading: boolean;export interface ProfileState {import { profileService, DriverProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/profileService';import { profileService, DriverProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/profileService';

  user: null,

  loading: false,  error: string | null;

  error: null,

};}  profile: any | null;



const profileSlice = createSlice({

  name: 'profile',

  initialState,const initialState: ProfileState = {  loading: boolean;

  reducers: {

    setProfile: (state, action: PayloadAction<any>) => {  user: null,

      state.user = action.payload;

    },  loading: false,  error: string | null;

    setLoading: (state, action: PayloadAction<boolean>) => {

      state.loading = action.payload;  error: null,

    },

    setError: (state, action: PayloadAction<string | null>) => {};}export interface ProfileState {export interface ProfileState {

      state.error = action.payload;

    },

    clearProfile: (state) => {

      state.user = null;const profileSlice = createSlice({

      state.error = null;

    },  name: 'profile',

  },

});  initialState,const initialState: ProfileState = {  profile: DriverProfile | null;  profile: DriverProfile | null;



export const { setProfile, setLoading, setError, clearProfile } = profileSlice.actions;  reducers: {

export default profileSlice.reducer;
    setProfile: (state, action: PayloadAction<any>) => {  profile: null,

      state.user = action.payload;

    },  loading: false,  loading: boolean;  loading: boolean;

    setLoading: (state, action: PayloadAction<boolean>) => {

      state.loading = action.payload;  error: null,

    },

    setError: (state, action: PayloadAction<string | null>) => {};  updating: boolean;  updating: boolean;

      state.error = action.payload;

    },

    clearProfile: (state) => {

      state.user = null;const profileSlice = createSlice({  uploading: boolean;  uploading: boolean;

      state.error = null;

    },  name: 'profile',

  },

});  initialState,  error: string | null;  error: string | null;



export const { setProfile, setLoading, setError, clearProfile } = profileSlice.actions;  reducers: {

export default profileSlice.reducer;
    setProfile: (state, action: PayloadAction<any>) => {  updateSuccess: boolean;  updateSuccess: boolean;

      state.profile = action.payload;

    },}}

    setLoading: (state, action: PayloadAction<boolean>) => {

      state.loading = action.payload;

    },

    setError: (state, action: PayloadAction<string | null>) => {const initialState: ProfileState = {const initialState: ProfileState = {

      state.error = action.payload;

    },  profile: null,  profile: null,

    clearProfile: (state) => {

      state.profile = null;  loading: false,  loading: false,

      state.error = null;

    },  updating: false,  updating: false,

  },

});  uploading: false,  uploading: false,



export const { setProfile, setLoading, setError, clearProfile } = profileSlice.actions;  error: null,  error: null,



export default profileSlice.reducer;  updateSuccess: false,  updateSuccess: false,

};};



// Async thunks// Async thunks

export const fetchProfile = createAsyncThunk(export const fetchProfile = createAsyncThunk(

  'profile/fetchProfile',  'profile/fetchProfile',

  async (_, { rejectWithValue }) => {  async (_, { rejectWithValue }) => {

    try {    try {

      const response = await profileService.getProfile();      const response = await profileService.getProfile();

      return response.data.driver;      return response.data.driver;

    } catch (error: any) {    } catch (error: any) {

      return rejectWithValue(error.message || 'Failed to fetch profile');      return rejectWithValue(error.message || 'Failed to fetch profile');

    }    }

  }  }

););



export const updateProfile = createAsyncThunk(export const updateProfile = createAsyncThunk(

  'profile/updateProfile',  'profile/updateProfile',

  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {

    try {    try {

      const response = await profileService.updateProfile(profileData);      const response = await profileService.updateProfile(profileData);

      return response.data.driver;      return response.data.driver;

    } catch (error: any) {    } catch (error: any) {

      return rejectWithValue(error.message || 'Failed to update profile');      return rejectWithValue(error.message || 'Failed to update profile');

    }    }

  }  }

););



export const changePassword = createAsyncThunk(export const changePassword = createAsyncThunk(

  'profile/changePassword',  'profile/changePassword',

  async (passwordData: ChangePasswordRequest, { rejectWithValue }) => {  async (passwordData: ChangePasswordRequest, { rejectWithValue }) => {

    try {    try {

      const response = await profileService.changePassword(passwordData);      const response = await profileService.changePassword(passwordData);

      return response.message;      return response.message;

    } catch (error: any) {    } catch (error: any) {

      return rejectWithValue(error.message || 'Failed to change password');      return rejectWithValue(error.message || 'Failed to change password');

    }    }

  }  }

););



export const uploadProfileImage = createAsyncThunk(export const uploadProfileImage = createAsyncThunk(

  'profile/uploadProfileImage',  'profile/uploadProfileImage',

  async (imageFile: FormData, { rejectWithValue }) => {  async (imageFile: FormData, { rejectWithValue }) => {

    try {    try {

      const response = await profileService.uploadProfileImage(imageFile);      const response = await profileService.uploadProfileImage(imageFile);

      return response.data.driver;      return response.data.driver;

    } catch (error: any) {    } catch (error: any) {

      return rejectWithValue(error.message || 'Failed to upload profile image');      return rejectWithValue(error.message || 'Failed to upload profile image');

    }    }

  }  }

););



const profileSlice = createSlice({export const fetchStatistics = createAsyncThunk(

  name: 'profile',  'profile/fetchStatistics',

  initialState,  async (period: 'week' | 'month' | 'year' = 'month') => {

  reducers: {    const response = await profileService.getStatistics(period);

    clearError: (state) => {    if (!response.success) {

      state.error = null;      throw new Error(response.message);

    },    }

    clearUpdateSuccess: (state) => {    return response.data!;

      state.updateSuccess = false;  }

    },);

    resetProfile: (state) => {

      state.profile = null;export const uploadProfileImage = createAsyncThunk(

      state.error = null;  'profile/uploadProfileImage',

      state.updateSuccess = false;  async (imageFile: File | any) => {

    },    const response = await profileService.uploadProfileImage(imageFile);

  },    if (!response.success) {

  extraReducers: (builder) => {      throw new Error(response.message);

    builder    }

      // Fetch profile    return response.data!;

      .addCase(fetchProfile.pending, (state) => {  }

        state.loading = true;);

        state.error = null;

      })export const deleteProfileImage = createAsyncThunk(

      .addCase(fetchProfile.fulfilled, (state, action) => {  'profile/deleteProfileImage',

        state.loading = false;  async () => {

        state.profile = action.payload;    const response = await profileService.deleteProfileImage();

        state.error = null;    if (!response.success) {

      })      throw new Error(response.message);

      .addCase(fetchProfile.rejected, (state, action) => {    }

        state.loading = false;    return response;

        state.error = action.payload as string;  }

      }));

      

      // Update profileexport const uploadDocuments = createAsyncThunk(

      .addCase(updateProfile.pending, (state) => {  'profile/uploadDocuments',

        state.updating = true;  async (documents: {

        state.error = null;    license_front?: File | any;

        state.updateSuccess = false;    license_back?: File | any;

      })    insurance_certificate?: File | any;

      .addCase(updateProfile.fulfilled, (state, action) => {    background_check?: File | any;

        state.updating = false;  }) => {

        state.profile = action.payload;    const response = await profileService.uploadDocuments(documents);

        state.updateSuccess = true;    if (!response.success) {

        state.error = null;      throw new Error(response.message);

      })    }

      .addCase(updateProfile.rejected, (state, action) => {    return response.data!;

        state.updating = false;  }

        state.error = action.payload as string;);

        state.updateSuccess = false;

      })export const updatePreferences = createAsyncThunk(

        'profile/updatePreferences',

      // Change password  async (preferences: {

      .addCase(changePassword.pending, (state) => {    notifications_enabled?: boolean;

        state.updating = true;    push_notifications?: boolean;

        state.error = null;    email_notifications?: boolean;

      })    sms_notifications?: boolean;

      .addCase(changePassword.fulfilled, (state) => {    preferred_language?: 'en' | 'es' | 'fr' | 'de';

        state.updating = false;    timezone?: string;

        state.updateSuccess = true;  }) => {

        state.error = null;    const response = await profileService.updatePreferences(preferences);

      })    if (!response.success) {

      .addCase(changePassword.rejected, (state, action) => {      throw new Error(response.message);

        state.updating = false;    }

        state.error = action.payload as string;    return response.data!;

      })  }

      );

      // Upload profile image

      .addCase(uploadProfileImage.pending, (state) => {const profileSlice = createSlice({

        state.uploading = true;  name: 'profile',

        state.error = null;  initialState,

      })  reducers: {

      .addCase(uploadProfileImage.fulfilled, (state, action) => {    clearError: (state) => {

        state.uploading = false;      state.error = null;

        state.profile = action.payload;    },

        state.updateSuccess = true;    clearUpdateSuccess: (state) => {

        state.error = null;      state.updateSuccess = false;

      })    },

      .addCase(uploadProfileImage.rejected, (state, action) => {    setLoading: (state, action: PayloadAction<boolean>) => {

        state.uploading = false;      state.loading = action.payload;

        state.error = action.payload as string;    },

      });    setUpdating: (state, action: PayloadAction<boolean>) => {

  },      state.updating = action.payload;

});    },

    clearProfileData: (state) => {

export const { clearError, clearUpdateSuccess, resetProfile } = profileSlice.actions;      state.profile = null;

      state.statistics = null;

// Selectors      state.preferences = null;

export const selectProfile = (state: { profile: ProfileState }) => state.profile.profile;      state.updateSuccess = false;

export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.loading;      state.error = null;

export const selectProfileUpdating = (state: { profile: ProfileState }) => state.profile.updating;    },

export const selectProfileUploading = (state: { profile: ProfileState }) => state.profile.uploading;  },

export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;  extraReducers: (builder) => {

export const selectUpdateSuccess = (state: { profile: ProfileState }) => state.profile.updateSuccess;    builder

      // Fetch Profile

export default profileSlice.reducer;      .addCase(fetchProfile.pending, (state) => {
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