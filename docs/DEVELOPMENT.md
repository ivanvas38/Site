# Руководство по разработке

## Советы для разработчиков

### Запуск обеих частей приложения

Откройте два отдельных терминала:

**Терминал 1 - Backend:**
```bash
cd backend
npm run dev
```

**Терминал 2 - Frontend:**
```bash
cd frontend
npm start
```

## Структура репозитория

```
messenger/
├── backend/              # Express API
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── frontend/             # React приложение
│   ├── src/
│   ├── public/
│   ├── .gitignore
│   ├── babel.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
├── docs/                 # Документация
│   ├── ARCHITECTURE.md
│   ├── INSTALLATION.md
│   ├── API.md
│   └── DEVELOPMENT.md
├── .gitignore
└── README.md
```

## Git Workflow

### Создание нового feature

```bash
# Создайте новую ветку
git checkout -b feature/your-feature-name

# Делайте коммиты с понятными сообщениями
git commit -m "feat: add user authentication"

# Когда готово, создайте Pull Request
```

### Коммит сообщения

Используйте Conventional Commits:

```
feat: добавить новую функцию
fix: исправить баг
docs: обновить документацию
style: форматирование, отсутствующие точки с запятой и т.д.
refactor: переработать код без изменения функциональности
perf: улучшение производительности
test: добавить или обновить тесты
chore: обновления зависимостей и другие хозяйственные работы
```

Пример:
```
git commit -m "feat: добавить функцию удаления сообщений"
git commit -m "fix: исправить ошибку при загрузке диалогов"
```

## Правила кодирования

### Backend (Node.js)

1. Используйте ES6+ синтаксис
2. Структурируйте код в папки по функциям
3. Используйте async/await вместо callbacks
4. Добавляйте error handling везде где нужно
5. Валидируйте входные данные

Пример контроллера:
```javascript
// controllers/userController.js
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Frontend (React)

1. Используйте functional components с hooks
2. Разбивайте компоненты на меньшие части
3. Используйте propTypes или TypeScript для типизации
4. Обрабатывайте ошибки в API запросах
5. Используйте TailwindCSS для стилей

Пример компонента:
```jsx
// components/Chat/MessageList.jsx
import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

export default function MessageList({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetchConversationMessages(conversationId);
        setMessages(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  if (loading) {
    return <div className="text-center p-4">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <MessageSquare size={48} />
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="mb-4">
            <p className="text-sm font-semibold">{msg.username}</p>
            <p className="text-gray-700">{msg.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
```

## Тестирование

### Backend

```bash
cd backend
npm test
```

Используйте Jest для unit тестов.

### Frontend

```bash
cd frontend
npm test
```

Используйте React Testing Library для компонентных тестов.

## Debugging

### Backend

Используйте console.log или отладчик Node.js:

```bash
node --inspect src/index.js
```

Откройте `chrome://inspect` в Chrome DevTools.

### Frontend

Используйте React DevTools и Chrome DevTools для отладки.

## Performance Optimization

### Backend

- Используйте connection pooling для БД
- Кэшируйте часто используемые данные
- Оптимизируйте database queries с индексами
- Используйте pagination для больших наборов данных

### Frontend

- Lazy load компоненты
- Используйте React.memo для оптимизации рендеринга
- Оптимизируйте изображения
- Используйте Code Splitting

## Мониторинг и Логирование

### Backend

Добавьте логирование для отладки:

```javascript
console.log('User login attempt:', email);
console.error('Database error:', error);
```

Для production используйте специальные библиотеки вроде Winston или Pino.

### Frontend

Используйте console для разработки, в production отправляйте логи на сервер:

```javascript
const logError = (error) => {
  if (process.env.NODE_ENV === 'production') {
    // Отправить на сервер мониторинга
  } else {
    console.error(error);
  }
};
```

## Решение проблем при разработке

### CORS ошибки

Проверьте `CORS_ORIGIN` в `.env` файле backend.

### Проблемы с БД

1. Проверьте что MySQL запущен
2. Проверьте учетные данные в `.env`
3. Проверьте что БД создана и инициализирована

### Порты заняты

Измените PORT в `.env` backend или порт в frontend конфигурации.

### Модули не найдены

```bash
# Очистите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

## IDE Setup

### VSCode Extensions

Рекомендуемые расширения:

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- Thunder Client (для тестирования API)

### ESLint и Prettier

Добавьте конфигурацию в `.eslintrc.json`:

```json
{
  "extends": ["react-app"],
  "rules": {
    "no-console": "warn"
  }
}
```

## Contributing

1. Fork репозиторий
2. Создайте feature ветку
3. Коммитьте с понятными сообщениями
4. Push в ветку
5. Откройте Pull Request

## FAQ

**Q: Как добавить новый endpoint?**
A: Создайте новый контроллер в `backend/src/controllers`, маршрут в `backend/src/routes`, и подключите в `index.js`.

**Q: Как добавить новый компонент?**
A: Создайте файл `.jsx` в папке `frontend/src/components` и используйте в других компонентах.

**Q: Как обновить переменные окружения?**
A: Скопируйте `.env.example` в `.env` и отредактируйте значения.

**Q: Как работает аутентификация?**
A: Используется JWT токены. При логине backend возвращает токен, который сохраняется в localStorage и отправляется в каждом запросе.
