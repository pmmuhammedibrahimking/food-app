import express from 'express';
import { getReportData, exportExcelReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('Admin', 'Staff', 'Manager'), getReportData);
router.post('/export', protect, authorize('Admin', 'Staff', 'Manager'), exportExcelReport);

export default router;
