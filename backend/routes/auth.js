/**
 * Authentication Routes
 * Handles user registration and login. Passwords are hashed with bcrypt.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');

const router = express.Router();

// Validation regex patterns for email and phone format checking
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Matches standard email format
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/; // Matches phone numbers with optional formatting

/**
 * JWT Token Generator
 * Creates a JWT token for the user. Default expiration: 7 days.
 */
const createToken = (userId) => {
  // Get JWT secret from environment variables (must be kept secure)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  // Sign token with user ID and set expiration time (default 7 days)
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Validation Error Handler
 * Returns formatted validation errors or calls next() if valid.
 */
const handleValidation = (req, res, next) => {
  // Get all validation errors from express-validator
  const errors = validationResult(req);
  // If validation failed, return error response with all field errors
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  // If validation passed, continue to next middleware/route handler
  return next();
};

/**
 * POST /api/auth/register
 * Registers a new user. Returns user data with JWT token.
 */
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('email')
      .trim()
      .matches(EMAIL_REGEX)
      .withMessage('Email must be a valid email address'),
    body('phone')
      .optional({ values: 'falsy' })
      .trim()
      .matches(PHONE_REGEX)
      .withMessage('Phone must be a valid phone number'),
    body('dob')
      .optional({ values: 'falsy' })
      .isISO8601()
      .withMessage('Date of birth must be a valid ISO-8601 date'),
  ],
  handleValidation,
  async (req, res) => {
    // Extract user data from request body
    const { username, password, email, phone, dob } = req.body;

    try {
      // Check if user already exists with same email or username (prevents duplicates)
      // Using $or to check both fields in single database query
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        // Generic message doesn't reveal which field matched (security best practice)
        return res
          .status(400)
          .json({ message: 'User with that username or email already exists', errors: [] });
      }

      // Create new user - password is automatically hashed by User model pre-save hook
      const user = await User.create({ username, password, email, phone, dob });

      // Return user data with JWT token for immediate authentication (password excluded)
      return res.status(201).json({
        id: user._id,
        username: user.username,
        email: user.email,
        token: createToken(user._id), // Generate JWT token for the new user
      });
    } catch (error) {
      // Log error for debugging, return generic message to client
      console.error('Register error:', error.message);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticates user with username/email and password. Returns JWT token.
 */
router.post(
  '/login',
  [
    body('password').notEmpty().withMessage('Password is required'),
    body('username')
      .optional({ values: 'falsy' })
      .trim()
      .notEmpty()
      .withMessage('Username cannot be empty'),
    body('email')
      .optional({ values: 'falsy' })
      .trim()
      .matches(EMAIL_REGEX)
      .withMessage('Email must be a valid email address'),
    body()
      .custom((value, { req }) => {
        if (!req.body.username && !req.body.email) {
          throw new Error('Username or email is required');
        }
        return true;
      }),
  ],
  handleValidation,
  async (req, res) => {
    // Extract login credentials from request body
    const { username, password, email } = req.body;

    try {
      // Build query to find user by username or email (user can login with either)
      const query = username ? { username } : { email };
      const user = await User.findOne(query);

      // Return generic error message if user not found (prevents user enumeration attacks)
      // Same message as wrong password to prevent revealing if username/email exists
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare provided password with hashed password stored in database
      // bcrypt.compare is secure against timing attacks
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Same generic error message to prevent user enumeration
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Authentication successful - return user data with JWT token
      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        token: createToken(user._id), // Generate JWT token for authenticated session
      });
    } catch (error) {
      // Log error for debugging, return generic message to client
      console.error('Login error:', error.message);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
