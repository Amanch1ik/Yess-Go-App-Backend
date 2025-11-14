# 🚀 Production Guide

Руководство по развертыванию и настройке проекта для production окружения.

## 📋 Содержание

1. [Production конфигурация](#production-конфигурация)
2. [Оптимизация сборки](#оптимизация-сборки)
3. [CORS настройки](#cors-настройки)
4. [WebSocket интеграция](#websocket-интеграция)
5. [Экспорт данных](#экспорт-данных)
6. [Мониторинг и логирование](#мониторинг-и-логирование)

## ⚙️ Production конфигурация

### Backend (.env)

Создайте `.env` файл в `yess-backend/`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
SECRET_KEY=your-super-secret-key-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
APP_ENV=production
DEBUG=False

# CORS - добавьте ваши production домены
CORS_ORIGINS=["https://admin.yessloyalty.com","https://partner.yessloyalty.com"]

# Server
HOST=0.0.0.0
PORT=8000
```

### Admin Panel (.env.production)

Создайте `.env.production` в `admin-panel/`:

```env
VITE_API_URL=https://api.yessloyalty.com
VITE_ENV=production
VITE_API_TIMEOUT=30000
VITE_USE_MOCK_API=false

# Опционально
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Partner Panel (.env.production)

Создайте `.env.production` в `partner-panel/`:

```env
VITE_API_URL=https://api.yessloyalty.com
VITE_ENV=production
VITE_API_TIMEOUT=30000
VITE_USE_MOCK_API=false

# Опционально
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## 🔨 Оптимизация сборки

### Сборка для production

```bash
# Admin Panel
cd admin-panel
npm run build:prod

# Partner Panel
cd partner-panel
npm run build:prod
```

### Оптимизации включены:

- ✅ Минификация кода (Terser)
- ✅ Удаление console.log в production
- ✅ Code splitting (разделение на чанки)
- ✅ Source maps только в development
- ✅ CSS code splitting

### Результат сборки:

- `dist/` - оптимизированные файлы для production
- Размер бандла уменьшен за счет разделения на чанки
- Vendor библиотеки вынесены в отдельные файлы

## 🌐 CORS настройки

### Backend автоматически определяет окружение

В `yess-backend/app/core/config.py` добавлен метод `get_cors_origins()`:

- **Development**: Разрешает localhost порты
- **Production**: Использует origins из переменной окружения `CORS_ORIGINS`

### Настройка CORS для production:

```bash
# В .env бэкенда
APP_ENV=production
CORS_ORIGINS=["https://admin.yessloyalty.com","https://partner.yessloyalty.com"]
```

Или через JSON:

```bash
CORS_ORIGINS='["https://admin.yessloyalty.com","https://partner.yessloyalty.com"]'
```

## 🔌 WebSocket интеграция

### Использование WebSocket сервиса

#### Admin Panel

```typescript
import { wsService, connectWebSocket } from '@/services/websocket';
import { message } from 'antd';

// Подключение после авторизации
useEffect(() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';
  connectWebSocket(wsUrl);
  
  // Подписка на уведомления
  const unsubscribe = wsService.on('notification', (data) => {
    message.info(data.message);
  });
  
  // Подписка на обновления транзакций
  const unsubscribeTransactions = wsService.on('transaction', (data) => {
    // Обновить список транзакций
    queryClient.invalidateQueries(['transactions']);
  });
  
  return () => {
    unsubscribe();
    unsubscribeTransactions();
    wsService.disconnect();
  };
}, []);
```

#### Partner Panel

```typescript
import { wsService, connectWebSocket } from '@/services/websocket';

// Аналогично Admin Panel
useEffect(() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';
  connectWebSocket(wsUrl);
  
  // Подписка на события партнера
  wsService.on('promotion_update', (data) => {
    // Обновить промо-акции
  });
  
  wsService.on('location_update', (data) => {
    // Обновить локации
  });
  
  return () => {
    wsService.disconnect();
  };
}, []);
```

### Типы событий:

- `notification` - общие уведомления
- `transaction` - обновления транзакций
- `user_update` - обновления пользователей (Admin)
- `partner_update` - обновления партнеров (Admin)
- `promotion_update` - обновления промо-акций (Partner)
- `location_update` - обновления локаций (Partner)
- `system` - системные сообщения

## 📊 Экспорт данных

### Использование exportUtils

```typescript
import { exportToCSV, exportToExcel, exportToJSON } from '@/utils/exportUtils';

// Экспорт в CSV
exportToCSV(transactions, columns, 'transactions');

// Экспорт в Excel
exportToExcel(transactions, columns, 'transactions');

// Экспорт в JSON
exportToJSON(transactions, 'transactions');
```

### Поддержка форматов:

- ✅ **CSV** - с правильным экранированием и BOM для кириллицы
- ✅ **Excel (.xls)** - CSV формат совместимый с Excel
- ✅ **JSON** - структурированный формат

### Для полноценного .xlsx:

```bash
npm install xlsx
```

Затем используйте библиотеку xlsx для создания настоящих Excel файлов.

## 📈 Мониторинг и логирование

### Обработка ошибок

Улучшенная обработка ошибок в API сервисах:

- ✅ Детальное логирование ошибок
- ✅ Обработка сетевых ошибок
- ✅ Автоматический редирект при 401
- ✅ Информативные сообщения для пользователя

### Типы ошибок:

- `401` - Неавторизован (автоматический редирект на логин)
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `422` - Ошибка валидации
- `500` - Ошибка сервера
- `503` - Сервис недоступен

### Интеграция с Sentry (опционально)

```typescript
// В main.tsx или App.tsx
if (import.meta.env.VITE_SENTRY_DSN) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENV,
    });
  });
}
```

## 🧪 Тестирование

### Проверка endpoints

Используйте `TEST_ENDPOINTS.md` для проверки всех API endpoints:

```bash
# Проверка здоровья API
curl http://localhost:8000/health

# Тест авторизации
curl -X POST http://localhost:8000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🚀 Деплой

### 1. Сборка фронтенда

```bash
# Admin Panel
cd admin-panel
npm install
npm run build:prod

# Partner Panel
cd partner-panel
npm install
npm run build:prod
```

### 2. Настройка Nginx

```nginx
# Admin Panel
server {
    listen 80;
    server_name admin.yessloyalty.com;
    
    root /var/www/admin-panel/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Partner Panel
server {
    listen 80;
    server_name partner.yessloyalty.com;
    
    root /var/www/partner-panel/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Запуск Backend

```bash
cd yess-backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Или с Gunicorn:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## ✅ Чеклист перед production

- [ ] Все `.env` файлы настроены
- [ ] CORS origins указаны для production доменов
- [ ] Секретные ключи сгенерированы и безопасны
- [ ] База данных настроена и миграции применены
- [ ] SSL сертификаты установлены
- [ ] Мониторинг настроен (Sentry, Analytics)
- [ ] Резервное копирование БД настроено
- [ ] Логирование настроено
- [ ] Rate limiting включен
- [ ] Все endpoints протестированы

---

**Последнее обновление:** 2025-01-XX

