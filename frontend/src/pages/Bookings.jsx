import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react'
import { fetchBookings, setFilters } from '../store/slices/bookingsSlice'

const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-primary',
  in_progress: 'badge-primary',
  completed: 'badge-success',
  cancelled: 'badge-error'
}

const Bookings = () => {
  const dispatch = useDispatch()
  const { bookings, pagination, filters, loading, error } = useSelector((state) => state.bookings)

  useEffect(() => {
    dispatch(fetchBookings({ 
      page: pagination.page, 
      limit: pagination.limit,
      ...filters 
    }))
  }, [dispatch, pagination.page, pagination.limit, filters])

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status: status === filters.status ? '' : status }))
  }

  const handlePageChange = (newPage) => {
    dispatch(fetchBookings({ 
      page: newPage, 
      limit: pagination.limit,
      ...filters 
    }))
  }

  if (loading && bookings.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Monitor and manage all platform bookings</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('pending')}
            className={`btn ${filters.status === 'pending' ? 'btn-warning' : 'btn-secondary'}`}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusFilter('confirmed')}
            className={`btn ${filters.status === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Confirmed
          </button>
          <button
            onClick={() => handleStatusFilter('in_progress')}
            className={`btn ${filters.status === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusFilter('completed')}
            className={`btn ${filters.status === 'completed' ? 'btn-success' : 'btn-secondary'}`}
          >
            Completed
          </button>
          <button
            onClick={() => handleStatusFilter('cancelled')}
            className={`btn ${filters.status === 'cancelled' ? 'btn-error' : 'btn-secondary'}`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.serviceType}
                  </h3>
                  <span className={`badge ${statusColors[booking.status]}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">
                  {booking.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">Client</div>
                      <div>{booking.client?.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">Provider</div>
                      <div>{booking.provider?.user?.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">Scheduled</div>
                      <div>{new Date(booking.scheduledDate).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">Cost</div>
                      <div>KES {booking.estimatedCost || booking.finalCost || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{booking.location?.address}</span>
                </div>

                {booking.payment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Payment Status:</span>
                      <span className={`badge ${
                        booking.payment.status === 'completed' ? 'badge-success' :
                        booking.payment.status === 'failed' ? 'badge-error' :
                        'badge-warning'
                      }`}>
                        {booking.payment.status}
                      </span>
                    </div>
                    {booking.payment.mpesaReceiptNumber && (
                      <div className="mt-1 text-xs text-gray-500">
                        Receipt: {booking.payment.mpesaReceiptNumber}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Created: {new Date(booking.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                ID: {booking.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No bookings found.</p>
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

export default Bookings