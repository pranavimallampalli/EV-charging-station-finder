import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Initialize database connection
await connectDB();

const server = app.listen(PORT, () => {
  console.log(`🚀 [ChargeNear Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 [Health Check] Available at http://localhost:${PORT}/api/health`);
  console.log(`⚡ [Stations API] Available at http://localhost:${PORT}/api/stations`);
});

// Graceful process shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
