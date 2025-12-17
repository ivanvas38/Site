# Messenger - Полнофункциональный мессенджер

Полнофункциональное веб-приложение мессенджера с использованием современных технологий.

## Структура проекта

```
messenger/
├── backend/          # Node.js + Express API сервер
├── frontend/         # React + TailwindCSS UI приложение
├── docs/            # Документация проекта
├── .gitignore       # Файл для игнорирования версионирования
└── README.md        # Этот файл
```

## Требования

- Node.js >= 16.x
- npm >= 8.x или yarn >= 3.x
- MySQL >= 8.0

## Быстрый старт

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Отредактируйте .env с вашими конфигурациями
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Технологический стек

### Backend
- **Express.js** - веб-фреймворк
- **JWT** - аутентификация
- **bcrypt** - хеширование паролей
- **mysql2** - работа с БД
- **dotenv** - переменные окружения
- **cors** - CORS поддержка

### Frontend
- **React** - UI библиотека
- **TailwindCSS** - стили
- **Axios** - HTTP клиент
- **Lucide Icons** - иконки

## Разработка

Детальная информация по разработке находится в папке `docs/`.

## Лицензия

MIT
