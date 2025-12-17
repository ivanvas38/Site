#!/bin/bash

# Скрипт автоматизации полной установки мессенджера на Ubuntu 22.04
# Автор: Automated Messenger Installer
# Версия: 1.0

set -e  # Остановить выполнение при любой ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Проверка прав доступа
check_sudo() {
    log "Проверка прав доступа sudo..."
    if [[ $EUID -eq 0 ]]; then
        warn "Скрипт запущен от root. Рекомендуется запуск от обычного пользователя с sudo."
    else
        if sudo -n true 2>/dev/null; then
            log "Права sudo подтверждены"
        else
            error "Необходимы права sudo. Запустите: sudo $0"
        fi
    fi
}

# Проверка версии Ubuntu
check_ubuntu() {
    log "Проверка версии операционной системы..."
    if ! grep -q "Ubuntu 22.04" /etc/os-release; then
        warn "Скрипт тестировался на Ubuntu 22.04. Продолжение на свой страх и риск."
    else
        log "Ubuntu 22.04 подтверждена"
    fi
}

# Обновление системы
update_system() {
    log "Обновление списка пакетов..."
    sudo apt update -y
    log "Обновление системных пакетов..."
    sudo apt upgrade -y
}

# Установка Node.js 18+ и npm
install_nodejs() {
    log "Установка Node.js 18+ и npm..."
    
    # Проверяем, установлен ли Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $NODE_VERSION -ge 18 ]]; then
            log "Node.js уже установлен (версия $(node -v))"
            return
        fi
    fi
    
    # Установка Node.js через NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Установка дополнительных пакетов для сборки
    sudo apt-get install -y build-essential
    
    log "Node.js установлен: $(node -v)"
    log "npm установлен: $(npm -v)"
}

# Установка MySQL 8.0
install_mysql() {
    log "Установка MySQL 8.0..."
    
    # Проверяем, установлен ли MySQL
    if command -v mysql >/dev/null 2>&1; then
        MYSQL_VERSION=$(mysql --version | awk '{print $3}' | cut -d',' -f1)
        log "MySQL уже установлен (версия $MYSQL_VERSION)"
        return
    fi
    
    # Установка MySQL
    sudo apt update
    sudo apt install -y mysql-server
    
    # Защита MySQL
    sudo mysql_secure_installation <<EOF

y
2
y
y
y
y
EOF
    
    # Запуск и включение автозапуска MySQL
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    log "MySQL 8.0 установлен и настроен"
}

# Установка PM2 глобально
install_pm2() {
    log "Установка PM2 глобально..."
    
    if command -v pm2 >/dev/null 2>&1; then
        log "PM2 уже установлен (версия $(pm2 --version))"
        return
    fi
    
    sudo npm install -g pm2
    
    # Настройка PM2 для автозапуска
    pm2 startup systemd -u $USER --hp $HOME
    
    log "PM2 установлен: $(pm2 --version)"
}

# Установка Nginx
install_nginx() {
    log "Установка Nginx..."
    
    if command -v nginx >/dev/null 2>&1; then
        log "Nginx уже установлен (версия $(nginx -v 2>&1 | cut -d'/' -f2))"
        return
    fi
    
    sudo apt install -y nginx
    
    # Запуск и включение автозапуска Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    log "Nginx установлен и запущен"
}

# Клонирование репозитория (если нужно)
clone_repository() {
    log "Клонирование репозитория..."
    
    # Если репозиторий уже существует, обновляем его
    if [[ -d ".git" ]]; then
        log "Репозиторий уже клонирован, обновление..."
        git pull
    else
        log "Клонирование репозитория..."
        # ВАЖНО: Замените URL на реальный URL репозитория
        REPO_URL="${REPO_URL:-https://github.com/your-username/messenger-app.git}"
        git clone $REPO_URL .
    fi
}

# Создание .env файлов с умолчаниями
create_env_files() {
    log "Создание .env файлов..."
    
    # Backend .env
    cat > backend/.env << EOF
# Настройки базы данных
DB_HOST=localhost
DB_PORT=3306
DB_NAME=messenger
DB_USER=messenger_user
DB_PASSWORD=$(openssl rand -base64 32)

# Настройки сервера
PORT=3000
NODE_ENV=production

# JWT токены
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=7d

# Настройки CORS
CORS_ORIGIN=https://your-domain.com

# Настройки файлов
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Настройки логирования
LOG_LEVEL=info
LOG_FILE=logs/app.log
EOF

    # Frontend .env
    cat > frontend/.env << EOF
# API URL
VITE_API_URL=https://your-domain.com/api

# Настройки приложения
VITE_APP_NAME=Messenger
VITE_APP_VERSION=1.0.0

# Настройки WebSocket
VITE_WS_URL=wss://your-domain.com

# Настройки файлов
VITE_MAX_FILE_SIZE=10485760
EOF

    log "Файлы .env созданы с умолчаниями"
}

# Создание базы данных MySQL
create_database() {
    log "Создание базы данных и пользователя MySQL..."
    
    # Генерация случайного пароля для пользователя БД
    DB_PASSWORD=$(openssl rand -base64 32)
    
    sudo mysql << EOF
-- Создание базы данных
CREATE DATABASE IF NOT EXISTS messenger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание пользователя
CREATE USER IF NOT EXISTS 'messenger_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Предоставление прав
GRANT ALL PRIVILEGES ON messenger.* TO 'messenger_user'@'localhost';
FLUSH PRIVILEGES;

-- Показ созданной базы данных
SHOW DATABASES LIKE 'messenger';
EOF

    # Сохранение пароля в .env файл
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" backend/.env
    
    log "База данных messenger создана с пользователем messenger_user"
}

# Установка зависимостей (backend и frontend)
install_dependencies() {
    log "Установка зависимостей backend..."
    
    if [[ -d "backend" ]]; then
        cd backend
        npm ci --production
        cd ..
        log "Зависимости backend установлены"
    else
        warn "Папка backend не найдена"
    fi
    
    log "Установка зависимостей frontend..."
    
    if [[ -d "frontend" ]]; then
        cd frontend
        npm ci
        npm run build
        cd ..
        log "Зависимости frontend установлены и проект собран"
    else
        warn "Папка frontend не найдена"
    fi
}

# Создание таблиц в базе данных
create_tables() {
    log "Создание таблиц в базе данных..."
    
    if [[ -f "scripts/database-setup.sql" ]]; then
        mysql -u messenger_user -p$(grep DB_PASSWORD backend/.env | cut -d'=' -f2) messenger < scripts/database-setup.sql
        log "Таблицы созданы успешно"
    else
        warn "SQL скрипт scripts/database-setup.sql не найден"
    fi
}

# Настройка конфигурации Nginx
setup_nginx() {
    log "Настройка конфигурации Nginx..."
    
    # Определяем домен
    DOMAIN="${DOMAIN:-localhost}"
    
    # Создаем конфигурацию Nginx
    sudo tee /etc/nginx/sites-available/messenger > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Логи
    access_log /var/log/nginx/messenger_access.log;
    error_log /var/log/nginx/messenger_error.log;

    # Frontend (статические файлы)
    location / {
        root /var/www/messenger/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Кеширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket поддержка
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Активация конфигурации
    sudo ln -sf /etc/nginx/sites-available/messenger /etc/nginx/sites-enabled/
    
    # Удаление конфигурации по умолчанию
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Проверка конфигурации
    sudo nginx -t
    
    if [[ $? -eq 0 ]]; then
        sudo systemctl reload nginx
        log "Nginx настроен для домена: $DOMAIN"
    else
        error "Ошибка в конфигурации Nginx"
    fi
}

# Установка SSL (Let's Encrypt)
setup_ssl() {
    if [[ "$DOMAIN" != "localhost" ]]; then
        log "Установка Let's Encrypt SSL..."
        
        # Установка Certbot
        sudo apt install -y certbot python3-certbot-nginx
        
        # Получение SSL сертификата
        sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Настройка автообновления
        sudo crontab -l | grep -q certbot || echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
        
        log "SSL сертификат установлен для домена: $DOMAIN"
    else
        warn "SSL не установлен для localhost"
    fi
}

# Запуск сервисов
start_services() {
    log "Запуск сервисов через PM2..."
    
    # Остановка существующих процессов
    pm2 delete all 2>/dev/null || true
    
    # Запуск backend
    if [[ -d "backend" ]]; then
        pm2 start backend/src/app.js --name "messenger-backend" --cwd backend
        log "Backend запущен"
    else
        warn "Папка backend не найдена, пропускаем запуск"
    fi
    
    # Сохранение конфигурации PM2
    pm2 save
    pm2 startup
    
    log "Все сервисы запущены через PM2"
}

# Проверка статуса
check_status() {
    log "Проверка статуса системы..."
    
    # Проверка PM2
    echo -e "\n${BLUE}=== Статус PM2 ===${NC}"
    pm2 status
    
    # Проверка Nginx
    echo -e "\n${BLUE}=== Статус Nginx ===${NC}"
    sudo systemctl status nginx --no-pager -l
    
    # Проверка MySQL
    echo -e "\n${BLUE}=== Статус MySQL ===${NC}"
    sudo systemctl status mysql --no-pager -l
    
    # Проверка открытых портов
    echo -e "\n${BLUE}=== Открытые порты ===${NC}"
    sudo netstat -tlnp | grep -E ':(80|443|3000|3306)'
    
    # Проверка доступности веб-интерфейса
    echo -e "\n${BLUE}=== Проверка доступности ===${NC}"
    
    if curl -s http://localhost:80 >/dev/null; then
        log "✅ Веб-интерфейс доступен на http://localhost:80"
    else
        warn "❌ Веб-интерфейс недоступен на http://localhost:80"
    fi
    
    if curl -s http://localhost:3000/api/health >/dev/null; then
        log "✅ Backend API доступен на http://localhost:3000/api"
    else
        warn "❌ Backend API недоступен на http://localhost:3000/api"
    fi
}

# Главная функция
main() {
    info "Запуск автоматической установки мессенджера..."
    info "Этот процесс может занять 10-15 минут"
    
    # Создание лог-файла
    LOG_FILE="logs/setup-$(date +%Y%m%d-%H%M%S).log"
    mkdir -p logs
    exec > >(tee -a $LOG_FILE)
    exec 2> >(tee -a $LOG_FILE >&2)
    
    # Последовательное выполнение всех этапов
    check_sudo
    check_ubuntu
    update_system
    install_nodejs
    install_mysql
    install_pm2
    install_nginx
    clone_repository
    create_env_files
    create_database
    install_dependencies
    create_tables
    setup_nginx
    setup_ssl
    start_services
    check_status
    
    log "🎉 Установка завершена успешно!"
    info "Лог установки сохранен в: $LOG_FILE"
    
    if [[ "$DOMAIN" != "localhost" ]]; then
        info "🌐 Ваш мессенджер доступен по адресу: https://$DOMAIN"
    else
        info "🌐 Ваш мессенджер доступен по адресу: http://localhost"
    fi
    
    info "📊 Для мониторинга используйте: pm2 status"
    info "📋 Для просмотра логов: pm2 logs"
}

# Обработка сигналов
trap 'error "Установка прервана пользователем"' INT TERM

# Проверка параметров командной строки
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            echo "Использование: $0 [опции]"
            echo "Опции:"
            echo "  -h, --help     Показать эту справку"
            echo "  -d, --domain   Указать домен (по умолчанию: localhost)"
            echo "  -r, --repo     Указать URL репозитория"
            echo "  --no-ssl       Пропустить установку SSL"
            echo "Примеры:"
            echo "  $0"
            echo "  $0 --domain example.com"
            echo "  $0 --repo https://github.com/user/messenger.git"
            exit 0
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -r|--repo)
            REPO_URL="$2"
            shift 2
            ;;
        --no-ssl)
            NO_SSL=true
            shift
            ;;
        *)
            error "Неизвестный параметр: $1"
            ;;
    esac
done

# Запуск главной функции
main