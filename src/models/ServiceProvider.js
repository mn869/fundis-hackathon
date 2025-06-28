const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceProvider = sequelize.define('ServiceProvider', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  services: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 50
    }
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  availability: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: { available: true, hours: '08:00-18:00' },
      tuesday: { available: true, hours: '08:00-18:00' },
      wednesday: { available: true, hours: '08:00-18:00' },
      thursday: { available: true, hours: '08:00-18:00' },
      friday: { available: true, hours: '08:00-18:00' },
      saturday: { available: true, hours: '08:00-16:00' },
      sunday: { available: false, hours: null }
    }
  },
  portfolio: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completedJobs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationDocuments: {
    type: DataTypes.JSON,
    allowNull: true
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('free', 'basic', 'premium'),
    defaultValue: 'free'
  },
  subscriptionExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  earnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = ServiceProvider;