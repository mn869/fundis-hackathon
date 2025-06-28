import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Wrench, Loader2, AlertCircle } from 'lucide-react'
import { login, clearError } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

const Login = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  })
  const [showTestCredentials, setShowTestCredentials] = useState(false)

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.phoneNumber.trim()) {
      toast.error('Phone number is required')
      return
    }

    console.log('Submitting login form with:', formData.phoneNumber);

    try {
      const result = await dispatch(login({
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password
      })).unwrap()
      
      console.log('Login successful:', result);
      toast.success('Login successful!')
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error || 'Login failed')
    }
  }

  const handleTestLogin = (phoneNumber) => {
    setFormData({ ...formData, phoneNumber })
    setShowTestCredentials(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full">
              <Wrench className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage Fundis Booking Bot
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Login Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="phoneNumber" className="label">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="input"
                placeholder="e.g., 0712345678"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password (Optional)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                placeholder="Enter password if required"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowTestCredentials(!showTestCredentials)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {showTestCredentials ? 'Hide' : 'Show'} Test Credentials
              </button>
            </div>

            {showTestCredentials && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-3 font-medium">Demo Accounts:</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleTestLogin('0700000000')}
                    className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <span className="font-medium">Admin:</span> 0700000000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestLogin('0712345678')}
                    className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <span className="font-medium">Client:</span> 0712345678
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestLogin('0723456789')}
                    className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <span className="font-medium">Provider:</span> 0723456789
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Check that both frontend and backend servers are running.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login