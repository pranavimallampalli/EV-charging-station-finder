import express from 'express';
import {
  getStations,
  getStationById,
  getLiveHyderabadStations,
  createStation,
  updateStation,
  deleteStation
} from '../controllers/stationController.js';
import {
  requireDB,
  validateObjectId,
  validateCreateStation
} from '../middleware/validate.js';

const router = express.Router();

// Public routes for station discovery
router.get('/live/hyderabad', getLiveHyderabadStations);
router.get('/', requireDB, getStations);
router.get('/:id', validateObjectId('id'), getStationById);

// Station mutations (Temporary development-level access; will be secured by verifyToken & requireAdmin in Phase 5)
router.post('/', validateCreateStation, requireDB, createStation);
router.put('/:id', validateObjectId('id'), requireDB, updateStation);
router.delete('/:id', validateObjectId('id'), requireDB, deleteStation);

export default router;
