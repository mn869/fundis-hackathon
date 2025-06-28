import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
  timeout: 10000,
  // Add these headers to handle CORS and mixed content issues
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow mixed content (HTTPS frontend to HTTP backend in development)
  withCredentials: false,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.baseURL)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Response Error:', error)
    
    // Handle network errors specifically
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      const errorMessage = 'Cannot connect to server. Please make sure the backend server is running on http://localhost:3000'
      toast.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    
    const message = error.response?.data?.message || 'An error occurred'
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      // Network error or server not responding
      toast.error('Cannot connect to server. Please check if the backend is running.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api