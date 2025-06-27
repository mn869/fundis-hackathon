const User = require('./User');
const ServiceProvider = require('./ServiceProvider');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Review = require('./Review');

// Define associations
User.hasOne(ServiceProvider, { foreignKey: 'userId', as: 'providerProfile' });
ServiceProvider.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Booking, { foreignKey: 'clientId', as: 'clientBookings' });
Booking.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

ServiceProvider.hasMany(Booking, { foreignKey: 'providerId', as: 'providerBookings' });
Booking.belongsTo(ServiceProvider, { foreignKey: 'providerId', as: 'provider' });

Booking.hasOne(Payment, { foreignKey: 'bookingId', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

User.hasMany(Review, { foreignKey: 'clientId', as: 'clientReviews' });
Review.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

ServiceProvider.hasMany(Review, { foreignKey: 'providerId', as: 'providerReviews' });
Review.belongsTo(ServiceProvider, { foreignKey: 'providerId', as: 'provider' });

module.exports = {
  User,
  ServiceProvider,
  Booking,
  Payment,
  Review
};