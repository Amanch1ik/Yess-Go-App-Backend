# Скрипт для тестирования API endpoints
# Использование: .\test_endpoints.ps1

$baseUrl = "http://localhost:8000"
$adminToken = $null
$partnerToken = $null

Write-Host "=== Тестирование API Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Проверка здоровья API
Write-Host "1. Проверка здоровья API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction Stop
    Write-Host "   ✓ API доступен" -ForegroundColor Green
} catch {
    Write-Host "   ✗ API недоступен: $_" -ForegroundColor Red
    Write-Host "   Убедитесь, что бэкенд запущен на $baseUrl" -ForegroundColor Yellow
    exit 1
}

# Тест авторизации Admin
Write-Host "`n2. Тест авторизации Admin..." -ForegroundColor Yellow
try {
    $body = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    if ($response.access_token) {
        $adminToken = $response.access_token
        Write-Host "   ✓ Авторизация Admin успешна" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Токен не получен (возможно, нужны другие учетные данные)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠ Ошибка авторизации Admin: $_" -ForegroundColor Yellow
    Write-Host "   (Это нормально, если тестовый пользователь не создан)" -ForegroundColor Gray
}

# Тест авторизации Partner
Write-Host "`n3. Тест авторизации Partner..." -ForegroundColor Yellow
try {
    $body = @{
        username = "partner"
        password = "partner123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/partner/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    if ($response.access_token) {
        $partnerToken = $response.access_token
        Write-Host "   ✓ Авторизация Partner успешна" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Токен не получен (возможно, нужны другие учетные данные)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠ Ошибка авторизации Partner: $_" -ForegroundColor Yellow
    Write-Host "   (Это нормально, если тестовый пользователь не создан)" -ForegroundColor Gray
}

# Тест Admin endpoints (если есть токен)
if ($adminToken) {
    Write-Host "`n4. Тест Admin endpoints..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    
    # Dashboard stats
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/dashboard/stats" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "   ✓ GET /api/v1/admin/dashboard/stats" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ GET /api/v1/admin/dashboard/stats: $_" -ForegroundColor Red
    }
    
    # Users list
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/users" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "   ✓ GET /api/v1/admin/users" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ GET /api/v1/admin/users: $_" -ForegroundColor Red
    }
    
    # Partners list
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/partners" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "   ✓ GET /api/v1/admin/partners" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ GET /api/v1/admin/partners: $_" -ForegroundColor Red
    }
}

# Тест Partner endpoints (если есть токен)
if ($partnerToken) {
    Write-Host "`n5. Тест Partner endpoints..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $partnerToken"
    }
    
    # Dashboard stats
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/partner/dashboard/stats" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "   ✓ GET /api/v1/partner/dashboard/stats" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ GET /api/v1/partner/dashboard/stats: $_" -ForegroundColor Red
    }
    
    # Locations
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/partner/locations" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "   ✓ GET /api/v1/partner/locations" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ GET /api/v1/partner/locations: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Тестирование завершено ===" -ForegroundColor Cyan
Write-Host "`nДля детального тестирования используйте:" -ForegroundColor Yellow
Write-Host "  - Swagger UI: $baseUrl/docs" -ForegroundColor Cyan
Write-Host "  - TEST_ENDPOINTS.md для полного списка endpoints" -ForegroundColor Cyan

