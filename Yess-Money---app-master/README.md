# YESS Money - API Документация для фронтенда

## Быстрый старт

### Запуск бэкенда
```bash
cd yess-backend
pip install -r requirements.prod.txt
cp env.example .env
# Настроить .env (DATABASE_URL, REDIS_URL)
alembic upgrade head
uvicorn app.main:app --reload
```

**API будет доступен:** `http://localhost:8000`  
**Swagger UI:** `http://localhost:8000/docs`

---

## Base URL

- Development: `http://localhost:8000`
- Production: `https://api.yessloyalty.com`

---

## Аутентификация

Все защищенные эндпоинты требуют JWT токен:
```
Authorization: Bearer {access_token}
```

### Регистрация
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "phone": "+996700000001",
  "password": "password123",
  "name": "Иван Иванов",
  "email": "ivan@example.com"
}
```

### Вход
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phone": "+996700000001",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "phone": "+996700000001",
    "name": "Иван Иванов"
  }
}
```

---

## API Endpoints

### Пользователи

#### GET /api/v1/users/me
Получить профиль текущего пользователя

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "id": 1,
  "phone": "+996700000001",
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "balance": 1500.00,
  "referral_code": "ABC123"
}
```

#### PUT /api/v1/users/me
Обновить профиль

**Headers:** `Authorization: Bearer {token}`  
**Body:**
```json
{
  "name": "Иван Петров",
  "email": "newemail@example.com"
}
```

---

### Партнеры

#### GET /api/v1/partners
Список партнеров

**Query Parameters:**
- `category` (optional) - Фильтр по категории
- `city_id` (optional) - Фильтр по городу
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Кафе Центральное",
      "category": "restaurant",
      "cashback_rate": 5.0,
      "logo_url": "https://...",
      "latitude": 42.8746,
      "longitude": 74.5698,
      "is_verified": true
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### GET /api/v1/partners/{id}
Детали партнера

**Response:**
```json
{
  "id": 1,
  "name": "Кафе Центральное",
  "description": "Уютное кафе в центре города",
  "category": "restaurant",
  "cashback_rate": 5.0,
  "phone": "+996700123456",
  "address": "ул. Чуй, 123",
  "latitude": 42.8746,
  "longitude": 74.5698,
  "working_hours": {
    "mon": "09:00-22:00",
    "tue": "09:00-22:00"
  }
}
```

#### GET /api/v1/partners/nearby
Партнеры рядом

**Query Parameters:**
- `latitude` (required)
- `longitude` (required)
- `radius` (optional, default: 5) - Радиус в км
- `category` (optional)

**Example:**
```
GET /api/v1/partners/nearby?latitude=42.8746&longitude=74.5698&radius=5
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Кафе Центральное",
      "distance": 0.5,
      "cashback_rate": 5.0
    }
  ],
  "total": 15
}
```

---

### Транзакции

#### GET /api/v1/transactions
История транзакций

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional) - topup, discount, bonus, refund
- `status` (optional) - pending, completed, failed
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "type": "topup",
      "amount": 1000.00,
      "status": "completed",
      "balance_before": 500.00,
      "balance_after": 1500.00,
      "created_at": "2024-01-01T12:00:00"
    }
  ],
  "total": 50
}
```

#### POST /api/v1/transactions
Создать транзакцию (пополнение)

**Headers:** `Authorization: Bearer {token}`  
**Body:**
```json
{
  "type": "topup",
  "amount": 1000.00,
  "payment_method": "optima"
}
```

**Response:**
```json
{
  "id": 1,
  "type": "topup",
  "amount": 1000.00,
  "status": "pending",
  "payment_url": "https://payment-gateway.com/pay/...",
  "qr_code": "data:image/png;base64,..."
}
```

---

### Кошелек

#### GET /api/v1/wallet
Информация о кошельке

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "balance": 1500.00,
  "currency": "KGS",
  "total_earned": 5000.00,
  "total_spent": 3500.00
}
```

#### GET /api/v1/wallet/balance
Текущий баланс

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "balance": 1500.00,
  "currency": "KGS"
}
```

#### POST /api/v1/wallet/topup
Пополнить баланс

**Headers:** `Authorization: Bearer {token}`  
**Body:**
```json
{
  "amount": 1000.00,
  "payment_method": "optima"
}
```

---

### Заказы

#### POST /api/v1/orders
Создать заказ

**Headers:** `Authorization: Bearer {token}`  
**Body:**
```json
{
  "partner_id": 1,
  "order_total": 500.00,
  "discount": 50.00
}
```

**Response:**
```json
{
  "id": 1,
  "partner_id": 1,
  "order_total": 500.00,
  "discount": 50.00,
  "final_amount": 450.00,
  "cashback": 22.50,
  "status": "completed"
}
```

#### GET /api/v1/orders
Список заказов

**Headers:** `Authorization: Bearer {token}`

---

### Уведомления

#### GET /api/v1/notifications
Список уведомлений

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `unread_only` (optional, default: false)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Новое предложение",
      "message": "Получите 10% кэшбэк",
      "type": "promotion",
      "is_read": false,
      "created_at": "2024-01-01T12:00:00"
    }
  ],
  "unread_count": 5
}
```

#### PUT /api/v1/notifications/{id}/read
Отметить как прочитанное

---

## Обработка ошибок

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Amount must be positive",
  "details": {"amount": -10}
}
```

### 401 Unauthorized
```json
{
  "error": "UnauthorizedError",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "NotFoundError",
  "message": "Partner not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Слишком много запросов",
  "retry_after": 60
}
```

### 503 Service Unavailable
```json
{
  "error": "CircuitBreakerOpenError",
  "message": "Circuit breaker is OPEN. Service unavailable. Retry after 45 seconds."
}
```

---

## Пример использования (TypeScript)

```typescript
const API_URL = 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  async login(phone: string, password: string) {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    this.token = data.access_token;
    return data;
  }

  async getPartners() {
    const response = await fetch(`${API_URL}/api/v1/partners`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch partners');
    return response.json();
  }

  async getNearbyPartners(lat: number, lon: number, radius = 5) {
    const url = `${API_URL}/api/v1/partners/nearby?latitude=${lat}&longitude=${lon}&radius=${radius}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Failed to fetch nearby partners');
    return response.json();
  }

  async getUserProfile() {
    const response = await fetch(`${API_URL}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }
}

// Использование
const api = new ApiClient();
await api.login('+996700000001', 'password123');
const partners = await api.getPartners();
```

---

## Health Checks

```bash
GET /health          # Общая проверка
GET /health/db       # База данных
GET /health/cache    # Redis
```

---

## Заголовки ответов

Все ответы содержат:
- `X-Process-Time` - время выполнения запроса (секунды)
- `X-Request-ID` - уникальный ID запроса

---

## Rate Limiting

По умолчанию: **100 запросов в минуту** на IP адрес.

При превышении возвращается **429** с заголовком `Retry-After`.

---

**Полная интерактивная документация:** `http://localhost:8000/docs`
