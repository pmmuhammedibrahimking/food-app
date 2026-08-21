import mongoose from 'mongoose';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Health Check Controller
 * GET /api/health
 */
export const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const healthData = {
    status: 'UP',
    service: 'Aurelia Hotel Backend API',
    database: states[dbState] || 'Unknown',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  };

  return successResponse(res, 200, 'Aurelia Hotel Backend API is healthy', healthData);
};
