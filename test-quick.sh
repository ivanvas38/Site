#!/bin/bash

# Простое тестирование через curl

echo "🧪 Тестирование исправлений через API..."

# Регистрация пользователей
echo "1️⃣ Регистрация пользователей..."

USER1=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "name": "Test User 1", "password": "password123", "timezone": "Europe/Moscow"}')

USER2=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@example.com", "name": "Test User 2", "password": "password123", "timezone": "America/New_York"}')

echo "✅ Пользователи зарегистрированы"

# Авторизация
echo "2️⃣ Авторизация..."

TOKEN1=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "password": "password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "✅ Авторизация завершена"

# Отправка сообщения
echo "3️⃣ Отправка сообщения..."

USER2_ID=$(echo $USER2 | grep -o '"id":[^,]*' | cut -d':' -f2)

SEND_RESPONSE=$(curl -s -X POST http://localhost:5000/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{\"recipientId\": $USER2_ID, \"text\": \"Привет! Как дела?\"}")

MESSAGE_TEXT=$(echo $SEND_RESPONSE | grep -o '"text":"[^"]*"' | cut -d'"' -f4)

echo "Текст сообщения: $MESSAGE_TEXT"

if [ "$MESSAGE_TEXT" = "Привет! Как дела?" ]; then
  echo "✅ Сообщение отображается корректно без дополнительных символов"
else
  echo "❌ Проблема: сообщение содержит лишние символы"
fi

# Проверка онлайн статуса
echo "4️⃣ Проверка онлайн статуса..."

ONLINE_COUNT=$(curl -s -X GET http://localhost:5000/api/users/online \
  -H "Authorization: Bearer $TOKEN1" | grep -o '"id":' | wc -l)

echo "Онлайн пользователей: $ONLINE_COUNT"

if [ "$ONLINE_COUNT" -ge "1" ]; then
  echo "✅ Онлайн статус работает"
else
  echo "❌ Проблема с онлайн статусом"
fi

# Тестирование обновления timezone
echo "5️⃣ Тестирование обновления timezone..."

TIMEZONE_RESPONSE=$(curl -s -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"timezone": "Asia/Tokyo"}')

NEW_TIMEZONE=$(echo $TIMEZONE_RESPONSE | grep -o '"timezone":"[^"]*"' | cut -d'"' -f4)

echo "Новый timezone: $NEW_TIMEZONE"

if [ "$NEW_TIMEZONE" = "Asia/Tokyo" ]; then
  echo "✅ Timezone обновлен корректно"
else
  echo "❌ Проблема с обновлением timezone"
fi

echo "🎉 Базовое тестирование завершено!"