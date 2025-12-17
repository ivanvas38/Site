# Site

## Backend - Node.js + Express + MySQL

Этот проект содержит бэкенд на Node.js с Express и подключением к MySQL.

### Структура проекта:
- `backend/src/` - исходный код бэкенда
  - `app.js` - основная конфигурация Express
  - `config/database.js` - подключение к MySQL
  - `models/User.js` - модель пользователя
  - `controllers/authController.js` - логика регистрации и входа
  - `routes/auth.js` - маршруты аутентификации
  - `middleware/auth.js` - JWT middleware

### Функциональность:
- POST /api/auth/register - регистрация пользователей
- POST /api/auth/login - вход с JWT токеном
- Хеширование паролей с bcrypt
- CORS настройки
- Error handling

### Установка и запуск:
```bash
cd backend
npm install
npm start
```