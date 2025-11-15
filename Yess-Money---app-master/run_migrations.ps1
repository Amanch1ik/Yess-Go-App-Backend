# Скрипт для применения миграций БД
# Автор: YESS!Go Team

$ErrorActionPreference = "Stop"

function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }

Clear-Host
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     YESS!Go - Применение миграций БД                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "Yess-Money---app-master\yess-backend"
if (-not (Test-Path $backendPath)) {
    Write-Error "✗ Backend не найден: $backendPath"
    exit 1
}

# Проверка .env файла
$envPath = Join-Path $backendPath ".env"
if (-not (Test-Path $envPath)) {
    Write-Warning "⚠ .env файл не найден. Запускаю setup_env.ps1..."
    $setupScript = Join-Path $PSScriptRoot "Yess-Money---app-master\setup_env.ps1"
    if (Test-Path $setupScript) {
        & $setupScript
    } else {
        Write-Error "✗ Скрипт setup_env.ps1 не найден"
        exit 1
    }
}

# Проверка виртуального окружения
$venvPath = Join-Path $backendPath "venv"
if (-not (Test-Path $venvPath)) {
    Write-Info "Создание виртуального окружения..."
    Set-Location $backendPath
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Error "✗ Не удалось создать виртуальное окружение"
        exit 1
    }
    Write-Success "✓ Виртуальное окружение создано"
}

# Активация виртуального окружения
Write-Info "Активация виртуального окружения..."
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
} else {
    Write-Error "✗ Скрипт активации не найден"
    exit 1
}

# Проверка alembic
Set-Location $backendPath
Write-Info "Проверка Alembic..."
$alembicExe = Join-Path $venvPath "Scripts\alembic.exe"
if (-not (Test-Path $alembicExe)) {
    Write-Info "Установка зависимостей..."
    pip install -q alembic sqlalchemy psycopg2-binary
    if ($LASTEXITCODE -ne 0) {
        Write-Error "✗ Не удалось установить зависимости"
        exit 1
    }
}

# Применение миграций
Write-Host ""
Write-Info "Применение миграций БД..."
Write-Host ""

& $alembicExe upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Success "═══════════════════════════════════════════════════════"
    Write-Success "  Миграции успешно применены!"
    Write-Success "═══════════════════════════════════════════════════════"
    Write-Host ""
} else {
    Write-Host ""
    Write-Error "═══════════════════════════════════════════════════════"
    Write-Error "  Ошибка при применении миграций!"
    Write-Error "═══════════════════════════════════════════════════════"
    Write-Host ""
    Write-Warning "Проверьте:"
    Write-Host "  1. PostgreSQL запущен и доступен"
    Write-Host "  2. DATABASE_URL в .env файле настроен правильно"
    Write-Host "  3. База данных создана"
    Write-Host ""
    exit 1
}

