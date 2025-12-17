# Руководство по устранению неполадок

Это руководство поможет решить наиболее частые проблемы при установке и использовании мессенджера.

## Проблемы при установке

### Проблема: "Permission denied" при запуске скрипта
**Решение:**
```bash
chmod +x scripts/setup.sh
```

### Проблема: MySQL не запускается
**Диагностика:**
```bash
sudo systemctl status mysql
sudo journalctl -u mysql --no-pager -l
```

**Решения:**
```bash
# Переустановка MySQL
sudo apt remove --purge mysql-server mysql-client mysql-common
sudo apt autoremove
sudo apt autoclean
sudo apt install mysql-server

# Проверка конфигурации
sudo mysql_secure_installation
```

### Проблема: Node.js не устанавливается
**Решение:**
```bash
# Очистка кэша npm
sudo npm cache clean --force

# Удаление Node.js
sudo apt remove nodejs npm

# Установка через другой метод
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Проблема: Nginx не перезапускается
**Диагностика:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Решение:**
```bash
# Проверка конфигурации
sudo nginx -t

# Если есть ошибки, исправить конфигурацию
sudo nano /etc/nginx/sites-available/messenger

# Перезапуск
sudo systemctl reload nginx
```

### Проблема: PM2 не запускает приложение
**Диагностика:**
```bash
pm2 logs messenger-backend
pm2 status
```

**Решение:**
```bash
# Остановка всех процессов
pm2 delete all

# Запуск с отладкой
pm2 start backend/src/app.js --name "messenger-backend" --cwd backend --log logs/pm2.log --error logs/pm2-error.log

# Проверка переменных окружения
cat backend/.env
```

## Проблемы с базой данных

### Проблема: "Access denied for user"
**Решение:**
```bash
# Сброс пароля пользователя MySQL
sudo mysql -u root
ALTER USER 'messenger_user'@'localhost' IDENTIFIED BY 'новый_пароль';
FLUSH PRIVILEGES;
```

### Проблема: База данных не создается
**Диагностика:**
```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'messenger';"
```

**Решение:**
```bash
# Создание вручную
sudo mysql -u root -p
CREATE DATABASE messenger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'messenger_user'@'localhost' IDENTIFIED BY 'пароль';
GRANT ALL PRIVILEGES ON messenger.* TO 'messenger_user'@'localhost';
FLUSH PRIVILEGES;
```

### Проблема: Таблицы не создаются
**Решение:**
```bash
# Выполнение SQL вручную
mysql -u messenger_user -p messenger < scripts/database-setup.sql

# Проверка ошибок
mysql -u messenger_user -p messenger -e "SHOW TABLES;"
```

## Проблемы с SSL

### Проблема: Let's Encrypt не выдает сертификат
**Диагностика:**
```bash
sudo certbot certificates
sudo certbot --nginx -d your-domain.com --verbose
```

**Решения:**
```bash
# Обновление Certbot
sudo apt update && sudo apt upgrade certbot python3-certbot-nginx

# Проверка DNS
dig your-domain.com

# Ручное получение сертификата
sudo certbot certonly --standalone -d your-domain.com
```

### Проблема: Mixed Content Warnings (HTTP/HTTPS)
**Решение:**
1. Убедитесь, что frontend .env содержит HTTPS URL
2. Проверьте конфигурацию Nginx
3. Очистите кеш браузера

## Проблемы с производительностью

### Проблема: Медленная работа приложения
**Диагностика:**
```bash
# Проверка использования ресурсов
pm2 monit
htop
df -h
free -h
```

**Решения:**
```bash
# Оптимизация MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Добавить:
# innodb_buffer_pool_size = 1G
# query_cache_size = 128M

# Перезапуск MySQL
sudo systemctl restart mysql

# Очистка логов PM2
pm2 flush
```

### Проблема: Высокое потребление памяти
**Решение:**
```bash
# Настройка PM2 для рестарта при превышении лимита
pm2 start backend/src/app.js --max-memory-restart 500M

# Проверка утечек памяти
pm2 logs --lines 100
```

## Проблемы с сетью

### Проблема: Приложение недоступно извне
**Проверки:**
```bash
# Проверка открытых портов
sudo netstat -tlnp | grep -E ':(80|443)'

# Проверка фаервола
sudo ufw status

# Проверка iptables
sudo iptables -L
```

**Решения:**
```bash
# Открытие портов в фаерволе
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload

# Проверка настроек провайдера
# Убедитесь, что порты 80 и 443 открыты в роутере
```

## Проблемы с логами

### Приложение не пишет логи
**Решение:**
```bash
# Создание директории для логов
mkdir -p logs
chmod 755 logs

# Настройка ротации логов
sudo nano /etc/logrotate.d/messenger
```

### Логи слишком большие
**Решение:**
```bash
# Очистка логов PM2
pm2 flush

# Настройка автоматической ротации
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Команды для диагностики

### Полная диагностика системы
```bash
#!/bin/bash
echo "=== Диагностика системы мессенджера ==="

echo "1. Статус сервисов:"
systemctl status nginx mysql --no-pager -l

echo "2. Статус PM2:"
pm2 status

echo "3. Открытые порты:"
sudo netstat -tlnp | grep -E ':(80|443|3000|3306)'

echo "4. Использование ресурсов:"
free -h
df -h

echo "5. Последние ошибки в логах:"
sudo tail -20 /var/log/nginx/error.log
pm2 logs messenger-backend --lines 20

echo "6. Проверка базы данных:"
mysql -u messenger_user -p messenger -e "SHOW TABLES;"

echo "7. Проверка SSL сертификатов:"
sudo certbot certificates

echo "8. Проверка доступности:"
curl -I http://localhost
curl -I http://localhost:3000/api/health
```

### Сброс всех настроек
```bash
#!/bin/bash
echo "ВНИМАНИЕ: Это удалит все данные!"

# Остановка сервисов
pm2 delete all
sudo systemctl stop nginx mysql

# Удаление конфигураций
sudo rm -f /etc/nginx/sites-enabled/messenger
sudo rm -f /etc/nginx/sites-available/messenger

# Удаление базы данных
mysql -u root -p -e "DROP DATABASE IF EXISTS messenger;"

# Очистка PM2
pm2 flush
pm2 unstartup

echo "Сброс завершен. Запустите установку заново."
```

## Получение помощи

### Сбор информации для отчета об ошибке
```bash
#!/bin/bash
echo "=== Информация для отчета об ошибке ==="

echo "Версия Ubuntu:"
lsb_release -a

echo "Версии установленного ПО:"
node --version
npm --version
mysql --version
nginx -v
pm2 --version
certbot --version

echo "Логи установки:"
ls -la logs/

echo "Конфигурация Nginx:"
sudo nginx -t

echo "Статус сервисов:"
systemctl is-active nginx mysql
pm2 jlist | jq '.[].pm2_env.status'

echo "Переменные окружения (без паролей):"
grep -v "PASSWORD\|SECRET" backend/.env 2>/dev/null || echo "Файл .env не найден"
```

### Контакты для получения помощи
- Создайте issue в репозитории проекта
- Приложите результат диагностики
- Укажите версию Ubuntu и шаги для воспроизведения

---

**Совет:** Всегда делайте резервные копии перед внесением изменений в конфигурацию!