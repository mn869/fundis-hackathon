import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import dashboardSlice from './slices/dashboardSlice'
import usersSlice from './slices/usersSlice'
import providersSlice from './slices/providersSlice'
import bookingsSlice from './slices/bookingsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    users: usersSlice,
    providers: providersSlice,
    bookings: bookingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch