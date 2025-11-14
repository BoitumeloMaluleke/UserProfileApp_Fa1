/**
 * User Model
 * Defines User schema with automatic password hashing and validation.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Define User schema with field types and validation rules
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,      // Username is mandatory
      trim: true,          // Remove leading/trailing whitespace
      unique: true,        // Ensure no duplicate usernames
    },
    password: {
      type: String,
      required: true,      // Password is mandatory
      minlength: 6,        // Minimum 6 characters
      // Note: Password will be hashed by pre-save hook before storage
    },
    email: {
      type: String,
      required: true,      // Email is mandatory
      lowercase: true,     // Convert to lowercase for consistency
      trim: true,          // Remove whitespace
      unique: true,        // Ensure no duplicate emails
    },
    phone: {
      type: String,
      trim: true,          // Optional field for phone number
    },
    dob: {
      type: Date,          // Optional field for date of birth
    },
  },
  {
    timestamps: true,      // Automatically add createdAt and updatedAt fields
  }
);

/**
 * Pre-Save Hook: Password Hashing
 * Automatically hashes password before saving. Only hashes if password was modified.
 */
userSchema.pre('save', async function hashPassword(next) {
  // Skip hashing if password hasn't been modified (improves performance on profile updates)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with 10 rounds (good balance of security and performance)
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt and replace plain text password
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    // Pass any hashing errors to next middleware
    return next(error);
  }
});

/**
 * Password Comparison Method
 * Compares plain text password with stored hash. Used for authentication.
 */
userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


