import express from 'express';
import { handleAiChat, handleConfirmAction } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', handleAiChat);
router.post('/confirm-action', handleConfirmAction);

export default router;
