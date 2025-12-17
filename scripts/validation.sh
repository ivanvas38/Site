#!/bin/bash

# Функции валидации и проверки безопасности для скрипта установки
# Автор: Automated Messenger Installer
# Версия: 1.0

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Логирование функций
log_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Проверка безопасности системы
check_system_security() {
    log_info "Проверка безопасности системы..."
    
    # Проверка на запуск от root
    if [[ $EUID -eq 0 ]]; then
        log_warning "Скрипт запущен от root. Это не рекомендуется по соображениям безопасности."
        read -p "Продолжить? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Проверка фаервола
    if command -v ufw >/dev/null 2>&1; then
        UFW_STATUS=$(ufw status | grep "Status:" | awk '{print $2}')
        if [[ "$UFW_STATUS" == "active" ]]; then
            log_success "UFW фаервол активен"
        else
            log_warning "UFW фаервол неактивен. Рекомендуется настроить базовые правила."
        fi
    fi
    
    # Проверка обновлений безопасности
    if command -v apt >/dev/null 2>&1; then
        log_info "Проверка доступных обновлений безопасности..."
        if apt list --upgradable 2>/dev/null | grep -i security | grep -v Listing >/dev/null; then
            log_warning "Доступны обновления безопасности. Рекомендуется обновить систему."
        else
            log_success "Система обновлена"
        fi
    fi
}

# Валидация домена
validate_domain() {
    local domain=$1
    if [[ ! $domain =~ ^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
        log_error "Некорректный формат домена: $domain"
        return 1
    fi
    return 0
}

# Валидация URL репозитория
validate_repo_url() {
    local url=$1
    if [[ ! $url =~ ^https?://.*github\.com/.*/.*\.git$ ]]; then
        log_warning "URL репозитория выглядит некорректно: $url"
        read -p "Продолнить? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    return 0
}

# Проверка доступности портов
check_port_availability() {
    local ports=(80 443 3000 3306)
    
    log_info "Проверка доступности портов..."
    
    for port in "${ports[@]}"; do
        if sudo netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            log_warning "Порт $port уже используется"
            read -p "Продолжить? Может потребоваться остановить другие сервисы. (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                return 1
            fi
        else
            log_success "Порт $port свободен"
        fi
    done
}

# Проверка системных ресурсов
check_system_resources() {
    log_info "Проверка системных ресурсов..."
    
    # Проверка оперативной памяти
    local available_ram=$(free -m | awk 'NR==2{print $7}')
    local total_ram=$(free -m | awk 'NR==2{print $2}')
    
    if [[ $available_ram -lt 512 ]]; then
        log_warning "Недостаточно свободной оперативной памяти: ${available_ram}MB"
        read -p "Продолжить? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    else
        log_success "Доступно оперативной памяти: ${available_ram}MB / ${total_ram}MB"
    fi
    
    # Проверка места на диске
    local available_space=$(df / | awk 'NR==2 {print $4}')
    local required_space=10485760  # 10GB в KB
    
    if [[ $available_space -lt $required_space ]]; then
        log_error "Недостаточно места на диске. Требуется: 10GB, доступно: $((available_space/1024/1024))GB"
        return 1
    else
        log_success "Достаточно места на диске: $((available_space/1024/1024))GB"
    fi
}

# Проверка сетевого подключения
check_network() {
    log_info "Проверка сетевого подключения..."
    
    # Проверка подключения к интернету
    if ! ping -c 1 google.com >/dev/null 2>&1; then
        log_error "Отсутствует подключение к интернету"
        return 1
    fi
    
    # Проверка подключения к GitHub
    if ! ping -c 1 github.com >/dev/null 2>&1; then
        log_warning "Проблемы с подключением к GitHub"
        read -p "Продолнить? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    else
        log_success "Сетевое подключение работает"
    fi
}

# Проверка безопасности файлов
check_file_security() {
    log_info "Проверка безопасности файлов..."
    
    # Проверка прав доступа к критичным файлам
    local critical_files=("/etc/passwd" "/etc/shadow" "/etc/sudoers")
    
    for file in "${critical_files[@]}"; do
        if [[ -r "$file" ]]; then
            local perms=$(stat -c "%a" "$file")
            if [[ ${perms:0:1} -gt 6 ]]; then
                log_warning "Файл $file имеет слишком открытые права: $perms"
            fi
        fi
    done
}

# Создание резервной копии
create_backup() {
    local backup_dir="backups/$(date +%Y%m%d-%H%M%S)"
    local backup_files=("/etc/nginx/sites-available" "/etc/mysql")
    
    log_info "Создание резервной копии конфигураций..."
    
    mkdir -p "$backup_dir"
    
    for file in "${backup_files[@]}"; do
        if [[ -e "$file" ]]; then
            sudo cp -r "$file" "$backup_dir/" 2>/dev/null || true
        fi
    done
    
    log_success "Резервная копия создана: $backup_dir"
}

# Проверка зависимостей
check_dependencies() {
    log_info "Проверка установленных зависимостей..."
    
    local required_commands=("curl" "wget" "git" "mysql" "nginx" "node" "npm" "pm2")
    local missing_commands=()
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log_warning "Отсутствуют команды: ${missing_commands[*]}"
        log_info "Они будут установлены автоматически"
    else
        log_success "Все необходимые команды доступны"
    fi
}

# Логирование системной информации
log_system_info() {
    log_info "Информация о системе:"
    echo "  OS: $(lsb_release -d 2>/dev/null | cut -f2 || echo "Неизвестно")"
    echo "  Kernel: $(uname -r)"
    echo "  Architecture: $(uname -m)"
    echo "  Memory: $(free -h | awk 'NR==2{print $2}')"
    echo "  Disk: $(df -h / | awk 'NR==2{print $4}') свободно из $(df -h / | awk 'NR==2{print $2}')"
}

# Основная функция валидации
run_validation() {
    log_system_info
    check_system_security
    check_system_resources
    check_network
    check_port_availability
    check_dependencies
    create_backup
    check_file_security
}

# Экспорт функций для использования в других скриптах
export -f log_info log_success log_warning log_error
export -f validate_domain validate_repo_url check_port_availability
export -f check_system_resources check_network check_dependencies
export -f run_validation log_system_info