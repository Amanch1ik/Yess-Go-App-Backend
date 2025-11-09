#!/bin/bash

# Скрипт для применения миграции категорий
# Использование: ./apply_categories_migration.sh

echo "=== Применение миграции категорий ==="
echo ""

# Проверяем, запущен ли Docker
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker не запущен или недоступен"
    exit 1
fi

# Переходим в директорию с docker-compose
cd "$(dirname "$0")/.."

echo "1️⃣  Применяем миграцию Alembic..."
docker-compose exec -T backend alembic upgrade head
if [ $? -ne 0 ]; then
    echo "❌ Ошибка при применении миграции"
    exit 1
fi
echo "✅ Миграция применена успешно"
echo ""

echo "2️⃣  Добавляем базовые категории..."
docker-compose exec -T backend python app/scripts/seed_categories.py
if [ $? -ne 0 ]; then
    echo "⚠️  Возможна ошибка при добавлении категорий (возможно, они уже существуют)"
else
    echo "✅ Категории добавлены успешно"
fi
echo ""

echo "3️⃣  Перезапускаем бэкенд для применения изменений..."
docker-compose restart backend
echo "✅ Бэкенд перезапущен"
echo ""

echo "=== Готово! ==="
echo "Проверьте логи: docker-compose logs -f backend"

