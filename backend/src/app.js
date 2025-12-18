import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import { createTables } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Backend API работает',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        validate: 'GET /api/auth/validate'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.use('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден',
    path: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  console.error('Ошибка сервера:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Неверный формат JSON'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
});

const startServer = async () => {
  try {
    await createTables();
    console.log('База данных инициализирована');
    
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`API доступно по адресу: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

startServer();
