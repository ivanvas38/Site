# Архитектура проекта

## Общая структура

Проект использует классическую архитектуру клиент-сервер:
- **Backend**: Node.js + Express REST API
- **Frontend**: React Single Page Application

## Backend архитектура

### Структура папок

```
backend/
├── src/
│   ├── index.js          # Входная точка приложения
│   ├── config/           # Конфигурация
│   ├── controllers/       # Контроллеры для обработки запросов
│   ├── routes/           # Маршруты API
│   ├── middleware/       # Middleware (аутентификация, валидация)
│   ├── models/           # БД модели
│   ├── utils/            # Утилиты и вспомогательные функции
│   └── database/         # Инициализация БД
├── .env.example          # Пример переменных окружения
├── package.json          # Зависимости
└── README.md             # Документация
```

### API структура

- **Authentication**: `/api/auth`
  - `POST /register` - Регистрация пользователя
  - `POST /login` - Вход пользователя
  - `POST /logout` - Выход пользователя

- **Users**: `/api/users`
  - `GET /profile` - Получить профиль
  - `PUT /profile` - Обновить профиль
  - `GET /:id` - Получить пользователя по ID

- **Messages**: `/api/messages`
  - `GET /` - Получить сообщения
  - `POST /` - Отправить сообщение
  - `DELETE /:id` - Удалить сообщение

- **Conversations**: `/api/conversations`
  - `GET /` - Список диалогов
  - `POST /` - Создать диалог
  - `GET /:id` - Получить диалог

## Frontend архитектура

### Структура папок

```
frontend/
├── public/               # Статические файлы
├── src/
│   ├── index.js         # Входная точка
│   ├── App.jsx          # Главный компонент
│   ├── components/      # React компоненты
│   ├── pages/           # Страницы приложения
│   ├── hooks/           # Custom React hooks
│   ├── context/         # Context API
│   ├── services/        # API сервисы (Axios)
│   ├── styles/          # Глобальные стили
│   └── utils/           # Утилиты
├── tailwind.config.js   # Tailwind конфигурация
├── babel.config.js      # Babel конфигурация
├── tsconfig.json        # TypeScript конфигурация
└── package.json         # Зависимости
```

### Компонентная структура

- **Layout**: Шапка, сайдбар, футер
- **Auth**: Формы входа/регистрации
- **Chat**: Список диалогов, окно чата
- **Profile**: Профиль пользователя, настройки
- **Common**: Кнопки, инпуты, модали

## Технологический стек

### Backend
- **Express.js** (4.18+) - веб-фреймворк
- **JWT** - JWT токены для аутентификации
- **bcrypt** - хеширование паролей
- **mysql2** - драйвер MySQL
- **dotenv** - управление переменными окружения
- **cors** - CORS поддержка
- **Node.js** (16+) - runtime

### Frontend
- **React** (18+) - UI библиотека
- **Axios** - HTTP клиент
- **TailwindCSS** (3+) - CSS фреймворк
- **Lucide Icons** - SVG иконки
- **React Router** (опционально) - маршрутизация

## Безопасность

1. **Аутентификация**: JWT токены
2. **Пароли**: Хеширование с bcrypt
3. **CORS**: Настроено для безопасности
4. **Переменные окружения**: Чувствительные данные в .env
5. **Валидация**: Валидация входных данных на сервере

## База данных

MySQL 8.0+ с поддержкой:
- Пользователи (users)
- Сообщения (messages)
- Диалоги (conversations)
- Участники диалогов (conversation_members)

## Workflow разработки

1. Клонировать репозиторий
2. Установить зависимости backend: `cd backend && npm install`
3. Установить зависимости frontend: `cd frontend && npm install`
4. Скопировать и заполнить `.env` файл в backend
5. Запустить backend: `npm run dev`
6. Запустить frontend: `npm start`
