-- Миграция для добавления полей редактирования и удаления сообщений
-- Версия: 1.0
-- Описание: Добавляет поля is_edited, is_deleted, edited_at в таблицу messages

-- Проверяем и добавляем поля если они не существуют
SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages' 
        AND COLUMN_NAME = 'is_edited'
    ),
    'ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT 0 AFTER reply_to_id',
    'SELECT "Column is_edited already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages' 
        AND COLUMN_NAME = 'is_deleted'
    ),
    'ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT 0 AFTER is_edited',
    'SELECT "Column is_deleted already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages' 
        AND COLUMN_NAME = 'edited_at'
    ),
    'ALTER TABLE messages ADD COLUMN edited_at TIMESTAMP NULL AFTER is_deleted',
    'SELECT "Column edited_at already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Обновляем существующие сообщения - устанавливаем значения по умолчанию
UPDATE messages SET 
    is_edited = 0, 
    is_deleted = 0, 
    edited_at = NULL 
WHERE is_edited IS NULL OR is_deleted IS NULL;

-- Создаем индексы для новых полей для оптимизации запросов
SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages' 
        AND INDEX_NAME = 'idx_messages_is_deleted'
    ),
    'CREATE INDEX idx_messages_is_deleted ON messages(is_deleted)',
    'SELECT "Index idx_messages_is_deleted already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages' 
        AND INDEX_NAME = 'idx_messages_is_edited'
    ),
    'CREATE INDEX idx_messages_is_edited ON messages(is_edited)',
    'SELECT "Index idx_messages_is_edited already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages' 
        AND INDEX_NAME = 'idx_messages_edited_at'
    ),
    'CREATE INDEX idx_messages_edited_at ON messages(edited_at)',
    'SELECT "Index idx_messages_edited_at already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;