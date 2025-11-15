# ═══════════════════════════════════════════════════════════════
# YESS!Go - Скрипт запуска всех сервисов
# ═══════════════════════════════════════════════════════════════
# 
# Использование:
#   .\start_all.ps1                    # Запустить все сервисы
#   .\start_all.ps1 -SkipBackend       # Пропустить Backend
#   .\start_all.ps1 -SkipAdmin         # Пропустить Admin Panel
#   .\start_all.ps1 -SkipPartner      # Пропустить Partner Panel
#   .\start_all.ps1 -InstallDeps       # Переустановить зависимости
#
# Автор: YESS!Go Team
# Версия: 2.0
# ═══════════════════════════════════════════════════════════════

param(
    [switch]$SkipBackend,
    [switch]$SkipAdmin,
    [switch]$SkipPartner,
    [switch]$InstallDeps
)

$ErrorActionPreference = "Stop"

# Цвета для вывода
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }

# Проверка зависимостей
function Test-Dependencies {
    Write-Info "Проверка зависимостей..."
    
    # Проверка Python
    try {
        $pythonVersion = python --version 2>&1
        Write-Success "✓ Python найден: $pythonVersion"
    } catch {
        Write-Error "✗ Python не найден! Установите Python 3.9+"
        exit 1
    }
    
    # Проверка Node.js
    try {
        $nodeVersion = node --version 2>&1
        Write-Success "✓ Node.js найден: $nodeVersion"
    } catch {
        Write-Error "✗ Node.js не найден! Установите Node.js 18+"
        exit 1
    }
    
    # Проверка npm
    try {
        $npmVersion = npm --version 2>&1
        Write-Success "✓ npm найден: $npmVersion"
    } catch {
        Write-Error "✗ npm не найден!"
        exit 1
    }
}

# Создание виртуального окружения для Python
function Setup-Backend {
    $backendPath = Join-Path $PSScriptRoot "yess-backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-Error "Папка yess-backend не найдена!"
        exit 1
    }
    
    $venvPath = Join-Path $backendPath "venv"
    
    if (-not (Test-Path $venvPath)) {
        Write-Info "Создание виртуального окружения Python..."
        Push-Location $backendPath
        python -m venv venv
        Pop-Location
        Write-Success "✓ Виртуальное окружение создано"
    }
    
    # Активация venv
    $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
        Write-Success "✓ Виртуальное окружение активировано"
    }
    
    # Установка зависимостей
    if ($InstallDeps -or -not (Test-Path (Join-Path $venvPath "Lib\site-packages\fastapi"))) {
        Write-Info "Установка зависимостей Python..."
        Push-Location $backendPath
        pip install --upgrade pip
        pip install -r requirements.txt
        Pop-Location
        Write-Success "✓ Зависимости Python установлены"
    }
}

# Установка зависимостей для панелей
function Setup-Panels {
    param([string]$PanelName, [string]$PanelPath)
    
    if (-not (Test-Path $PanelPath)) {
        Write-Warning "Папка $PanelName не найдена: $PanelPath"
        return $false
    }
    
    $nodeModulesPath = Join-Path $PanelPath "node_modules"
    
    if ($InstallDeps -or -not (Test-Path $nodeModulesPath)) {
        Write-Info "Установка зависимостей для $PanelName..."
        Push-Location $PanelPath
        npm install
        Pop-Location
        Write-Success "✓ Зависимости для $PanelName установлены"
    }
    
    return $true
}

# Запуск Backend
function Start-Backend {
    $backendPath = Join-Path $PSScriptRoot "yess-backend"
    $venvPath = Join-Path $backendPath "venv"
    $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
    
    Write-Info "Запуск Backend на http://localhost:8000"
    
    Start-Process powershell -ArgumentList @"
`$host.ui.RawUI.WindowTitle = 'YESS Backend (Port 8000)'
cd "$backendPath"
& "$activateScript"
Write-Host '🚀 Backend запускается...' -ForegroundColor Green
Write-Host '📚 Swagger UI: http://localhost:8000/docs' -ForegroundColor Cyan
Write-Host '📖 ReDoc: http://localhost:8000/redoc' -ForegroundColor Cyan
Write-Host ''
uvicorn app.main:app --reload --port 8000
"@
}

# Запуск Admin Panel
function Start-AdminPanel {
    $adminPath = Join-Path $PSScriptRoot "admin-panel"
    
    Write-Info "Запуск Admin Panel на http://localhost:3001"
    
    Start-Process powershell -ArgumentList @"
`$host.ui.RawUI.WindowTitle = 'YESS Admin Panel (Port 3001)'
cd "$adminPath"
Write-Host '🎨 Admin Panel запускается...' -ForegroundColor Green
Write-Host '🌐 URL: http://localhost:3001' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@
}

# Запуск Partner Panel
function Start-PartnerPanel {
    $partnerPath = Join-Path $PSScriptRoot "partner-panel"
    
    Write-Info "Запуск Partner Panel на http://localhost:3002"
    
    Start-Process powershell -ArgumentList @"
`$host.ui.RawUI.WindowTitle = 'YESS Partner Panel (Port 3002)'
cd "$partnerPath"
Write-Host '🤝 Partner Panel запускается...' -ForegroundColor Green
Write-Host '🌐 URL: http://localhost:3002' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@
}

# Главная функция
function Main {
    Clear-Host
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     YESS!Go - Запуск всех сервисов                    ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Проверка зависимостей
    Test-Dependencies
    Write-Host ""
    
    # Проверка и настройка .env файлов
    $backendEnvPath = Join-Path $PSScriptRoot "yess-backend\.env"
    $adminEnvPath = Join-Path $PSScriptRoot "admin-panel\.env"
    $partnerEnvPath = Join-Path $PSScriptRoot "partner-panel\.env"
    
    if (-not (Test-Path $backendEnvPath) -or -not (Test-Path $adminEnvPath) -or -not (Test-Path $partnerEnvPath)) {
        Write-Warning "⚠ .env файлы не найдены. Запускаю автоматическую настройку..."
        $setupScript = Join-Path $PSScriptRoot "setup_env.ps1"
        if (Test-Path $setupScript) {
            & $setupScript
            Write-Host ""
        } else {
            Write-Warning "⚠ Скрипт setup_env.ps1 не найден. Создайте .env файлы вручную."
            Write-Host ""
        }
    }
    
    # Настройка Backend
    if (-not $SkipBackend) {
        Setup-Backend
        Write-Host ""
    }
    
    # Настройка панелей
    if (-not $SkipAdmin) {
        $adminPath = Join-Path $PSScriptRoot "admin-panel"
        Setup-Panels "Admin Panel" $adminPath | Out-Null
    }
    
    if (-not $SkipPartner) {
        $partnerPath = Join-Path $PSScriptRoot "partner-panel"
        Setup-Panels "Partner Panel" $partnerPath | Out-Null
    }
    
    Write-Host ""
    Write-Success "═══════════════════════════════════════════════════════"
    Write-Success "  Все сервисы запускаются в отдельных окнах..."
    Write-Success "═══════════════════════════════════════════════════════"
    Write-Host ""
    
    # Запуск сервисов
    Start-Sleep -Seconds 2
    
    if (-not $SkipBackend) {
        Start-Backend
        Start-Sleep -Seconds 1
    }
    
    if (-not $SkipAdmin) {
        Start-AdminPanel
        Start-Sleep -Seconds 1
    }
    
    if (-not $SkipPartner) {
        Start-PartnerPanel
        Start-Sleep -Seconds 1
    }
    
    Write-Host ""
    Write-Success "✅ Все сервисы запущены!"
    Write-Host ""
    Write-Info "📚 Backend API:     http://localhost:8000"
    Write-Info "📖 Swagger UI:      http://localhost:8000/docs"
    Write-Info "🎨 Admin Panel:     http://localhost:3001"
    Write-Info "🤝 Partner Panel:   http://localhost:3002"
    Write-Host ""
    Write-Warning "💡 Для остановки закройте окна PowerShell с сервисами"
    Write-Host ""
}

# Запуск
Main

