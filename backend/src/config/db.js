import { setServers } from 'node:dns';
import mongoose from 'mongoose';

const stateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export const getDBStatus = () => {
  const readyState = mongoose.connection.readyState;
  return stateMap[readyState] || 'unknown';
};

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ [MongoDB] MONGODB_URI is not defined in environment variables. Database operations will fail.');
    return;
  }

  try {
    mongoose.connection.on('connected', () => {
      console.log('✅ [MongoDB] Connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ [MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MongoDB] Disconnected from database');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Timeout fast if server is unreachable
    });
  } catch (error) {
    console.error(`❌ [MongoDB] Initial connection failure: ${error.message}`);
    console.warn('⚠️ [MongoDB] The server will continue running. Ensure MongoDB is running and MONGODB_URI is valid.');
  }
};
