const express = require('express');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

module.exports = router;
