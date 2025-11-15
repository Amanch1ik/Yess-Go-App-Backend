# Скрипт для генерации production секретных ключей
# Автор: YESS!Go Team

$ErrorActionPreference = "Stop"

function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }

Clear-Host
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     YESS!Go - Генерация Production ключей              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Info "Генерация безопасных секретных ключей для production..."
Write-Host ""

try {
    $secretKey = python -c "import secrets; print(secrets.token_urlsafe(32))" 2>&1 | Select-Object -Last 1
    $jwtSecretKey = python -c "import secrets; print(secrets.token_urlsafe(32))" 2>&1 | Select-Object -Last 1
    $adminSecretKey = python -c "import secrets; print(secrets.token_urlsafe(32))" 2>&1 | Select-Object -Last 1
    
    Write-Success "✓ Ключи сгенерированы"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  PRODUCTION СЕКРЕТНЫЕ КЛЮЧИ" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SECRET_KEY=$secretKey" -ForegroundColor Green
    Write-Host "JWT_SECRET_KEY=$jwtSecretKey" -ForegroundColor Green
    Write-Host "ADMIN_SECRET_KEY=$adminSecretKey" -ForegroundColor Green
    Write-Host ""
    Write-Warning "⚠ ВАЖНО: Сохраните эти ключи в безопасном месте!"
    Write-Warning "⚠ Добавьте их в .env файл для production сервера"
    Write-Warning "⚠ НИКОГДА не коммитьте эти ключи в Git!"
    Write-Host ""
    
    # Сохранение в файл (опционально)
    $save = Read-Host "Сохранить ключи в файл production_keys.txt? (y/n)"
    if ($save -eq "y" -or $save -eq "Y") {
        $keysFile = Join-Path $PSScriptRoot "production_keys.txt"
        @"
# PRODUCTION СЕКРЕТНЫЕ КЛЮЧИ
# Сгенерировано: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ВАЖНО: НЕ КОММИТЬТЕ ЭТОТ ФАЙЛ В GIT!

SECRET_KEY=$secretKey
JWT_SECRET_KEY=$jwtSecretKey
ADMIN_SECRET_KEY=$adminSecretKey
"@ | Out-File -FilePath $keysFile -Encoding UTF8
        
        Write-Success "✓ Ключи сохранены в: $keysFile"
        Write-Warning "⚠ Убедитесь, что этот файл добавлен в .gitignore!"
    }
    
} catch {
    Write-Warning "⚠ Не удалось сгенерировать ключи через Python"
    Write-Host "Используйте онлайн генератор или команду:"
    Write-Host "  openssl rand -base64 32"
    Write-Host ""
}

