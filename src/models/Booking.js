const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  eventId: {
    type: DataTypes.STRING(24), // MongoDB ObjectId as string
    allowNull: false,
    field: 'event_id'
  },
  eventTitle: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'event_title'
  },
  bookingDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'booking_date'
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled'),
    defaultValue: 'confirmed',
    allowNull: false
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['event_id']
    }
  ]
});

module.exports = Booking;
