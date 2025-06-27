const express = require('express');
const { ServiceProvider, User, Review, Booking } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Get all service providers
router.get('/', async (req, res) => {
  try {
    const { 
      service, 
      location, 
      minRating = 0, 
      maxRate, 
      page = 1, 
      limit = 10,
      sortBy = 'rating'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isVerified: true };

    // Filter by service
    if (service) {
      whereClause.services = { [require('sequelize').Op.contains]: [service] };
    }

    // Filter by hourly rate
    if (maxRate) {
      whereClause.hourlyRate = { [require('sequelize').Op.lte]: maxRate };
    }

    // Filter by rating
    if (minRating > 0) {
      whereClause.rating = { [require('sequelize').Op.gte]: minRating };
    }

    // Sorting options
    const orderOptions = {
      rating: [['rating', 'DESC']],
      price: [['hourlyRate', 'ASC']],
      experience: [['experience', 'DESC']],
      reviews: [['totalReviews', 'DESC']]
    };

    const providers = await ServiceProvider.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profileImage', 'location']
        }
      ],
      order: orderOptions[sortBy] || orderOptions.rating,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        providers: providers.rows,
        pagination: {
          total: providers.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(providers.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Fetch providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service providers'
    });
  }
});

// Get specific provider
router.get('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profileImage', 'location', 'createdAt']
        },
        {
          model: Review,
          as: 'providerReviews',
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['name', 'profileImage']
            }
          ],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    res.json({
      success: true,
      data: { provider }
    });
  } catch (error) {
    logger.error('Fetch provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service provider'
    });
  }
});

// Create or update provider profile
router.post('/profile', authenticate, authorize('provider'), validate('updateProvider'), async (req, res) => {
  try {
    const {
      businessName,
      description,
      services,
      skills,
      experience,
      hourlyRate,
      availability
    } = req.body;

    let provider = await ServiceProvider.findOne({
      where: { userId: req.user.id }
    });

    if (provider) {
      // Update existing profile
      await provider.update({
        businessName,
        description,
        services,
        skills,
        experience,
        hourlyRate,
        availability
      });
    } else {
      // Create new profile
      provider = await ServiceProvider.create({
        userId: req.user.id,
        businessName,
        description,
        services,
        skills,
        experience,
        hourlyRate,
        availability
      });
    }

    // Fetch complete provider data
    const completeProvider = await ServiceProvider.findByPk(provider.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'profileImage']
        }
      ]
    });

    res.json({
      success: true,
      message: provider ? 'Provider profile updated successfully' : 'Provider profile created successfully',
      data: { provider: completeProvider }
    });

    logger.info(`Provider profile ${provider ? 'updated' : 'created'}: ${req.user.id}`);
  } catch (error) {
    logger.error('Provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save provider profile'
    });
  }
});

// Get provider dashboard stats
router.get('/dashboard/stats', authenticate, authorize('provider'), async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({
      where: { userId: req.user.id }
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    // Get booking statistics
    const totalBookings = await Booking.count({
      where: { providerId: provider.id }
    });

    const completedBookings = await Booking.count({
      where: { 
        providerId: provider.id,
        status: 'completed'
      }
    });

    const pendingBookings = await Booking.count({
      where: { 
        providerId: provider.id,
        status: 'pending'
      }
    });

    const thisMonthBookings = await Booking.count({
      where: { 
        providerId: provider.id,
        createdAt: {
          [require('sequelize').Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Calculate completion rate
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalBookings,
          completedBookings,
          pendingBookings,
          thisMonthBookings,
          completionRate: parseFloat(completionRate),
          rating: provider.rating,
          totalReviews: provider.totalReviews,
          earnings: provider.earnings
        }
      }
    });
  } catch (error) {
    logger.error('Provider dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

module.exports = router;