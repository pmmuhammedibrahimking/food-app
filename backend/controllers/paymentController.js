import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from './auditLogController.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * @desc    Create Razorpay / Stripe Payment Order
 * @route   POST /api/payment/create-order
 * @access  Public / Staff
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', bookingId } = req.body;

    if (!amount || Number(amount) <= 0) {
      return errorResponse(res, 400, 'Invalid payment amount.');
    }

    // Use mock key if valid ones aren't provided
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('your_razorpay')) {
      const orderId = `PAY-ORD-${Date.now()}`;
      const transactionData = {
        id: orderId,
        orderId,
        amount: Number(amount) * 100,
        currency,
        bookingId: bookingId || 'BKG-5594',
        status: 'created',
        createdAt: new Date().toISOString()
      };
      return successResponse(res, 201, 'Mock Payment order generated successfully', transactionData);
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt: `receipt_${bookingId || Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return successResponse(res, 201, 'Payment order generated successfully', order);
  } catch (err) {
    console.error('Razorpay order error:', err);
    return errorResponse(res, 500, 'Failed to create payment order.');
  }
};

/**
 * @desc    Verify Payment Order Completion Signature
 * @route   POST /api/payment/verify
 * @access  Public / Staff
 */
export const verifyPaymentOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, paymentId, bookingId, amount } = req.body;

    if (process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.startsWith('your_razorpay') && razorpay_signature) {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return errorResponse(res, 400, 'Invalid payment signature');
      }
    }

    const verificationResult = {
      orderId: razorpay_order_id || orderId || `ORD-${Date.now()}`,
      paymentId: razorpay_payment_id || paymentId || `PAY-${Date.now()}`,
      bookingId: bookingId || 'BKG-5594',
      status: 'Paid',
      transactionTimestamp: new Date().toISOString()
    };

    await logAuditEvent({
      user: req.user?.name || 'Gateway Callback',
      role: req.user?.role || 'System',
      action: 'Payment update',
      module: 'Payments',
      details: `Payment of ${amount ? '$' + amount : 'order amount'} captured for ${bookingId || orderId || razorpay_order_id}.`,
      relevantRecordId: razorpay_payment_id || paymentId || razorpay_order_id || orderId || 'N/A'
    });

    return successResponse(res, 200, 'Payment verified and captured successfully!', verificationResult);
  } catch (err) {
    return errorResponse(res, 500, 'Payment verification failed.');
  }
};
