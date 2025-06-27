const { User, ServiceProvider, Booking } = require('../../models');
const { getRedisClient } = require('../../config/redis');
const whatsappService = require('./index');
const mpesaService = require('../mpesa');
const logger = require('../../utils/logger');

class MessageHandler {
  async handleMessage(user, messageText, phoneNumber) {
    try {
      const redis = getRedisClient();
      const userContext = await redis.get(`context:${user.id}`);
      
      // Check for specific commands first
      if (messageText.startsWith('accept ')) {
        return await this.handleBookingAcceptance(user, messageText);
      }
      
      if (messageText.startsWith('decline ')) {
        return await this.handleBookingDecline(user, messageText);
      }
      
      if (messageText.startsWith('pay ')) {
        return await this.handlePaymentRequest(user, messageText);
      }

      // Handle based on user context or message content
      if (userContext) {
        return await this.handleContextualMessage(user, messageText, JSON.parse(userContext));
      }

      // Handle general commands
      switch (messageText) {
        case 'hi':
        case 'hello':
        case 'start':
          return await this.sendMainMenu(phoneNumber);
        
        case '1':
        case 'book service':
          return await this.startBookingProcess(user, phoneNumber);
        
        case '2':
        case 'my bookings':
          return await this.showUserBookings(user, phoneNumber);
        
        case '3':
        case 'become provider':
          return await this.startProviderRegistration(user, phoneNumber);
        
        case '4':
        case 'help':
          return await this.sendHelpMessage(phoneNumber);
        
        default:
          return await this.sendMainMenu(phoneNumber);
      }
    } catch (error) {
      logger.error('Message handler error:', error);
      await whatsappService.sendMessage(phoneNumber, 'Sorry, something went wrong. Please try again.');
    }
  }

  async sendMainMenu(phoneNumber) {
    const menuMessage = `🏠 *Fundis Booking Bot - Main Menu*

Welcome! How can I help you today?

1️⃣ Book a Service
2️⃣ My Bookings
3️⃣ Become a Service Provider
4️⃣ Help & Support

Simply reply with the number or text of your choice.`;

    await whatsappService.sendMessage(phoneNumber, menuMessage);
  }

  async startBookingProcess(user, phoneNumber) {
    const redis = getRedisClient();
    await redis.setEx(`context:${user.id}`, 300, JSON.stringify({ 
      step: 'booking_service_type' 
    }));

    const serviceMessage = `🔧 *Book a Service*

What type of service do you need?

Popular services:
• Plumbing
• Electrical
• Cleaning
• Carpentry
• Painting
• Appliance Repair
• Gardening
• Tutoring

Please type the service you need:`;

    await whatsappService.sendMessage(phoneNumber, serviceMessage);
  }

  async handleContextualMessage(user, messageText, context) {
    const redis = getRedisClient();

    switch (context.step) {
      case 'booking_service_type':
        await redis.setEx(`context:${user.id}`, 300, JSON.stringify({
          ...context,
          step: 'booking_description',
          serviceType: messageText
        }));

        await whatsappService.sendMessage(user.whatsappId, 
          `Great! You need *${messageText}* service.\n\nPlease describe what exactly needs to be done:`);
        break;

      case 'booking_description':
        await redis.setEx(`context:${user.id}`, 300, JSON.stringify({
          ...context,
          step: 'booking_location',
          description: messageText
        }));

        await whatsappService.sendMessage(user.whatsappId, 
          `Perfect! Now, please provide your location (address or area name):`);
        break;

      case 'booking_location':
        await redis.setEx(`context:${user.id}`, 300, JSON.stringify({
          ...context,
          step: 'booking_date',
          location: messageText
        }));

        await whatsappService.sendMessage(user.whatsappId, 
          `Location noted: *${messageText}*\n\nWhen do you need this service?\n\nExamples:\n• Today\n• Tomorrow\n• Monday\n• 25/12/2024`);
        break;

      case 'booking_date':
        // Find available providers
        const providers = await ServiceProvider.findAll({
          where: {
            services: { [require('sequelize').Op.contains]: [context.serviceType] },
            isVerified: true
          },
          include: [{ model: User, as: 'user' }],
          limit: 3,
          order: [['rating', 'DESC']]
        });

        if (providers.length === 0) {
          await whatsappService.sendMessage(user.whatsappId, 
            `Sorry, no providers available for *${context.serviceType}* in your area right now. Please try again later or contact support.`);
          await redis.del(`context:${user.id}`);
          return;
        }

        // Create booking with first available provider (simplified)
        const selectedProvider = providers[0];
        const scheduledDate = this.parseDate(messageText);

        const booking = await Booking.create({
          clientId: user.id,
          providerId: selectedProvider.id,
          serviceType: context.serviceType,
          description: context.description,
          scheduledDate,
          location: { address: context.location },
          estimatedCost: selectedProvider.hourlyRate || 1000
        });

        // Send confirmation
        await whatsappService.sendBookingConfirmation(
          { ...booking.toJSON(), provider: selectedProvider, client: user },
          user.whatsappId,
          selectedProvider.user.whatsappId
        );

        await redis.del(`context:${user.id}`);
        break;

      case 'provider_registration':
        // Handle provider registration steps
        await this.handleProviderRegistrationStep(user, messageText, context);
        break;
    }
  }

  async handleBookingAcceptance(user, messageText) {
    const bookingId = messageText.split(' ')[1];
    
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: User, as: 'client' },
        { model: ServiceProvider, as: 'provider' }
      ]
    });

    if (!booking) {
      return await whatsappService.sendMessage(user.whatsappId, 'Booking not found.');
    }

    // Check if user is the provider
    if (booking.provider.userId !== user.id) {
      return await whatsappService.sendMessage(user.whatsappId, 'You are not authorized for this booking.');
    }

    await booking.update({ status: 'confirmed' });

    await whatsappService.sendMessage(user.whatsappId, 
      `✅ Booking ${bookingId} accepted! The client has been notified.`);

    await whatsappService.sendMessage(booking.client.whatsappId, 
      `🎉 Great news! Your booking has been confirmed by ${user.name}.\n\nBooking ID: ${bookingId}\nService: ${booking.serviceType}\n\nThey will contact you soon to finalize details.`);
  }

  async handleBookingDecline(user, messageText) {
    const bookingId = messageText.split(' ')[1];
    
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return await whatsappService.sendMessage(user.whatsappId, 'Booking not found.');
    }

    await booking.update({ 
      status: 'cancelled',
      cancellationReason: 'Declined by provider'
    });

    await whatsappService.sendMessage(user.whatsappId, 
      `Booking ${bookingId} declined. We'll find another provider for the client.`);
  }

  async handlePaymentRequest(user, messageText) {
    const bookingId = messageText.split(' ')[1];
    
    const booking = await Booking.findByPk(bookingId);
    if (!booking || booking.clientId !== user.id) {
      return await whatsappService.sendMessage(user.whatsappId, 'Booking not found or access denied.');
    }

    try {
      // Initiate M-Pesa payment
      const mpesaResponse = await mpesaService.initiatePayment({
        phoneNumber: user.phoneNumber,
        amount: booking.estimatedCost,
        reference: booking.id,
        description: `Payment for ${booking.serviceType}`
      });

      await whatsappService.sendMessage(user.whatsappId, 
        `💳 Payment request sent to your phone!\n\nAmount: KES ${booking.estimatedCost}\nBooking: ${booking.serviceType}\n\nPlease check your phone and enter your M-Pesa PIN to complete payment.`);

    } catch (error) {
      await whatsappService.sendMessage(user.whatsappId, 
        'Payment initiation failed. Please try again or contact support.');
    }
  }

  async showUserBookings(user, phoneNumber) {
    const bookings = await Booking.findAll({
      where: { clientId: user.id },
      include: [
        {
          model: ServiceProvider,
          as: 'provider',
          include: [{ model: User, as: 'user' }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    if (bookings.length === 0) {
      return await whatsappService.sendMessage(phoneNumber, 
        'You have no bookings yet. Reply "1" to book your first service!');
    }

    let message = '📋 *Your Recent Bookings*\n\n';
    
    bookings.forEach((booking, index) => {
      const status = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
      message += `${index + 1}. *${booking.serviceType}*\n`;
      message += `   Status: ${status}\n`;
      message += `   Date: ${new Date(booking.scheduledDate).toLocaleDateString()}\n`;
      message += `   Provider: ${booking.provider.user.name}\n`;
      message += `   ID: ${booking.id}\n\n`;
    });

    message += 'Reply with booking ID for more details.';
    
    await whatsappService.sendMessage(phoneNumber, message);
  }

  async startProviderRegistration(user, phoneNumber) {
    if (user.role === 'provider') {
      return await whatsappService.sendMessage(phoneNumber, 
        'You are already registered as a service provider! 🎉');
    }

    const redis = getRedisClient();
    await redis.setEx(`context:${user.id}`, 600, JSON.stringify({ 
      step: 'provider_registration',
      substep: 'business_name'
    }));

    const message = `🔧 *Become a Service Provider*

Great! Let's get you set up as a service provider.

First, what's your business name? (or just use your personal name)`;

    await whatsappService.sendMessage(phoneNumber, message);
  }

  async sendHelpMessage(phoneNumber) {
    const helpMessage = `❓ *Help & Support*

*How to use Fundis Booking Bot:*

🔹 *Book a Service:* Reply "1" or "book service"
🔹 *Check Bookings:* Reply "2" or "my bookings"  
🔹 *Become Provider:* Reply "3" or "become provider"

*Need human support?*
📞 Call: +254700000000
📧 Email: support@fundisbookingbot.com
🕒 Hours: Mon-Fri 8AM-6PM

*Emergency Services:*
For urgent repairs, mention "URGENT" in your booking request.

Reply "start" anytime to return to the main menu.`;

    await whatsappService.sendMessage(phoneNumber, helpMessage);
  }

  parseDate(dateString) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (dateString.toLowerCase()) {
      case 'today':
        return today;
      case 'tomorrow':
        return tomorrow;
      default:
        // Try to parse as date
        const parsed = new Date(dateString);
        return isNaN(parsed.getTime()) ? tomorrow : parsed;
    }
  }
}

module.exports = new MessageHandler();