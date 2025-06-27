import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { fetchDashboardStats } from '../store/slices/dashboardSlice'

const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
  }

  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              <TrendingUp className={`h-4 w-4 mr-1 ${
                changeType === 'increase' ? 'text-success-500' : 'text-error-500'
              }`} />
              <span className={`text-sm ${
                changeType === 'increase' ? 'text-success-600' : 'text-error-600'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { stats, loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
        Error loading dashboard: {error}
      </div>
    )
  }

  const { overview, monthly } = stats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to Fundis Booking Bot admin dashboard</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={overview.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Service Providers"
          value={overview.totalProviders?.toLocaleString() || '0'}
          icon={UserCheck}
          color="success"
        />
        <StatCard
          title="Total Bookings"
          value={overview.totalBookings?.toLocaleString() || '0'}
          icon={Calendar}
          color="warning"
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${overview.totalRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          color="primary"
        />
      </div>

      {/* Booking Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Active Bookings"
          value={overview.activeBookings?.toLocaleString() || '0'}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Completed Bookings"
          value={overview.completedBookings?.toLocaleString() || '0'}
          icon={CheckCircle}
          color="success"
        />
      </div>

      {/* Monthly Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {monthly.newUsers?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">New Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">
              {monthly.newBookings?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">New Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600">
              KES {monthly.revenue?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-primary">
            View All Users
          </button>
          <button className="btn-secondary">
            Manage Providers
          </button>
          <button className="btn-secondary">
            Review Bookings
          </button>
          <button className="btn-secondary">
            Payment Reports
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">WhatsApp API</span>
            <span className="badge-success">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">M-Pesa Integration</span>
            <span className="badge-success">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Database</span>
            <span className="badge-success">Healthy</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Redis Cache</span>
            <span className="badge-success">Running</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard