# API Документация

## Базовый URL

```
http://localhost:5000/api
```

## Аутентификация

Все защищённые endpoints требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Регистрация

```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Ответ (200):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Вход

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Ответ (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Выход

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "message": "Logout successful"
}
```

### Users

#### Получить профиль текущего пользователя

```http
GET /users/profile
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Обновить профиль

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john_updated",
  "email": "john.updated@example.com"
}
```

**Ответ (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "john_updated",
    "email": "john.updated@example.com"
  }
}
```

#### Получить пользователя по ID

```http
GET /users/:id
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "id": 2,
  "username": "jane_doe",
  "email": "jane@example.com"
}
```

### Conversations

#### Получить все диалоги пользователя

```http
GET /conversations
Authorization: Bearer <token>
```

**Ответ (200):**
```json
[
  {
    "id": 1,
    "name": "John & Jane",
    "type": "direct",
    "created_at": "2024-01-15T10:30:00Z",
    "members": [
      {"id": 1, "username": "john_doe"},
      {"id": 2, "username": "jane_doe"}
    ]
  }
]
```

#### Создать новый диалог

```http
POST /conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "direct",
  "member_ids": [2]
}
```

**Ответ (201):**
```json
{
  "id": 1,
  "name": null,
  "type": "direct",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Получить диалог по ID с сообщениями

```http
GET /conversations/:id
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "id": 1,
  "name": "John & Jane",
  "type": "direct",
  "members": [
    {"id": 1, "username": "john_doe"},
    {"id": 2, "username": "jane_doe"}
  ],
  "messages": [
    {
      "id": 1,
      "user_id": 1,
      "username": "john_doe",
      "content": "Hello!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Messages

#### Получить сообщения диалога

```http
GET /messages?conversation_id=1&limit=50&offset=0
Authorization: Bearer <token>
```

**Параметры:**
- `conversation_id` - ID диалога (обязательно)
- `limit` - Количество сообщений (default: 50)
- `offset` - Смещение (default: 0)

**Ответ (200):**
```json
{
  "total": 2,
  "messages": [
    {
      "id": 1,
      "conversation_id": 1,
      "user_id": 1,
      "username": "john_doe",
      "content": "Hello!",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "conversation_id": 1,
      "user_id": 2,
      "username": "jane_doe",
      "content": "Hi there!",
      "created_at": "2024-01-15T10:31:00Z"
    }
  ]
}
```

#### Отправить сообщение

```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": 1,
  "content": "Hello, how are you?"
}
```

**Ответ (201):**
```json
{
  "id": 3,
  "conversation_id": 1,
  "user_id": 1,
  "username": "john_doe",
  "content": "Hello, how are you?",
  "created_at": "2024-01-15T10:32:00Z"
}
```

#### Удалить сообщение

```http
DELETE /messages/:id
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "message": "Message deleted successfully"
}
```

## Коды ошибок

| Код | Описание |
|-----|---------|
| 200 | OK - Успешный запрос |
| 201 | Created - Ресурс создан |
| 400 | Bad Request - Неверные параметры |
| 401 | Unauthorized - Требуется аутентификация |
| 403 | Forbidden - Доступ запрещён |
| 404 | Not Found - Ресурс не найден |
| 500 | Internal Server Error - Ошибка сервера |

## Пример ошибки

```json
{
  "error": "Invalid credentials",
  "status": 401
}
```

## Rate Limiting

На данный момент rate limiting не реализован. Планируется добавить в будущих версиях.

## Версионирование

API использует версию v1. Все endpoints доступны по адресу `/api/v1/...`

## CORS

CORS включен для `http://localhost:3000` в development режиме.
Для production измените `CORS_ORIGIN` в `.env` файле.
