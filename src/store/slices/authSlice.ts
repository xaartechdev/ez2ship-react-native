import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginRequest, LoginResponse } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockApiDelay } from '../../services/mockData';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      // MOCK LOGIN - Bypass API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000)); // Simulate API delay
      
      // Mock user data
      const mockResponse: LoginResponse = {
        user: {
          id: '1',
          email: credentials.email,
          name: 'John Smith',
          phone: '+1 (555) 123-4567',
          profileImage: undefined,
          driverLicense: 'DL123456789',
          vehicleInfo: {
            type: 'car',
            model: 'Toyota Camry',
            year: 2022,
            plateNumber: 'ABC123',
            color: 'White',
            capacity: '5 passengers'
          },
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'mock-jwt-token-12345',
        refreshToken: 'mock-refresh-token-67890',
        expiresIn: 3600
      };

      await AsyncStorage.setItem('token', mockResponse.token);
      await AsyncStorage.setItem('refreshToken', mockResponse.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockResponse.user));
      return mockResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // MOCK LOGOUT - Bypass API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // Simulate API delay
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      // MOCK REFRESH TOKEN - Bypass API call
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // Simulate API delay
      
      // Mock refresh response
      const mockResponse = {
        token: 'mock-new-jwt-token-' + Date.now(),
        refreshToken: 'mock-new-refresh-token-' + Date.now(),
        expiresIn: 3600
      };
      
      await AsyncStorage.setItem('token', mockResponse.token);
      return mockResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userString = await AsyncStorage.getItem('user');
      
      if (!token || !userString) {
        throw new Error('No stored authentication data');
      }
      
      const user = JSON.parse(userString);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load user data');
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Load User from Storage
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;