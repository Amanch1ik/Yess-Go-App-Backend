# 🧪 Тестирование API Endpoints

Этот документ содержит инструкции для тестирования всех API endpoints, используемых в Admin Panel и Partner Panel.

## 📋 Предварительные требования

1. **Backend должен быть запущен:**
   ```bash
   cd yess-backend
   python -m venv venv
   source venv/bin/activate  # или venv\Scripts\activate на Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. **Проверка здоровья API:**
   ```bash
   curl http://localhost:8000/health
   # или
   curl http://localhost:8000/api/v1/health
   ```

3. **Swagger документация:**
   Откройте в браузере: http://localhost:8000/docs

## 🔐 Тестирование аутентификации

### Admin Panel Auth

```bash
# Тест входа администратора
curl -X POST http://localhost:8000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Ожидаемый ответ:
# {
#   "access_token": "eyJ...",
#   "token_type": "bearer",
#   "admin": {...}
# }
```

### Partner Panel Auth

```bash
# Тест входа партнера
curl -X POST http://localhost:8000/api/v1/partner/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"partner","password":"partner123"}'

# Ожидаемый ответ:
# {
#   "access_token": "eyJ...",
#   "token_type": "bearer",
#   "user_id": 1
# }
```

**Сохраните токен для следующих запросов:**
```bash
export ADMIN_TOKEN="your_admin_token_here"
export PARTNER_TOKEN="your_partner_token_here"
```

## 📊 Admin Panel Endpoints

### Dashboard

```bash
# Получить статистику
curl -X GET http://localhost:8000/api/v1/admin/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Пользователи

```bash
# Список пользователей
curl -X GET http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Детали пользователя
curl -X GET http://localhost:8000/api/v1/admin/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Обновить пользователя
curl -X PUT http://localhost:8000/api/v1/admin/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@example.com"}'

# Удалить пользователя
curl -X DELETE http://localhost:8000/api/v1/admin/users/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Активировать пользователя
curl -X POST http://localhost:8000/api/v1/admin/users/1/activate \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Деактивировать пользователя
curl -X POST http://localhost:8000/api/v1/admin/users/1/deactivate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Партнеры

```bash
# Список партнеров
curl -X GET http://localhost:8000/api/v1/admin/partners \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Детали партнера
curl -X GET http://localhost:8000/api/v1/admin/partners/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Создать партнера
curl -X POST http://localhost:8000/api/v1/admin/partners \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Partner",
    "email": "partner@example.com",
    "phone": "+996555123456",
    "category": "restaurant"
  }'

# Обновить партнера
curl -X PUT http://localhost:8000/api/v1/admin/partners/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Partner Name"}'

# Удалить партнера
curl -X DELETE http://localhost:8000/api/v1/admin/partners/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Одобрить партнера
curl -X POST http://localhost:8000/api/v1/admin/partners/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Отклонить партнера
curl -X POST http://localhost:8000/api/v1/admin/partners/1/reject \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Транзакции

```bash
# Список транзакций
curl -X GET http://localhost:8000/api/v1/admin/transactions \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Список с фильтрами
curl -X GET "http://localhost:8000/api/v1/admin/transactions?page=1&limit=10&start_date=2025-01-01&end_date=2025-01-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Детали транзакции
curl -X GET http://localhost:8000/api/v1/admin/transactions/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Промо-акции

```bash
# Список промо-акций
curl -X GET http://localhost:8000/api/v1/admin/promotions \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Детали промо-акции
curl -X GET http://localhost:8000/api/v1/admin/promotions/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Создать промо-акцию
curl -X POST http://localhost:8000/api/v1/admin/promotions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Promotion",
    "description": "Promotion description",
    "discount_percent": 10,
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  }'

# Обновить промо-акцию
curl -X PUT http://localhost:8000/api/v1/admin/promotions/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Promotion"}'

# Удалить промо-акцию
curl -X DELETE http://localhost:8000/api/v1/admin/promotions/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 🤝 Partner Panel Endpoints

### Dashboard

```bash
# Статистика партнера
curl -X GET http://localhost:8000/api/v1/partner/dashboard/stats \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### Локации

```bash
# Список локаций
curl -X GET http://localhost:8000/api/v1/partner/locations \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Создать локацию
curl -X POST http://localhost:8000/api/v1/partner/locations \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Location",
    "address": "123 Main St",
    "latitude": 42.8746,
    "longitude": 74.5698,
    "phone": "+996555123456"
  }'

# Обновить локацию
curl -X PUT http://localhost:8000/api/v1/partner/locations/1 \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Location"}'

# Удалить локацию
curl -X DELETE http://localhost:8000/api/v1/partner/locations/1 \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### Промо-акции

```bash
# Список промо-акций партнера
curl -X GET http://localhost:8000/api/v1/partner/promotions \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Создать промо-акцию
curl -X POST http://localhost:8000/api/v1/partner/promotions \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Partner Promotion",
    "description": "Description",
    "discount_percent": 15,
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  }'

# Обновить промо-акцию
curl -X PUT http://localhost:8000/api/v1/partner/promotions/1 \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Promotion"}'

# Удалить промо-акцию
curl -X DELETE http://localhost:8000/api/v1/partner/promotions/1 \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### Сотрудники

```bash
# Список сотрудников
curl -X GET http://localhost:8000/api/v1/partner/employees \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Создать сотрудника
curl -X POST http://localhost:8000/api/v1/partner/employees \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+996555123456",
    "role": "manager"
  }'

# Обновить сотрудника
curl -X PUT http://localhost:8000/api/v1/partner/employees/1 \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Удалить сотрудника
curl -X DELETE http://localhost:8000/api/v1/partner/employees/1 \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### Транзакции

```bash
# Список транзакций партнера
curl -X GET http://localhost:8000/api/v1/partner/transactions \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# С фильтрами по датам
curl -X GET "http://localhost:8000/api/v1/partner/transactions?start_date=2025-01-01&end_date=2025-01-31" \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Детали транзакции
curl -X GET http://localhost:8000/api/v1/partner/transactions/1 \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### Биллинг

```bash
# Информация о биллинге
curl -X GET http://localhost:8000/api/v1/partner/billing \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# История биллинга
curl -X GET http://localhost:8000/api/v1/partner/billing/history \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Создать инвойс
curl -X POST http://localhost:8000/api/v1/partner/billing/invoices \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "description": "Monthly fee"
  }'
```

### Интеграции

```bash
# Получить API ключи
curl -X GET http://localhost:8000/api/v1/partner/integrations/keys \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Создать API ключ
curl -X POST http://localhost:8000/api/v1/partner/integrations/keys \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "expires_in_days": 365
  }'

# Удалить API ключ
curl -X DELETE http://localhost:8000/api/v1/partner/integrations/keys/1 \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Настройки интеграций
curl -X GET http://localhost:8000/api/v1/partner/integrations/settings \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Обновить настройки
curl -X PUT http://localhost:8000/api/v1/partner/integrations/settings \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"webhook_url":"https://example.com/webhook"}'
```

### Профиль

```bash
# Получить профиль
curl -X GET http://localhost:8000/api/v1/partner/me \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Обновить профиль
curl -X PUT http://localhost:8000/api/v1/partner/profile \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com",
    "phone": "+996555123456"
  }'

# Загрузить аватар
curl -X POST http://localhost:8000/api/v1/partner/profile/avatar \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -F "file=@avatar.jpg"
```

## ✅ Чеклист проверки

### Admin Panel
- [ ] POST /api/v1/admin/auth/login
- [ ] GET /api/v1/admin/me
- [ ] GET /api/v1/admin/dashboard/stats
- [ ] GET /api/v1/admin/users
- [ ] GET /api/v1/admin/users/:id
- [ ] PUT /api/v1/admin/users/:id
- [ ] DELETE /api/v1/admin/users/:id
- [ ] GET /api/v1/admin/partners
- [ ] POST /api/v1/admin/partners
- [ ] PUT /api/v1/admin/partners/:id
- [ ] DELETE /api/v1/admin/partners/:id
- [ ] GET /api/v1/admin/transactions
- [ ] GET /api/v1/admin/promotions
- [ ] POST /api/v1/admin/promotions
- [ ] PUT /api/v1/admin/promotions/:id
- [ ] DELETE /api/v1/admin/promotions/:id

### Partner Panel
- [ ] POST /api/v1/partner/auth/login
- [ ] GET /api/v1/partner/me
- [ ] GET /api/v1/partner/dashboard/stats
- [ ] GET /api/v1/partner/locations
- [ ] POST /api/v1/partner/locations
- [ ] PUT /api/v1/partner/locations/:id
- [ ] DELETE /api/v1/partner/locations/:id
- [ ] GET /api/v1/partner/promotions
- [ ] POST /api/v1/partner/promotions
- [ ] PUT /api/v1/partner/promotions/:id
- [ ] DELETE /api/v1/partner/promotions/:id
- [ ] GET /api/v1/partner/employees
- [ ] POST /api/v1/partner/employees
- [ ] PUT /api/v1/partner/employees/:id
- [ ] DELETE /api/v1/partner/employees/:id
- [ ] GET /api/v1/partner/transactions
- [ ] GET /api/v1/partner/billing
- [ ] GET /api/v1/partner/integrations/keys

## 🐛 Тестирование ошибок

### Проверка обработки ошибок

```bash
# Неверные учетные данные
curl -X POST http://localhost:8000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"wrong"}'
# Ожидается: 401 Unauthorized

# Запрос без токена
curl -X GET http://localhost:8000/api/v1/admin/users
# Ожидается: 401 Unauthorized

# Несуществующий ресурс
curl -X GET http://localhost:8000/api/v1/admin/users/99999 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Ожидается: 404 Not Found

# Неверный формат данных
curl -X POST http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'
# Ожидается: 422 Validation Error
```

## 📝 Примечания

- Все запросы требуют токен авторизации (кроме login)
- Токены истекают через время, указанное в `ACCESS_TOKEN_EXPIRE_MINUTES`
- При ошибке 401 нужно повторно авторизоваться
- Swagger UI доступен на `/docs` для интерактивного тестирования

## 🔧 Автоматизация тестирования

Для автоматического тестирования можно использовать:

1. **Postman** - импорт коллекции из Swagger
2. **Insomnia** - создание запросов
3. **Python requests** - написание скриптов
4. **Jest/Playwright** - E2E тестирование

---

**Последнее обновление:** 2025-01-XX

