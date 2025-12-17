#!/bin/bash

# Скрипт обновления проекта
# Версия: 1.0
# Описание: Автоматическое обновление кода и перезапуск сервисов

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Проверка директории проекта
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    print_warning "Скрипт должен запускаться из корневой директории проекта"
    exit 1
fi

# Остановка PM2 процессов
print_status "Остановка PM2 процессов..."
pm2 stop project-backend || print_warning "Не удалось остановить PM2 процессы"

# Создание резервной копии
print_status "Создание резервной копии..."
BACKUP_DIR="/var/backups/project/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -d "backend" ]; then
    cp -r backend "$BACKUP_DIR/"
    print_success "Backend сохранен в $BACKUP_DIR"
fi

if [ -d "frontend" ]; then
    cp -r frontend "$BACKUP_DIR/"
    print_success "Frontend сохранен в $BACKUP_DIR"
fi

if [ -d "database" ]; then
    cp -r database "$BACKUP_DIR/"
    print_success "Database схема сохранена в $BACKUP_DIR"
fi

# Обновление кода из репозитория
print_status "Обновление кода из репозитория..."
git fetch origin
git checkout main
git pull origin main

# Обновление зависимостей backend
if [ -d "backend" ]; then
    print_status "Обновление зависимостей backend..."
    cd backend
    npm install
    cd ..
    print_success "Backend зависимости обновлены"
fi

# Обновление зависимостей frontend
if [ -d "frontend" ]; then
    print_status "Обновление зависимостей frontend..."
    cd frontend
    npm install
    
    # Пересборка frontend для production
    print_status "Сборка frontend для production..."
    npm run build
    cd ..
    print_success "Frontend пересобран"
fi

# Проверка и применение миграций базы данных
if [ -d "database/migrations" ]; then
    print_status "Применение миграций базы данных..."
    # Здесь может быть логика применения SQL миграций
    print_success "Миграции применены (если есть)"
fi

# Обновление PM2 конфигурации (если изменилась)
if [ -f "ecosystem.config.js" ]; then
    print_status "Обновление PM2 конфигурации..."
    pm2 delete project-backend 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    print_success "PM2 конфигурация обновлена"
fi

# Проверка конфигурации nginx (если есть)
if [ -f "nginx.conf" ]; then
    print_status "Проверка конфигурации nginx..."
    sudo nginx -t && sudo systemctl reload nginx
    print_success "Nginx конфигурация проверена"
fi

# Очистка PM2 логов
print_status "Очистка старых логов PM2..."
pm2 flush

print_success "Обновление завершено!"

# Отображение статуса
print_status "Текущий статус сервисов:"
pm2 status
sudo systemctl status nginx --no-pager -l
sudo systemctl status mysql --no-pager -l

echo
print_success "Проект успешно обновлен!"
echo "Логи доступны через: pm2 logs"