import express from 'express';
import {
  registerCustomer,
  verifyEmail,
  resendVerificationOTP,
  loginCustomer,
  googleAuth,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getCustomerMe,
  updateCustomerProfile,
  changeCustomerPassword,
  uploadAvatar,
  toggleFavorite,
  logoutCustomer,
  refreshCustomerToken
} from '../controllers/customerAuthController.js';
import { protectCustomer } from '../middleware/customerAuthMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/auth/register', registerCustomer);
router.post('/auth/verify-email', verifyEmail);
router.post('/auth/resend-otp', resendVerificationOTP);
router.post('/auth/login', loginCustomer);
router.post('/auth/google', googleAuth);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/verify-reset-otp', verifyResetOTP);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/logout', logoutCustomer);
router.post('/auth/refresh', refreshCustomerToken);

// Protected Customer Profile Endpoints
router.get('/auth/me', protectCustomer, getCustomerMe);
router.put('/auth/profile', protectCustomer, updateCustomerProfile);
router.put('/auth/change-password', protectCustomer, changeCustomerPassword);
router.post('/auth/upload-avatar', protectCustomer, uploadAvatar);
router.post('/favorites/:roomNumber', protectCustomer, toggleFavorite);

export default router;
