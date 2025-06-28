const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validate } = require('../utils/validation');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '7d' });
};

// Register user
router.post('/register', validate('register'), async (req, res) => {
  try {
    const { phoneNumber, name, email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { phoneNumber } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Create user
    const user = await User.create({
      phoneNumber,
      name,
      email,
      role,
      isVerified: true // For demo purposes
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

    logger.info(`New user registered: ${phoneNumber}`);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    logger.info(`Login attempt received for phone: ${phoneNumber}`);

    // Validate input
    if (!phoneNumber) {
      logger.warn('Login attempt without phone number');
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    logger.info(`Cleaned phone number: ${cleanPhoneNumber}`);

    // Find user by phone number with detailed logging
    logger.info('Searching for user in database...');
    const user = await User.findOne({ 
      where: { phoneNumber: cleanPhoneNumber },
      include: [
        {
          association: 'providerProfile',
          required: false
        }
      ]
    });

    if (!user) {
      logger.warn(`User not found for phone: ${cleanPhoneNumber}`);
      
      // Check if there are any users in the database
      const userCount = await User.count();
      logger.info(`Total users in database: ${userCount}`);
      
      if (userCount === 0) {
        logger.error('No users found in database - database may not be seeded');
        return res.status(500).json({
          success: false,
          message: 'Database not properly initialized. Please contact support.'
        });
      }
      
      // List available phone numbers for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        const allUsers = await User.findAll({
          attributes: ['phoneNumber', 'name', 'role'],
          limit: 5
        });
        logger.info('Available users for testing:');
        allUsers.forEach(u => {
          logger.info(`  - ${u.phoneNumber}: ${u.name} (${u.role})`);
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'User not found. Please check your phone number or register first.',
        hint: process.env.NODE_ENV === 'development' ? 'Try: 0700000000 (admin), 0712345678 (client), or 0723456789 (provider)' : undefined
      });
    }

    logger.info(`User found: ${user.name} (${user.role}) - Active: ${user.isActive}, Verified: ${user.isVerified}`);

    if (!user.isActive) {
      logger.warn(`Inactive user login attempt: ${cleanPhoneNumber}`);
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // For demo purposes, we don't require password verification
    // In production, you would verify the password here
    if (password && user.password) {
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        logger.warn(`Invalid password for user: ${cleanPhoneNumber}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user.id);
    logger.info(`Token generated for user: ${user.id}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

    logger.info(`User logged in successfully: ${cleanPhoneNumber} (${user.name})`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          association: 'providerProfile',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email, location } = req.body;
    
    await req.user.update({
      name,
      email,
      location
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: req.user }
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Test endpoint to check available users (development only)
router.get('/test-users', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Not found' });
    }

    const users = await User.findAll({
      attributes: ['id', 'phoneNumber', 'name', 'email', 'role', 'isActive', 'isVerified'],
      limit: 10
    });

    res.json({
      success: true,
      data: { users },
      message: 'Available test users',
      instructions: {
        admin: '0700000000',
        client: '0712345678', 
        provider: '0723456789'
      }
    });
  } catch (error) {
    logger.error('Test users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test users'
    });
  }
});

// Debug endpoint to check database connection
router.get('/debug', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Not found' });
    }

    const userCount = await User.count();
    const sampleUser = await User.findOne({
      attributes: ['phoneNumber', 'name', 'role', 'isActive', 'isVerified']
    });

    res.json({
      success: true,
      data: {
        userCount,
        sampleUser,
        databaseConnected: true,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    logger.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug check failed',
      error: error.message
    });
  }
});

module.exports = router;