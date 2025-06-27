import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, limit = 20, role, search }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit })
      if (role) params.append('role', role)
      if (search) params.append('search', search)
      
      const response = await api.get(`/admin/users?${params}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { isActive })
      return { userId, isActive, user: response.data.data.user }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status')
    }
  }
)

const initialState = {
  users: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  filters: {
    role: '',
    search: '',
  },
  loading: false,
  error: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload
        const userIndex = state.users.findIndex(user => user.id === userId)
        if (userIndex !== -1) {
          state.users[userIndex].isActive = isActive
        }
      })
  },
})

export const { setFilters, clearError } = usersSlice.actions
export default usersSlice.reducer