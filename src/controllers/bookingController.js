const mongoose = require('mongoose');
const { sequelize } = require('../config/mysql');
const { Booking } = require('../models');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

exports.bookTicket = catchAsync(async (req, res, next) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  // Start MongoDB session for transaction
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  // Start MySQL transaction
  const mysqlTransaction = await sequelize.transaction();

  try {
    // 1. Find event with pessimistic locking to prevent race conditions
    // Use findOneAndUpdate with atomic operation to decrement tickets
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        availableTickets: { $gt: 0 },
        date: { $gte: new Date() }
      },
      {
        $inc: { availableTickets: -1 }
      },
      {
        new: true,
        session: mongoSession,
        runValidators: true
      }
    );

    // 2. Check if event exists and has available tickets
    if (!event) {
      await mongoSession.abortTransaction();
      await mysqlTransaction.rollback();
      
      // Check if event exists at all
      const eventExists = await Event.findById(eventId);
      if (!eventExists) {
        return next(new AppError('Event not found', 404));
      }
      if (eventExists.date < new Date()) {
        return next(new AppError('This event has already passed', 400));
      }
      
      return next(new AppError('No tickets available for this event', 400));
    }

    // 3. Check if user already has a booking for this event
    const existingBooking = await Booking.findOne({
      where: {
        userId,
        eventId: eventId.toString(),
        status: 'confirmed'
      },
      transaction: mysqlTransaction
    });

    if (existingBooking) {
      // Rollback the ticket decrement
      await Event.findByIdAndUpdate(
        eventId,
        { $inc: { availableTickets: 1 } },
        { session: mongoSession }
      );
      
      await mongoSession.abortTransaction();
      await mysqlTransaction.rollback();
      
      return next(new AppError('You have already booked a ticket for this event', 400));
    }

    // 4. Create booking in MySQL
    const booking = await Booking.create({
      userId,
      eventId: eventId.toString(),
      eventTitle: event.title,
      status: 'confirmed'
    }, { transaction: mysqlTransaction });

    // 5. Commit both transactions
    await mongoSession.commitTransaction();
    await mysqlTransaction.commit();

    // 6. Log successful booking
    await logger.info('TICKET_BOOKED', {
      userId,
      eventId: event._id,
      eventTitle: event.title,
      bookingId: booking.id,
      ipAddress: req.ip
    });

    res.status(201).json({
      status: 'success',
      message: 'Ticket booked successfully',
      data: {
        booking: {
          id: booking.id,
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.date,
          bookingDate: booking.bookingDate,
          status: booking.status
        }
      }
    });

  } catch (error) {
    // Rollback both transactions on error
    await mongoSession.abortTransaction();
    await mysqlTransaction.rollback();

    // Log failed booking attempt
    await logger.error('TICKET_BOOKING_FAILED', {
      userId,
      eventId,
      error: error.message,
      ipAddress: req.ip
    });

    throw error;
  } finally {
    mongoSession.endSession();
  }
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Get all bookings for the user
  const bookings = await Booking.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'eventId', 'eventTitle', 'bookingDate', 'status', 'createdAt']
  });

  // Get event details from MongoDB for each booking
  const bookingsWithEventDetails = await Promise.all(
    bookings.map(async (booking) => {
      try {
        const event = await Event.findById(booking.eventId);
        return {
          bookingId: booking.id,
          status: booking.status,
          bookingDate: booking.bookingDate,
          event: event ? {
            id: event._id,
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            availableTickets: event.availableTickets
          } : {
            id: booking.eventId,
            title: booking.eventTitle,
            message: 'Event details not available'
          }
        };
      } catch (error) {
        return {
          bookingId: booking.id,
          status: booking.status,
          bookingDate: booking.bookingDate,
          event: {
            id: booking.eventId,
            title: booking.eventTitle,
            message: 'Event details not available'
          }
        };
      }
    })
  );

  res.status(200).json({
    status: 'success',
    results: bookingsWithEventDetails.length,
    data: {
      bookings: bookingsWithEventDetails
    }
  });
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user.id;

  // Start transactions
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();
  const mysqlTransaction = await sequelize.transaction();

  try {
    // 1. Find the booking
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        userId
      },
      transaction: mysqlTransaction
    });

    if (!booking) {
      await mongoSession.abortTransaction();
      await mysqlTransaction.rollback();
      return next(new AppError('Booking not found', 404));
    }

    if (booking.status === 'cancelled') {
      await mongoSession.abortTransaction();
      await mysqlTransaction.rollback();
      return next(new AppError('Booking is already cancelled', 400));
    }

    // 2. Update booking status
    booking.status = 'cancelled';
    await booking.save({ transaction: mysqlTransaction });

    // 3. Increment available tickets in MongoDB
    const event = await Event.findByIdAndUpdate(
      booking.eventId,
      { $inc: { availableTickets: 1 } },
      { session: mongoSession, new: true }
    );

    if (!event) {
      await mongoSession.abortTransaction();
      await mysqlTransaction.rollback();
      return next(new AppError('Associated event not found', 404));
    }

    // 4. Commit transactions
    await mongoSession.commitTransaction();
    await mysqlTransaction.commit();

    // 5. Log cancellation
    await logger.info('BOOKING_CANCELLED', {
      userId,
      bookingId: booking.id,
      eventId: booking.eventId,
      ipAddress: req.ip
    });

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: {
        booking
      }
    });

  } catch (error) {
    await mongoSession.abortTransaction();
    await mysqlTransaction.rollback();

    await logger.error('BOOKING_CANCELLATION_FAILED', {
      userId,
      bookingId,
      error: error.message,
      ipAddress: req.ip
    });

    throw error;
  } finally {
    mongoSession.endSession();
  }
});
