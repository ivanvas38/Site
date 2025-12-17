const express = require('express');
const router = express.Router();
const { register, login, getProfile, validateToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getProfile);
router.get('/profile', authenticateToken, getProfile);
router.get('/validate', authenticateToken, validateToken);

module.exports = router;
