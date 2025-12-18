import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getAll, 
  getById, 
  updateProfile, 
  updateAvatar, 
  updateActivity,
  getOnlineUsers 
} from '../controllers/usersController.js';

const router = express.Router();

// GET /api/users - Get all users except current user
router.get('/', authenticateToken, getAll);

// GET /api/users/online - Get online users
router.get('/online', authenticateToken, getOnlineUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, getById);

// PUT /api/users/profile - Update current user profile
router.put('/profile', authenticateToken, updateProfile);

// POST /api/users/profile/avatar - Update user avatar
router.post('/profile/avatar', authenticateToken, updateAvatar);

// POST /api/users/activity - Update user activity (last seen)
router.post('/activity', authenticateToken, updateActivity);

export default router;
