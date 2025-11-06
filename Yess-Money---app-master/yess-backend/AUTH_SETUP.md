# Система аутентификации - Исправлена ✅

## Обзор изменений

Система аутентификации была полностью переработана для корректной работы с JWT токенами.

### Что было сделано:

1. ✅ **Создан `app/services/dependencies.py`**
   - Функция `get_current_user` для декодирования JWT из `Authorization: Bearer <token>`
   - Валидация токенов с использованием `SECRET_KEY` и `ALGORITHM` из config
   - Проверка активности пользователя

2. ✅ **Обновлен `app/services/auth_service.py`**
   - Функция `register_user` - регистрация с полями `phone_number`, `password`, `first_name`, `last_name`
   - Функция `authenticate_user` - вход по номеру телефона
   - Функция `create_access_token` - генерация JWT токенов

3. ✅ **Обновлена модель `User` (`app/models/user.py`)**
   - Добавлены поля `first_name` и `last_name`
   - Поле `name` сделано nullable для обратной совместимости

4. ✅ **Обновлены схемы (`app/schemas/user.py`)**
   - `UserCreate` - принимает `phone_number`, `password`, `first_name`, `last_name`
   - `UserResponse` - возвращает данные пользователя
   - `TokenResponse` - возвращает только `access_token` и `token_type`

5. ✅ **Обновлен `app/api/v1/auth.py`**
   - Эндпоинт `/auth/register` - регистрация пользователя
   - Эндпоинт `/auth/login` - вход через OAuth2PasswordRequestForm
   - Эндпоинт `/auth/me` - получение данных текущего пользователя по токену

6. ✅ **Исправлен `app/api/v1/api_router.py`**
   - Убран дублирующий prefix для auth router

7. ✅ **Создана миграция базы данных**
   - Добавлены поля `first_name` и `last_name` в таблицу users

## Структура API

### 1. Регистрация пользователя
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "phone_number": "+996555123456",
  "password": "secure_password123",
  "first_name": "Иван",
  "last_name": "Иванов"
}
```

**Ответ:**
```json
{
  "id": 1,
  "phone_number": "+996555123456",
  "first_name": "Иван",
  "last_name": "Иванов",
  "email": null,
  "city_id": null,
  "referral_code": null,
  "created_at": "2025-11-05T12:00:00"
}
```

### 2. Вход пользователя
```
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=+996555123456
password=secure_password123
```

**Ответ:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Получение данных текущего пользователя
```
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

**Ответ:**
```json
{
  "id": 1,
  "phone_number": "+996555123456",
  "first_name": "Иван",
  "last_name": "Иванов",
  "email": null,
  "city_id": null,
  "referral_code": null,
  "created_at": "2025-11-05T12:00:00"
}
```

## Запуск и тестирование

### 1. Применить миграцию базы данных
```bash
cd E:\Yess-Go-App-Backend\Yess-Money---app-master\yess-backend
alembic upgrade head
```

### 2. Запустить сервер
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Открыть документацию API
Перейдите в браузере: http://localhost:8000/docs

### 4. Тестирование через Swagger UI
1. Перейдите в `/docs`
2. Откройте `POST /api/v1/auth/register` и зарегистрируйте пользователя
3. Откройте `POST /api/v1/auth/login` и войдите (получите токен)
4. Нажмите кнопку "Authorize" в правом верхнем углу
5. Введите токен в формате: `Bearer <ваш_токен>`
6. Теперь можете тестировать защищенный эндпоинт `GET /api/v1/auth/me`

## Технические детали

### JWT токены
- **Алгоритм:** HS256
- **Срок действия:** 30 минут (настраивается в `ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Secret key:** Берется из переменной окружения `SECRET_KEY`

### Безопасность
- Пароли хешируются с помощью bcrypt
- Токены проверяются при каждом запросе к защищенным эндпоинтам
- Неактивные пользователи (`is_active=False`) не могут получить доступ

### Поля пользователя в БД
- `id` - Primary key
- `phone` - Номер телефона (используется для входа)
- `password_hash` - Хешированный пароль
- `first_name` - Имя
- `last_name` - Фамилия
- `name` - Полное имя (заполняется автоматически как "first_name last_name")
- `email` - Email (опционально)
- `is_active` - Активность пользователя
- `created_at` - Дата создания

## Устранение проблем

### Ошибка "SECRET_KEY не установлен"
Убедитесь, что в файле `.env` установлена переменная:
```
SECRET_KEY=your_super_secret_key_here_change_in_production
```

### Ошибка при миграции
Если миграция не применяется, проверьте:
1. Подключение к базе данных
2. Правильность `DATABASE_URL` в `.env`
3. Запустите `alembic upgrade head` с флагом `-v` для подробного вывода

### Токен не проходит валидацию
1. Проверьте, что токен не истек (срок - 30 минут)
2. Убедитесь, что токен отправляется в формате `Bearer <token>`
3. Проверьте, что `SECRET_KEY` не изменился с момента создания токена

## Дальнейшие улучшения

- [ ] Добавить refresh tokens
- [ ] Реализовать двухфакторную аутентификацию (SMS)
- [ ] Добавить email верификацию
- [ ] Реализовать восстановление пароля
- [ ] Добавить rate limiting для эндпоинтов аутентификации

