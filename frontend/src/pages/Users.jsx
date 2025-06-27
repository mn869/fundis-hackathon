import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, MoreVertical, User, Phone, Mail } from 'lucide-react'
import { fetchUsers, updateUserStatus, setFilters } from '../store/slices/usersSlice'
import toast from 'react-hot-toast'

const Users = () => {
  const dispatch = useDispatch()
  const { users, pagination, filters, loading, error } = useSelector((state) => state.users)
  const [searchTerm, setSearchTerm] = useState(filters.search)

  useEffect(() => {
    dispatch(fetchUsers({ 
      page: pagination.page, 
      limit: pagination.limit,
      ...filters 
    }))
  }, [dispatch, pagination.page, pagination.limit, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setFilters({ search: searchTerm }))
  }

  const handleRoleFilter = (role) => {
    dispatch(setFilters({ role: role === filters.role ? '' : role }))
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await dispatch(updateUserStatus({ 
        userId, 
        isActive: !currentStatus 
      })).unwrap()
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handlePageChange = (newPage) => {
    dispatch(fetchUsers({ 
      page: newPage, 
      limit: pagination.limit,
      ...filters 
    }))
  }

  if (loading && users.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage platform users and their accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleRoleFilter('client')}
              className={`btn ${filters.role === 'client' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Clients
            </button>
            <button
              onClick={() => handleRoleFilter('provider')}
              className={`btn ${filters.role === 'provider' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Providers
            </button>
            <button
              onClick={() => handleRoleFilter('admin')}
              className={`btn ${filters.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Admins
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {user.phoneNumber}
                    </div>
                    {user.email && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      user.role === 'admin' ? 'badge-error' :
                      user.role === 'provider' ? 'badge-warning' :
                      'badge-primary'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`badge ${
                        user.isActive ? 'badge-success' : 'badge-gray'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.isVerified && (
                        <span className="badge-primary ml-2">Verified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleStatusToggle(user.id, user.isActive)}
                      className={`btn btn-sm ${
                        user.isActive ? 'btn-error' : 'btn-success'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
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
    </div>
  )
}

export default Users