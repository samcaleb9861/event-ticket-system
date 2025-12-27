const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

exports.createEvent = catchAsync(async (req, res, next) => {
  const { title, description, date, location, totalTickets, metadata } = req.body;

  const newEvent = await Event.create({
    title,
    description,
    date,
    location,
    totalTickets,
    metadata: metadata || {},
    createdBy: req.user.id
  });

  // Log event creation
  await logger.info('EVENT_CREATED', {
    userId: req.user.id,
    eventId: newEvent._id,
    eventTitle: newEvent.title,
    ipAddress: req.ip
  });

  res.status(201).json({
    status: 'success',
    data: {
      event: newEvent
    }
  });
});

exports.getAllEvents = catchAsync(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filters
  const filter = {};
  
  // Filter by upcoming events
  if (req.query.upcoming === 'true') {
    filter.date = { $gte: new Date() };
  }

  // Search by title
  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: 'i' };
  }

  // Execute query
  const events = await Event.find(filter)
    .sort({ date: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Event.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: events.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      events
    }
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event
    }
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const { title, description, date, location, totalTickets, metadata } = req.body;

  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Check if user is the creator or admin
  if (event.createdBy !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this event', 403));
  }

  // Update fields
  if (title) event.title = title;
  if (description) event.description = description;
  if (date) event.date = date;
  if (location) event.location = location;
  if (metadata) event.metadata = metadata;
  
  // Handle totalTickets update carefully
  if (totalTickets !== undefined) {
    const ticketsDifference = totalTickets - event.totalTickets;
    event.totalTickets = totalTickets;
    event.availableTickets = Math.max(0, event.availableTickets + ticketsDifference);
  }

  await event.save();

  // Log event update
  await logger.info('EVENT_UPDATED', {
    userId: req.user.id,
    eventId: event._id,
    eventTitle: event.title,
    ipAddress: req.ip
  });

  res.status(200).json({
    status: 'success',
    data: {
      event
    }
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Check if user is the creator or admin
  if (event.createdBy !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this event', 403));
  }

  await Event.findByIdAndDelete(req.params.id);

  // Log event deletion
  await logger.info('EVENT_DELETED', {
    userId: req.user.id,
    eventId: req.params.id,
    eventTitle: event.title,
    ipAddress: req.ip
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
