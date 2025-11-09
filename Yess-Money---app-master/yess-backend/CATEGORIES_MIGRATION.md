# Миграция категорий партнёров

## Описание изменений

Создана новая система категорий для партнёров с поддержкой связи многие-ко-многим:

1. **Таблица `categories`** - стандартизированные категории партнёров
2. **Таблица `partner_categories`** - промежуточная таблица для связи многие-ко-многим
3. **Удалено поле `category`** из таблицы `partners` (заменено на связь)

## Преимущества

- ✅ Единые категории (нет дубликатов типа "еда и напитки", "кафе", "питание")
- ✅ Один партнёр может иметь несколько категорий
- ✅ Легко добавлять новые категории
- ✅ Удобная фильтрация и поиск по категориям

## Применение миграции

### 1. Применить миграцию Alembic

```bash
cd yess-backend
alembic upgrade head
```

### 2. Добавить базовые категории

```bash
python app/scripts/seed_categories.py
```

Или через Docker:

```bash
docker-compose exec backend python app/scripts/seed_categories.py
```

## Базовые категории

Скрипт добавит следующие категории:

1. Рестораны и кафе
2. Еда и напитки
3. Одежда и обувь
4. Красота и здоровье
5. Электроника и техника
6. Развлечения
7. Транспорт
8. Образование
9. Медицина
10. Спорт и фитнес
11. Дом и сад
12. Книги и канцелярия
13. Игрушки и детские товары
14. Автомобили
15. Путешествия и туризм
16. Услуги
17. Супермаркеты
18. Банки и финансы
19. Интернет и связь
20. Другое

## Использование в коде

### Получить категории партнёра

```python
partner = db.query(Partner).filter(Partner.id == partner_id).first()
categories = partner.categories  # Список категорий
```

### Добавить категорию партнёру

```python
category = db.query(Category).filter(Category.slug == "restaurants-cafes").first()
partner.categories.append(category)
db.commit()
```

### Получить всех партнёров по категории

```python
category = db.query(Category).filter(Category.slug == "restaurants-cafes").first()
partners = category.partners  # Список партнёров в этой категории
```

### Получить все категории

```python
categories = db.query(Category).filter(Category.is_active == True).order_by(Category.display_order).all()
```

## Откат миграции

Если нужно откатить изменения:

```bash
alembic downgrade -1
```

**Внимание:** При откате данные из `partner_categories` будут перенесены обратно в поле `category` (берется первая категория для каждого партнёра).

