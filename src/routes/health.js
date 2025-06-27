const express = require('express');
const { sequelize } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const router = express.Router();

// General health check
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Redis health check
router.get('/redis', async (req, res) => {
  try {
    const client = getRedisClient();
    await client.ping();
    res.json({
      status: 'OK',
      redis: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Redis health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      redis: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// WhatsApp API health check
router.get('/whatsapp', async (req, res) => {
  try {
    // Simple check to see if WhatsApp credentials are configured
    const isConfigured = !!(
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    );

    res.json({
      status: isConfigured ? 'OK' : 'WARNING',
      whatsapp: isConfigured ? 'Configured' : 'Not Configured',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WhatsApp health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      whatsapp: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;