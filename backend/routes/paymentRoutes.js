import express from 'express';
import { createPaymentOrder, verifyPaymentOrder } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPaymentOrder);

export default router;
