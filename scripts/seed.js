const bcrypt = require('bcryptjs');
const { User, ServiceProvider, Booking, Payment } = require('../src/models');
const logger = require('../src/utils/logger');

async function seedDatabase() {
  try {
    logger.info('Seeding database...');

    // Create admin user
    const adminUser = await User.findOrCreate({
      where: { phoneNumber: '0700000000' },
      defaults: {
        name: 'Admin User',
        email: 'admin@fundisbookingbot.com',
        role: 'admin',
        isVerified: true,
        isActive: true
      }
    });

    if (adminUser[1]) {
      logger.info('Admin user created');
    }

    // Create sample clients
    const clients = [
      {
        phoneNumber: '0712345678',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'client',
        isVerified: true,
        isActive: true,
        whatsappId: '254712345678',
        location: { address: 'Nairobi, Kenya', latitude: -1.286389, longitude: 36.817223 }
      },
      {
        phoneNumber: '0798765432',
        name: 'Mary Wanjiku',
        email: 'mary@example.com',
        role: 'client',
        isVerified: true,
        isActive: true,
        whatsappId: '254798765432',
        location: { address: 'Mombasa, Kenya', latitude: -4.043477, longitude: 39.668206 }
      }
    ];

    for (const clientData of clients) {
      const [client, created] = await User.findOrCreate({
        where: { phoneNumber: clientData.phoneNumber },
        defaults: clientData
      });
      if (created) {
        logger.info(`Sample client created: ${clientData.name}`);
      }
    }

    // Create sample providers
    const providers = [
      {
        user: {
          phoneNumber: '0723456789',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'provider',
          isVerified: true,
          isActive: true,
          whatsappId: '254723456789',
          location: { address: 'Nairobi, Kenya', latitude: -1.286389, longitude: 36.817223 }
        },
        profile: {
          businessName: 'Jane\'s Plumbing Services',
          description: 'Professional plumbing services with 5+ years experience',
          services: ['Plumbing', 'Pipe Repair', 'Water Heater Installation'],
          skills: ['Pipe Fitting', 'Leak Detection', 'Drain Cleaning'],
          experience: 5,
          hourlyRate: 1500,
          rating: 4.5,
          totalReviews: 23,
          completedJobs: 45,
          isVerified: true,
          earnings: 125000
        }
      },
      {
        user: {
          phoneNumber: '0734567890',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'provider',
          isVerified: true,
          isActive: true,
          whatsappId: '254734567890',
          location: { address: 'Nairobi, Kenya', latitude: -1.286389, longitude: 36.817223 }
        },
        profile: {
          businessName: 'Mike\'s Electrical Solutions',
          description: 'Licensed electrician providing safe and reliable electrical services',
          services: ['Electrical', 'Wiring', 'Solar Installation'],
          skills: ['House Wiring', 'Solar Systems', 'Electrical Repairs'],
          experience: 8,
          hourlyRate: 2000,
          rating: 4.8,
          totalReviews: 31,
          completedJobs: 67,
          isVerified: true,
          earnings: 180000
        }
      },
      {
        user: {
          phoneNumber: '0745678901',
          name: 'Sarah Muthoni',
          email: 'sarah@example.com',
          role: 'provider',
          isVerified: true,
          isActive: true,
          whatsappId: '254745678901',
          location: { address: 'Nairobi, Kenya', latitude: -1.286389, longitude: 36.817223 }
        },
        profile: {
          businessName: 'Clean & Shine Services',
          description: 'Professional cleaning services for homes and offices',
          services: ['Cleaning', 'Deep Cleaning', 'Office Cleaning'],
          skills: ['Residential Cleaning', 'Commercial Cleaning', 'Carpet Cleaning'],
          experience: 3,
          hourlyRate: 800,
          rating: 4.2,
          totalReviews: 18,
          completedJobs: 32,
          isVerified: true,
          earnings: 85000
        }
      }
    ];

    for (const providerData of providers) {
      const [providerUser, userCreated] = await User.findOrCreate({
        where: { phoneNumber: providerData.user.phoneNumber },
        defaults: providerData.user
      });

      if (userCreated) {
        logger.info(`Sample provider user created: ${providerData.user.name}`);

        await ServiceProvider.findOrCreate({
          where: { userId: providerUser.id },
          defaults: {
            ...providerData.profile,
            userId: providerUser.id
          }
        });

        logger.info(`Sample provider profile created: ${providerData.profile.businessName}`);
      }
    }

    // Create sample bookings
    const allUsers = await User.findAll();
    const allProviders = await ServiceProvider.findAll();
    const clients = allUsers.filter(user => user.role === 'client');

    if (clients.length > 0 && allProviders.length > 0) {
      const sampleBookings = [
        {
          clientId: clients[0].id,
          providerId: allProviders[0].id,
          serviceType: 'Plumbing',
          description: 'Fix leaking kitchen sink and replace faucet',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          duration: 2,
          location: { address: 'Westlands, Nairobi', latitude: -1.2676, longitude: 36.8108 },
          status: 'confirmed',
          priority: 'medium',
          estimatedCost: 3000,
          paymentStatus: 'paid',
          paymentMethod: 'mpesa'
        },
        {
          clientId: clients[0].id,
          providerId: allProviders[1].id,
          serviceType: 'Electrical',
          description: 'Install new electrical outlets in living room',
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          duration: 3,
          location: { address: 'Karen, Nairobi', latitude: -1.3197, longitude: 36.6859 },
          status: 'pending',
          priority: 'low',
          estimatedCost: 6000,
          paymentStatus: 'pending',
          paymentMethod: 'mpesa'
        },
        {
          clientId: clients.length > 1 ? clients[1].id : clients[0].id,
          providerId: allProviders[2].id,
          serviceType: 'Cleaning',
          description: 'Deep cleaning for 3-bedroom apartment',
          scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
          duration: 4,
          location: { address: 'Kilimani, Nairobi', latitude: -1.2921, longitude: 36.7809 },
          status: 'completed',
          priority: 'medium',
          estimatedCost: 3200,
          finalCost: 3200,
          paymentStatus: 'paid',
          paymentMethod: 'mpesa',
          completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        }
      ];

      for (const bookingData of sampleBookings) {
        const booking = await Booking.create(bookingData);
        
        // Create payment for paid bookings
        if (bookingData.paymentStatus === 'paid') {
          await Payment.create({
            bookingId: booking.id,
            amount: bookingData.finalCost || bookingData.estimatedCost,
            method: bookingData.paymentMethod,
            status: 'completed',
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            mpesaReceiptNumber: `QK${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            phoneNumber: clients[0].phoneNumber,
            providerShare: (bookingData.finalCost || bookingData.estimatedCost) * 0.95,
            platformFee: (bookingData.finalCost || bookingData.estimatedCost) * 0.05,
            processedAt: new Date()
          });
        }
      }

      logger.info('Sample bookings created');
    }

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;