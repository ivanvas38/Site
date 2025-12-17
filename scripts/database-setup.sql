-- ================================================
-- SQL скрипт для создания базы данных мессенджера
-- Автор: Automated Messenger Installer
-- Версия: 1.0
-- Дата: 2024
-- ================================================

-- Использование базы данных messenger
USE messenger;

-- ================================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- ================================================

-- Создание таблицы пользователей
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор пользователя',
  `username` varchar(50) NOT NULL COMMENT 'Имя пользователя (уникальное)',
  `email` varchar(100) NOT NULL COMMENT 'Email адрес пользователя (уникальный)',
  `password_hash` varchar(255) NOT NULL COMMENT 'Хеш пароля пользователя',
  `first_name` varchar(50) DEFAULT NULL COMMENT 'Имя пользователя',
  `last_name` varchar(50) DEFAULT NULL COMMENT 'Фамилия пользователя',
  `avatar` varchar(255) DEFAULT NULL COMMENT 'Путь к файлу аватара',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Номер телефона',
  `bio` text COMMENT 'Краткое описание пользователя',
  `is_online` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Статус онлайн (1 - онлайн, 0 - офлайн)',
  `last_seen` timestamp NULL DEFAULT NULL COMMENT 'Время последнего входа',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Активность аккаунта (1 - активен, 0 - заблокирован)',
  `email_verified_at` timestamp NULL DEFAULT NULL COMMENT 'Время подтверждения email',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Время создания аккаунта',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Время последнего обновления',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_is_active_index` (`is_active`),
  KEY `users_is_online_index` (`is_online`),
  KEY `users_last_seen_index` (`last_seen`),
  KEY `users_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица пользователей мессенджера';

-- ================================================
-- ТАБЛИЦА ЧАТОВ/ДИАЛОГОВ
-- ================================================

-- Создание таблицы чатов
DROP TABLE IF EXISTS `chats`;
CREATE TABLE `chats` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор чата',
  `type` enum('private','group','channel') NOT NULL DEFAULT 'private' COMMENT 'Тип чата (private - приватный, group - групповой, channel - канал)',
  `name` varchar(100) DEFAULT NULL COMMENT 'Название чата (для групп и каналов)',
  `description` text COMMENT 'Описание чата',
  `avatar` varchar(255) DEFAULT NULL COMMENT 'Путь к файлу аватара чата',
  `owner_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID владельца чата (для групп и каналов)',
  `is_public` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Публичность чата (1 - публичный, 0 - приватный)',
  `invite_link` varchar(255) DEFAULT NULL COMMENT 'Ссылка для приглашения',
  `message_count` bigint(20) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Количество сообщений в чате',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Время создания чата',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Время последнего обновления',
  PRIMARY KEY (`id`),
  KEY `chats_type_index` (`type`),
  KEY `chats_owner_id_index` (`owner_id`),
  KEY `chats_is_public_index` (`is_public`),
  KEY `chats_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица чатов и диалогов';

-- ================================================
-- ТАБЛИЦА УЧАСТНИКОВ ЧАТА
-- ================================================

-- Создание таблицы участников чата
DROP TABLE IF EXISTS `chat_participants`;
CREATE TABLE `chat_participants` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор записи',
  `chat_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID чата',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID пользователя',
  `role` enum('admin','moderator','member') NOT NULL DEFAULT 'member' COMMENT 'Роль в чате (admin - админ, moderator - модератор, member - участник)',
  `nickname` varchar(50) DEFAULT NULL COMMENT 'Псевдоним в чате',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Статус участия (1 - активен, 0 - исключен)',
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Время присоединения к чату',
  `last_read_at` timestamp NULL DEFAULT NULL COMMENT 'Время последнего прочтения сообщений',
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_participants_chat_id_user_id_unique` (`chat_id`, `user_id`),
  KEY `chat_participants_chat_id_index` (`chat_id`),
  KEY `chat_participants_user_id_index` (`user_id`),
  KEY `chat_participants_role_index` (`role`),
  KEY `chat_participants_is_active_index` (`is_active`),
  CONSTRAINT `chat_participants_chat_id_foreign` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_participants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица участников чата';

-- ================================================
-- ТАБЛИЦА СООБЩЕНИЙ
-- ================================================

-- Создание таблицы сообщений
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор сообщения',
  `chat_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID чата',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID отправителя',
  `content` text NOT NULL COMMENT 'Текст сообщения',
  `message_type` enum('text','image','file','audio','video','location','contact') NOT NULL DEFAULT 'text' COMMENT 'Тип сообщения',
  `file_path` varchar(255) DEFAULT NULL COMMENT 'Путь к файлу (для медиа-сообщений)',
  `file_name` varchar(255) DEFAULT NULL COMMENT 'Имя файла',
  `file_size` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Размер файла в байтах',
  `reply_to_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID сообщения на которое отвечаем',
  `is_edited` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Было ли сообщение отредактировано (1 - да, 0 - нет)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Было ли сообщение удалено (1 - да, 0 - нет)',
  `edited_at` timestamp NULL DEFAULT NULL COMMENT 'Время редактирования сообщения',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Время отправки сообщения',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Время последнего обновления',
  PRIMARY KEY (`id`),
  KEY `messages_chat_id_index` (`chat_id`),
  KEY `messages_user_id_index` (`user_id`),
  KEY `messages_created_at_index` (`created_at`),
  KEY `messages_message_type_index` (`message_type`),
  KEY `messages_reply_to_id_index` (`reply_to_id`),
  KEY `messages_is_deleted_index` (`is_deleted`),
  CONSTRAINT `messages_chat_id_foreign` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_reply_to_id_foreign` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица сообщений';

-- ================================================
-- ТАБЛИЦА ПРОСМОТРОВ СООБЩЕНИЙ
-- ================================================

-- Создание таблицы просмотров сообщений
DROP TABLE IF EXISTS `message_views`;
CREATE TABLE `message_views` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор записи',
  `message_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID сообщения',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID пользователя',
  `viewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Время просмотра',
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_views_message_id_user_id_unique` (`message_id`, `user_id`),
  KEY `message_views_message_id_index` (`message_id`),
  KEY `message_views_user_id_index` (`user_id`),
  KEY `message_views_viewed_at_index` (`viewed_at`),
  CONSTRAINT `message_views_message_id_foreign` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица просмотров сообщений';

-- ================================================
-- ТАБЛИЦА ДРУЗЕЙ
-- ================================================

-- Создание таблицы друзей
DROP TABLE IF EXISTS `friendships`;
CREATE TABLE `friendships` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор записи',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID пользователя (инициатор)',
  `friend_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID друга',
  `status` enum('pending','accepted','blocked') NOT NULL DEFAULT 'pending' COMMENT 'Статус заявки (pending - ожидает, accepted - принята, blocked - заблокирована)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Время создания заявки',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Время последнего обновления',
  PRIMARY KEY (`id`),
  UNIQUE KEY `friendships_user_id_friend_id_unique` (`user_id`, `friend_id`),
  KEY `friendships_user_id_index` (`user_id`),
  KEY `friendships_friend_id_index` (`friend_id`),
  KEY `friendships_status_index` (`status`),
  CONSTRAINT `friendships_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friendships_friend_id_foreign` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица друзей и заявок в друзья';

-- ================================================
-- ТАБЛИЦА СЕССИЙ
-- ================================================

-- Создание таблицы сессий
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` varchar(128) NOT NULL COMMENT 'Уникальный идентификатор сессии',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID пользователя',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP адрес пользователя',
  `user_agent` text COMMENT 'User Agent браузера',
  `device_type` varchar(50) DEFAULT NULL COMMENT 'Тип устройства',
  `location` varchar(100) DEFAULT NULL COMMENT 'Местоположение',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Статус сессии (1 - активна, 0 - неактивна)',
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Время последней активности',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Время создания сессии',
  PRIMARY KEY (`id`),
  KEY `user_sessions_user_id_index` (`user_id`),
  KEY `user_sessions_is_active_index` (`is_active`),
  KEY `user_sessions_last_activity_index` (`last_activity`),
  CONSTRAINT `user_sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица пользовательских сессий';

-- ================================================
-- ТАБЛИЦА УВЕДОМЛЕНИЙ
-- ================================================

-- Создание таблицы уведомлений
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Уникальный идентификатор уведомления',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID получателя',
  `title` varchar(255) NOT NULL COMMENT 'Заголовок уведомления',
  `message` text NOT NULL COMMENT 'Текст уведомления',
  `type` enum('message','friend_request','system','group_invite') NOT NULL DEFAULT 'system' COMMENT 'Тип уведомления',
  `is_read` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Прочитано ли уведомление (1 - да, 0 - нет)',
  `data` json DEFAULT NULL COMMENT 'Дополнительные данные в формате JSON',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Время создания уведомления',
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_index` (`user_id`),
  KEY `notifications_is_read_index` (`is_read`),
  KEY `notifications_type_index` (`type`),
  KEY `notifications_created_at_index` (`created_at`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица уведомлений';

-- ================================================
-- ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- ================================================

-- Индексы для ускорения поиска пользователей
CREATE INDEX `idx_users_search` ON `users` (`username`, `first_name`, `last_name`);
CREATE INDEX `idx_users_online` ON `users` (`is_online`, `last_seen`);

-- Индексы для быстрого получения сообщений чата
CREATE INDEX `idx_messages_chat_created` ON `messages` (`chat_id`, `created_at` DESC);
CREATE INDEX `idx_messages_user_chat` ON `messages` (`user_id`, `chat_id`, `created_at` DESC);

-- Индексы для групповых чатов
CREATE INDEX `idx_chats_type_public` ON `chats` (`type`, `is_public`);
CREATE INDEX `idx_chat_participants_active` ON `chat_participants` (`chat_id`, `is_active`);

-- Индексы для друзей
CREATE INDEX `idx_friendships_status_user` ON `friendships` (`status`, `user_id`);
CREATE INDEX `idx_friendships_mutual` ON `friendships` (`user_id`, `friend_id`, `status`);

-- Индексы для сессий
CREATE INDEX `idx_sessions_activity` ON `user_sessions` (`is_active`, `last_activity`);

-- ================================================
-- ПРЕДСТАВЛЕНИЯ ДЛЯ УДОБСТВА
-- ================================================

-- Представление для активных пользователей
CREATE OR REPLACE VIEW `active_users` AS
SELECT 
    u.id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar,
    u.is_online,
    u.last_seen
FROM `users` u
WHERE u.is_active = 1
ORDER BY u.is_online DESC, u.last_seen DESC;

-- Представление для популярных чатов
CREATE OR REPLACE VIEW `popular_chats` AS
SELECT 
    c.id,
    c.type,
    c.name,
    c.description,
    c.avatar,
    COUNT(cp.id) as participant_count,
    c.message_count,
    c.created_at
FROM `chats` c
LEFT JOIN `chat_participants` cp ON c.id = cp.chat_id AND cp.is_active = 1
WHERE c.is_public = 1
GROUP BY c.id
ORDER BY participant_count DESC, c.message_count DESC;

-- ================================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ
-- ================================================

-- Триггер для автоматического обновления счетчика сообщений в чате
DELIMITER //
CREATE TRIGGER `update_chat_message_count_after_insert` 
AFTER INSERT ON `messages` FOR EACH ROW
BEGIN
    UPDATE `chats` 
    SET `message_count` = `message_count` + 1,
        `updated_at` = CURRENT_TIMESTAMP
    WHERE `id` = NEW.`chat_id`;
END//

CREATE TRIGGER `update_chat_message_count_after_delete` 
AFTER DELETE ON `messages` FOR EACH ROW
BEGIN
    UPDATE `chats` 
    SET `message_count` = `message_count` - 1,
        `updated_at` = CURRENT_TIMESTAMP
    WHERE `id` = OLD.`chat_id`;
END//

-- Триггер для автоматической установки времени просмотра
CREATE TRIGGER `auto_set_message_view_time` 
AFTER INSERT ON `message_views` FOR EACH ROW
BEGIN
    UPDATE `chat_participants`
    SET `last_read_at` = NEW.`viewed_at`
    WHERE `chat_id` = (SELECT `chat_id` FROM `messages` WHERE `id` = NEW.`message_id`)
      AND `user_id` = NEW.`user_id`
      AND `is_active` = 1;
END//
DELIMITER ;

-- ================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ================================================

-- Создание системного пользователя (опционально)
-- INSERT INTO `users` (`username`, `email`, `password_hash`, `first_name`, `last_name`, `is_active`) VALUES
-- ('system', 'system@messenger.local', '$2b$10$example_hash', 'System', 'Administrator', 1);

-- ================================================
-- КОММЕНТАРИИ К СТРУКТУРЕ БАЗЫ
-- ================================================

COMMENT ON TABLE `users` IS 'Основная таблица пользователей мессенджера';
COMMENT ON TABLE `chats` IS 'Таблица чатов: приватные диалоги, групповые чаты и каналы';
COMMENT ON TABLE `chat_participants` IS 'Таблица участников чатов с ролями и статусами';
COMMENT ON TABLE `messages` IS 'Таблица сообщений всех типов (текст, медиа, файлы)';
COMMENT ON TABLE `message_views` IS 'Таблица отметок о прочтении сообщений';
COMMENT ON TABLE `friendships` IS 'Таблица дружеских связей и заявок';
COMMENT ON TABLE `user_sessions` IS 'Таблица активных сессий пользователей';
COMMENT ON TABLE `notifications` IS 'Таблица уведомлений пользователей';

-- ================================================
-- ЗАВЕРШЕНИЕ СКРИПТА
-- ================================================

-- Показать информацию о созданных таблицах
SHOW TABLES;

-- Показать статус таблиц
SELECT 
    TABLE_NAME as 'Таблица',
    TABLE_ROWS as 'Количество строк',
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as 'Размер (МБ)',
    TABLE_COMMENT as 'Комментарий'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'messenger'
ORDER BY TABLE_NAME;

SELECT 'База данных мессенджера успешно создана!' as Результат;