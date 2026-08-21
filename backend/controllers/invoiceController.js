import { generateInvoiceData } from '../models/invoiceModel.js';
import { buildInvoicePdfStream } from '../services/pdfService.js';
import { logAuditEvent } from './auditLogController.js';

/**
 * @desc    Get JSON breakdown of Invoice & Billing Data
 * @route   GET /api/invoices/:bookingId
 * @access  Public / Staff
 */
export const getInvoiceData = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const invoiceData = generateInvoiceData(bookingId, req.body?.booking);

    await logAuditEvent({
      user: req.user?.name || 'Staff / Guest',
      role: req.user?.role || 'Staff',
      action: 'Invoice generated',
      module: 'Invoices',
      details: `Folio invoice #${invoiceData.invoiceNumber || bookingId} generated for guest ${invoiceData.guestName || 'Guest'}.`,
      relevantRecordId: bookingId
    });

    return res.status(200).json({
      success: true,
      invoice: invoiceData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate invoice data.'
    });
  }
};

/**
 * @desc    Generate & Stream Downloadable PDF Invoice File
 * @route   GET /api/invoices/:bookingId/pdf
 * @access  Public / Staff
 */
export const downloadInvoicePdf = (req, res) => {
  try {
    const { bookingId } = req.params;
    const invoiceData = generateInvoiceData(bookingId);

    const filename = `invoice-${bookingId.replace(/[^a-zA-Z0-9-]/g, '')}.pdf`;

    // Set Response Headers for Direct PDF Download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream PDF directly to HTTP Client
    buildInvoicePdfStream(invoiceData, res);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate PDF invoice file.'
    });
  }
};
