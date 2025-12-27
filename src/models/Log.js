const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: Number, // MySQL User ID
    required: false
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  level: {
    type: String,
    enum: ['info', 'warning', 'error'],
    default: 'info'
  },
  ipAddress: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  collection: 'logs'
});

// Index for efficient log queries
logSchema.index({ timestamp: -1 });
logSchema.index({ userId: 1 });
logSchema.index({ action: 1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
