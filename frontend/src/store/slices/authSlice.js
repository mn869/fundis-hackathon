import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with phone:', phoneNumber);
      
      const response = await api.post('/auth/login', { 
        phoneNumber: phoneNumber.trim(), 
        password 
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        console.log('Token saved to localStorage');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (error.code === 'ECONNREFUSED') {
        return rejectWithValue('Cannot connect to server. Please make sure the backend is running.');
      } else {
        return rejectWithValue(error.message || 'Login failed');
      }
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  return null
})

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile')
      return response.data.data.user
    } catch (error) {
      console.error('Profile fetch error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
        console.log('Login pending...');
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        console.log('Login fulfilled:', action.payload.user.name);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
        console.error('Login rejected:', action.payload);
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // If profile fetch fails, likely token is invalid
        if (action.payload?.includes('token') || action.payload?.includes('401')) {
          state.isAuthenticated = false
          state.token = null
          localStorage.removeItem('token')
        }
      })
  },
})

export const { clearError, setCredentials, resetAuth } = authSlice.actions
export default authSlice.reducer