const express = require('express');
const eventController = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { createEventSchema } = require('../validators/eventValidators');

const router = express.Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', validateRequest(createEventSchema), eventController.createEvent);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
