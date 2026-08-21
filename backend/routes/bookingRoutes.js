import express from 'express';
import {
  getBookings,
  createBooking,
  executeCheckIn,
  executeCheckOut,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Staff View Endpoints
router.get('/', getBookings);
router.post('/', createBooking);

// Protected Workflow Endpoints (Admin, Manager, Receptionist)
router.post('/:id/checkin', protect, authorize('Admin', 'Manager', 'Receptionist'), executeCheckIn);
router.post('/:id/checkout', protect, authorize('Admin', 'Manager', 'Receptionist'), executeCheckOut);
router.post('/:id/cancel', protect, authorize('Admin', 'Manager', 'Receptionist'), cancelBooking);

export default router;
