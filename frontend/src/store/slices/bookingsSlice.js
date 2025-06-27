import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async ({ page = 1, limit = 20, status, dateFrom, dateTo }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit })
      if (status) params.append('status', status)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      
      const response = await api.get(`/admin/bookings?${params}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

const initialState = {
  bookings: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  filters: {
    status: '',
    dateFrom: '',
    dateTo: '',
  },
  loading: false,
  error: null,
}

const bookingsSlice = createSlice({
  name: 'bookings',
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
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload.bookings
        state.pagination = action.payload.pagination
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, clearError } = bookingsSlice.actions
export default bookingsSlice.reducer