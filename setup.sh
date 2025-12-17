#!/bin/bash

# Автоматизированный скрипт установки проекта на Ubuntu 22.04
# Версия: 1.0
# Автор: Development Team

set -e  # Остановка скрипта при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода цветных сообщений
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка прав администратора
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Этот скрипт должен быть запущен с правами root (используйте sudo)"
        exit 1
    fi
}

# Проверка версии Ubuntu
check_ubuntu_version() {
    if ! grep -q "Ubuntu 22.04" /etc/os-release; then
        print_error "Скрипт предназначен для Ubuntu 22.04 LTS"
        exit 1
    fi
    print_success "Версия Ubuntu проверена"
}

# Обновление системы
update_system() {
    print_status "Обновление списка пакетов..."
    apt update
    
    print_status "Обновление системы..."
    apt upgrade -y
    print_success "Система обновлена"
}

# Установка Node.js 18+
install_nodejs() {
    print_status "Установка Node.js 18+..."
    
    # Установка curl если не установлен
    if ! command -v curl &> /dev/null; then
        apt install -y curl
    fi
    
    # Добавление репозитория NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    
    # Установка Node.js
    apt install -y nodejs
    
    # Проверка версий
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js $NODE_VERSION и npm $NPM_VERSION установлены"
}

# Установка MySQL 8.0
install_mysql() {
    print_status "Установка MySQL 8.0..."
    apt install -y mysql-server
    
    print_status "Защита установки MySQL..."
    # Запуск скрипта безопасности без интерактивности
    expect << EOF
spawn mysql_secure_installation
expect "Press y|Y for Yes, any other key for No:"
send "y\r"
expect "Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG:"
send "1\r"
expect "New password:"
send "$MYSQL_ROOT_PASSWORD\r"
expect "Re-enter new password:"
send "$MYSQL_ROOT_PASSWORD\r"
expect "Remove anonymous users?"
send "y\r"
expect "Disallow root login remotely?"
send "y\r"
expect "Remove test database and access to it?"
send "y\r"
expect "Reload privilege tables now?"
send "y\r"
expect eof
EOF
    
    systemctl enable mysql
    systemctl start mysql
    print_success "MySQL установлен и настроен"
}

# Установка nginx
install_nginx() {
    print_status "Установка nginx..."
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_success "nginx установлен и запущен"
}

# Установка PM2
install_pm2() {
    print_status "Установка PM2..."
    npm install -g pm2
    print_success "PM2 установлен"
}

# Установка дополнительных пакетов
install_additional_packages() {
    print_status "Установка дополнительных пакетов..."
    apt install -y git expect ufw unattended-upgrades
    print_success "Дополнительные пакеты установлены"
}

# Настройка переменных конфигурации
setup_configuration() {
    print_status "Настройка конфигурации..."
    
    read -p "Введите домен вашего сайта (например: example.com): " DOMAIN_NAME
    read -p "Введите email для Let's Encrypt: " EMAIL
    
    read -s -p "Введите пароль для MySQL root: " MYSQL_ROOT_PASSWORD
    echo
    
    read -p "Введите имя базы данных (по умолчанию: project_db): " DB_NAME
    DB_NAME=${DB_NAME:-project_db}
    
    read -p "Введите пользователя базы данных (по умолчанию: project_user): " DB_USER
    DB_USER=${DB_USER:-project_user}
    
    read -s -p "Введите пароль для пользователя базы данных: " DB_PASSWORD
    echo
    
    # Генерация JWT секрета
    JWT_SECRET=$(openssl rand -base64 32)
    
    print_success "Конфигурация завершена"
}

# Настройка файрвола
setup_firewall() {
    print_status "Настройка файрвола..."
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
    print_success "Файрвол настроен"
}

# Создание базы данных
setup_database() {
    print_status "Создание базы данных и пользователя..."
    
    mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    print_success "База данных создана"
}

# Создание конфигурационных файлов
create_config_files() {
    print_status "Создание конфигурационных файлов..."
    
    # Backend .env файл
    cat > /var/www/project/backend/.env << EOF
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# Frontend URL
FRONTEND_URL=https://$DOMAIN_NAME
EOF

    # Frontend .env файл
    cat > /var/www/project/frontend/.env << EOF
# API Configuration
REACT_APP_API_URL=https://$DOMAIN_NAME/api
REACT_APP_SOCKET_URL=https://$DOMAIN_NAME

# App Configuration
REACT_APP_NAME=Project Name
EOF

    # PM2 конфигурация
    cat > /var/www/project/ecosystem.config.js << EOF
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
EOF

    print_success "Конфигурационные файлы созданы"
}

# Настройка nginx
setup_nginx() {
    print_status "Настройка nginx..."
    
    cat > /etc/nginx/sites-available/project << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Frontend (React build files)
    location / {
        root /var/www/project/frontend/build;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

    ln -sf /etc/nginx/sites-available/project /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t
    systemctl reload nginx
    
    print_success "nginx настроен"
}

# Установка SSL сертификата
install_ssl() {
    print_status "Установка SSL сертификата..."
    
    # Установка certbot
    apt install -y certbot python3-certbot-nginx
    
    # Получение сертификата (неинтерактивный режим)
    certbot --nginx --non-interactive --agree-tos --email $EMAIL -d $DOMAIN_NAME -d www.$DOMAIN_NAME
    
    # Настройка автообновления
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL сертификат установлен"
}

# Настройка автозагрузки сервисов
setup_auto_start() {
    print_status "Настройка автозагрузки сервисов..."
    
    systemctl enable mysql
    systemctl enable nginx
    systemctl enable unattended-upgrades
    
    print_success "Автозагрузка настроена"
}

# Создание скрипта обновления
create_update_script() {
    print_status "Создание скрипта обновления..."
    
    cat > /var/www/project/update.sh << EOF
#!/bin/bash
echo "Обновление проекта..."

cd /var/www/project

# Обновление кода
git pull origin main

# Обновление зависимостей backend
cd backend
npm install

# Обновление зависимостей frontend
cd ../frontend
npm install

# Пересборка frontend
npm run build

# Перезапуск PM2
cd ..
pm2 restart project-backend

echo "Обновление завершено"
EOF

    chmod +x /var/www/project/update.sh
    print_success "Скрипт обновления создан"
}

# Отображение финальной информации
show_final_info() {
    print_success "Установка завершена успешно!"
    echo
    echo "Информация о установке:"
    echo "================================"
    echo "Домен: https://$DOMAIN_NAME"
    echo "База данных: $DB_NAME"
    echo "Пользователь БД: $DB_USER"
    echo "Email для SSL: $EMAIL"
    echo
    echo "Управление сервисами:"
    echo "================================"
    echo "PM2: pm2 status, pm2 logs, pm2 restart project-backend"
    echo "MySQL: systemctl status mysql"
    echo "Nginx: systemctl status nginx"
    echo
    echo "Команды для проверки:"
    echo "================================"
    echo "curl https://$DOMAIN_NAME/api/health"
    echo "curl -I https://$DOMAIN_NAME"
    echo
    echo "Обновление проекта:"
    echo "================================"
    echo "/var/www/project/update.sh"
    echo
    echo "Логи:"
    echo "================================"
    echo "PM2: pm2 logs"
    echo "Nginx: tail -f /var/log/nginx/error.log"
    echo "MySQL: tail -f /var/log/mysql/error.log"
}

# Главная функция
main() {
    echo "=================================="
    echo "  Автоматизированная установка проекта"
    echo "  Ubuntu 22.04 LTS"
    echo "=================================="
    echo
    
    check_root
    check_ubuntu_version
    
    print_warning "Этот скрипт автоматически настроит весь стек приложения."
    print_warning "Убедитесь, что у вас есть:"
    print_warning "1. Доступ к интернету"
    print_warning "2. Домен, указывающий на этот сервер"
    print_warning "3. Права администратора"
    echo
    
    read -p "Продолжить установку? (y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        print_error "Установка отменена"
        exit 1
    fi
    
    # Создание директории проекта
    mkdir -p /var/www/project
    cd /var/www/project
    
    # Выполнение этапов установки
    update_system
    install_additional_packages
    install_nodejs
    install_mysql
    install_nginx
    install_pm2
    setup_configuration
    setup_firewall
    setup_database
    create_config_files
    setup_nginx
    install_ssl
    setup_auto_start
    create_update_script
    
    show_final_info
}

# Обработка сигналов
trap 'print_error "Установка прервана"; exit 1' INT TERM

# Запуск главной функции
main "$@"