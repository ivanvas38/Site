# Инструкция по установке проекта на Ubuntu 22.04

Данная инструкция содержит пошаговые команды для установки и настройки проекта на операционной системе Ubuntu 22.04 LTS.

## Системные требования

- Ubuntu 22.04 LTS
- Минимум 2GB RAM
- 10GB свободного места на диске
- Права sudo для выполнения административных задач

## 1. Обновление системы

Обновите список пакетов и установите обновления безопасности:

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Установка Node.js 18+ и npm

### Добавление репозитория NodeSource

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

### Установка Node.js и npm

```bash
sudo apt install -y nodejs
```

### Проверка установки

```bash
node --version
npm --version
```

Ожидаемый вывод:
```
v18.x.x
9.x.x
```

## 3. Установка MySQL 8.0

### Установка MySQL сервера

```bash
sudo apt install -y mysql-server
```

### Защита установки MySQL

```bash
sudo mysql_secure_installation
```

При выполнении команды следуйте подсказкам:
- Установите пароль для root пользователя
- Удалите анонимных пользователей (Y)
- Отключите удаленный вход для root (Y)
- Удалите тестовую базу данных (Y)
- Обновите таблицы привилегий (Y)

### Проверка статуса MySQL

```bash
sudo systemctl status mysql
sudo systemctl enable mysql
```

## 4. Клонирование репозитория

### Установка Git (если не установлен)

```bash
sudo apt install -y git
```

### Клонирование репозитория

```bash
cd /home
sudo mkdir -p /var/www/project
sudo chown $USER:$USER /var/www/project
cd /var/www/project
git clone <repository-url> .
```

**Примечание:** Замените `<repository-url>` на URL вашего репозитория.

### Установка прав доступа

```bash
sudo chown -R www-data:www-data /var/www/project
sudo chmod -R 755 /var/www/project
```

## 5. Установка зависимостей

### Backend зависимости

```bash
cd /var/www/project/backend
npm install
```

### Frontend зависимости

```bash
cd /var/www/project/frontend
npm install
```

## 6. Конфигурация .env файлов

### Настройка backend .env

Создайте файл конфигурации для backend:

```bash
cd /var/www/project/backend
cp .env.example .env
```

Отредактируйте файл `.env`:

```bash
nano .env
```

Пример содержимого `.env` файла:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=project_user
DB_PASSWORD=your_secure_password
DB_NAME=project_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Email Configuration (если используется)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://your-domain.com
```

### Настройка frontend .env

```bash
cd /var/www/project/frontend
cp .env.example .env
```

Пример содержимого frontend `.env`:

```env
# API Configuration
REACT_APP_API_URL=http://your-domain.com/api
REACT_APP_SOCKET_URL=http://your-domain.com

# App Configuration
REACT_APP_NAME=Your Project Name
```

## 7. Создание базы данных и таблиц

### Подключение к MySQL

```bash
sudo mysql -u root -p
```

### Создание базы данных и пользователя

```sql
CREATE DATABASE project_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'project_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON project_db.* TO 'project_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Создание таблиц

Выполните SQL скрипт для создания таблиц:

```bash
cd /var/www/project
sudo mysql -u root -p project_db < database/schema.sql
```

**Примечание:** Убедитесь, что файл `database/schema.sql` существует в корне проекта.

## 8. Запуск бэкенда

### Проверка запуска backend

```bash
cd /var/www/project/backend
npm start
```

Backend должен запуститься на порту 3001. Проверьте работу:

```bash
curl http://localhost:3001/health
```

### Остановка для настройки PM2

Нажмите `Ctrl+C` для остановки.

## 9. Запуск фронтенда

### Проверка запуска frontend

```bash
cd /var/www/project/frontend
npm start
```

Frontend должен запуститься на порту 3000. Откройте браузер и перейдите по адресу `http://localhost:3000`.

### Остановка для настройки production

Нажмите `Ctrl+C` для остановки.

### Сборка для production

```bash
cd /var/www/project/frontend
npm run build
```

Статические файлы будут созданы в папке `build/`.

## 10. Конфигурация nginx как reverse proxy

### Установка nginx

```bash
sudo apt install -y nginx
```

### Настройка сайта

Создайте конфигурационный файл:

```bash
sudo nano /etc/nginx/sites-available/project
```

Пример конфигурации:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (React build files)
    location / {
        root /var/www/project/frontend/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support (если используется)
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### Активация сайта

```bash
sudo ln -s /etc/nginx/sites-available/project /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 11. Установка SSL сертификата (Let's Encrypt)

### Установка Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Получение SSL сертификата

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Следуйте инструкциям для настройки автоматического обновления сертификатов.

### Проверка автообновления

```bash
sudo certbot renew --dry-run
```

## 12. Использование PM2 для управления процессом

### Установка PM2

```bash
sudo npm install -g pm2
```

### Создание PM2 конфигурации

Создайте файл `ecosystem.config.js` в корне проекта:

```javascript
module.exports = {
  apps: [{
    name: 'project-backend',
    script: 'src/app.js',
    cwd: '/var/www/project/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/project-backend-error.log',
    out_file: '/var/log/pm2/project-backend-out.log',
    log_file: '/var/log/pm2/project-backend-combined.log',
    time: true
  }]
};
```

### Запуск приложения через PM2

```bash
cd /var/www/project
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Выполните команду, которую предложит PM2 для автозагрузки.

### Управление PM2

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs

# Перезапуск
pm2 restart project-backend

# Остановка
pm2 stop project-backend

# Удаление из автозагрузки
pm2 unstartup
```

## 13. Настройка автозагрузки сервиса

### Настройка автозагрузки MySQL

```bash
sudo systemctl enable mysql
```

### Настройка автозагрузки nginx

```bash
sudo systemctl enable nginx
```

### Проверка автозагрузки всех сервисов

```bash
sudo systemctl list-unit-files | grep -E "(mysql|nginx|pm2)"
```

## 14. Проверка установки

### Проверка backend API

```bash
curl http://localhost:3001/health
```

Ожидаемый ответ:
```json
{"status":"OK","timestamp":"2024-01-01T12:00:00.000Z"}
```

### Проверка frontend

Откройте браузер и перейдите по адресу:
- http://your-domain.com
- https://your-domain.com (если SSL настроен)

### Проверка всех сервисов

```bash
# Проверка статуса MySQL
sudo systemctl status mysql

# Проверка статуса nginx
sudo systemctl status nginx

# Проверка статуса PM2
pm2 status

# Проверка портов
sudo netstat -tlnp | grep -E "(80|443|3001)"
```

## 15. Troubleshooting

### Backend не запускается

1. Проверьте логи PM2:
   ```bash
   pm2 logs project-backend
   ```

2. Проверьте подключение к базе данных:
   ```bash
   cd /var/www/project/backend
   node -e "require('./src/config/database')"
   ```

3. Убедитесь, что порт 3001 свободен:
   ```bash
   sudo lsof -i :3001
   ```

### Frontend не загружается

1. Проверьте конфигурацию nginx:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

2. Проверьте существование build файлов:
   ```bash
   ls -la /var/www/project/frontend/build/
   ```

3. Проверьте права доступа:
   ```bash
   sudo chown -R www-data:www-data /var/www/project/frontend/build/
   ```

### Проблемы с базой данных

1. Проверьте статус MySQL:
   ```bash
   sudo systemctl status mysql
   sudo systemctl restart mysql
   ```

2. Проверьте подключение:
   ```bash
   mysql -u project_user -p project_db
   ```

3. Проверьте наличие таблиц:
   ```bash
   sudo mysql -u root -p -e "USE project_db; SHOW TABLES;"
   ```

### Проблемы с SSL сертификатом

1. Проверьте статус сертификата:
   ```bash
   sudo certbot certificates
   ```

2. Обновите сертификат принудительно:
   ```bash
   sudo certbot renew --force-renewal
   ```

3. Проверьте конфигурацию nginx:
   ```bash
   sudo nginx -t
   ```

### Проблемы с PM2

1. Перезапустите PM2:
   ```bash
   pm2 restart all
   ```

2. Очистите логи PM2:
   ```bash
   pm2 flush
   ```

3. Переустановите автозагрузку:
   ```bash
   pm2 unstartup
   pm2 startup
   pm2 save
   ```

### Логи и мониторинг

Основные файлы логов для диагностики:

- **Nginx логи:**
  ```bash
  sudo tail -f /var/log/nginx/error.log
  sudo tail -f /var/log/nginx/access.log
  ```

- **MySQL логи:**
  ```bash
  sudo tail -f /var/log/mysql/error.log
  ```

- **PM2 логи:**
  ```bash
  pm2 logs --lines 100
  ```

- **Системные логи:**
  ```bash
  sudo tail -f /var/log/syslog
  ```

### Команды для быстрой диагностики

```bash
# Общий статус системы
sudo systemctl status mysql nginx

# Проверка портов
sudo netstat -tlnp | grep -E "(80|443|3001)"

# Проверка логов
sudo tail -50 /var/log/nginx/error.log

# Проверка PM2
pm2 status && pm2 logs --lines 10

# Проверка дискового пространства
df -h

# Проверка памяти
free -h

# Проверка процессов
ps aux | grep -E "(node|mysql|nginx)"
```

## Безопасность

### Настройка файрвола (UFW)

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### Обновление системы

Настройте регулярные обновления безопасности:

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Дополнительные меры безопасности

1. Измените стандартные порты SSH (опционально)
2. Настройте fail2ban для защиты от брутфорса
3. Регулярно обновляйте зависимости npm
4. Используйте сложные пароли для базы данных
5. Настройте резервное копирование базы данных

## Поддержка

При возникновении проблем проверьте:
1. Все ли сервисы запущены
2. Корректность конфигурационных файлов
3. Права доступа к файлам
4. Достаточность системных ресурсов
5. Сетевое подключение

Для получения дополнительной помощи обратитесь к документации проекта или создайте issue в репозитории.