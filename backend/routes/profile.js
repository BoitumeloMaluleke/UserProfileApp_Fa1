/**
 * Profile Routes
 * Handles profile retrieval and updates. All routes require JWT authentication.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Validation regex patterns for email and phone format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/; // Phone with optional country code and formatting

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request. Returns 401 if invalid.
 */
const requireAuth = async (req, res, next) => {
  // Extract Authorization header from request (format: "Bearer <token>")
  const authHeader = req.headers.authorization || '';
  
  // Check if header follows Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  // Extract token by splitting "Bearer <token>" and taking second part
  const token = authHeader.split(' ')[1];

  try {
    // Get JWT secret from environment variables
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Verify and decode JWT token (throws error if invalid/expired)
    const decoded = jwt.verify(token, secret);
    // Find user in database using ID from decoded token
    const user = await User.findById(decoded.id);
    if (!user) {
      // User ID in token doesn't exist (user may have been deleted)
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Attach user object to request for use in route handlers
    req.user = user;
    next(); // Continue to next middleware/route handler
  } catch (error) {
    // Token verification failed (invalid, expired, or malformed)
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

/**
 * Validation Error Handler
 * Returns formatted validation errors or calls next() if valid.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  return next();
};

/**
 * GET /api/profile
 * Returns authenticated user's profile data.
 */
router.get('/', requireAuth, async (req, res) => {
  // User is already attached to req by requireAuth middleware
  const user = req.user;
  // Return profile data with consistent format (empty string for phone, null for dob if not set)
  return res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone || '', // Default to empty string if not set
    dob: user.dob || null,   // Default to null if not set
    createdAt: user.createdAt, // Timestamp from Mongoose timestamps
    updatedAt: user.updatedAt, // Last update timestamp
  });
});

/**
 * PUT /api/profile
 * Updates user profile fields (email, phone, dob). Only provided fields are updated.
 */
router.put(
  '/',
  requireAuth,
  [
    body('email')
      .optional({ values: 'falsy' })
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
    // Extract only updateable fields from request body (default to empty object if undefined)
    const { email, phone, dob } = req.body || {};

    try {
      // Only update fields that are explicitly provided - allows partial updates
      // Using !== undefined allows setting fields to empty/null values
      if (email !== undefined) req.user.email = email;
      if (phone !== undefined) req.user.phone = phone;
      // Convert ISO date string to Date object, or set to null if empty string
      if (dob !== undefined) req.user.dob = dob ? new Date(dob) : null;

      // Save updated user to database (Mongoose automatically updates updatedAt timestamp)
      const saved = await req.user.save();
      // Return updated profile in same format as GET endpoint
      return res.json({
        id: saved._id,
        username: saved.username,
        email: saved.email,
        phone: saved.phone || '',
        dob: saved.dob || null,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      });
    } catch (error) {
      // Handle database or server errors with generic message
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;