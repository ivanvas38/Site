#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPIFixes() {
  console.log('🧪 Тестирование исправлений API...\n');

  try {
    // Test 1: Регистрация пользователей
    console.log('1️⃣ Тестирование регистрации пользователей...');
    
    const user1 = await axios.post(`${API_URL}/auth/register`, {
      email: 'test1@example.com',
      name: 'Test User 1',
      password: 'password123',
      timezone: 'Europe/Moscow'
    });
    console.log('✅ Пользователь 1 зарегистрирован:', user1.data.user.name);

    const user2 = await axios.post(`${API_URL}/auth/register`, {
      email: 'test2@example.com', 
      name: 'Test User 2',
      password: 'password123',
      timezone: 'America/New_York'
    });
    console.log('✅ Пользователь 2 зарегистрирован:', user2.data.user.name);

    // Test 2: Авторизация
    console.log('\n2️⃣ Тестирование авторизации...');
    
    const login1 = await axios.post(`${API_URL}/auth/login`, {
      email: 'test1@example.com',
      password: 'password123'
    });
    console.log('✅ Авторизация user1 успешна');
    const token1 = login1.data.token;

    const login2 = await axios.post(`${API_URL}/auth/login`, {
      email: 'test2@example.com',
      password: 'password123'
    });
    console.log('✅ Авторизация user2 успешна');
    const token2 = login2.data.token;

    // Test 3: Отправка сообщения и проверка отображения без "0"
    console.log('\n3️⃣ Тестирование отправки сообщения...');
    
    const authHeader1 = { Authorization: `Bearer ${token1}` };
    
    const sendMessage = await axios.post(`${API_URL}/messages/send`, {
      recipientId: user2.data.user.id,
      text: 'Привет! Как дела?'
    }, { headers: authHeader1 });
    
    console.log('✅ Сообщение отправлено');
    console.log('   Текст сообщения:', JSON.stringify(sendMessage.data.data.message.text));
    
    // Проверяем что в тексте нет лишних символов
    if (sendMessage.data.data.message.text === 'Привет! Как дела?') {
      console.log('✅ Сообщение отображается корректно без дополнительных символов');
    } else {
      console.log('❌ Проблема: сообщение содержит лишние символы');
    }

    // Test 4: Проверка онлайн статуса
    console.log('\n4️⃣ Тестирование онлайн статуса...');
    
    const onlineUsers = await axios.get(`${API_URL}/users/online`, {
      headers: authHeader1
    });
    console.log('✅ Онлайн пользователи получены');
    console.log('   Количество онлайн:', onlineUsers.data.data.length);
    
    if (onlineUsers.data.data.length >= 2) {
      console.log('✅ Онлайн статус работает корректно');
    } else {
      console.log('❌ Проблема с онлайн статусом');
    }

    // Test 5: Проверка обновления профиля с timezone
    console.log('\n5️⃣ Тестирование обновления timezone...');
    
    const updateProfile = await axios.put(`${API_URL}/users/profile`, {
      timezone: 'Asia/Tokyo'
    }, { headers: authHeader1 });
    
    console.log('✅ Профиль обновлен с timezone:', updateProfile.data.data.timezone);
    
    if (updateProfile.data.data.timezone === 'Asia/Tokyo') {
      console.log('✅ Timezone обновлен корректно');
    } else {
      console.log('❌ Проблема с обновлением timezone');
    }

    // Test 6: Проверка получения conversations
    console.log('\n6️⃣ Тестирование получения диалогов...');
    
    const conversations = await axios.get(`${API_URL}/conversations`, {
      headers: authHeader1
    });
    
    console.log('✅ Диалоги получены');
    console.log('   Количество диалогов:', conversations.data.data.length);
    
    if (conversations.data.data.length > 0) {
      const lastMessage = conversations.data.data[0].lastMessage;
      if (lastMessage && lastMessage.text === 'Привет! Как дела?') {
        console.log('✅ Последнее сообщение отображается корректно');
      } else {
        console.log('❌ Проблема с отображением последнего сообщения');
        console.log('   Ожидалось:', 'Привет! Как дела?');
        console.log('   Получено:', lastMessage ? lastMessage.text : 'null');
      }
    }

    // Test 7: Тестирование загрузки аватара (базовое)
    console.log('\n7️⃣ Тестирование загрузки аватара...');
    
    const testAvatar = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    const avatarResponse = await axios.post(`${API_URL}/users/profile/avatar`, {
      avatar: testAvatar
    }, { headers: authHeader1 });
    
    console.log('✅ Аватар загружен (эмуляция)');
    
    if (avatarResponse.data.data.avatar === testAvatar) {
      console.log('✅ Аватар сохраняется корректно');
    } else {
      console.log('❌ Проблема с сохранением аватара');
    }

    console.log('\n🎉 Все тесты API завершены!');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.response?.data || error.message);
  }
}

testAPIFixes();