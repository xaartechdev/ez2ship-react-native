import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import tasksSlice from './slices/tasksSlice';
import ordersSlice from './slices/ordersSlice';
import notificationsSlice from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tasks: tasksSlice,
    orders: ordersSlice,
    notifications: notificationsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;