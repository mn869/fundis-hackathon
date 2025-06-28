const logger = require('../utils/logger');

// Mock Redis client for development
class MockRedisClient {
  constructor() {
    this.data = new Map();
  }

  async connect() {
    logger.info('Mock Redis connected successfully');
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async set(key, value) {
    this.data.set(key, value);
    return 'OK';
  }

  async setEx(key, seconds, value) {
    this.data.set(key, value);
    // In a real implementation, you'd set expiration
    setTimeout(() => {
      this.data.delete(key);
    }, seconds * 1000);
    return 'OK';
  }

  async del(key) {
    return this.data.delete(key) ? 1 : 0;
  }

  async ping() {
    return 'PONG';
  }
}

let client;

const connectRedis = async () => {
  try {
    client = new MockRedisClient();
    await client.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!client) {
    throw new Error('Redis client not initialized');
  }
  return client;
};

module.exports = { connectRedis, getRedisClient };