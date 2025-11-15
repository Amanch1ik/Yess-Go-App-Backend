# Скрипт для автоматической настройки .env файлов
# Автор: YESS!Go Team

$ErrorActionPreference = "Stop"

function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }

Clear-Host
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     YESS!Go - Настройка окружения                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Генерация секретных ключей
Write-Info "Генерация секретных ключей..."
try {
    $secretKey = python -c "import secrets; print(secrets.token_urlsafe(32))" 2>&1 | Select-Object -Last 1
    $jwtSecretKey = python -c "import secrets; print(secrets.token_urlsafe(32))" 2>&1 | Select-Object -Last 1
    $adminSecretKey = python -c "import secrets; print(secrets.token_urlsafe(32))" 2>&1 | Select-Object -Last 1
    
    Write-Success "✓ Секретные ключи сгенерированы"
} catch {
    Write-Warning "⚠ Не удалось сгенерировать ключи через Python, используем случайные значения"
    $secretKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 43 | ForEach-Object {[char]$_})
    $jwtSecretKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 43 | ForEach-Object {[char]$_})
    $adminSecretKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 43 | ForEach-Object {[char]$_})
}

# Настройка Backend .env
$backendEnvPath = Join-Path $PSScriptRoot "yess-backend\.env"
if (-not (Test-Path $backendEnvPath)) {
    Write-Info "Создание .env для Backend..."
    
    $backendEnv = @"
# Настройки базы данных
# ВАЖНО: Настройте подключение к вашей PostgreSQL базе данных
DATABASE_URL=postgresql://yess_user:password@localhost:5432/yess_db

# Настройки безопасности
# Сгенерированные секретные ключи
SECRET_KEY=$secretKey
JWT_SECRET_KEY=$jwtSecretKey
ADMIN_SECRET_KEY=$adminSecretKey
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_TOKEN_EXPIRE_MINUTES=60
JWT_ALGORITHM=HS256

# Политика паролей
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=True
PASSWORD_REQUIRE_LOWERCASE=True
PASSWORD_REQUIRE_DIGITS=True
PASSWORD_REQUIRE_SPECIAL_CHARS=False

# Настройки Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Настройки CORS (для разработки)
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]
CORS_ALLOW_CREDENTIALS=True

# Настройки безопасности файлов
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=["jpg","jpeg","png","gif","pdf"]

# Мониторинг безопасности
ENABLE_SECURITY_LOGGING=True
LOG_SENSITIVE_EVENTS=False

# Настройки 2FA
TWO_FACTOR_ENABLED=False
TWO_FACTOR_METHODS=["totp", "sms"]

# Политика сессий
MAX_CONCURRENT_SESSIONS=3
SESSION_TIMEOUT_MINUTES=120

# Режим работы приложения
APP_ENV=development
DEBUG=True
DEVELOPMENT_MODE=True

# Локальные настройки Кыргызстана
COUNTRY_CODE=KG
CURRENCY=KGS
TIMEZONE=Asia/Bishkek
LANGUAGE=kg
PHONE_FORMAT=+996XXXXXXXXX
DATE_FORMAT=DD.MM.YYYY
TIME_FORMAT=HH:MM
NUMBER_FORMAT=1 234,56

# Бизнес-правила
DEFAULT_REFERRAL_BONUS=100.0
MIN_TRANSACTION_AMOUNT=10.0
MAX_TRANSACTION_AMOUNT=100000.0
DEFAULT_CASHBACK_RATE=1.0
MAX_CASHBACK_RATE=10.0

# Redis (опционально)
REDIS_URL=redis://localhost:6379/0

# Логирование
LOG_LEVEL=INFO
"@
    
    $backendEnv | Out-File -FilePath $backendEnvPath -Encoding UTF8
    Write-Success "✓ Backend .env создан: $backendEnvPath"
} else {
    Write-Warning "⚠ Backend .env уже существует, пропускаем"
}

# Настройка Admin Panel .env
$adminEnvPath = Join-Path $PSScriptRoot "admin-panel\.env"
if (-not (Test-Path $adminEnvPath)) {
    Write-Info "Создание .env для Admin Panel..."
    "VITE_API_URL=http://localhost:8000" | Out-File -FilePath $adminEnvPath -Encoding UTF8
    Write-Success "✓ Admin Panel .env создан: $adminEnvPath"
} else {
    Write-Warning "⚠ Admin Panel .env уже существует, пропускаем"
}

# Настройка Partner Panel .env
$partnerEnvPath = Join-Path $PSScriptRoot "partner-panel\.env"
if (-not (Test-Path $partnerEnvPath)) {
    Write-Info "Создание .env для Partner Panel..."
    "VITE_API_URL=http://localhost:8000" | Out-File -FilePath $partnerEnvPath -Encoding UTF8
    Write-Success "✓ Partner Panel .env создан: $partnerEnvPath"
} else {
    Write-Warning "⚠ Partner Panel .env уже существует, пропускаем"
}

Write-Host ""
Write-Success "═══════════════════════════════════════════════════════"
Write-Success "  Настройка окружения завершена!"
Write-Success "═══════════════════════════════════════════════════════"
Write-Host ""
Write-Info "📝 Следующие шаги:"
Write-Host "  1. Настройте DATABASE_URL в yess-backend/.env"
Write-Host "  2. Примените миграции: cd yess-backend && alembic upgrade head"
Write-Host "  3. Запустите сервисы: .\start_all.ps1"
Write-Host ""

