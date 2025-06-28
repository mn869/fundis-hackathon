const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const authRoutes = require('../../src/routes/auth');
const bookingRoutes = require('../../src/routes/bookings');
const providerRoutes = require('../../src/routes/providers');
const paymentRoutes = require('../../src/routes/payments');
const webhookRoutes = require('../../src/routes/webhook');
const adminRoutes = require('../../src/routes/admin');
const healthRoutes = require('../../src/routes/health');

// Import middleware
const errorHandler = require('../../src/middleware/errorHandler');

// Import database connection
const { connectDatabase } = require('../../src/config/database');
const { connectRedis } = require('../../src/config/redis');

const app = express();

// Initialize database connections
let dbInitialized = false;

const initializeConnections = async () => {
  if (!dbInitialized) {
    try {
      await connectDatabase();
      await connectRedis();
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize connections:', error);
    }
  }
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Initialize connections middleware
app.use(async (req, res, next) => {
  await initializeConnections();
  next();
});

// API Routes
app.use('/auth', authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/providers', providerRoutes);
app.use('/payments', paymentRoutes);
app.use('/webhook', webhookRoutes);
app.use('/admin', adminRoutes);
app.use('/health', healthRoutes);

// API documentation route
app.get('/docs', (req, res) => {
  res.json({
    message: 'Fundis Booking Bot API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      bookings: '/api/bookings',
      providers: '/api/providers',
      payments: '/api/payments',
      webhook: '/api/webhook',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

module.exports.handler = serverless(app);