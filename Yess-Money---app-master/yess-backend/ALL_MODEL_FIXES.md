# Исправление всех проблем с моделями SQLAlchemy

## Проблема

При попытке регистрации из мобильного приложения возникали последовательные ошибки инициализации mapper'ов SQLAlchemy.

---

## Исправление #1: Transaction ↔ Partner

### Ошибка
```
Could not determine join condition between parent/child tables on relationship Partner.transactions - 
there are no foreign keys linking these tables.
```

### Причина
- В `Partner` был определен: `transactions = relationship("Transaction", back_populates="partner")`
- В `Transaction` отсутствовали: `partner_id` и обратный relationship

### Решение
Добавлено в `app/models/transaction.py`:

```python
# Foreign key
partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True, index=True)

# Дополнительные поля для QR-платежей
yescoin_used = Column(Numeric(10, 2), default=0.0)
yescoin_earned = Column(Numeric(10, 2), default=0.0)
description = Column(Text)

# Relationship
partner = relationship("Partner", back_populates="transactions")

# Индекс
Index('idx_transaction_partner', 'partner_id', 'created_at')
```

---

## Исправление #2: Transaction ↔ Refund

### Ошибка
```
Mapper 'mapped class Transaction->transactions' has no property 'refunds'.
Original exception from mapper 'Refund->refunds'
```

### Причина
- В `Refund` был определен: `transaction = relationship("Transaction", back_populates="refunds")`
- В `Transaction` отсутствовал: обратный relationship

### Решение
Добавлено в `app/models/transaction.py`:

```python
# Relationship
refunds = relationship("Refund", back_populates="transaction")
```

---

## Финальная структура модели Transaction

```python
class Transaction(Base):
    __tablename__ = "transactions"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True, index=True)  # ✅ ДОБАВЛЕНО
    
    # Transaction details
    type = Column(String(50), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    balance_before = Column(Numeric(10, 2))
    balance_after = Column(Numeric(10, 2))
    status = Column(String(50), nullable=False, index=True)
    
    # Payment URLs and QR data
    payment_url = Column(String(500))
    qr_code_data = Column(Text)
    
    # YesCoin tracking ✅ ДОБАВЛЕНО
    yescoin_used = Column(Numeric(10, 2), default=0.0)
    yescoin_earned = Column(Numeric(10, 2), default=0.0)
    description = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime)
    
    __table_args__ = (
        CheckConstraint('amount > 0', name='check_positive_amount'),
        Index('idx_transaction_user_status', 'user_id', 'status', 'created_at'),
        Index('idx_transaction_type_status', 'type', 'status', 'created_at'),
        Index('idx_transaction_date_range', 'created_at', 'status'),
        Index('idx_transaction_partner', 'partner_id', 'created_at'),  # ✅ ДОБАВЛЕНО
    )
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    partner = relationship("Partner", back_populates="transactions")  # ✅ ДОБАВЛЕНО
    refunds = relationship("Refund", back_populates="transaction")    # ✅ ДОБАВЛЕНО
```

---

## Связанные модели

### Partner (`app/models/partner.py`)
```python
class Partner(Base):
    __tablename__ = "partners"
    # ... fields ...
    
    # Relationships
    transactions = relationship("Transaction", back_populates="partner")  # ✅ УЖЕ БЫЛО
```

### Refund (`app/models/payment.py`)
```python
class Refund(Base):
    __tablename__ = "refunds"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # ... other fields ...
    
    # Relationships
    transaction = relationship("Transaction", back_populates="refunds")  # ✅ УЖЕ БЫЛО
    user = relationship("User")
```

---

## Команды для применения изменений

### 1. Пересоздание базы данных (Development)

```bash
# Перейти в директорию проекта
cd E:\YessProject\Yess-Go-App-Backend\Yess-Money---app-master

# Остановить и удалить контейнеры
docker compose down

# Пересобрать и запустить
docker compose up --build -d

# Проверить логи
docker logs yess-money---app-master-backend-1 --tail=50

# Проверить API
curl http://localhost:8000/
```

### 2. Миграция базы данных (Production)

```bash
# Войти в контейнер backend
docker exec -it yess-money---app-master-backend-1 bash

# Создать миграцию
alembic revision --autogenerate -m "Add partner_id and refunds to transactions"

# Применить миграцию
alembic upgrade head

# Выйти из контейнера
exit
```

---

## Проверка исправлений

### 1. Проверить структуру таблицы

```bash
# Подключиться к PostgreSQL
docker exec -it yess-money---app-master-postgres-1 psql -U yess_user -d yess_db

# Посмотреть структуру таблицы transactions
\d transactions

# Проверить внешние ключи
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'transactions'::regclass AND contype = 'f';

# Выйти
\q
```

### 2. Тестовый запрос регистрации

Через мобильное приложение или curl:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+996504876087",
    "password": "123456",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 3. Проверить Swagger UI

Откройте в браузере: http://localhost:8000/docs

---

## Что было добавлено

| Поле/Связь | Тип | Описание | Nullable |
|------------|-----|----------|----------|
| `partner_id` | Integer, FK | ID партнёра | Yes |
| `yescoin_used` | Numeric(10,2) | YesCoin потрачено | No (default 0.0) |
| `yescoin_earned` | Numeric(10,2) | Кешбэк начислен | No (default 0.0) |
| `description` | Text | Описание транзакции | Yes |
| `partner` | relationship | Связь с Partner | - |
| `refunds` | relationship | Связь с Refund | - |

---

## Типы транзакций

Модель поддерживает следующие типы:

- **topup** - Пополнение баланса
- **payment** - Оплата через QR у партнёра
- **discount** - Применение скидки
- **bonus** - Начисление бонусов
- **refund** - Возврат средств
- **cashback** - Начисление кешбэка

---

## Индексы для производительности

1. `idx_transaction_user_status` - (user_id, status, created_at)
2. `idx_transaction_type_status` - (type, status, created_at)
3. `idx_transaction_date_range` - (created_at, status)
4. **`idx_transaction_partner`** - (partner_id, created_at) ✅ НОВЫЙ

---

## Примеры использования

### Создание транзакции оплаты

```python
from app.models.transaction import Transaction

transaction = Transaction(
    user_id=user.id,
    partner_id=partner.id,
    type="payment",
    amount=1000.0,
    yescoin_used=900.0,      # После 10% скидки
    yescoin_earned=45.0,     # 5% кешбэк
    status="completed",
    description=f"Оплата в {partner.name}"
)
db.add(transaction)
db.commit()
```

### Получение транзакций партнёра

```python
partner_transactions = db.query(Transaction).filter(
    Transaction.partner_id == partner_id,
    Transaction.status == "completed"
).all()
```

### Создание возврата

```python
from app.models.payment import Refund

refund = Refund(
    transaction_id=transaction.id,
    user_id=user.id,
    amount=900.0,
    reason="Товар не подошел",
    status="pending"
)
db.add(refund)
db.commit()
```

---

## Исправление #3: User ↔ Notification & NotificationSettings

### Ошибка
```
Mapper 'mapped class User->users' has no property 'notifications'
One or more mappers failed to initialize - Notification->notifications
```

### Причина
- В `Notification` был определен: `user = relationship("User", back_populates="notifications")`
- В `NotificationSettings` был определен: `user = relationship("User", back_populates="notification_settings")`
- В `User` отсутствовали: оба обратных relationships

### Решение
Добавлено в `app/models/user.py`:

```python
# Relationships
notifications = relationship("Notification", back_populates="user")
notification_settings = relationship("NotificationSettings", back_populates="user", uselist=False)
```

---

## Статус исправлений

| # | Проблема | Статус | Файл |
|---|----------|--------|------|
| 1 | Partner ↔ Transaction связь | ✅ ИСПРАВЛЕНО | `app/models/transaction.py` |
| 2 | Transaction ↔ Refund связь | ✅ ИСПРАВЛЕНО | `app/models/transaction.py` |
| 3 | User ↔ Notification связь | ✅ ИСПРАВЛЕНО | `app/models/user.py` |
| 4 | User ↔ NotificationSettings связь | ✅ ИСПРАВЛЕНО | `app/models/user.py` |
| 5 | Пересоздана база данных | ✅ ВЫПОЛНЕНО | Docker Compose |
| 6 | Бэкенд запускается | ✅ РАБОТАЕТ | Backend v1.0.3 |

---

## Версионирование

**Версия модели:** v1.0.3  
**Дата исправления:** 5 ноября 2025  
**Статус:** ✅ **ВСЕ ПРОБЛЕМЫ ИСПРАВЛЕНЫ**

---

## Связанные файлы

- `app/models/transaction.py` - Модель Transaction (ИЗМЕНЁН)
- `app/models/partner.py` - Модель Partner
- `app/models/payment.py` - Модель Refund
- `app/api/v1/qr.py` - API для QR-платежей
- `DATABASE_MODEL_FIX.md` - Первое исправление

---

## Следующие шаги

1. ✅ Модели исправлены
2. ✅ База данных пересоздана
3. ✅ Бэкенд работает
4. 🎯 **ПРОТЕСТИРУЙТЕ РЕГИСТРАЦИЮ** из мобильного приложения
5. 🎯 Протестируйте QR-платежи
6. 🎯 Протестируйте возвраты (refunds)

---

**Бэкенд готов к работе!** 🚀

Попробуйте зарегистрироваться снова из мобильного приложения - всё должно работать корректно.

