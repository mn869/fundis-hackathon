import React, { useState } from 'react'
import { Save, Bell, Shield, Database, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [settings, setSettings] = useState({
    // WhatsApp Settings
    whatsappEnabled: true,
    whatsappWebhookUrl: 'https://yourdomain.com/api/webhook/whatsapp',
    whatsappVerifyToken: 'your_verify_token',
    
    // M-Pesa Settings
    mpesaEnabled: true,
    mpesaShortcode: '174379',
    mpesaEnvironment: 'sandbox',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Platform Settings
    platformFeeRate: 5,
    autoVerifyProviders: false,
    requirePaymentUpfront: true,
    maxBookingsPerDay: 10
  })

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure platform settings and integrations</p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* WhatsApp Integration */}
      <div className="card">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">WhatsApp Integration</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable WhatsApp Bot</label>
              <p className="text-sm text-gray-500">Allow users to interact via WhatsApp</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsappEnabled}
                onChange={(e) => handleChange('whatsappEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div>
            <label className="label">Webhook URL</label>
            <input
              type="url"
              className="input"
              value={settings.whatsappWebhookUrl}
              onChange={(e) => handleChange('whatsappWebhookUrl', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Verify Token</label>
            <input
              type="text"
              className="input"
              value={settings.whatsappVerifyToken}
              onChange={(e) => handleChange('whatsappVerifyToken', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* M-Pesa Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-success-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">M-Pesa Integration</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable M-Pesa Payments</label>
              <p className="text-sm text-gray-500">Accept payments via M-Pesa</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mpesaEnabled}
                onChange={(e) => handleChange('mpesaEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div>
            <label className="label">Business Shortcode</label>
            <input
              type="text"
              className="input"
              value={settings.mpesaShortcode}
              onChange={(e) => handleChange('mpesaShortcode', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Environment</label>
            <select
              className="input"
              value={settings.mpesaEnvironment}
              onChange={(e) => handleChange('mpesaEnvironment', e.target.value)}
            >
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-warning-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-sm text-gray-500">Send email alerts for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
              <p className="text-sm text-gray-500">Send SMS alerts via Africa's Talking</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
              <p className="text-sm text-gray-500">Browser push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="label">Platform Fee Rate (%)</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              className="input"
              value={settings.platformFeeRate}
              onChange={(e) => handleChange('platformFeeRate', parseFloat(e.target.value))}
            />
            <p className="text-sm text-gray-500 mt-1">
              Percentage fee charged on each transaction
            </p>
          </div>

          <div>
            <label className="label">Max Bookings Per Day</label>
            <input
              type="number"
              min="1"
              max="100"
              className="input"
              value={settings.maxBookingsPerDay}
              onChange={(e) => handleChange('maxBookingsPerDay', parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-verify Providers</label>
              <p className="text-sm text-gray-500">Automatically verify new service providers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoVerifyProviders}
                onChange={(e) => handleChange('autoVerifyProviders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Require Payment Upfront</label>
              <p className="text-sm text-gray-500">Require payment before service confirmation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requirePaymentUpfront}
                onChange={(e) => handleChange('requirePaymentUpfront', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings