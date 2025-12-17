import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { sendMessage, markAsDelivered, markAsRead, editMessage, deleteMessage } from '../controllers/messagesController.js';

const router = express.Router();

// POST /api/messages/send - Send a message
router.post('/send', authenticateToken, sendMessage);

// PATCH /api/messages/:id/edit - Edit a message
router.patch('/:id/edit', authenticateToken, editMessage);

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', authenticateToken, deleteMessage);

// PATCH /api/messages/:id/deliver - Mark message as delivered
router.patch('/:id/deliver', authenticateToken, markAsDelivered);

// PATCH /api/messages/:id/read - Mark message as read
router.patch('/:id/read', authenticateToken, markAsRead);

export default router;
