-- Миграция для добавления полей профилей пользователей
-- Версия: 1.0
-- Описание: Добавляет поля avatar, last_seen_at, is_online для пользователей

-- Добавляем новые поля в таблицу users
ALTER TABLE users 
ADD COLUMN avatar VARCHAR(500) AFTER password_hash,
ADD COLUMN last_seen_at TIMESTAMP NULL AFTER avatar,
ADD COLUMN is_online BOOLEAN DEFAULT FALSE AFTER last_seen_at;

-- Создаем индексы для новых полей
CREATE INDEX idx_last_seen_at ON users(last_seen_at);
CREATE INDEX idx_is_online ON users(is_online);

-- Обновляем существующих пользователей - делаем их офлайн
UPDATE users SET is_online = FALSE;

-- Устанавливаем значение last_seen_at для существующих пользователей
-- как их время последней активности или создания аккаунта
UPDATE users SET last_seen_at = COALESCE(last_login_at, created_at) WHERE last_seen_at IS NULL;