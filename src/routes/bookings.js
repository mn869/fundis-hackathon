const express = require('express');
const { Booking, ServiceProvider, User, Payment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Get all bookings for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;

    // Determine if user is client or provider
    let bookings;
    if (req.user.role === 'client') {
      whereClause.clientId = req.user.id;
      bookings = await Booking.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: ServiceProvider,
            as: 'provider',
            include: [{ model: User, as: 'user' }]
          },
          { model: Payment, as: 'payment' }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } else {
      // For providers, find their provider profile first
      const providerProfile = await ServiceProvider.findOne({
        where: { userId: req.user.id }
      });

      if (!providerProfile) {
        return res.status(404).json({
          success: false,
          message: 'Provider profile not found'
        });
      }

      whereClause.providerId = providerProfile.id;
      bookings = await Booking.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'client' },
          { model: Payment, as: 'payment' }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    }

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
    logger.error('Fetch bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Create new booking
router.post('/', authenticate, validate('createBooking'), async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can create bookings'
      });
    }

    const { providerId, serviceType, description, scheduledDate, duration, location, priority } = req.body;

    // Verify provider exists
    const provider = await ServiceProvider.findByPk(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }

    // Create booking
    const booking = await Booking.create({
      clientId: req.user.id,
      providerId,
      serviceType,
      description,
      scheduledDate,
      duration,
      location,
      priority,
      estimatedCost: provider.hourlyRate * (duration || 1)
    });

    // Fetch complete booking data
    const completeBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: ServiceProvider,
          as: 'provider',
          include: [{ model: User, as: 'user' }]
        },
        { model: User, as: 'client' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: completeBooking }
    });

    logger.info(`New booking created: ${booking.id}`);
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// Get specific booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: ServiceProvider,
          as: 'provider',
          include: [{ model: User, as: 'user' }]
        },
        { model: User, as: 'client' },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    const hasAccess = booking.clientId === req.user.id || 
                     (booking.provider && booking.provider.userId === req.user.id) ||
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    logger.error('Fetch booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// Update booking status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const provider = await ServiceProvider.findByPk(booking.providerId);
    const canUpdate = booking.clientId === req.user.id || 
                     (provider && provider.userId === req.user.id) ||
                     req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update booking
    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = req.body.reason;
    }

    await booking.update(updateData);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });

    logger.info(`Booking ${booking.id} status updated to ${status}`);
  } catch (error) {
    logger.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
});

module.exports = router;