const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { bookTicketSchema } = require('../validators/eventValidators');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', validateRequest(bookTicketSchema), bookingController.bookTicket);
router.get('/my-bookings', bookingController.getMyBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
