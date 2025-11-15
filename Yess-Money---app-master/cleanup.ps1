# Скрипт для очистки лишних файлов и папок
# ВНИМАНИЕ: Этот скрипт удаляет файлы! Используйте с осторожностью.

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }

function Remove-ItemSafe {
    param([string]$Path, [string]$Description)
    
    if (Test-Path $Path) {
        try {
            Write-Info "Удаление: $Description"
            Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "✓ Удалено: $Description"
        } catch {
            Write-Warning "⚠ Не удалось удалить: $Description"
        }
    }
}

Clear-Host
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║     YESS!Go - Очистка лишних файлов                    ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

if (-not $Force) {
    Write-Warning "Этот скрипт удалит следующие файлы и папки:"
    Write-Host ""
    Write-Host "  - Вложенная папка Yess-Money---app-master/Yess-Money---app-master"
    Write-Host "  - Временные файлы (*.txt с описаниями)"
    Write-Host "  - Дублирующиеся скрипты"
    Write-Host ""
    $confirm = Read-Host "Продолжить? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Info "Отменено пользователем"
        exit 0
    }
}

Write-Host ""
Write-Info "Начало очистки..."
Write-Host ""

$scriptRoot = $PSScriptRoot

# Удаление вложенной папки Yess-Money---app-master
$nestedFolder = Join-Path $scriptRoot "Yess-Money---app-master"
Remove-ItemSafe $nestedFolder "Вложенная папка Yess-Money---app-master"

# Удаление временных файлов
$tempFiles = @(
    "✅_АУТЕНТИФИКАЦИЯ_ИСПРАВЛЕНА.txt",
    "FIX_DEPENDENCIES.txt",
    "RUN_BACKEND.txt",
    "RUN_FRONTEND.txt",
    "отсюда",
    "хост",
    "new",
    "0",
    "1",
    "_http",
    "logging.AddDebug())",
    "System.NotSupportedException"
)

foreach ($file in $tempFiles) {
    $filePath = Join-Path $scriptRoot $file
    Remove-ItemSafe $filePath "Временный файл: $file"
}

# Удаление дублирующихся скриптов (оставляем только start_all.ps1)
$oldScripts = @(
    "check_and_start_backend.ps1",
    "dev_start.ps1",
    "start_dev.ps1",
    "start_panels_and_backend.sh",
    "start_all.sh"
)

foreach ($script in $oldScripts) {
    $scriptPath = Join-Path $scriptRoot $script
    Remove-ItemSafe $scriptPath "Старый скрипт: $script"
}

# Удаление лишних папок из корня (если они есть)
$rootExtraFolders = @(
    "unified-mobile-app",
    "YESS.MauiApp"
)

foreach ($folder in $rootExtraFolders) {
    $folderPath = Join-Path (Split-Path $scriptRoot -Parent) $folder
    if (Test-Path $folderPath) {
        Write-Warning "Найдена лишняя папка в корне: $folder"
        Write-Warning "  Путь: $folderPath"
        Write-Warning "  Удалите вручную, если не нужна"
    }
}

Write-Host ""
Write-Success "═══════════════════════════════════════════════════════"
Write-Success "  Очистка завершена!"
Write-Success "═══════════════════════════════════════════════════════"
Write-Host ""
Write-Info "💡 Используйте start_all.ps1 для запуска всех сервисов"
Write-Host ""
