import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { sendMessage, markAsDelivered, markAsRead } from '../controllers/messagesController.js';

const router = express.Router();

// POST /api/messages/send - Send a message
router.post('/send', authenticateToken, sendMessage);

// PATCH /api/messages/:id/deliver - Mark message as delivered
router.patch('/:id/deliver', authenticateToken, markAsDelivered);

// PATCH /api/messages/:id/read - Mark message as read
router.patch('/:id/read', authenticateToken, markAsRead);

export default router;
