const Joi = require('joi');

const createEventSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.empty': 'Event title is required',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  description: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Event description is required'
    }),
  date: Joi.date()
    .iso()
    .greater('now')
    .required()
    .messages({
      'date.base': 'Please provide a valid date',
      'date.greater': 'Event date must be in the future'
    }),
  location: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Event location is required'
    }),
  totalTickets: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Total tickets must be a number',
      'number.integer': 'Total tickets must be an integer',
      'number.min': 'Total tickets must be at least 1'
    }),
  metadata: Joi.object()
    .default({})
});

const bookTicketSchema = Joi.object({
  eventId: Joi.string()
    .length(24)
    .hex()
    .required()
    .messages({
      'string.empty': 'Event ID is required',
      'string.length': 'Invalid event ID format',
      'string.hex': 'Invalid event ID format'
    })
});

module.exports = {
  createEventSchema,
  bookTicketSchema
};
