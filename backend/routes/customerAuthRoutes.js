import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  forgotPassword,
  resetPassword,
  getCustomerMe,
  updateCustomerProfile,
  changeCustomerPassword,
  toggleFavorite
} from '../controllers/customerAuthController.js';
import { protectCustomer } from '../middleware/customerAuthMiddleware.js';

const router = express.Router();

// Public Customer Auth Endpoints
router.post('/auth/register', registerCustomer);
router.post('/auth/login', loginCustomer);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

// Protected Customer Profile & Preferences Endpoints
router.get('/auth/me', protectCustomer, getCustomerMe);
router.put('/auth/profile', protectCustomer, updateCustomerProfile);
router.put('/auth/change-password', protectCustomer, changeCustomerPassword);
router.post('/favorites/:roomNumber', protectCustomer, toggleFavorite);

export default router;
