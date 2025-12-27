const User = require('./User');
const Booking = require('./Booking');

// Define associations
User.hasMany(Booking, {
  foreignKey: 'userId',
  as: 'bookings',
  onDelete: 'CASCADE'
});

Booking.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  Booking
};
