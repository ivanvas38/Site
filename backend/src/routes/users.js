import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll } from '../controllers/usersController.js';

const router = express.Router();

// GET /api/users - Get all users except current user
router.get('/', authenticateToken, getAll);

export default router;
