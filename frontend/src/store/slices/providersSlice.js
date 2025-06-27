import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchProviders = createAsyncThunk(
  'providers/fetchProviders',
  async ({ page = 1, limit = 20, service, location }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit })
      if (service) params.append('service', service)
      if (location) params.append('location', location)
      
      const response = await api.get(`/providers?${params}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch providers')
    }
  }
)

export const verifyProvider = createAsyncThunk(
  'providers/verify',
  async ({ providerId, isVerified }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/providers/${providerId}/verify`, { isVerified })
      return { providerId, isVerified, provider: response.data.data.provider }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify provider')
    }
  }
)

const initialState = {
  providers: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  filters: {
    service: '',
    location: '',
  },
  loading: false,
  error: null,
}

const providersSlice = createSlice({
  name: 'providers',
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
      // Fetch Providers
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false
        state.providers = action.payload.providers
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Verify Provider
      .addCase(verifyProvider.fulfilled, (state, action) => {
        const { providerId, isVerified } = action.payload
        const providerIndex = state.providers.findIndex(provider => provider.id === providerId)
        if (providerIndex !== -1) {
          state.providers[providerIndex].isVerified = isVerified
        }
      })
  },
})

export const { setFilters, clearError } = providersSlice.actions
export default providersSlice.reducer