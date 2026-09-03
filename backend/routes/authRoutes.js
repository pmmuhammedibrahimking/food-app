import express from 'express';
import { login, register, logout, getMe, refreshToken, forgotPassword, resetPassword, generate2FA, verify2FA } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 2FA Routes
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', verify2FA);

// Protected Current User Profile Endpoint
router.get('/me', protect, getMe);

export default router;
