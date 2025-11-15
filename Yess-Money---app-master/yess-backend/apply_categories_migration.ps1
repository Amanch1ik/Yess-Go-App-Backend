# Скрипт для применения миграции категорий
# Использование: .\apply_categories_migration.ps1

Write-Host "=== Применение миграции категорий ===" -ForegroundColor Cyan
Write-Host ""

# Проверяем, запущен ли Docker
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker не запущен или недоступен" -ForegroundColor Red
    exit 1
}

# Переходим в директорию с docker-compose
$dockerComposePath = Split-Path -Parent $PSScriptRoot
Set-Location $dockerComposePath

Write-Host "1️⃣  Применяем миграцию Alembic..." -ForegroundColor Yellow
docker-compose exec -T backend alembic upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при применении миграции" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Миграция применена успешно" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  Добавляем базовые категории..." -ForegroundColor Yellow
docker-compose exec -T backend python app/scripts/seed_categories.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Возможна ошибка при добавлении категорий (возможно, они уже существуют)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Категории добавлены успешно" -ForegroundColor Green
}
Write-Host ""

Write-Host "3️⃣  Перезапускаем бэкенд для применения изменений..." -ForegroundColor Yellow
docker-compose restart backend
Write-Host "✅ Бэкенд перезапущен" -ForegroundColor Green
Write-Host ""

Write-Host "=== Готово! ===" -ForegroundColor Green
Write-Host "Проверьте логи: docker-compose logs -f backend" -ForegroundColor Cyan

