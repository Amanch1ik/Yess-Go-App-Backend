# Исправление модели Transaction

## Проблема

При попытке регистрации из мобильного приложения возникала ошибка:

```
Could not determine join condition between parent/child tables on relationship Partner.transactions - 
there are no foreign keys linking these tables. Ensure that referencing columns are associated with 
a ForeignKey or ForeignKeyConstraint, or specify a 'primaryjoin' expression.
```

### Причина

В модели `Partner` было определено relationship к `Transaction`:
```python
transactions = relationship("Transaction", back_populates="partner")
```

Но в модели `Transaction` отсутствовали:
1. Поле `partner_id` с ForeignKey
2. Обратное relationship к Partner

## Решение

### Файл изменён: `app/models/transaction.py`

**Добавлено:**

1. **Поле `partner_id`** - внешний ключ на таблицу partners:
```python
partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True, index=True)
```

2. **Дополнительные поля** для отслеживания QR-платежей:
```python
yescoin_used = Column(Numeric(10, 2), default=0.0)     # YesCoin потрачено
yescoin_earned = Column(Numeric(10, 2), default=0.0)   # Кешбэк начислен
description = Column(Text)                              # Описание транзакции
```

3. **Relationship к Partner**:
```python
partner = relationship("Partner", back_populates="transactions")
```

4. **Индекс для оптимизации**:
```python
Index('idx_transaction_partner', 'partner_id', 'created_at')
```

## Структура обновлённой модели Transaction

```python
class Transaction(Base):
    __tablename__ = "transactions"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True, index=True)
    
    # Transaction data
    type = Column(String(50), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    balance_before = Column(Numeric(10, 2))
    balance_after = Column(Numeric(10, 2))
    status = Column(String(50), nullable=False, index=True)
    
    # URLs and QR data
    payment_url = Column(String(500))
    qr_code_data = Column(Text)
    
    # YesCoin tracking
    yescoin_used = Column(Numeric(10, 2), default=0.0)
    yescoin_earned = Column(Numeric(10, 2), default=0.0)
    description = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    partner = relationship("Partner", back_populates="transactions")
```

## Типы транзакций

Модель поддерживает следующие типы транзакций:

- **topup** - пополнение баланса
- **payment** - оплата через QR у партнёра
- **discount** - применение скидки
- **bonus** - начисление бонусов
- **refund** - возврат средств
- **cashback** - начисление кешбэка

## Статусы транзакций

- **pending** - ожидает обработки
- **completed** - успешно завершена
- **failed** - ошибка выполнения
- **cancelled** - отменена

## Примеры использования

### Создание транзакции оплаты через QR

```python
transaction = Transaction(
    user_id=user.id,
    partner_id=partner.id,
    type="payment",
    amount=1000.0,
    yescoin_used=900.0,      # После применения 10% скидки
    yescoin_earned=45.0,     # Кешбэк 5%
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

### Получение транзакций пользователя с партнёром

```python
user_partner_transactions = db.query(Transaction).filter(
    Transaction.user_id == user_id,
    Transaction.partner_id == partner_id
).order_by(Transaction.created_at.desc()).all()
```

## Миграция базы данных

После изменения модели необходимо пересоздать базу данных или применить миграцию.

### Способ 1: Пересоздание базы (для dev)

```bash
# Остановить все контейнеры
docker compose down

# Запустить с пересборкой
docker compose up --build -d
```

### Способ 2: Создание миграции Alembic (для production)

```bash
# Создать миграцию
alembic revision --autogenerate -m "Add partner_id and yescoin fields to transactions"

# Применить миграцию
alembic upgrade head
```

## Индексы

Для оптимизации запросов созданы следующие индексы:

1. `idx_transaction_user_status` - (user_id, status, created_at)
2. `idx_transaction_type_status` - (type, status, created_at)
3. `idx_transaction_date_range` - (created_at, status)
4. `idx_transaction_partner` - **(NEW)** (partner_id, created_at)

## Проверка изменений

### Проверить структуру таблицы в PostgreSQL

```sql
-- Подключиться к базе
docker exec -it yess-money---app-master-postgres-1 psql -U yess_user -d yess_db

-- Посмотреть структуру таблицы
\d transactions

-- Проверить внешние ключи
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conrelid = 'transactions'::regclass AND contype = 'f';
```

### Тестовый запрос регистрации

```bash
# Из мобильного приложения попробуйте регистрацию
# Или через curl:
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+996504876087",
    "password": "123456",
    "first_name": "Test",
    "last_name": "User"
  }'
```

## Связанные файлы

- `app/models/transaction.py` - Модель Transaction
- `app/models/partner.py` - Модель Partner
- `app/api/v1/qr.py` - API для QR-платежей
- `app/services/qr_service.py` - Сервис QR-кодов

## Статус

✅ **ИСПРАВЛЕНО**
- Добавлен `partner_id` в модель Transaction
- Добавлены поля для отслеживания YesCoin
- Создан relationship между Partner и Transaction
- База данных пересоздана с новой структурой
- Бэкенд запускается без ошибок

**Дата исправления:** 5 ноября 2025  
**Версия:** Backend v1.0.1

