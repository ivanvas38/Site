-- Миграция для добавления поля timezone пользователей
-- Версия: 1.0
-- Описание: Добавляет поле timezone для автоматического определения часового пояса

-- Добавляем новое поле в таблицу users
ALTER TABLE users 
ADD COLUMN timezone VARCHAR(100) DEFAULT 'UTC' AFTER is_online;

-- Создаем индекс для новых полей
CREATE INDEX idx_timezone ON users(timezone);

-- Обновляем существующих пользователей - устанавливаем UTC в качестве таймзона по умолчанию
UPDATE users SET timezone = 'UTC' WHERE timezone IS NULL;
