# Messenger Frontend

React приложение для мессенджера с TailwindCSS и Axios

## Быстрый старт

### Установка

```bash
npm install
```

### Запуск

```bash
npm start
```

Frontend будет доступен на `http://localhost:3000`

## Структура проекта

```
src/
├── index.js              # Входная точка React приложения
├── App.jsx              # Главный компонент приложения
├── components/          # React компоненты
│   ├── Auth/            # Компоненты аутентификации
│   ├── Chat/            # Компоненты чата
│   ├── Layout/          # Layout компоненты
│   └── Common/          # Переиспользуемые компоненты
├── pages/               # Страницы приложения
│   ├── HomePage.jsx
│   ├── ChatPage.jsx
│   └── ProfilePage.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js
│   └── useMessages.js
├── context/             # React Context для управления состоянием
│   └── AuthContext.js
├── services/            # API сервисы (Axios)
│   ├── api.js           # Axios инстанс
│   ├── authService.js
│   ├── userService.js
│   └── messageService.js
├── styles/              # Глобальные стили
│   └── index.css        # Tailwind CSS импорт
└── utils/               # Утилиты
    └── helpers.js       # Вспомогательные функции
```

## Технологический стек

- **React** (18+) - UI библиотека
- **Axios** - HTTP клиент
- **TailwindCSS** (3+) - CSS фреймворк
- **Lucide Icons** - SVG иконки
- **React Hooks** - State management

## Доступные скрипты

### `npm start`

Запускает приложение в режиме разработки.
Откройте [http://localhost:3000](http://localhost:3000) в браузере.

Страница перезагружается при внесении изменений в код.
Вы также можете увидеть ошибки и предупреждения в консоли.

### `npm test`

Запускает тестовый набор в интерактивном режиме просмотра.

### `npm run build`

Собирает приложение для production в папку `build`.
Сборка правильно минифицирована и оптимизирована для наилучшей производительности.

### `npm run eject`

**Примечание: эта одностороннее операция. После ejecting, вы не сможете вернуться!**

Если вас не устраивает инструмент build и выбор конфигурации, вы можете ejected в любое время. Эта команда удалит единую зависимость build из вашего проекта.

## Конфигурация

### TailwindCSS

TailwindCSS уже настроена в `tailwind.config.js`.

Используйте Tailwind классы прямо в JSX:

```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello World
</div>
```

### Axios

API сервис находится в `src/services/api.js`.

Все HTTP запросы должны идти через этот сервис для консистентности и перехвата ошибок.

### Переменные окружения

Создайте `.env.local` файл в корне проекта:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Используйте в коде:

```javascript
const apiUrl = process.env.REACT_APP_API_URL;
```

## Компонентная структура

### Auth Components

- `LoginForm` - Форма входа
- `RegisterForm` - Форма регистрации
- `ProtectedRoute` - Защищённый маршрут

### Chat Components

- `ChatWindow` - Окно чата
- `MessageList` - Список сообщений
- `MessageInput` - Поле ввода сообщения
- `ConversationList` - Список диалогов

### Layout Components

- `Header` - Шапка приложения
- `Sidebar` - Боковая панель
- `Footer` - Футер

### Common Components

- `Button` - Кнопка
- `Input` - Поле ввода
- `Modal` - Модальное окно
- `Loading` - Индикатор загрузки

## Использование Lucide Icons

```jsx
import { MessageSquare, Send, Home } from 'lucide-react';

function MyComponent() {
  return (
    <div>
      <MessageSquare size={24} />
      <Send size={24} />
      <Home size={24} />
    </div>
  );
}
```

## State Management

Используется React Context API для управления глобальным состоянием (аутентификация, пользователь).

Для более сложного состояния можно добавить Redux или Zustand.

## Стилизация

### Использование Tailwind CSS

Основное стилизирование выполняется через Tailwind CSS классы.

Глобальные стили находятся в `src/styles/index.css`.

Кастомные стили можно добавлять в `tailwind.config.js` в секцию `theme.extend`.

## Требования

- Node.js >= 16.0.0
- npm >= 8.0.0

## Лицензия

MIT

## Поддержка

Для вопросов и проблем, пожалуйста, создавайте issues в репозитории.
