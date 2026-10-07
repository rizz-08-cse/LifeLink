const mongoose = require('mongoose');

/**
 * Robust MongoDB / Mongoose connection module
 * Reads URI strictly from environment variables without exposing sensitive credentials.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifelink';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);

    // Register runtime connection lifecycle events
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB Runtime Error]: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Connection restored.');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB Initial Connection Failed]: ${error.message}`);
    console.error(`Please ensure MongoDB is running and MONGODB_URI is correctly configured in .env.`);
    process.exit(1);
  }
};

module.exports = connectDB;
