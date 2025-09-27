import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';import { createSlice, PayloadAction } from '@reduxjs/toolkit';import { createSlice, PayloadAction } from '@reduxjs/toolkit';import { createSlice, PayloadAction } from '@reduxjs/toolkit';import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { profileService, DriverProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/profileService';

import { profileService, DriverProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/profileService';

export interface ProfileState {

  profile: DriverProfile | null;

  loading: boolean;

  updating: boolean;export interface ProfileState {

  uploading: boolean;

  error: string | null;  profile: DriverProfile | null;interface ProfileState {

  updateSuccess: boolean;

}  loading: boolean;



const initialState: ProfileState = {  updating: boolean;  user: any | null;

  profile: null,

  loading: false,  uploading: boolean;

  updating: false,

  uploading: false,  error: string | null;  loading: boolean;export interface ProfileState {

  error: null,

  updateSuccess: false,  updateSuccess: boolean;

};

}  error: string | null;

// Fetch profile

export const fetchProfile = createAsyncThunk(

  'profile/fetchProfile',

  async (_, { rejectWithValue }) => {const initialState: ProfileState = {}  user: any | null;

    try {

      console.log('API Request: Fetching driver profile');  profile: null,

      const response = await profileService.getProfile();

      console.log('API Response: Profile fetch response:', response);  loading: false,

      return response;

    } catch (error: any) {  updating: false,

      console.log('API Error: Profile fetch error:', error.message);

      return rejectWithValue(error.message);  uploading: false,const initialState: ProfileState = {  loading: boolean;export interface ProfileState {import { profileService, DriverProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/profileService';import { profileService, DriverProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/profileService';

    }

  }  error: null,

);

  updateSuccess: false,  user: null,

// Update profile

export const updateProfile = createAsyncThunk(};

  'profile/updateProfile',

  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {  loading: false,  error: string | null;

    try {

      console.log('API Request: Updating profile with data:', profileData);// Fetch profile

      const response = await profileService.updateProfile(profileData);

      console.log('API Response: Profile update response:', response);export const fetchProfile = createAsyncThunk(  error: null,

      return response;

    } catch (error: any) {  'profile/fetchProfile',

      console.log('API Error: Profile update error:', error.message);

      return rejectWithValue(error.message);  async (_, { rejectWithValue }) => {};}  profile: any | null;

    }

  }    try {

);

      console.log('API Request: Fetching driver profile');

// Change password

export const changePassword = createAsyncThunk(      const response = await profileService.getProfile();

  'profile/changePassword',

  async (passwordData: ChangePasswordRequest, { rejectWithValue }) => {      console.log('API Response: Profile fetch response:', response);const profileSlice = createSlice({

    try {

      console.log('API Request: Changing password');      

      await profileService.changePassword(passwordData);

      console.log('API Response: Password changed successfully');      if (!response.success) {  name: 'profile',

      return true;

    } catch (error: any) {        throw new Error(response.message);

      console.log('API Error: Change password error:', error.message);

      return rejectWithValue(error.message);      }  initialState,const initialState: ProfileState = {  loading: boolean;

    }

  }      return response.data!;

);

    } catch (error: any) {  reducers: {

// Upload profile image

export const uploadProfileImage = createAsyncThunk(      console.log('API Error: Profile fetch error:', error.message);

  'profile/uploadProfileImage',

  async (imageFile: any, { rejectWithValue }) => {      return rejectWithValue(error.message);    setProfile: (state, action: PayloadAction<any>) => {  user: null,

    try {

      console.log('API Request: Uploading profile image');    }

      const response = await profileService.uploadProfileImage(imageFile);

      console.log('API Response: Upload image response:', response);  }      state.user = action.payload;

      return response;

    } catch (error: any) {);

      console.log('API Error: Upload image error:', error.message);

      return rejectWithValue(error.message);    },  loading: false,  error: string | null;

    }

  }// Update profile

);

export const updateProfile = createAsyncThunk(    setLoading: (state, action: PayloadAction<boolean>) => {

const profileSlice = createSlice({

  name: 'profile',  'profile/updateProfile',

  initialState,

  reducers: {  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {      state.loading = action.payload;  error: null,

    clearError: (state) => {

      state.error = null;    try {

    },

    clearUpdateSuccess: (state) => {      console.log('API Request: Updating profile with data:', profileData);    },

      state.updateSuccess = false;

    },      const response = await profileService.updateProfile(profileData);

    setLoading: (state, action: PayloadAction<boolean>) => {

      state.loading = action.payload;      console.log('API Response: Profile update response:', response);    setError: (state, action: PayloadAction<string | null>) => {};}export interface ProfileState {export interface ProfileState {

    },

    setUpdating: (state, action: PayloadAction<boolean>) => {      

      state.updating = action.payload;

    },      if (!response.success) {      state.error = action.payload;

  },

  extraReducers: (builder) => {        throw new Error(response.message);

    builder

      // Fetch profile      }    },

      .addCase(fetchProfile.pending, (state) => {

        state.loading = true;      return response.data!;

        state.error = null;

      })    } catch (error: any) {    clearProfile: (state) => {

      .addCase(fetchProfile.fulfilled, (state, action) => {

        state.loading = false;      console.log('API Error: Profile update error:', error.message);

        state.profile = action.payload;

        state.error = null;      return rejectWithValue(error.message);      state.user = null;const profileSlice = createSlice({

      })

      .addCase(fetchProfile.rejected, (state, action) => {    }

        state.loading = false;

        state.error = action.payload as string;  }      state.error = null;

      })

);

      // Update profile

      .addCase(updateProfile.pending, (state) => {    },  name: 'profile',

        state.updating = true;

        state.error = null;// Change password

        state.updateSuccess = false;

      })export const changePassword = createAsyncThunk(  },

      .addCase(updateProfile.fulfilled, (state, action) => {

        state.updating = false;  'profile/changePassword',

        state.profile = action.payload;

        state.error = null;  async (passwordData: ChangePasswordRequest, { rejectWithValue }) => {});  initialState,const initialState: ProfileState = {  profile: DriverProfile | null;  profile: DriverProfile | null;

        state.updateSuccess = true;

      })    try {

      .addCase(updateProfile.rejected, (state, action) => {

        state.updating = false;      console.log('API Request: Changing password');

        state.error = action.payload as string;

        state.updateSuccess = false;      const response = await profileService.changePassword(passwordData);

      })

      console.log('API Response: Change password response:', response);export const { setProfile, setLoading, setError, clearProfile } = profileSlice.actions;  reducers: {

      // Change password

      .addCase(changePassword.pending, (state) => {      

        state.updating = true;

        state.error = null;      if (!response.success) {export default profileSlice.reducer;

      })

      .addCase(changePassword.fulfilled, (state) => {        throw new Error(response.message);    setProfile: (state, action: PayloadAction<any>) => {  profile: null,

        state.updating = false;

        state.updateSuccess = true;      }

        state.error = null;

      })      return response.data!;      state.user = action.payload;

      .addCase(changePassword.rejected, (state, action) => {

        state.updating = false;    } catch (error: any) {

        state.error = action.payload as string;

      })      console.log('API Error: Change password error:', error.message);    },  loading: false,  loading: boolean;  loading: boolean;



      // Upload profile image      return rejectWithValue(error.message);

      .addCase(uploadProfileImage.pending, (state) => {

        state.uploading = true;    }    setLoading: (state, action: PayloadAction<boolean>) => {

        state.error = null;

      })  }

      .addCase(uploadProfileImage.fulfilled, (state, action) => {

        state.uploading = false;);      state.loading = action.payload;  error: null,

        state.profile = action.payload;

        state.error = null;

      })

      .addCase(uploadProfileImage.rejected, (state, action) => {// Upload profile image    },

        state.uploading = false;

        state.error = action.payload as string;export const uploadProfileImage = createAsyncThunk(

      });

  },  'profile/uploadProfileImage',    setError: (state, action: PayloadAction<string | null>) => {};  updating: boolean;  updating: boolean;

});

  async (imageUri: string, { rejectWithValue }) => {

export const { clearError, clearUpdateSuccess, setLoading, setUpdating } = profileSlice.actions;

    try {      state.error = action.payload;

// Selectors

export const selectProfile = (state: { profile: ProfileState }) => state.profile.profile;      console.log('API Request: Uploading profile image');

export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.loading;

export const selectProfileUpdating = (state: { profile: ProfileState }) => state.profile.updating;      const response = await profileService.uploadProfileImage(imageUri);    },

export const selectProfileUploading = (state: { profile: ProfileState }) => state.profile.uploading;

export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;      console.log('API Response: Upload image response:', response);

export const selectProfileUpdateSuccess = (state: { profile: ProfileState }) => state.profile.updateSuccess;

          clearProfile: (state) => {

export default profileSlice.reducer;
      if (!response.success) {

        throw new Error(response.message);      state.user = null;const profileSlice = createSlice({  uploading: boolean;  uploading: boolean;

      }

      return response.data!;      state.error = null;

    } catch (error: any) {

      console.log('API Error: Upload image error:', error.message);    },  name: 'profile',

      return rejectWithValue(error.message);

    }  },

  }

);});  initialState,  error: string | null;  error: string | null;



const profileSlice = createSlice({

  name: 'profile',

  initialState,export const { setProfile, setLoading, setError, clearProfile } = profileSlice.actions;  reducers: {

  reducers: {

    clearError: (state) => {export default profileSlice.reducer;

      state.error = null;    setProfile: (state, action: PayloadAction<any>) => {  updateSuccess: boolean;  updateSuccess: boolean;

    },

    clearUpdateSuccess: (state) => {      state.profile = action.payload;

      state.updateSuccess = false;

    },    },}}

    setLoading: (state, action: PayloadAction<boolean>) => {

      state.loading = action.payload;    setLoading: (state, action: PayloadAction<boolean>) => {

    },

    setUpdating: (state, action: PayloadAction<boolean>) => {      state.loading = action.payload;

      state.updating = action.payload;

    },    },

  },

  extraReducers: (builder) => {    setError: (state, action: PayloadAction<string | null>) => {const initialState: ProfileState = {const initialState: ProfileState = {

    builder

      // Fetch profile      state.error = action.payload;

      .addCase(fetchProfile.pending, (state) => {

        state.loading = true;    },  profile: null,  profile: null,

        state.error = null;

      })    clearProfile: (state) => {

      .addCase(fetchProfile.fulfilled, (state, action) => {

        state.loading = false;      state.profile = null;  loading: false,  loading: false,

        state.profile = action.payload;

        state.error = null;      state.error = null;

      })

      .addCase(fetchProfile.rejected, (state, action) => {    },  updating: false,  updating: false,

        state.loading = false;

        state.error = action.payload as string;  },

      })

});  uploading: false,  uploading: false,

      // Update profile

      .addCase(updateProfile.pending, (state) => {

        state.updating = true;

        state.error = null;export const { setProfile, setLoading, setError, clearProfile } = profileSlice.actions;  error: null,  error: null,

        state.updateSuccess = false;

      })

      .addCase(updateProfile.fulfilled, (state, action) => {

        state.updating = false;export default profileSlice.reducer;  updateSuccess: false,  updateSuccess: false,

        state.profile = action.payload;

        state.error = null;};};

        state.updateSuccess = true;

      })

      .addCase(updateProfile.rejected, (state, action) => {

        state.updating = false;// Async thunks// Async thunks

        state.error = action.payload as string;

        state.updateSuccess = false;export const fetchProfile = createAsyncThunk(export const fetchProfile = createAsyncThunk(

      })

  'profile/fetchProfile',  'profile/fetchProfile',

      // Change password

      .addCase(changePassword.pending, (state) => {  async (_, { rejectWithValue }) => {  async (_, { rejectWithValue }) => {

        state.updating = true;

        state.error = null;    try {    try {

      })

      .addCase(changePassword.fulfilled, (state) => {      const response = await profileService.getProfile();      const response = await profileService.getProfile();

        state.updating = false;

        state.updateSuccess = true;      return response.data.driver;      return response.data.driver;

        state.error = null;

      })    } catch (error: any) {    } catch (error: any) {

      .addCase(changePassword.rejected, (state, action) => {

        state.updating = false;      return rejectWithValue(error.message || 'Failed to fetch profile');      return rejectWithValue(error.message || 'Failed to fetch profile');

        state.error = action.payload as string;

      })    }    }



      // Upload profile image  }  }

      .addCase(uploadProfileImage.pending, (state) => {

        state.uploading = true;););

        state.error = null;

      })

      .addCase(uploadProfileImage.fulfilled, (state, action) => {

        state.uploading = false;export const updateProfile = createAsyncThunk(export const updateProfile = createAsyncThunk(

        state.profile = action.payload;

        state.error = null;  'profile/updateProfile',  'profile/updateProfile',

      })

      .addCase(uploadProfileImage.rejected, (state, action) => {  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {

        state.uploading = false;

        state.error = action.payload as string;    try {    try {

      });

  },      const response = await profileService.updateProfile(profileData);      const response = await profileService.updateProfile(profileData);

});

      return response.data.driver;      return response.data.driver;

export const { clearError, clearUpdateSuccess, setLoading, setUpdating } = profileSlice.actions;

    } catch (error: any) {    } catch (error: any) {

// Selectors

export const selectProfile = (state: { profile: ProfileState }) => state.profile.profile;      return rejectWithValue(error.message || 'Failed to update profile');      return rejectWithValue(error.message || 'Failed to update profile');

export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.loading;

export const selectProfileUpdating = (state: { profile: ProfileState }) => state.profile.updating;    }    }

export const selectProfileUploading = (state: { profile: ProfileState }) => state.profile.uploading;

export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;  }  }

export const selectProfileUpdateSuccess = (state: { profile: ProfileState }) => state.profile.updateSuccess;

););

export default profileSlice.reducer;


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