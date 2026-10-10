import express from 'express';
import cors from 'cors';
import stationRoutes from './routes/stationRoutes.js';
import { getDBStatus, isDBConnected } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Standard middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive during hackathon local dev
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  const dbConnected = isDBConnected();

  return res.status(200).json({
    success: true,
    message: 'ChargeNear Backend API is operational',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connected: dbConnected
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Primary application routes
app.use('/api/stations', stationRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Centralized error-handling middleware
app.use(errorHandler);

export default app;
