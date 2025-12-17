# API Documentation

> Документация REST API для проекта

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3001/api
```

## Authentication

API использует JWT (JSON Web Tokens) для аутентификации.

### Получение токена

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Использование токена

Добавьте токен в заголовок всех запросов, требующих аутентификации:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Health Check

Проверка состояния API.

```bash
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Authentication

#### POST /auth/login

Аутентификация пользователя.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string"
  }
}
```

#### POST /auth/register

Регистрация нового пользователя.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string"
  }
}
```

#### POST /auth/logout

Выход пользователя (аннулирование токена).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /auth/profile

Получение профиля текущего пользователя.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

### User Management

#### GET /users

Получение списка пользователей (только для администраторов).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `page` (number, default: 1) - номер страницы
- `limit` (number, default: 10) - количество элементов на странице
- `search` (string, optional) - поиск по имени или email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "email": "string",
      "name": "string",
      "created_at": "string"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

#### GET /users/:id

Получение пользователя по ID.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

#### PUT /users/:id

Обновление данных пользователя.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "updated_at": "string"
  }
}
```

#### DELETE /users/:id

Удаление пользователя (только для администраторов).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

Все ошибки возвращаются в едином формате:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Additional error details (optional)"
  }
}
```

### Стандартные коды ошибок

| HTTP Code | Error Code | Description |
|-----------|------------|-------------|
| 400 | VALIDATION_ERROR | Ошибка валидации данных |
| 401 | UNAUTHORIZED | Неавторизованный доступ |
| 403 | FORBIDDEN | Недостаточно прав доступа |
| 404 | NOT_FOUND | Ресурс не найден |
| 409 | CONFLICT | Конфликт данных |
| 422 | INVALID_INPUT | Неверный формат входных данных |
| 500 | INTERNAL_ERROR | Внутренняя ошибка сервера |

### Примеры ошибок

#### 400 - Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "reason": "required"
    }
  }
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

## Rate Limiting

API имеет ограничения на количество запросов:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour

Информация о лимитах возвращается в заголовках ответа:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

Для endpoints, возвращающих списки, используется пагинация:

### Параметры
- `page` - номер страницы (начиная с 1)
- `limit` - количество элементов на странице (максимум 100)

### Пример использования

```bash
GET /users?page=2&limit=20
```

### Response format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## WebSocket Events

Для real-time коммуникации используется Socket.io.

### Подключение

```javascript
const socket = io('https://your-domain.com', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### События

#### user:online
Уведомление о том, что пользователь онлайн.

```json
{
  "userId": 1,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### user:offline
Уведомление о том, что пользователь офлайн.

```json
{
  "userId": 1,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Testing API

### curl examples

#### Health check
```bash
curl -X GET https://your-domain.com/api/health
```

#### Login
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Get user profile
```bash
curl -X GET https://your-domain.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update user
```bash
curl -X PUT https://your-domain.com/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "email": "newemail@example.com"
  }'
```

### JavaScript/Axios examples

#### Basic requests
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://your-domain.com/api'
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Get user profile
const getProfile = async (token) => {
  const response = await api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

#### With error handling
```javascript
const makeRequest = async (request) => {
  try {
    const response = await request;
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: 'Network error' }
    };
  }
};
```

## SDK Examples

### Node.js SDK

```javascript
const ProjectAPI = require('project-api');

const api = new ProjectAPI({
  baseURL: 'https://your-domain.com/api',
  apiKey: 'YOUR_JWT_TOKEN'
});

// Usage
const user = await api.users.getProfile();
const users = await api.users.list({ page: 1, limit: 10 });
```

### React Hooks Example

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const useUserProfile = (token) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('https://your-domain.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (err) {
        setError(err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  return { user, loading, error };
};
```

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Authentication endpoints
- User management endpoints
- WebSocket support
- Rate limiting implementation