const axios = require('axios');
const { User, ServiceProvider, Booking } = require('../../models');
const { getRedisClient } = require('../../config/redis');
const logger = require('../../utils/logger');
const messageHandler = require('./messageHandler');

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  async sendMessage(to, message) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp message sent to ${to}`);
      return response.data;
    } catch (error) {
      logger.error('WhatsApp send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendInteractiveMessage(to, message) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: message
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp interactive message sent to ${to}`);
      return response.data;
    } catch (error) {
      logger.error('WhatsApp send interactive message error:', error.response?.data || error.message);
      throw error;
    }
  }

  async handleIncomingMessage(message, contact) {
    try {
      const phoneNumber = contact.wa_id;
      const messageText = message.text?.body?.toLowerCase().trim();

      if (!messageText) return;

      // Find or create user
      let user = await User.findOne({ where: { whatsappId: phoneNumber } });
      
      if (!user) {
        // New user - start registration process
        await this.startRegistration(phoneNumber, contact.profile?.name || 'User');
        return;
      }

      // Handle message based on user context
      await messageHandler.handleMessage(user, messageText, phoneNumber);

    } catch (error) {
      logger.error('Handle incoming message error:', error);
      await this.sendMessage(message.from, 'Sorry, something went wrong. Please try again later.');
    }
  }

  async startRegistration(phoneNumber, name) {
    try {
      const redis = getRedisClient();
      await redis.setEx(`registration:${phoneNumber}`, 300, JSON.stringify({ step: 'name', name }));

      const welcomeMessage = `Welcome to Fundis Booking Bot! 🔧

I'm here to help you connect with trusted local service providers.

To get started, please tell me your full name:`;

      await this.sendMessage(phoneNumber, welcomeMessage);
    } catch (error) {
      logger.error('Start registration error:', error);
    }
  }

  async sendBookingConfirmation(booking, clientPhone, providerPhone) {
    try {
      const clientMessage = `✅ Booking Confirmed!

Service: ${booking.serviceType}
Date: ${new Date(booking.scheduledDate).toLocaleDateString()}
Provider: ${booking.provider.user.name}
Location: ${booking.location.address}

Your booking ID: ${booking.id}

The service provider will contact you soon!`;

      const providerMessage = `🔔 New Booking Request!

Service: ${booking.serviceType}
Client: ${booking.client.name}
Date: ${new Date(booking.scheduledDate).toLocaleDateString()}
Location: ${booking.location.address}

Booking ID: ${booking.id}

Please confirm your availability by replying:
- Type "ACCEPT ${booking.id}" to accept
- Type "DECLINE ${booking.id}" to decline`;

      await Promise.all([
        this.sendMessage(clientPhone, clientMessage),
        this.sendMessage(providerPhone, providerMessage)
      ]);
    } catch (error) {
      logger.error('Send booking confirmation error:', error);
    }
  }

  async sendPaymentReminder(booking, clientPhone) {
    try {
      const message = `💳 Payment Reminder

Your booking is confirmed but payment is still pending.

Booking: ${booking.serviceType}
Amount: KES ${booking.estimatedCost}
Due: ${new Date(booking.scheduledDate).toLocaleDateString()}

Please complete payment to secure your booking.

Reply "PAY ${booking.id}" to proceed with M-Pesa payment.`;

      await this.sendMessage(clientPhone, message);
    } catch (error) {
      logger.error('Send payment reminder error:', error);
    }
  }
}

module.exports = new WhatsAppService();