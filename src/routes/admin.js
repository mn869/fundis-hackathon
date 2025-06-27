const express = require('express');
const { User, ServiceProvider, Booking, Payment } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      totalRevenue,
      activeBookings,
      completedBookings
    ] = await Promise.all([
      User.count(),
      ServiceProvider.count(),
      Booking.count(),
      Payment.sum('platformFee', { where: { status: 'completed' } }),
      Booking.count({ where: { status: ['pending', 'confirmed', 'in_progress'] } }),
      Booking.count({ where: { status: 'completed' } })
    ]);

    // Monthly statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [
      monthlyUsers,
      monthlyBookings,
      monthlyRevenue
    ] = await Promise.all([
      User.count({ where: { createdAt: { [require('sequelize').Op.gte]: currentMonth } } }),
      Booking.count({ where: { createdAt: { [require('sequelize').Op.gte]: currentMonth } } }),
      Payment.sum('platformFee', { 
        where: { 
          status: 'completed',
          createdAt: { [require('sequelize').Op.gte]: currentMonth }
        } 
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProviders,
          totalBookings,
          totalRevenue: totalRevenue || 0,
          activeBookings,
          completedBookings
        },
        monthly: {
          newUsers: monthlyUsers,
          newBookings: monthlyBookings,
          revenue: monthlyRevenue || 0
        }
      }
    });
  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { phoneNumber: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ServiceProvider,
          as: 'providerProfile',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(users.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Admin users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isActive });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });

    logger.info(`User ${user.id} ${isActive ? 'activated' : 'deactivated'} by admin ${req.user.id}`);
  } catch (error) {
    logger.error('Admin user status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// Verify service provider
router.put('/providers/:id/verify', async (req, res) => {
  try {
    const { isVerified } = req.body;
    const provider = await ServiceProvider.findByPk(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    await provider.update({ isVerified });

    res.json({
      success: true,
      message: `Provider ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: { provider }
    });

    logger.info(`Provider ${provider.id} ${isVerified ? 'verified' : 'unverified'} by admin ${req.user.id}`);
  } catch (error) {
    logger.error('Admin provider verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update provider verification'
    });
  }
});

// Get all bookings with filters
router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (dateFrom && dateTo) {
      whereClause.createdAt = {
        [require('sequelize').Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }

    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'phoneNumber'] },
        {
          model: ServiceProvider,
          as: 'provider',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phoneNumber'] }]
        },
        { model: Payment, as: 'payment' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        bookings: bookings.rows,
        pagination: {
          total: bookings.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(bookings.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Admin bookings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

module.exports = router;