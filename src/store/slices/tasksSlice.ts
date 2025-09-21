import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tasksService, Task, TasksResponse } from '../../services/tasksService';

export interface TasksState {
  tasks: Task[];
  isLoading: boolean;
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
  } = {}, { rejectWithValue }) => {
    try {
      const response = await tasksService.getTasks(params);
      
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
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
    status: string;
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
  isLoading: false,
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
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.tasks = action.payload.data.tasks;
          state.pagination = {
            ...action.payload.data.pagination,
            has_more: action.payload.data.pagination.current_page < action.payload.data.pagination.last_page
          };
          
          // Calculate summary from tasks
          state.summary = {
            pending: action.payload.data.tasks.filter(t => t.status === 'pending').length,
            in_progress: action.payload.data.tasks.filter(t => t.status === 'in_progress').length,
            completed: action.payload.data.tasks.filter(t => t.status === 'delivered').length,
          };
        }
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
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

export const { clearError, setFilter, setSearch, clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;