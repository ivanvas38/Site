# Переменные окружения

## Backend переменные (.env)

Все переменные окружения для backend должны быть определены в файле `.env` в папке `backend/`.

Используйте `.env.example` как шаблон:
```bash
cp backend/.env.example backend/.env
```

### Описание переменных

#### Database Configuration

| Переменная | Тип | Пример | Описание |
|-----------|-----|--------|---------|
| `DB_HOST` | string | `localhost` | Адрес хоста MySQL сервера |
| `DB_USER` | string | `root` | Имя пользователя для подключения к БД |
| `DB_PASSWORD` | string | `password123` | Пароль пользователя БД |
| `DB_NAME` | string | `messenger` | Название базы данных |

#### JWT Configuration

| Переменная | Тип | Пример | Описание |
|-----------|-----|--------|---------|
| `JWT_SECRET` | string | `super_secret_key_...` | Секретный ключ для подписания JWT токенов |

#### Server Configuration

| Переменная | Тип | Пример | Описание |
|-----------|-----|--------|---------|
| `PORT` | number | `5000` | Порт на котором будет запущен сервер |
| `NODE_ENV` | string | `development` | Окружение (`development`, `production`, `test`) |

#### CORS Configuration

| Переменная | Тип | Пример | Описание |
|-----------|-----|--------|---------|
| `CORS_ORIGIN` | string | `http://localhost:3000` | Разрешённый origin для CORS запросов |

### Пример .env файла

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=messenger

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Frontend переменные (.env)

Frontend использует переменные префиксом `REACT_APP_`. Они устанавливаются при build времени.

Создайте файл `.env.local` в папке `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=5000
```

### Доступные переменные

| Переменная | Тип | Пример | Описание |
|-----------|-----|--------|---------|
| `REACT_APP_API_URL` | string | `http://localhost:5000/api` | Base URL для API запросов |
| `REACT_APP_API_TIMEOUT` | number | `5000` | Timeout для API запросов в мс |

## Переменные для разных окружений

### Development

**Backend (.env)**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=messenger
JWT_SECRET=dev-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.development.local)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=5000
```

### Production

**Backend (.env.production)**
```env
DB_HOST=db.example.com
DB_USER=prod_user
DB_PASSWORD=strong_password
DB_NAME=messenger_prod
JWT_SECRET=production_secret_key_long_and_complex
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://messenger.example.com
```

**Frontend (.env.production)**
```env
REACT_APP_API_URL=https://api.messenger.example.com/api
REACT_APP_API_TIMEOUT=10000
```

## Правила безопасности

⚠️ **ВАЖНО!**

1. **Никогда не коммитьте .env файлы** - используйте `.env.example`
2. **Меняйте `JWT_SECRET`** в production на уникальное значение
3. **Используйте сильные пароли** для БД в production
4. **Не сохраняйте в git** файлы с реальными credentials
5. **Разные переменные** для development и production
6. **Используйте переменные окружения** вместо hardcoded значений

## Загрузка переменных

### Backend (Node.js + dotenv)

```javascript
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST;
const jwtSecret = process.env.JWT_SECRET;
```

### Frontend (React)

```javascript
const apiUrl = process.env.REACT_APP_API_URL;
const apiTimeout = process.env.REACT_APP_API_TIMEOUT || 5000;
```

⚠️ **Примечание**: Frontend переменные должны начинаться с `REACT_APP_` префикса, иначе они не будут доступны.

## Проверка переменных

### Backend

```bash
cd backend
# Убедитесь что .env существует
ls -la .env

# Проверьте переменные в коде
grep -r "process.env" src/
```

### Frontend

```bash
cd frontend
# Убедитесь что .env.local существует
ls -la .env.local

# Проверьте переменные в коде
grep -r "REACT_APP_" src/
```

## Переменные по умолчанию

Если переменная не установлена, используются значения по умолчанию:

| Переменная | По умолчанию |
|-----------|------------|
| `PORT` | `5000` |
| `NODE_ENV` | `development` |
| `CORS_ORIGIN` | `http://localhost:3000` |
| `DB_HOST` | `localhost` |

## Trouble Shooting

### Переменные не загружаются

1. Убедитесь что файл `.env` находится в корне папки `backend/`
2. Проверьте что используется `dotenv.config()` в начале файла
3. Перезагрузите сервер после изменения `.env`

### CORS ошибка

1. Проверьте `CORS_ORIGIN` в `.env` backend
2. Убедитесь что frontend обращается к backend на правильный адрес
3. Проверьте `REACT_APP_API_URL` в `.env.local` frontend

### API запросы не работают

1. Проверьте что `REACT_APP_API_URL` правильный
2. Убедитесь что backend запущен и доступен
3. Проверьте browser console на ошибки
