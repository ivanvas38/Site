# TeleApp - React Frontend + Express Backend Integration

Современное полнофункциональное приложение с React фронтенд-частью в стиле Telegram и Express бэкенд-частью с MySQL базой данных. Интегрированная система аутентификации с JWT, сохранением сессии и защитой маршрутов.

## Возможности

### Фронтенд
- 🎨 **Красивый дизайн** - Минималистичный интерфейс в стиле Telegram
- 📱 **Responsive** - Адаптивный дизайн для всех устройств
- 🌙 **Темная тема** - Встроенная поддержка темной темы
- 🔐 **Аутентификация** - Полная система входа и регистрации
- ✨ **Анимации** - Плавные переходы и анимации
- 🇷🇺 **Русский язык** - Полная поддержка русского языка
- 📦 **TypeScript** - Полная типизация для надежности
- 🎯 **Lucide Icons** - Красивые иконки

### Бэкенд
- 🚀 **Express.js** - Мощный REST API фреймворк
- 🗄️ **MySQL** - Надежная база данных
- 🔐 **JWT Authentication** - Безопасная аутентификация
- 🔒 **bcrypt** - Безопасное хеширование паролей
- 🛡️ **CORS** - Защита от кросс-доменных запросов
- ✅ **Error Handling** - Полная обработка ошибок

## Технологический стек

### Фронтенд
- **React 18** - UI библиотека
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS** - Утилит-первый CSS фреймворк
- **Vite** - Современный build инструмент
- **Lucide React** - Иконки

### Бэкенд
- **Node.js** - Runtime environment
- **Express.js** - Web фреймворк
- **MySQL** - База данных
- **bcrypt** - Хеширование паролей
- **jsonwebtoken** - JWT токены
- **dotenv** - Управление переменными окружения

## Структура проекта

```
.
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ProtectedPage.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── NavigationContext.tsx
│   │   ├── components/
│   │   │   └── PrivateRoute.tsx
│   │   └── utils/
│   │       └── api.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── routes/
│   │   │   └── auth.js
│   │   └── middleware/
│   │       └── auth.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Установка и запуск

### Требования
- Node.js 16 или выше
- npm или yarn
- MySQL 5.7 или выше

### Установка зависимостей фронтенд-части

```bash
npm install
```

### Разработка фронтенд-части

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

### Сборка для production

```bash
npm run build
```

### Проверка типов

```bash
npm run type-check
```

### Линтинг

```bash
npm run lint
```

### Установка и запуск бэкенд-части

```bash
cd backend
npm install
npm start
```
