/**
 * Express Server Setup
 * Main entry point. Configures middleware, routes, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS middleware allows frontend to make requests from different origin/port
app.use(cors());
// JSON parser middleware converts request body to JavaScript object
app.use(express.json());

// API routes must be registered before static files to avoid conflicts
// Authentication routes handle user registration and login
app.use('/api/auth', authRoutes);
// Profile routes handle profile retrieval and updates (requires authentication)
app.use('/api/profile', profileRoutes);
// Root route serves the login page when accessing the base URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
// Static file middleware serves frontend files (HTML, CSS, JS) from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all handler for undefined API routes - returns 404 JSON response
app.use('/api', (req, res, next) => {
  res.status(404).json({ message: 'API route not found' });
});

// Global error handler - catches errors and returns JSON responses for API routes
app.use((err, req, res, next) => {
  console.error(err);
  // Only handle errors for API routes, pass others to default Express handler
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
  next(err);
});

// Port number from environment variable (Azure sets this) or default to 5000 for local
const PORT = process.env.PORT || 5000;

/**
 * Start Server
 * Connects to database and starts Express server.
 */
const startServer = async () => {
  try {
    // Establish connection to MongoDB before starting server
    await connectDB();
    // Start listening for incoming HTTP requests on specified port
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // If database connection fails, log error and exit process
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
