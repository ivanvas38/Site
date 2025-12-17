#!/bin/bash

# Скрипт резервного копирования и восстановления для мессенджера
# Автор: Automated Messenger Installer
# Версия: 1.0

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Конфигурация
BACKUP_DIR="${BACKUP_DIR:-backups}"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="messenger"
DB_USER="messenger_user"

# Функции логирования
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

# Создание резервной копии
create_backup() {
    local backup_name="messenger_backup_$DATE"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    info "Создание резервной копии: $backup_name"
    
    mkdir -p "$backup_path"
    
    # Резервная копия базы данных
    log "Резервное копирование базы данных..."
    
    # Получение пароля из .env файла
    local db_password=$(grep DB_PASSWORD backend/.env 2>/dev/null | cut -d'=' -f2)
    if [[ -z "$db_password" ]]; then
        warn "Не удалось найти пароль базы данных в backend/.env"
        read -s -p "Введите пароль базы данных: " db_password
        echo
    fi
    
    # Экспорт базы данных
    mysqldump -u "$DB_USER" -p"$db_password" "$DB_NAME" > "$backup_path/database.sql"
    
    # Резервная копия конфигураций
    log "Резервное копирование конфигураций..."
    
    if [[ -f "/etc/nginx/sites-available/messenger" ]]; then
        sudo cp /etc/nginx/sites-available/messenger "$backup_path/nginx.conf"
    fi
    
    if [[ -d "/etc/mysql" ]]; then
        sudo cp -r /etc/mysql "$backup_path/mysql_config/"
    fi
    
    # Резервная копия файлов приложения
    log "Резервное копирование файлов приложения..."
    
    if [[ -d "frontend/dist" ]]; then
        cp -r frontend/dist "$backup_path/frontend_dist/"
    fi
    
    if [[ -d "uploads" ]]; then
        cp -r uploads "$backup_path/user_uploads/"
    fi
    
    if [[ -d "logs" ]]; then
        cp -r logs "$backup_path/application_logs/"
    fi
    
    # Резервная копия .env файлов
    if [[ -f "backend/.env" ]]; then
        cp backend/.env "$backup_path/backend.env.backup"
    fi
    
    if [[ -f "frontend/.env" ]]; then
        cp frontend/.env "$backup_path/frontend.env.backup"
    fi
    
    # Резервная копия SSL сертификатов
    if [[ -d "/etc/letsencrypt" ]]; then
        sudo cp -r /etc/letsencrypt "$backup_path/ssl_certificates/"
    fi
    
    # Создание архива
    log "Создание архива..."
    tar -czf "$backup_path.tar.gz" -C "$BACKUP_DIR" "$backup_name"
    rm -rf "$backup_path"
    
    # Информация о размере
    local backup_size=$(du -h "$backup_path.tar.gz" | cut -f1)
    log "Резервная копия создана: $backup_path.tar.gz (размер: $backup_size)"
    
    # Очистка старых резервных копий
    cleanup_old_backups
}

# Восстановление из резервной копии
restore_backup() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        error "Файл резервной копии не найден: $backup_file"
    fi
    
    warn "Восстановление из резервной копии: $backup_file"
    read -p "ВНИМАНИЕ: Это перезапишет существующие данные. Продолжить? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Восстановление отменено"
        return 1
    fi
    
    local temp_dir="$BACKUP_DIR/temp_restore_$DATE"
    mkdir -p "$temp_dir"
    
    # Извлечение архива
    log "Извлечение резервной копии..."
    tar -xzf "$backup_file" -C "$temp_dir"
    
    local backup_dir=$(find "$temp_dir" -mindepth 1 -maxdepth 1 -type d | head -1)
    
    if [[ -z "$backup_dir" ]]; then
        error "Не удалось найти директорию резервной копии"
    fi
    
    # Восстановление базы данных
    if [[ -f "$backup_dir/database.sql" ]]; then
        log "Восстановление базы данных..."
        
        local db_password=$(grep DB_PASSWORD backend/.env 2>/dev/null | cut -d'=' -f2)
        if [[ -z "$db_password" ]]; then
            read -s -p "Введите пароль базы данных: " db_password
            echo
        fi
        
        mysql -u "$DB_USER" -p"$db_password" "$DB_NAME" < "$backup_dir/database.sql"
        log "База данных восстановлена"
    fi
    
    # Восстановление конфигураций
    if [[ -f "$backup_dir/nginx.conf" ]]; then
        log "Восстановление конфигурации Nginx..."
        sudo cp "$backup_dir/nginx.conf" /etc/nginx/sites-available/messenger
        sudo nginx -t && sudo systemctl reload nginx
    fi
    
    if [[ -d "$backup_dir/mysql_config" ]]; then
        log "Восстановление конфигурации MySQL..."
        sudo cp -r "$backup_dir/mysql_config/"* /etc/mysql/
        sudo systemctl restart mysql
    fi
    
    # Восстановление файлов приложения
    if [[ -d "$backup_dir/frontend_dist" ]]; then
        log "Восстановление собранного frontend..."
        rm -rf frontend/dist
        cp -r "$backup_dir/frontend_dist" frontend/dist
    fi
    
    if [[ -d "$backup_dir/user_uploads" ]]; then
        log "Восстановление пользовательских файлов..."
        rm -rf uploads
        cp -r "$backup_dir/user_uploads" uploads
    fi
    
    # Перезапуск сервисов
    log "Перезапуск сервисов..."
    pm2 restart all
    sudo systemctl reload nginx
    
    # Очистка
    rm -rf "$temp_dir"
    
    log "Восстановление завершено успешно"
}

# Очистка старых резервных копий
cleanup_old_backups() {
    local max_backups="${MAX_BACKUPS:-10}"
    local backup_count=$(ls -1 "$BACKUP_DIR"/messenger_backup_*.tar.gz 2>/dev/null | wc -l)
    
    if [[ $backup_count -gt $max_backups ]]; then
        log "Очистка старых резервных копий (оставляем последние $max_backups)..."
        
        ls -1t "$BACKUP_DIR"/messenger_backup_*.tar.gz | tail -n +$((max_backups + 1)) | while read backup; do
            rm -f "$backup"
            log "Удалена старая резервная копия: $(basename "$backup")"
        done
    fi
}

# Автоматическое резервное копирование
setup_automatic_backup() {
    log "Настройка автоматического резервного копирования..."
    
    # Создание скрипта для cron
    local cron_script="$BACKUP_DIR/auto_backup.sh"
    
    cat > "$cron_script" << EOF
#!/bin/bash
cd $(pwd)
./scripts/backup.sh --create >> $BACKUP_DIR/backup.log 2>&1
EOF
    
    chmod +x "$cron_script"
    
    # Добавление в cron (ежедневно в 2:00)
    (crontab -l 2>/dev/null; echo "0 2 * * * $cron_script") | crontab -
    
    log "Автоматическое резервное копирование настроено (ежедневно в 2:00)"
}

# Отключение автоматического резервного копирования
disable_automatic_backup() {
    log "Отключение автоматического резервного копирования..."
    
    # Удаление из cron
    crontab -l 2>/dev/null | grep -v "auto_backup.sh" | crontab -
    
    log "Автоматическое резервное копирование отключено"
}

# Список резервных копий
list_backups() {
    info "Доступные резервные копии:"
    
    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR"/messenger_backup_*.tar.gz 2>/dev/null)" ]]; then
        warn "Резервные копии не найдены"
        return 1
    fi
    
    printf "%-30s %-15s %-20s\n" "Файл" "Размер" "Дата создания"
    echo "------------------------------------------------------------"
    
    ls -1t "$BACKUP_DIR"/messenger_backup_*.tar.gz | while read backup; do
        local filename=$(basename "$backup")
        local size=$(du -h "$backup" | cut -f1)
        local date=$(stat -c "%y" "$backup" | cut -d' ' -f1,2 | cut -d'.' -f1)
        printf "%-30s %-15s %-20s\n" "$filename" "$size" "$date"
    done
}

# Проверка целостности резервной копии
verify_backup() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        error "Файл резервной копии не найден: $backup_file"
    fi
    
    info "Проверка целостности резервной копии: $(basename "$backup_file")"
    
    # Проверка архива
    if ! tar -tzf "$backup_file" >/dev/null 2>&1; then
        error "Архив поврежден"
    fi
    
    # Создание временной директории для проверки
    local temp_dir="$BACKUP_DIR/temp_verify_$DATE"
    mkdir -p "$temp_dir"
    
    # Извлечение для проверки
    tar -xzf "$backup_file" -C "$temp_dir"
    
    local backup_dir=$(find "$temp_dir" -mindepth 1 -maxdepth 1 -type d | head -1)
    
    # Проверка содержимого
    local required_files=("database.sql")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$backup_dir/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    # Очистка
    rm -rf "$temp_dir"
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        error "В резервной копии отсутствуют файлы: ${missing_files[*]}"
    else
        log "Резервная копия прошла проверку целостности"
    fi
}

# Справка
show_help() {
    echo "Скрипт резервного копирования и восстановления мессенджера"
    echo ""
    echo "Использование: $0 [команда] [опции]"
    echo ""
    echo "Команды:"
    echo "  --create              Создать резервную копию"
    echo "  --restore FILE        Восстановить из резервной копии"
    echo "  --list                Показать список резервных копий"
    echo "  --verify FILE         Проверить целостность резервной копии"
    echo "  --setup-auto          Настроить автоматическое резервное копирование"
    echo "  --disable-auto        Отключить автоматическое резервное копирование"
    echo "  --cleanup             Очистить старые резервные копии"
    echo "  --help                Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 --create"
    echo "  $0 --restore backups/messenger_backup_20241217_143022.tar.gz"
    echo "  $0 --list"
    echo "  $0 --verify backups/messenger_backup_20241217_143022.tar.gz"
    echo ""
    echo "Переменные окружения:"
    echo "  BACKUP_DIR           Директория для резервных копий (по умолчанию: backups)"
    echo "  MAX_BACKUPS          Максимальное количество резервных копий (по умолчанию: 10)"
    echo "  DB_NAME              Имя базы данных (по умолчанию: messenger)"
    echo "  DB_USER              Пользователь базы данных (по умолчанию: messenger_user)"
}

# Главная функция
main() {
    case "${1:-}" in
        --create)
            create_backup
            ;;
        --restore)
            if [[ -z "$2" ]]; then
                error "Укажите файл резервной копии для восстановления"
            fi
            restore_backup "$2"
            ;;
        --list)
            list_backups
            ;;
        --verify)
            if [[ -z "$2" ]]; then
                error "Укажите файл резервной копии для проверки"
            fi
            verify_backup "$2"
            ;;
        --setup-auto)
            setup_automatic_backup
            ;;
        --disable-auto)
            disable_automatic_backup
            ;;
        --cleanup)
            cleanup_old_backups
            ;;
        --help|-h)
            show_help
            ;;
        "")
            error "Укажите команду. Используйте --help для справки."
            ;;
        *)
            error "Неизвестная команда: $1. Используйте --help для справки."
            ;;
    esac
}

# Проверка необходимых зависимостей
check_dependencies() {
    local deps=("mysql" "mysqldump" "tar" "gzip")
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" >/dev/null 2>&1; then
            error "Необходимая зависимость не найдена: $dep"
        fi
    done
}

# Проверка перед выполнением
if [[ "$1" != "--help" && "$1" != "-h" ]]; then
    check_dependencies
    
    # Проверка наличия необходимых файлов
    if [[ ! -f "backend/.env" ]]; then
        warn "Файл backend/.env не найден. Пароль базы данных потребуется ввести вручную."
    fi
fi

# Запуск главной функции
main "$@"