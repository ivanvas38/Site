# Messaging API Tests

This document contains comprehensive tests for the messaging backend API.

## Prerequisites

1. Start the backend server:
```bash
cd backend
npm install
npm start
```

2. Register test users and get tokens:
```bash
# Register User 1
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@test.com", "username": "user1", "password": "password123"}'

# Register User 2
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@test.com", "username": "user2", "password": "password123"}'

# Register User 3
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user3@test.com", "username": "user3", "password": "password123"}'
```

3. Save tokens from responses:
```bash
TOKEN1="<token_from_user1_response>"
TOKEN2="<token_from_user2_response>"
TOKEN3="<token_from_user3_response>"
```

## API Endpoints Testing

### 1. GET /api/users
**Description:** Get all users except the current user

**Test Case 1: Get users list (authenticated)**
```bash
curl -H "Authorization: Bearer $TOKEN1" http://localhost:5000/api/users
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {"id": 2, "email": "user2@test.com", "username": "user2"},
    {"id": 3, "email": "user3@test.com", "username": "user3"}
  ]
}
```

**Test Case 2: Get users without authentication**
```bash
curl http://localhost:5000/api/users
```
**Expected Response:**
```json
{
  "success": false,
  "message": "Токен доступа не предоставлен"
}
```

### 2. POST /api/messages/send
**Description:** Send a message to another user

**Test Case 1: Send message with recipientId (create new conversation)**
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": 2, "text": "Привет! Как дела?"}'
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": 1,
      "senderId": 1,
      "senderUsername": "user1",
      "text": "Привет! Как дела?",
      "createdAt": "2025-12-17 20:43:56"
    },
    "conversation": {
      "id": 1,
      "user1Id": 1,
      "user2Id": 2
    }
  }
}
```

**Test Case 2: Send message with conversationId (existing conversation)**
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": 1, "text": "Отлично! Рад тебя видеть!"}'
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": 2,
      "senderId": 2,
      "senderUsername": "user2",
      "text": "Отлично! Рад тебя видеть!",
      "createdAt": "2025-12-17 20:44:33"
    },
    "conversation": {
      "id": 1,
      "user1Id": 1,
      "user2Id": 2
    }
  }
}
```

**Test Case 3: Send empty message (should fail)**
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": 2, "text": ""}'
```
**Expected Response:**
```json
{
  "success": false,
  "message": "Текст сообщения не может быть пустым"
}
```

**Test Case 4: Send message without recipientId or conversationId (should fail)**
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}'
```
**Expected Response:**
```json
{
  "success": false,
  "message": "Требуется conversationId или recipientId"
}
```

### 3. GET /api/conversations
**Description:** Get all conversations for the current user

**Test Case 1: Get conversations (User 1)**
```bash
curl -H "Authorization: Bearer $TOKEN1" http://localhost:5000/api/conversations
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "otherUser": {
        "id": 2,
        "email": "user2@test.com",
        "username": "user2"
      },
      "lastMessage": {
        "text": "Отлично! Рад тебя видеть!",
        "createdAt": "2025-12-17 20:44:33"
      },
      "updatedAt": "2025-12-17 20:44:33"
    }
  ]
}
```

**Test Case 2: Get conversations (User 2)**
```bash
curl -H "Authorization: Bearer $TOKEN2" http://localhost:5000/api/conversations
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "otherUser": {
        "id": 1,
        "email": "user1@test.com",
        "username": "user1"
      },
      "lastMessage": {
        "text": "Отлично! Рад тебя видеть!",
        "createdAt": "2025-12-17 20:44:33"
      },
      "updatedAt": "2025-12-17 20:44:33"
    }
  ]
}
```

**Test Case 3: Get conversations (User 3 - no conversations)**
```bash
curl -H "Authorization: Bearer $TOKEN3" http://localhost:5000/api/conversations
```
**Expected Response:**
```json
{
  "success": true,
  "data": []
}
```

### 4. GET /api/conversations/:id/messages
**Description:** Get all messages in a conversation

**Test Case 1: Get messages (authorized participant)**
```bash
curl -H "Authorization: Bearer $TOKEN1" http://localhost:5000/api/conversations/1/messages
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "senderId": 1,
      "senderUsername": "user1",
      "text": "Привет! Как дела?",
      "createdAt": "2025-12-17 20:43:56"
    },
    {
      "id": 2,
      "senderId": 2,
      "senderUsername": "user2",
      "text": "Отлично! Рад тебя видеть!",
      "createdAt": "2025-12-17 20:44:33"
    }
  ]
}
```

**Test Case 2: Get messages (unauthorized user - should fail)**
```bash
curl -H "Authorization: Bearer $TOKEN3" http://localhost:5000/api/conversations/1/messages
```
**Expected Response:**
```json
{
  "success": false,
  "message": "У вас нет доступа к этому диалогу"
}
```

**Test Case 3: Get messages from non-existent conversation (should fail)**
```bash
curl -H "Authorization: Bearer $TOKEN1" http://localhost:5000/api/conversations/999/messages
```
**Expected Response:**
```json
{
  "success": false,
  "message": "Диалог не найден"
}
```

## Database Structure

### Tables Created

1. **conversations**
   - id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
   - user1_id (INTEGER, NOT NULL, FOREIGN KEY -> users.id)
   - user2_id (INTEGER, NOT NULL, FOREIGN KEY -> users.id)
   - created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)
   - updated_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)
   - UNIQUE INDEX on (user1_id, user2_id)

2. **messages**
   - id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
   - conversation_id (INTEGER, NOT NULL, FOREIGN KEY -> conversations.id)
   - sender_id (INTEGER, NOT NULL, FOREIGN KEY -> users.id)
   - text (TEXT, NOT NULL)
   - created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)

## Success Criteria

✅ All database tables created successfully
✅ GET /api/users returns all users except current user
✅ POST /api/messages/send creates conversations automatically
✅ POST /api/messages/send works with both recipientId and conversationId
✅ GET /api/conversations returns sorted conversations with last message
✅ GET /api/conversations/:id/messages returns messages sorted chronologically
✅ Security: Only conversation participants can view messages
✅ Security: Authentication required for all endpoints
✅ Error handling for empty messages
✅ Error handling for invalid conversation access

## Notes

- Conversations are automatically created when sending a message to a new recipient
- Messages are sorted from oldest to newest
- Conversations are sorted by most recent message first
- The system ensures user1_id < user2_id in conversations table for consistency
- All endpoints use the standard response envelope: `{ success, message?, data? }`
