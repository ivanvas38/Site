import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getConversations, 
  getConversationMessages 
} from '../controllers/conversationsController.js';

const router = express.Router();

// GET /api/conversations - Get all conversations for current user
router.get('/', authenticateToken, getConversations);

// GET /api/conversations/:id/messages - Get messages for a specific conversation
router.get('/:id/messages', authenticateToken, getConversationMessages);

export default router;
