const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'user'
  });

  // Log registration
  await logger.info('USER_REGISTERED', {
    userId: newUser.id,
    email: newUser.email,
    ipAddress: req.ip
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if user exists
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    await logger.warning('LOGIN_FAILED', {
      email,
      reason: 'User not found',
      ipAddress: req.ip
    });
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    await logger.warning('LOGIN_FAILED', {
      userId: user.id,
      email,
      reason: 'Incorrect password',
      ipAddress: req.ip
    });
    return next(new AppError('Incorrect email or password', 401));
  }

  // 4. Log successful login
  await logger.info('USER_LOGIN', {
    userId: user.id,
    email: user.email,
    ipAddress: req.ip
  });

  // 5. Send token
  createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});
