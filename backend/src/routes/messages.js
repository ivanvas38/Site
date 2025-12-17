import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { sendMessage } from '../controllers/messagesController.js';

const router = express.Router();

// POST /api/messages/send - Send a message
router.post('/send', authenticateToken, sendMessage);

export default router;
