const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const register = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 50 }).trim().escape(),
  body('password').isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Ошибка валидации',
          errors: errors.array()
        });
      }

      const { email, username, password } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует'
        });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким username уже существует'
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        email,
        username,
        passwordHash
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          },
          token
        }
      });

    } catch (error) {
      console.error('Ошибка регистрации:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  }
];

const login = [
  body('email').optional().isEmail().normalizeEmail(),
  body('password').notEmpty(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Ошибка валидации',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email обязателен'
        });
      }

      const user = await User.findByEmailOrUsername(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Неверные учетные данные'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Неверный пароль'
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Успешный вход',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          },
          token
        }
      });

    } catch (error) {
      console.error('Ошибка входа:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  }
];

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      }
    });

  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

const validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      success: true,
      message: 'Токен действителен',
      data: {
        userId: decoded.userId,
        email: decoded.email
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  validateToken
};
