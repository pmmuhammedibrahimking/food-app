import express from 'express';
import {
  getHousekeepingTasks,
  createHousekeepingTask,
  updateHousekeepingStatus
} from '../controllers/housekeepingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Staff Housekeeping Routes
router.use(protect);
router.use(authorize('Admin', 'Manager', 'Receptionist', 'Housekeeping'));

router.get('/', getHousekeepingTasks);
router.post('/', createHousekeepingTask);
router.patch('/:id/status', updateHousekeepingStatus);

export default router;
