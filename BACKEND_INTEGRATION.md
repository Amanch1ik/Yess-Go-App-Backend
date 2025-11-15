# 🔗 Интеграция с бэкендом Yess-Go-App-Backend

## 📋 Обзор

Обе панели (Admin Panel и Partner Panel) настроены для работы с бэкендом из репозитория [Yess-Go-App-Backend](https://github.com/Amanch1ik/Yess-Go-App-Backend.git).

## ⚙️ Конфигурация

### Переменные окружения

Создайте файлы `.env` в корне каждой панели:

#### Admin Panel (`admin-panel/.env`)
```env
# API Configuration
# Backend URL from Yess-Go-App-Backend repository
VITE_API_URL=http://localhost:8000

# Environment
VITE_ENV=development
```

#### Partner Panel (`partner-panel/.env`)
```env
# API Configuration
# Backend URL from Yess-Go-App-Backend repository
VITE_API_URL=http://localhost:8000

# Environment
VITE_ENV=development
```

### Production настройки

Для production измените `VITE_API_URL` на URL вашего production сервера:
```env
VITE_API_URL=https://api.yessloyalty.com
```

## 🔌 API Endpoints

### Admin Panel Endpoints

Все запросы идут на базовый URL: `${VITE_API_URL}/api/v1/admin`

- **Аутентификация:**
  - `POST /api/v1/admin/auth/login` - Вход администратора
  - `GET /api/v1/admin/me` - Текущий администратор

- **Dashboard:**
  - `GET /api/v1/admin/dashboard/stats` - Статистика

- **Пользователи:**
  - `GET /api/v1/admin/users` - Список пользователей
  - `GET /api/v1/admin/users/:id` - Детали пользователя
  - `PUT /api/v1/admin/users/:id` - Обновление пользователя
  - `DELETE /api/v1/admin/users/:id` - Удаление пользователя
  - `POST /api/v1/admin/users/:id/activate` - Активация
  - `POST /api/v1/admin/users/:id/deactivate` - Деактивация

- **Партнеры:**
  - `GET /api/v1/admin/partners` - Список партнеров
  - `GET /api/v1/admin/partners/:id` - Детали партнера
  - `POST /api/v1/admin/partners` - Создание партнера
  - `PUT /api/v1/admin/partners/:id` - Обновление партнера
  - `DELETE /api/v1/admin/partners/:id` - Удаление партнера
  - `POST /api/v1/admin/partners/:id/approve` - Одобрение партнера
  - `POST /api/v1/admin/partners/:id/reject` - Отклонение партнера

- **Транзакции:**
  - `GET /api/v1/admin/transactions` - Список транзакций
  - `GET /api/v1/admin/transactions/:id` - Детали транзакции

- **Акции:**
  - `GET /api/v1/admin/promotions` - Список акций
  - `GET /api/v1/admin/promotions/:id` - Детали акции
  - `POST /api/v1/admin/promotions` - Создание акции
  - `PUT /api/v1/admin/promotions/:id` - Обновление акции
  - `DELETE /api/v1/admin/promotions/:id` - Удаление акции

### Partner Panel Endpoints

Все запросы идут на базовый URL: `${VITE_API_URL}/api/v1/partner`

- **Аутентификация:**
  - `POST /api/v1/partner/auth/login` - Вход партнера
  - `GET /api/v1/partner/me` - Текущий партнер

- **Dashboard:**
  - `GET /api/v1/partner/dashboard/stats` - Статистика партнера

- **Локации:**
  - `GET /api/v1/partner/locations` - Список локаций
  - `POST /api/v1/partner/locations` - Создание локации
  - `PUT /api/v1/partner/locations/:id` - Обновление локации
  - `DELETE /api/v1/partner/locations/:id` - Удаление локации

- **Акции:**
  - `GET /api/v1/partner/promotions` - Список акций
  - `POST /api/v1/partner/promotions` - Создание акции
  - `PUT /api/v1/partner/promotions/:id` - Обновление акции
  - `DELETE /api/v1/partner/promotions/:id` - Удаление акции

- **Транзакции:**
  - `GET /api/v1/partner/transactions` - Список транзакций
  - `GET /api/v1/partner/transactions/:id` - Детали транзакции

- **Сотрудники:**
  - `GET /api/v1/partner/employees` - Список сотрудников
  - `POST /api/v1/partner/employees` - Добавление сотрудника
  - `PUT /api/v1/partner/employees/:id` - Обновление сотрудника
  - `DELETE /api/v1/partner/employees/:id` - Удаление сотрудника

- **Биллинг:**
  - `GET /api/v1/partner/billing` - Информация о биллинге
  - `GET /api/v1/partner/billing/history` - История платежей
  - `POST /api/v1/partner/billing/invoices` - Создание инвойса

- **Интеграции:**
  - `GET /api/v1/partner/integrations/keys` - API ключи
  - `POST /api/v1/partner/integrations/keys` - Создание API ключа
  - `DELETE /api/v1/partner/integrations/keys/:id` - Удаление API ключа
  - `GET /api/v1/partner/integrations/settings` - Настройки интеграций
  - `PUT /api/v1/partner/integrations/settings` - Обновление настроек

- **Профиль:**
  - `PUT /api/v1/partner/profile` - Обновление профиля
  - `POST /api/v1/partner/profile/avatar` - Загрузка аватара

## 🔐 Аутентификация

Обе панели используют JWT токены для аутентификации:

1. **Вход:** После успешного входа токен сохраняется в `localStorage`
   - Admin Panel: `admin_token`
   - Partner Panel: `partner_token`

2. **Автоматическое добавление токена:** Все запросы автоматически включают заголовок:
   ```
   Authorization: Bearer <token>
   ```

3. **Обработка ошибок:** При получении 401 (Unauthorized) пользователь автоматически перенаправляется на страницу входа.

## 🚀 Запуск

### 1. Запустите бэкенд

Убедитесь, что бэкенд из репозитория Yess-Go-App-Backend запущен и доступен на `http://localhost:8000`

### 2. Создайте .env файлы

Создайте `.env` файлы в каждой панели (см. раздел "Конфигурация" выше)

### 3. Запустите панели

**Admin Panel:**
```bash
cd admin-panel
npm install
npm run dev
```
Панель будет доступна на `http://localhost:3001`

**Partner Panel:**
```bash
cd partner-panel
npm install
npm run dev
```
Панель будет доступна на `http://localhost:3002`

## 🔧 Vite Proxy

Обе панели используют Vite proxy для разработки. Это позволяет:
- Избежать проблем с CORS
- Автоматически проксировать запросы к бэкенду

Конфигурация в `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## 📝 Примечания

- Все API запросы используют базовый URL из переменной окружения `VITE_API_URL`
- Если переменная не установлена, используется значение по умолчанию: `http://localhost:8000`
- Таймаут для запросов: 10 секунд (Partner Panel)
- Все запросы используют JSON формат (`Content-Type: application/json`)

## 🐛 Отладка

Если возникают проблемы с подключением:

1. **Проверьте, что бэкенд запущен:**
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

2. **Проверьте переменные окружения:**
   - Убедитесь, что `.env` файлы созданы
   - Проверьте значение `VITE_API_URL`

3. **Проверьте консоль браузера:**
   - Откройте DevTools (F12)
   - Проверьте вкладку Network для просмотра запросов
   - Проверьте вкладку Console для ошибок

4. **Проверьте токен:**
   - В DevTools → Application → Local Storage
   - Убедитесь, что токен сохранен (`admin_token` или `partner_token`)

## 🔄 Миграция на Production

При переходе на production:

1. Обновите `VITE_API_URL` в `.env` файлах
2. Убедитесь, что CORS настроен на бэкенде
3. Проверьте, что SSL сертификаты настроены
4. Обновите настройки безопасности (HTTPS, secure cookies и т.д.)

