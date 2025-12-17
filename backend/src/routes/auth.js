import express from 'express';
import { register, login, getProfile, validateToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getProfile);
router.get('/profile', authenticateToken, getProfile);
router.get('/validate', authenticateToken, validateToken);

export default router;
