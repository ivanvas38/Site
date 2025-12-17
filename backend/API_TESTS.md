# Тестирование API Endpoints

## Предварительные требования

1. Установите зависимости:
```bash
npm install
```

2. Настройте MySQL базу данных (измените настройки в .env файле)

3. Запустите сервер:
```bash
npm start
```

## Тестирование Endpoints

### 1. Проверка работы сервера
```bash
curl -X GET http://localhost:3000/
```

### 2. Регистрация пользователя
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "TestPassword123"
  }'
```

### 3. Вход в систему
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "user@example.com",
    "password": "TestPassword123"
  }'
```

### 4. Получение профиля (требуется токен)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Валидация токена
```bash
curl -X GET http://localhost:3000/api/auth/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Проверка состояния системы
```bash
curl -X GET http://localhost:3000/api/health
```

## Примеры ответов

### Успешная регистрация
```json
{
  "success": true,
  "message": "Пользователь успешно зарегистрирован",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "testuser",
      "created_at": "2023-12-17T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Успешный вход
```json
{
  "success": true,
  "message": "Успешный вход",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "testuser",
      "created_at": "2023-12-17T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Ошибка валидации
```json
{
  "success": false,
  "message": "Ошибка валидации",
  "errors": [
    {
      "field": "email",
      "message": "Некорректный формат email"
    }
  ]
}
```
