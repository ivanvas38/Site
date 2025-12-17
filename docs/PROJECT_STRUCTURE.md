# Структура проекта

## Полная иерархия файлов

```
messenger/
├── backend/                          # Node.js Express API
│   ├── src/
│   │   ├── index.js                 # Входная точка приложения
│   │   ├── config/                  # Конфигурационные файлы
│   │   │   └── database.js          # Конфигурация подключения к БД
│   │   ├── controllers/             # Контроллеры для обработки бизнес-логики
│   │   │   ├── authController.js    # Контроль аутентификации
│   │   │   ├── userController.js    # Управление пользователями
│   │   │   ├── messageController.js # Управление сообщениями
│   │   │   └── conversationController.js # Управление диалогами
│   │   ├── routes/                  # Маршруты API
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   └── conversationRoutes.js
│   │   ├── middleware/              # Middleware функции
│   │   │   ├── authMiddleware.js    # Проверка JWT токена
│   │   │   ├── errorHandler.js      # Обработка ошибок
│   │   │   └── validation.js        # Валидация входных данных
│   │   ├── models/                  # Модели/Query Builders для БД
│   │   │   ├── User.js
│   │   │   ├── Message.js
│   │   │   └── Conversation.js
│   │   ├── utils/                   # Вспомогательные функции
│   │   │   ├── jwt.js               # JWT вспомогательные функции
│   │   │   ├── password.js          # Хеширование паролей
│   │   │   └── validators.js        # Валидаторы
│   │   └── database/                # Инициализация БД
│   │       └── init.js              # SQL скрипты и инициализация
│   ├── .env.example                 # Пример переменных окружения
│   ├── .gitignore                   # Git ignore правила
│   ├── package.json                 # Зависимости и скрипты
│   └── README.md                    # Документация backend
│
├── frontend/                         # React приложение
│   ├── public/
│   │   └── index.html               # HTML шаблон
│   ├── src/
│   │   ├── index.js                 # Входная точка React
│   │   ├── App.jsx                  # Главный компонент
│   │   ├── components/              # React компоненты
│   │   │   ├── Auth/                # Компоненты аутентификации
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── Chat/                # Компоненты чата
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── MessageList.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   └── ConversationList.jsx
│   │   │   ├── Layout/              # Layout компоненты
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── Common/              # Переиспользуемые компоненты
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── Loading.jsx
│   │   ├── pages/                   # Страницы приложения
│   │   │   ├── HomePage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js           # Hook для аутентификации
│   │   │   ├── useMessages.js       # Hook для сообщений
│   │   │   └── useConversations.js  # Hook для диалогов
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.js       # Контекст аутентификации
│   │   │   └── ChatContext.js       # Контекст чата
│   │   ├── services/                # API сервисы
│   │   │   ├── api.js               # Axios инстанс и конфигурация
│   │   │   ├── authService.js       # Сервис аутентификации
│   │   │   ├── userService.js       # Сервис пользователей
│   │   │   ├── messageService.js    # Сервис сообщений
│   │   │   └── conversationService.js # Сервис диалогов
│   │   ├── styles/                  # CSS стили
│   │   │   ├── index.css            # Главные стили (Tailwind импорт)
│   │   │   └── variables.css        # CSS переменные
│   │   └── utils/                   # Утилиты
│   │       ├── helpers.js           # Вспомогательные функции
│   │       ├── constants.js         # Константы
│   │       └── storage.js           # LocalStorage helpers
│   ├── .gitignore                   # Git ignore правила
│   ├── babel.config.js              # Babel конфигурация
│   ├── tailwind.config.js           # TailwindCSS конфигурация
│   ├── tsconfig.json                # TypeScript конфигурация
│   ├── package.json                 # Зависимости и скрипты
│   └── README.md                    # Документация frontend
│
├── docs/                            # Документация проекта
│   ├── ARCHITECTURE.md              # Архитектура приложения
│   ├── INSTALLATION.md              # Инструкция установки
│   ├── API.md                       # Документация API
│   ├── DEVELOPMENT.md               # Руководство разработчика
│   └── PROJECT_STRUCTURE.md         # Этот файл
│
├── .gitignore                       # Глобальные git ignore правила
└── README.md                        # Основная документация
```

## Описание ключевых папок

### Backend структура

| Папка | Назначение |
|-------|-----------|
| `src/` | Весь исходный код приложения |
| `src/config/` | Конфигурационные файлы (БД, окружение) |
| `src/controllers/` | Контроллеры для обработки логики endpoints |
| `src/routes/` | Определение API маршрутов |
| `src/middleware/` | Middleware для обработки запросов |
| `src/models/` | Модели БД и query builders |
| `src/utils/` | Утилиты и помощники |
| `src/database/` | Скрипты инициализации БД |

### Frontend структура

| Папка | Назначение |
|-------|-----------|
| `public/` | Статические файлы (index.html) |
| `src/` | Весь исходный код React приложения |
| `src/components/` | React компоненты |
| `src/pages/` | Полные страницы приложения |
| `src/hooks/` | Custom React hooks |
| `src/context/` | React Context для состояния |
| `src/services/` | Сервисы для API запросов |
| `src/styles/` | CSS стили (Tailwind) |
| `src/utils/` | Утилиты и помощники |

## Соглашения по именованию

### Backend

- **Файлы контроллеров**: `entityController.js` (例: `userController.js`)
- **Файлы маршрутов**: `entityRoutes.js` (例: `userRoutes.js`)
- **Функции контроллеров**: camelCase (例: `getUser`, `createMessage`)
- **Переменные окружения**: UPPER_SNAKE_CASE (例: `DB_HOST`, `JWT_SECRET`)

### Frontend

- **Компоненты**: PascalCase (例: `MessageList.jsx`, `ChatWindow.jsx`)
- **Страницы**: PascalCase с суффиксом Page (例: `HomePage.jsx`, `ChatPage.jsx`)
- **Hooks**: camelCase с префиксом use (例: `useAuth.js`, `useMessages.js`)
- **Сервисы**: camelCase (例: `authService.js`, `messageService.js`)
- **Функции и переменные**: camelCase (例: `fetchMessages`, `isLoading`)
- **Константы**: UPPER_SNAKE_CASE (例: `MAX_MESSAGE_LENGTH`, `API_TIMEOUT`)

## Инициализация новых модулей

### Добавление нового Backend route

1. Создайте контроллер в `src/controllers/` (例: `postController.js`)
2. Создайте маршруты в `src/routes/` (例: `postRoutes.js`)
3. Подключите маршруты в `src/index.js`
4. Добавьте model если нужно в `src/models/`

### Добавление нового Frontend компонента

1. Создайте компонент в соответствующую папку `src/components/`
2. Импортируйте и используйте в других компонентах или страницах
3. Если нужно глобальное состояние, добавьте в `src/context/`
4. Если нужен сервис, добавьте в `src/services/`

## Размер проекта

- **Backend**: ~10-15 файлов на начальном этапе
- **Frontend**: ~20-30 компонентов на начальном этапе
- **Документация**: 5 файлов
- **Всего**: 50-60 файлов в начальной структуре

## Масштабирование структуры

При расширении проекта рассмотрите:

- **Разделение больших папок**: Например, разделить `controllers/` по доменам
- **Добавление тестов**: `tests/` или `__tests__/` папки
- **Database migrations**: `migrations/` папка для управления БД изменениями
- **Статические файлы**: `assets/` папка в frontend для изображений и иконок
- **Config файлы**: Отдельные конфигурации для development/production

## Ссылки

- [Архитектура](./ARCHITECTURE.md)
- [Установка](./INSTALLATION.md)
- [API Документация](./API.md)
- [Разработка](./DEVELOPMENT.md)
