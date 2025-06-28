const { User, ServiceProvider, Booking, Payment } = require('../src/models');
const { connectDatabase } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function verifyDatabase() {
  try {
    logger.info('Verifying database contents...');
    
    // Connect to database
    await connectDatabase();
    
    // Count records in each table
    const userCount = await User.count();
    const providerCount = await ServiceProvider.count();
    const bookingCount = await Booking.count();
    const paymentCount = await Payment.count();
    
    logger.info('Database verification results:');
    logger.info(`- Users: ${userCount}`);
    logger.info(`- Service Providers: ${providerCount}`);
    logger.info(`- Bookings: ${bookingCount}`);
    logger.info(`- Payments: ${paymentCount}`);
    
    // Check specific records
    const adminUser = await User.findOne({ where: { phoneNumber: '0700000000' } });
    const sampleProvider = await ServiceProvider.findOne({
      include: [{ model: User, as: 'user' }]
    });
    
    if (adminUser) {
      logger.info(`✅ Admin user found: ${adminUser.name} (${adminUser.email})`);
    } else {
      logger.warn('❌ Admin user not found');
    }
    
    if (sampleProvider) {
      logger.info(`✅ Sample provider found: ${sampleProvider.businessName} - ${sampleProvider.user.name}`);
    } else {
      logger.warn('❌ No providers found');
    }
    
    // Check for sample bookings
    const sampleBooking = await Booking.findOne({
      include: [
        { model: User, as: 'client' },
        { model: ServiceProvider, as: 'provider', include: [{ model: User, as: 'user' }] }
      ]
    });
    
    if (sampleBooking) {
      logger.info(`✅ Sample booking found: ${sampleBooking.serviceType} by ${sampleBooking.client.name}`);
    } else {
      logger.warn('❌ No bookings found');
    }
    
    // Summary
    const isSeeded = userCount > 0 && providerCount > 0 && bookingCount > 0;
    
    if (isSeeded) {
      logger.info('🎉 Database seeding verification PASSED - All sample data is present');
    } else {
      logger.warn('⚠️  Database seeding verification FAILED - Missing sample data');
    }
    
    // Display login credentials
    logger.info('\n📋 Login Credentials for Testing:');
    logger.info('Admin Dashboard: Phone: 0700000000');
    logger.info('Sample Client: Phone: 0712345678');
    logger.info('Sample Provider: Phone: 0723456789');
    
    process.exit(0);
  } catch (error) {
    logger.error('Database verification failed:', error);
    process.exit(1);
  }
}

verifyDatabase();