import express from 'express';
import { getInvoiceData, downloadInvoicePdf } from '../controllers/invoiceController.js';

const router = express.Router();

// GET JSON invoice details
router.get('/:bookingId', getInvoiceData);

// GET downloadable PDF invoice file
router.get('/:bookingId/pdf', downloadInvoicePdf);

export default router;
