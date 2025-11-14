/**
 * Database Connection Module
 * Connects to MongoDB using connection URI from environment variables.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Connect to MongoDB
 * Establishes connection to MongoDB using connection URI from environment variables.
 * @throws {Error} If MONGO_URI is not set or connection fails
 */
const connectDB = async () => {
  // Get MongoDB connection URI from environment variables (set in .env or Azure)
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  try {
    // Connect to MongoDB using Mongoose (returns connection object)
    const connection = await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    return connection;
  } catch (error) {
    // Log connection error and re-throw so caller can handle it
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;


