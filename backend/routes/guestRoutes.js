import express from 'express';
import {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  addGuestNote,
  deleteGuest,
  getGuestStatsSummary
} from '../controllers/guestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All Guest CRM endpoints are protected & restricted to Staff (Admin, Manager, Receptionist)
router.use(protect);
router.use(authorize('Admin', 'Manager', 'Receptionist'));

router.get('/stats/summary', getGuestStatsSummary);
router.get('/', getGuests);
router.post('/', createGuest);
router.get('/:id', getGuestById);
router.put('/:id', updateGuest);
router.delete('/:id', deleteGuest);
router.post('/:id/notes', addGuestNote);

export default router;
