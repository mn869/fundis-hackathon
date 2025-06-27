const bcrypt = require('bcryptjs');
const { User, ServiceProvider } = require('../src/models');
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

    // Create sample client
    const clientUser = await User.findOrCreate({
      where: { phoneNumber: '0712345678' },
      defaults: {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'client',
        isVerified: true,
        isActive: true,
        whatsappId: '254712345678'
      }
    });

    if (clientUser[1]) {
      logger.info('Sample client created');
    }

    // Create sample provider
    const providerUser = await User.findOrCreate({
      where: { phoneNumber: '0723456789' },
      defaults: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'provider',
        isVerified: true,
        isActive: true,
        whatsappId: '254723456789'
      }
    });

    if (providerUser[1]) {
      logger.info('Sample provider user created');

      // Create provider profile
      await ServiceProvider.findOrCreate({
        where: { userId: providerUser[0].id },
        defaults: {
          businessName: 'Jane\'s Plumbing Services',
          description: 'Professional plumbing services with 5+ years experience',
          services: ['Plumbing', 'Pipe Repair', 'Water Heater Installation'],
          skills: ['Pipe Fitting', 'Leak Detection', 'Drain Cleaning'],
          experience: 5,
          hourlyRate: 1500,
          rating: 4.5,
          totalReviews: 23,
          completedJobs: 45,
          isVerified: true
        }
      });

      logger.info('Sample provider profile created');
    }

    // Create another provider
    const provider2User = await User.findOrCreate({
      where: { phoneNumber: '0734567890' },
      defaults: {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'provider',
        isVerified: true,
        isActive: true,
        whatsappId: '254734567890'
      }
    });

    if (provider2User[1]) {
      logger.info('Second sample provider user created');

      await ServiceProvider.findOrCreate({
        where: { userId: provider2User[0].id },
        defaults: {
          businessName: 'Mike\'s Electrical Solutions',
          description: 'Licensed electrician providing safe and reliable electrical services',
          services: ['Electrical', 'Wiring', 'Solar Installation'],
          skills: ['House Wiring', 'Solar Systems', 'Electrical Repairs'],
          experience: 8,
          hourlyRate: 2000,
          rating: 4.8,
          totalReviews: 31,
          completedJobs: 67,
          isVerified: true
        }
      });

      logger.info('Second sample provider profile created');
    }

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();