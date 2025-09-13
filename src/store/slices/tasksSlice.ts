import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TasksState, Task, TaskListRequest, UpdateTaskStatusRequest } from '../../types';
import { mockTasks, mockApiDelay, generateMockId } from '../../services/mockData';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: TaskListRequest = {}, { rejectWithValue }) => {
    try {
      // MOCK FETCH TASKS - Bypass API call
      await mockApiDelay(800);
      
      let filteredTasks = [...mockTasks];
      
      // Apply filters
      if (params.status) {
        filteredTasks = filteredTasks.filter(task => task.status === params.status);
      }
      
      if (params.dateFrom || params.dateTo) {
        // For demo, just return all tasks
        // In real implementation, filter by date
      }
      
      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return filteredTasks.slice(startIndex, endIndex);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      // MOCK FETCH TASK BY ID - Bypass API call
      await mockApiDelay(500);
      
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async (request: UpdateTaskStatusRequest, { rejectWithValue }) => {
    try {
      // MOCK UPDATE TASK STATUS - Bypass API call
      await mockApiDelay(600);
      
      const task = mockTasks.find(t => t.id === request.taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      // Update task status
      const updatedTask = {
        ...task,
        status: request.status,
        notes: request.notes || task.notes,
        updatedAt: new Date().toISOString()
      };
      
      return updatedTask;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task status');
    }
  }
);

export const acceptTask = createAsyncThunk(
  'tasks/acceptTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      // MOCK ACCEPT TASK - Bypass API call
      await mockApiDelay(500);
      
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      return {
        ...task,
        status: 'in-progress' as const,
        updatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to accept task');
    }
  }
);

export const startTask = createAsyncThunk(
  'tasks/startTask',
  async (
    { taskId, location }: { taskId: string; location?: { latitude: number; longitude: number } },
    { rejectWithValue }
  ) => {
    try {
      // MOCK START TASK - Bypass API call
      await mockApiDelay(500);
      
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      return {
        ...task,
        status: 'in-progress' as const,
        updatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start task');
    }
  }
);

export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async (
    { taskId, notes, location }: { 
      taskId: string; 
      notes?: string; 
      location?: { latitude: number; longitude: number } 
    },
    { rejectWithValue }
  ) => {
    try {
      // MOCK COMPLETE TASK - Bypass API call
      await mockApiDelay(600);
      
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      return {
        ...task,
        status: 'completed' as const,
        notes: notes || task.notes,
        updatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete task');
    }
  }
);

export const cancelTask = createAsyncThunk(
  'tasks/cancelTask',
  async ({ taskId, reason }: { taskId: string; reason: string }, { rejectWithValue }) => {
    try {
      // MOCK CANCEL TASK - Bypass API call
      await mockApiDelay(500);
      
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      return {
        ...task,
        status: 'cancelled' as const,
        notes: `Cancelled: ${reason}`,
        updatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel task');
    }
  }
);

const initialState: TasksState = {
  tasks: [],
  activeTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setActiveTask: (state, action: PayloadAction<Task | null>) => {
      state.activeTask = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<TasksState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateTaskInList: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.activeTask?.id === action.payload.id) {
        state.activeTask = action.payload;
      }
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      if (state.activeTask?.id === action.payload) {
        state.activeTask = null;
      }
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
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Task by ID
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTask = action.payload;
        state.error = null;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
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
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Accept Task
    builder
      .addCase(acceptTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = action.payload;
        }
      });

    // Start Task
    builder
      .addCase(startTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.activeTask = action.payload;
      });

    // Complete Task
    builder
      .addCase(completeTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = null; // Clear active task when completed
        }
      });

    // Cancel Task
    builder
      .addCase(cancelTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = null; // Clear active task when cancelled
        }
      });
  },
});

export const {
  clearError,
  setActiveTask,
  updateFilters,
  setLoading,
  updateTaskInList,
  addTask,
  removeTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;