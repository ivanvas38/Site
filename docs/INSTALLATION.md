# Установка и Настройка

## Требования

- Node.js >= 16.0.0
- npm >= 8.0.0 или yarn >= 3.0.0
- MySQL >= 8.0
- Git

## Шаг 1: Клонирование репозитория

```bash
git clone <repository-url>
cd messenger
```

## Шаг 2: Установка Backend

```bash
cd backend

# Установка зависимостей
npm install

# Копирование примера .env файла
cp .env.example .env

# Редактирование .env файла с вашими конфигурациями
# Откройте .env и установите:
# - DB_HOST (по умолчанию localhost)
# - DB_USER (по умолчанию root)
# - DB_PASSWORD (ваш пароль MySQL)
# - DB_NAME (название БД)
# - JWT_SECRET (секретный ключ для JWT)
# - PORT (по умолчанию 5000)
```

## Шаг 3: Установка Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Frontend будет запускаться на http://localhost:3000
```

## Шаг 4: Настройка MySQL

Создайте базу данных:

```sql
CREATE DATABASE messenger;
USE messenger;

-- Таблица пользователей
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица диалогов
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  type ENUM('direct', 'group') DEFAULT 'direct',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица участников диалогов
CREATE TABLE conversation_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member (conversation_id, user_id)
);

-- Таблица сообщений
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Шаг 5: Запуск приложения

### Запуск Backend (терминал 1)

```bash
cd backend
npm run dev
```

Backend будет работать на `http://localhost:5000`

### Запуск Frontend (терминал 2)

```bash
cd frontend
npm start
```

Frontend будет доступен на `http://localhost:3000`

## Переменные окружения Backend

Файл `.env` должен содержать:

```
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=messenger

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Проверка установки

1. Убедитесь, что MySQL запущен
2. Запустите backend - должен запуститься без ошибок
3. Запустите frontend - должна открыться страница в браузере
4. Проверьте консоль браузера на наличие ошибок

## Решение проблем

### MySQL не запущен
```bash
# macOS
brew services start mysql

# Linux
sudo service mysql start

# Windows
# Используйте MySQL Server Configuration Wizard или запустите сервис из Services
```

### Порт уже занят
Измените PORT в `.env` файле backend

### npm install не работает
```bash
# Очистите npm кэш
npm cache clean --force

# Удалите package-lock.json и node_modules
rm -rf node_modules package-lock.json
npm install
```

## Дополнительные команды

### Backend
```bash
npm start      # Production mode
npm run dev    # Development mode с автоперезагрузкой
```

### Frontend
```bash
npm start      # Development server
npm build      # Production build
npm test       # Запуск тестов
```
