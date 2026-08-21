import express from 'express';
import {
  getRooms,
  getRoomByNumber,
  createRoom,
  updateRoom,
  updateRoomStatus,
  updateRoomPrice,
  deleteRoom
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Staff View Endpoints
router.get('/', getRooms);
router.get('/:number', getRoomByNumber);

// Protected Status Update (Admin, Manager, Receptionist, Housekeeping)
router.patch('/:number/status', protect, authorize('Admin', 'Manager', 'Receptionist', 'Housekeeping'), updateRoomStatus);

// Management Protected Endpoints (Admin, Manager)
router.post('/', protect, authorize('Admin', 'Manager'), createRoom);
router.put('/:number', protect, authorize('Admin', 'Manager'), updateRoom);
router.patch('/:number/price', protect, authorize('Admin', 'Manager'), updateRoomPrice);
router.delete('/:number', protect, authorize('Admin', 'Manager'), deleteRoom);

export default router;
