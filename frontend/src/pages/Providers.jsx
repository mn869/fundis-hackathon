import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Star, MapPin, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import { fetchProviders, verifyProvider, setFilters } from '../store/slices/providersSlice'
import toast from 'react-hot-toast'

const Providers = () => {
  const dispatch = useDispatch()
  const { providers, pagination, filters, loading, error } = useSelector((state) => state.providers)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchProviders({ 
      page: pagination.page, 
      limit: pagination.limit,
      ...filters 
    }))
  }, [dispatch, pagination.page, pagination.limit, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ service: searchTerm }))
  }

  const handleVerificationToggle = async (providerId, currentStatus) => {
    try {
      await dispatch(verifyProvider({ 
        providerId, 
        isVerified: !currentStatus 
      })).unwrap()
      toast.success(`Provider ${!currentStatus ? 'verified' : 'unverified'} successfully`)
    } catch (error) {
      toast.error('Failed to update provider verification')
    }
  }

  const handlePageChange = (newPage) => {
    dispatch(fetchProviders({ 
      page: newPage, 
      limit: pagination.limit,
      ...filters 
    }))
  }

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600">Manage and verify service providers on the platform</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by service type..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <div key={provider.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {provider.user?.name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {provider.user?.name || 'Unknown Provider'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {provider.businessName || 'Individual Provider'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {provider.isVerified ? (
                  <CheckCircle className="h-5 w-5 text-success-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-error-500" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 mr-2 text-warning-500" />
                <span>{provider.rating || 0}/5</span>
                <span className="ml-2">({provider.totalReviews || 0} reviews)</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>KES {provider.hourlyRate || 0}/hour</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{provider.user?.location?.address || 'Location not set'}</span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.services?.slice(0, 3).map((service, index) => (
                    <span key={index} className="badge-primary text-xs">
                      {service}
                    </span>
                  ))}
                  {provider.services?.length > 3 && (
                    <span className="badge-gray text-xs">
                      +{provider.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {provider.completedJobs || 0} jobs completed
                  </div>
                  <button
                    onClick={() => handleVerificationToggle(provider.id, provider.isVerified)}
                    className={`btn btn-sm ${
                      provider.isVerified ? 'btn-error' : 'btn-success'
                    }`}
                  >
                    {provider.isVerified ? 'Unverify' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {providers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No service providers found.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Providers