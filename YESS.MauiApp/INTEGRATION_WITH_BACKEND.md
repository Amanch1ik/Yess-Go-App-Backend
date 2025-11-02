# Интеграция YESS.MauiApp с Backend API

## 📋 Обзор

Это руководство по подключению мобильного приложения **YESS.MauiApp** к существующему backend API на FastAPI.

## 🔗 Конфигурация Backend URL

### Локальная разработка

#### Android Emulator
```csharp
// В MauiProgram.cs
builder.Services.AddYessServices("http://10.0.2.2:8000");
```

**Почему 10.0.2.2?** 
- Android эмулятор использует специальный IP `10.0.2.2` для доступа к `localhost` хост-машины
- `localhost` внутри эмулятора указывает на сам эмулятор, а не на хост

#### iOS Simulator
```csharp
// В MauiProgram.cs
builder.Services.AddYessServices("http://localhost:8000");
```

#### Физическое устройство (в одной сети)
```csharp
// Узнайте IP вашего компьютера в локальной сети (например, 192.168.1.100)
builder.Services.AddYessServices("http://192.168.1.100:8000");
```

### Production
```csharp
builder.Services.AddYessServices("https://api.yess.kg");
```

## 🚀 Запуск Backend

### Вариант 1: Локально (SQLite)

```bash
# Перейти в папку бэкенда
cd yess-backend

# Активировать виртуальное окружение
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Вариант 2: Docker

```bash
cd yess-backend
docker-compose up -d
```

## 📡 API Endpoints

### Авторизация

#### POST /api/v1/auth/register
Регистрация нового пользователя

**Request:**
```json
{
  "name": "Иван Иванов",
  "phone": "+996700123456",
  "password": "SecurePass123",
  "email": "ivan@example.com",
  "city_id": 1,
  "referral_code": "ABC123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user_id": 1
}
```

#### POST /api/v1/auth/login
Вход в систему

**Request:**
```json
{
  "phone": "+996700123456",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user_id": 1
}
```

#### POST /api/v1/auth/refresh
Обновление access token

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user_id": 1
}
```

#### GET /api/v1/auth/me
Получить текущего пользователя

**Query Params:** `user_id=1`

**Response:**
```json
{
  "id": 1,
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+996700123456",
  "city_id": 1,
  "referral_code": "XYZ789",
  "created_at": "2025-10-14T10:00:00"
}
```

---

### Кошелёк

#### GET /api/v1/wallet/
Получить баланс кошелька

**Query Params:** `userId=1`

**Response:**
```json
{
  "balance": 500.00,
  "last_updated": "2025-10-14T12:30:00"
}
```

#### POST /api/v1/wallet/topup
Инициировать пополнение баланса

**Request:**
```json
{
  "user_id": 1,
  "amount": 1000.00
}
```

**Response:**
```json
{
  "transaction_id": 123,
  "payment_url": "https://pay.yess.kg/tx/123",
  "qr_code_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

**Примечание:** После оплаты баланс автоматически увеличится на `amount * 2` (x2 бонус)

#### GET /api/v1/wallet/history
История транзакций

**Query Params:** `user_id=1`

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "type": "topup",
    "amount": 1000.00,
    "balance_before": 0.00,
    "balance_after": 2000.00,
    "status": "completed",
    "created_at": "2025-10-14T10:00:00",
    "completed_at": "2025-10-14T10:05:00"
  }
]
```

---

### Партнёры

#### GET /api/v1/partner/list
Список партнёров

**Query Params:**
- `category` (optional): фильтр по категории
- `active` (default: true): только активные партнёры

**Response:**
```json
[
  {
    "id": 1,
    "name": "Ресторан XYZ",
    "category": "food",
    "max_discount_percent": 10,
    "logo_url": "/static/logos/restaurant-xyz.png",
    "description": "Лучший ресторан в городе",
    "is_active": true
  }
]
```

#### GET /api/v1/partner/{partner_id}
Детали партнёра

**Response:**
```json
{
  "id": 1,
  "name": "Ресторан XYZ",
  "category": "food",
  "max_discount_percent": 10,
  "logo_url": "/static/logos/restaurant-xyz.png",
  "description": "Лучший ресторан в городе",
  "is_active": true
}
```

#### GET /api/v1/partner/locations
Локации партнёров для карты

**Query Params:**
- `partner_id` (optional): фильтр по партнёру
- `latitude` (optional): широта для поиска по радиусу
- `longitude` (optional): долгота
- `radius` (default: 10.0): радиус в км

**Response:**
```json
[
  {
    "id": 1,
    "partner_id": 1,
    "partner_name": "Ресторан XYZ",
    "address": "ул. Чуй 123, Бишкек",
    "latitude": 42.8746,
    "longitude": 74.5698,
    "phone_number": "+996312123456",
    "working_hours": "09:00-22:00",
    "max_discount_percent": 10
  }
]
```

#### GET /api/v1/partner/categories
Категории партнёров

**Response:**
```json
[
  {"name": "food"},
  {"name": "cafe"},
  {"name": "beauty"}
]
```

---

### Заказы

#### POST /api/v1/order/calculate
Рассчитать скидку (предпросмотр)

**Request:**
```json
{
  "user_id": 1,
  "partner_id": 1,
  "order_total": 1000.00
}
```

**Response:**
```json
{
  "max_discount": 100.00,
  "user_balance": 500.00,
  "actual_discount": 100.00,
  "final_amount": 900.00
}
```

#### POST /api/v1/order/confirm
Подтвердить заказ и списать бонусы

**Request:**
```json
{
  "user_id": 1,
  "partner_id": 1,
  "order_total": 1000.00,
  "discount": 100.00,
  "idempotency_key": "unique-key-12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order confirmed successfully",
  "order_id": 45,
  "new_balance": 400.00,
  "discount": 100.00,
  "final_amount": 900.00
}
```

#### GET /api/v1/order/history
История заказов

**Query Params:** `user_id=1`

**Response:**
```json
[
  {
    "id": 45,
    "user_id": 1,
    "partner_id": 1,
    "order_total": 1000.00,
    "discount": 100.00,
    "final_amount": 900.00,
    "idempotency_key": "unique-key-12345",
    "created_at": "2025-10-14T12:00:00",
    "partner_name": "Ресторан XYZ"
  }
]
```

---

### Города

#### GET /api/v1/city/list
Список городов

**Response:**
```json
[
  {"id": 1, "name": "Бишкек"},
  {"id": 2, "name": "Ош"}
]
```

---

## 🔐 Аутентификация

### JWT Token Flow

1. **Регистрация/Вход** → Получение `access_token` и `refresh_token`
2. **Сохранение токенов** в `SecureStorage`
3. **Использование access_token** в заголовке `Authorization: Bearer <token>`
4. **При истечении access_token** → Использование `refresh_token` для получения нового
5. **При ошибке 401** → Автоматический refresh или logout

### Реализация в MAUI

```csharp
// ApiClientService автоматически:
// 1. Добавляет Bearer token в заголовки
// 2. Обрабатывает 401 ошибки
// 3. Автоматически обновляет токены
// 4. Сохраняет токены в SecureStorage
```

## 🧪 Тестирование

### 1. Проверка доступности API

```bash
curl http://localhost:8000/health
# Ответ: {"status": "healthy"}
```

### 2. Swagger UI

Откройте в браузере: `http://localhost:8000/docs`

### 3. Тестовые данные

После запуска бэкенда выполните:

```bash
cd yess-backend
python seed_data.py
```

Это создаст:
- Тестовые города
- Партнёров с локациями
- Тестового пользователя: `+996700000001` / `password123`

### 4. Тест из MAUI приложения

```csharp
// В MainPageViewModel.cs
public async Task TestConnection()
{
    try
    {
        // Попытка входа
        var user = await _authService.LoginAsync(new LoginRequest
        {
            Phone = "+996700000001",
            Password = "password123"
        });
        
        Console.WriteLine($"✅ Успешно: {user.Name}");
        
        // Получить баланс
        var wallet = await _walletService.GetWalletAsync(user.Id);
        Console.WriteLine($"💰 Баланс: {wallet.Balance} YessCoin");
        
        // Получить партнёров
        var partners = await _partnerService.GetPartnersAsync();
        Console.WriteLine($"🏪 Партнёров: {partners.Count}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Ошибка: {ex.Message}");
    }
}
```

## 🐛 Устранение проблем

### Проблема: "Connection refused"

**Android Emulator:**
- Используйте `http://10.0.2.2:8000` вместо `localhost:8000`
- Убедитесь что бэкенд запущен с `--host 0.0.0.0`

**iOS Simulator:**
- Используйте `http://localhost:8000`

**Физическое устройство:**
- Убедитесь что устройство и компьютер в одной Wi-Fi сети
- Используйте IP компьютера (например, `http://192.168.1.100:8000`)
- Проверьте firewall

### Проблема: "CORS error"

Убедитесь что в `yess-backend/app/core/config.py` добавлены нужные origins:

```python
CORS_ORIGINS: List[str] = [
    "http://10.0.2.2:8000",  # Android emulator
    "http://localhost:8000",  # iOS simulator
]
```

### Проблема: "401 Unauthorized"

- Проверьте что токены сохранены в `SecureStorage`
- Убедитесь что `JWT_SECRET_KEY` в бэкенде не изменился
- Проверьте срок действия токенов в конфиге

## 📦 Полный пример .env для бэкенда

```env
# Database
DATABASE_URL=sqlite:///./yess.db

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS
CORS_ORIGINS=["http://localhost:3000","http://10.0.2.2:8000","http://localhost:8000"]

# Business
TOPUP_MULTIPLIER=2.0
DEFAULT_REFERRAL_BONUS=50.0
```

## 🎯 Checklist интеграции

- [ ] Backend запущен на `http://0.0.0.0:8000`
- [ ] В MauiProgram.cs указан правильный URL (10.0.2.2 для Android)
- [ ] CORS настроен в бэкенде
- [ ] Тестовые данные загружены (`seed_data.py`)
- [ ] Swagger UI доступен (`http://localhost:8000/docs`)
- [ ] Успешный логин с тестовым пользователем
- [ ] Получение баланса работает
- [ ] Список партнёров загружается
- [ ] Расчёт скидки работает корректно
- [ ] Подтверждение заказа списывает бонусы

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи бэкенда
2. Проверьте логи MAUI приложения (Debug mode)
3. Используйте Swagger UI для тестирования эндпоинтов
4. Проверьте сетевое подключение

---

**Документация обновлена:** 14.10.2025

