# Messenger Backend

REST API сервер для мессенджера на Node.js + Express

## Быстрый старт

### Установка

```bash
npm install
```

### Конфигурация

```bash
cp .env.example .env
# Отредактируйте .env с вашими настройками
```

### Запуск

```bash
# Development (с автоперезагрузкой)
npm run dev

# Production
npm start
```

Backend будет доступен на `http://localhost:5000`

## Структура проекта

```
src/
├── index.js              # Входная точка
├── config/               # Конфигурация
│   └── database.js      # Настройка БД
├── controllers/          # Контроллеры
│   ├── authController.js
│   ├── userController.js
│   ├── messageController.js
│   └── conversationController.js
├── routes/               # Маршруты
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── messageRoutes.js
│   └── conversationRoutes.js
├── middleware/           # Middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
├── models/               # Модели/Query Builders
├── utils/                # Утилиты
└── database/             # Инициализация БД
```

## Технологический стек

- **Express.js** (4.18+) - веб-фреймворк
- **JWT** - токены аутентификации
- **bcrypt** - хеширование паролей
- **mysql2** - драйвер MySQL
- **dotenv** - переменные окружения
- **CORS** - кросс-доменные запросы

## Переменные окружения

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=messenger

# JWT
JWT_SECRET=your_super_secret_key

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход

### Users
- `GET /api/users/profile` - Получить профиль
- `PUT /api/users/profile` - Обновить профиль
- `GET /api/users/:id` - Получить пользователя

### Conversations
- `GET /api/conversations` - Список диалогов
- `POST /api/conversations` - Создать диалог
- `GET /api/conversations/:id` - Получить диалог

### Messages
- `GET /api/messages` - Получить сообщения
- `POST /api/messages` - Отправить сообщение
- `DELETE /api/messages/:id` - Удалить сообщение

Полная документация API: [API.md](../docs/API.md)

## Требования

- Node.js >= 16.0.0
- MySQL >= 8.0

## Разработка

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для production

```bash
npm run build
```

## Database Schema

См. [INSTALLATION.md](../docs/INSTALLATION.md) для инициализации базы данных

## Лицензия

MIT

## Поддержка

Для вопросов и проблем, пожалуйста, создавайте issues в репозитории.
