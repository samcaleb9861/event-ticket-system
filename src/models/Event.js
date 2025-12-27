const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  totalTickets: {
    type: Number,
    required: [true, 'Total tickets is required'],
    min: [1, 'Total tickets must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Total tickets must be an integer'
    }
  },
  availableTickets: {
    type: Number,
    required: true,
    min: [0, 'Available tickets cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Available tickets must be an integer'
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: Number, // MySQL User ID
    required: true
  }
}, {
  timestamps: true,
  collection: 'events'
});

// Index for efficient queries
eventSchema.index({ date: 1 });
eventSchema.index({ createdBy: 1 });

// Pre-save hook to set availableTickets equal to totalTickets on creation
eventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableTickets = this.totalTickets;
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
