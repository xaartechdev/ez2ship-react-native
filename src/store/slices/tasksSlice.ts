import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tasksService, Task, TasksResponse } from '../../services/tasksService';

export interface TasksState {
  tasks: Task[];
  // Add cached tasks by status for location tracking
  pendingTasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  filter: 'all' | 'pending' | 'in_progress' | 'completed';
  search: string;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
  };
  summary: {
    pending: number;
    in_progress: number;
    completed: number;
  };
}

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: {
    status?: 'all' | 'pending' | 'in_progress' | 'completed';
    search?: string;
    per_page?: number;
    page?: number;
    loadMore?: boolean; // Indicates if this is a load more operation
  } = {}, { rejectWithValue }) => {
    try {
      const response = await tasksService.getTasks(params);
      
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      
      return { ...response, isLoadMore: params.loadMore || false };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

// Background fetch for location tracking - doesn't affect UI loading state
export const fetchTasksForLocationTracking = createAsyncThunk(
  'tasks/fetchTasksForLocationTracking',
  async (status: 'pending' | 'in_progress' | 'completed', { rejectWithValue }) => {
    try {
      console.log(`🔍 Background fetching ${status} tasks for location tracking...`);
      const response = await tasksService.getTasks({ status, per_page: 100 });
      
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      
      console.log(`✅ Fetched ${response.data?.tasks?.length || 0} ${status} tasks for tracking`);
      return { ...response, status };
    } catch (error: any) {
      console.error(`❌ Failed to fetch ${status} tasks for tracking:`, error);
      return rejectWithValue(error.message || `Failed to fetch ${status} tasks`);
    }
  }
);

export const fetchTaskDetails = createAsyncThunk(
  'tasks/fetchTaskDetails',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const response = await tasksService.getTaskDetails(taskId);
      
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch task details');
    }
  }
);

export const acceptTask = createAsyncThunk(
  'tasks/acceptTask',
  async (taskId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await tasksService.acceptTask(taskId);
      
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      
      // Refresh tasks after accepting
      dispatch(fetchTasks({}));
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to accept task');
    }
  }
);

export const rejectTask = createAsyncThunk(
  'tasks/rejectTask',
  async ({ taskId, reason }: { taskId: number; reason: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await tasksService.rejectTask(taskId, reason);
      
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      
      // Refresh tasks after rejecting
      dispatch(fetchTasks({}));
      
      return { taskId, message: response.message };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status, notes, location }: {
    taskId: number;
    status: 'pending' | 'assigned' | 'in_progress' | 'picked_up' | 'in_transit' | 'arrived_at_destination' | 'completed' | 'delivered' | 'cancelled';
    notes?: string;
    location?: { latitude: number; longitude: number };
  }, { rejectWithValue, dispatch }) => {
    try {
      const response = await tasksService.updateTaskStatus(taskId, {
        status,
        notes,
        location,
      });
      
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      
      // Refresh tasks after status update
      dispatch(fetchTasks({}));
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task status');
    }
  }
);

const initialState: TasksState = {
  tasks: [],
  // Initialize cached task arrays for location tracking
  pendingTasks: [],
  inProgressTasks: [],
  completedTasks: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  filter: 'all',
  search: '',
  pagination: {
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    has_more: false,
  },
  summary: {
    pending: 0,
    in_progress: 0,
    completed: 0,
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action: PayloadAction<'all' | 'pending' | 'in_progress' | 'completed'>) => {
      state.filter = action.payload;
      // Reset pagination when filter changes
      state.pagination.current_page = 1;
      state.tasks = [];
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      // Reset pagination when search changes
      state.pagination.current_page = 1;
      state.tasks = [];
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.error = null;
      state.pagination.current_page = 1;
    },
    resetPagination: (state) => {
      state.pagination.current_page = 1;
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state, action) => {
        const isLoadMore = (action.meta.arg as any)?.loadMore;
        if (isLoadMore) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
          state.tasks = []; // Clear tasks for fresh load
        }
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { isLoadMore, ...response } = action.payload as any;
        const requestStatus = (action.meta.arg as any)?.status;
        
        state.isLoading = false;
        state.isLoadingMore = false;
        
        if (response.data) {
          if (isLoadMore) {
            // Append new tasks for load more
            state.tasks = [...state.tasks, ...response.data.tasks];
          } else {
            // Replace tasks for fresh load
            state.tasks = response.data.tasks;
          }
          
          // CACHE TASKS BY STATUS for location tracking persistence
          if (requestStatus === 'pending') {
            state.pendingTasks = response.data.tasks;
          } else if (requestStatus === 'in_progress') {
            state.inProgressTasks = response.data.tasks;
          } else if (requestStatus === 'completed') {
            state.completedTasks = response.data.tasks;
          }
          
          state.pagination = {
            ...response.data.pagination,
            has_more: response.data.pagination.current_page < response.data.pagination.last_page
          };
          
          // Use summary from API response instead of calculating locally
          if (response.data.summary) {
            state.summary = response.data.summary;
          }
        }
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload as string;
      });

    // Background fetch for location tracking
    builder
      .addCase(fetchTasksForLocationTracking.fulfilled, (state, action) => {
        const response = action.payload as any;
        const status = response.status;
        
        if (response.data) {
          // Cache tasks by status for location tracking - don't affect current UI
          if (status === 'pending') {
            state.pendingTasks = response.data.tasks;
            console.log(`📦 Cached ${response.data.tasks.length} pending tasks for tracking`);
          } else if (status === 'in_progress') {
            state.inProgressTasks = response.data.tasks;
            console.log(`📦 Cached ${response.data.tasks.length} in-progress tasks for tracking`);
          } else if (status === 'completed') {
            state.completedTasks = response.data.tasks;
            console.log(`📦 Cached ${response.data.tasks.length} completed tasks for tracking`);
          }
        }
      })
      .addCase(fetchTasksForLocationTracking.rejected, (state, action) => {
        console.error('❌ Background task fetch failed:', action.payload);
        // Don't set UI error state for background operations
      });

    // Fetch Task Details
    builder
      .addCase(fetchTaskDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          // Update the task in the list with detailed info
          const taskIndex = state.tasks.findIndex(task => task.id === action.payload!.id);
          if (taskIndex !== -1) {
            state.tasks[taskIndex] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(fetchTaskDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Accept Task
    builder
      .addCase(acceptTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(acceptTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reject Task
    builder
      .addCase(rejectTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(rejectTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Task Status
    builder
      .addCase(updateTaskStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilter, setSearch, clearTasks, resetPagination } = tasksSlice.actions;
export default tasksSlice.reducer;