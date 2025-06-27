import React from 'react'
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'

const Payments = () => {
  // Mock data for demonstration
  const paymentStats = {
    totalRevenue: 125000,
    monthlyRevenue: 25000,
    pendingPayments: 5,
    failedPayments: 2
  }

  const recentPayments = [
    {
      id: '1',
      amount: 1500,
      status: 'completed',
      method: 'mpesa',
      receipt: 'QK12345678',
      client: 'John Doe',
      service: 'Plumbing',
      date: '2024-01-15'
    },
    {
      id: '2',
      amount: 2000,
      status: 'pending',
      method: 'mpesa',
      client: 'Jane Smith',
      service: 'Electrical',
      date: '2024-01-15'
    },
    {
      id: '3',
      amount: 800,
      status: 'failed',
      method: 'mpesa',
      client: 'Bob Wilson',
      service: 'Cleaning',
      date: '2024-01-14'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'badge-success'
      case 'pending': return 'badge-warning'
      case 'failed': return 'badge-error'
      default: return 'badge-gray'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Monitor payment transactions and revenue</p>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {paymentStats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-success-50 text-success-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {paymentStats.monthlyRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warning-50 text-warning-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentStats.pendingPayments}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-error-50 text-error-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentStats.failedPayments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
          <button className="btn-secondary">
            Export Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.receipt || payment.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.method.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    KES {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">M-Pesa</h4>
                <p className="text-sm text-gray-500">Mobile Money</p>
              </div>
              <span className="badge-success">Active</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              95% of transactions
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Cash</h4>
                <p className="text-sm text-gray-500">On Delivery</p>
              </div>
              <span className="badge-warning">Limited</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              5% of transactions
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                <p className="text-sm text-gray-500">Direct Transfer</p>
              </div>
              <span className="badge-gray">Coming Soon</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              0% of transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payments