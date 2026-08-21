import express from 'express';
import { login, register, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

// Protected Current User Profile Endpoint
router.get('/me', protect, getMe);

export default router;
