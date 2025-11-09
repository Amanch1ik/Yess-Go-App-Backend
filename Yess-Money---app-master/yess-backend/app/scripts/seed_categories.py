"""Скрипт для добавления базовых категорий в базу данных"""
import sys
import os

# Добавляем корневую директорию проекта в путь
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.category import Category
from datetime import datetime


# Базовые категории для партнёров
BASE_CATEGORIES = [
    {
        "name": "Рестораны и кафе",
        "slug": "restaurants-cafes",
        "description": "Рестораны, кафе, бары и другие заведения общественного питания",
        "icon": "restaurant",
        "display_order": 1
    },
    {
        "name": "Еда и напитки",
        "slug": "food-drinks",
        "description": "Продукты питания, напитки, доставка еды",
        "icon": "food",
        "display_order": 2
    },
    {
        "name": "Одежда и обувь",
        "slug": "clothing-shoes",
        "description": "Магазины одежды, обуви, аксессуаров",
        "icon": "shopping-bag",
        "display_order": 3
    },
    {
        "name": "Красота и здоровье",
        "slug": "beauty-health",
        "description": "Салоны красоты, спа, фитнес-центры, аптеки",
        "icon": "spa",
        "display_order": 4
    },
    {
        "name": "Электроника и техника",
        "slug": "electronics",
        "description": "Магазины электроники, бытовой техники, гаджетов",
        "icon": "laptop",
        "display_order": 5
    },
    {
        "name": "Развлечения",
        "slug": "entertainment",
        "description": "Кинотеатры, развлекательные центры, клубы",
        "icon": "movie",
        "display_order": 6
    },
    {
        "name": "Транспорт",
        "slug": "transport",
        "description": "Такси, каршеринг, автосервисы, заправки",
        "icon": "car",
        "display_order": 7
    },
    {
        "name": "Образование",
        "slug": "education",
        "description": "Школы, курсы, репетиторы, образовательные центры",
        "icon": "school",
        "display_order": 8
    },
    {
        "name": "Медицина",
        "slug": "medicine",
        "description": "Клиники, больницы, медицинские центры",
        "icon": "medical",
        "display_order": 9
    },
    {
        "name": "Спорт и фитнес",
        "slug": "sports-fitness",
        "description": "Спортивные клубы, фитнес-центры, спортивные товары",
        "icon": "fitness",
        "display_order": 10
    },
    {
        "name": "Дом и сад",
        "slug": "home-garden",
        "description": "Мебель, товары для дома, садовые центры",
        "icon": "home",
        "display_order": 11
    },
    {
        "name": "Книги и канцелярия",
        "slug": "books-stationery",
        "description": "Книжные магазины, канцелярские товары",
        "icon": "book",
        "display_order": 12
    },
    {
        "name": "Игрушки и детские товары",
        "slug": "toys-kids",
        "description": "Детские магазины, игрушки, товары для детей",
        "icon": "toys",
        "display_order": 13
    },
    {
        "name": "Автомобили",
        "slug": "automotive",
        "description": "Автосалоны, автозапчасти, автосервисы",
        "icon": "car-repair",
        "display_order": 14
    },
    {
        "name": "Путешествия и туризм",
        "slug": "travel-tourism",
        "description": "Турагентства, отели, билеты",
        "icon": "flight",
        "display_order": 15
    },
    {
        "name": "Услуги",
        "slug": "services",
        "description": "Различные услуги: ремонт, клининг, юридические и др.",
        "icon": "tools",
        "display_order": 16
    },
    {
        "name": "Супермаркеты",
        "slug": "supermarkets",
        "description": "Супермаркеты, гипермаркеты, продуктовые магазины",
        "icon": "store",
        "display_order": 17
    },
    {
        "name": "Банки и финансы",
        "slug": "banking-finance",
        "description": "Банки, финансовые услуги, страховые компании",
        "icon": "bank",
        "display_order": 18
    },
    {
        "name": "Интернет и связь",
        "slug": "internet-telecom",
        "description": "Интернет-провайдеры, мобильная связь, IT-услуги",
        "icon": "wifi",
        "display_order": 19
    },
    {
        "name": "Другое",
        "slug": "other",
        "description": "Прочие категории",
        "icon": "more",
        "display_order": 99
    }
]


def seed_categories(db: Session):
    """Добавляет базовые категории в базу данных"""
    print("Начинаем добавление базовых категорий...")
    
    added_count = 0
    skipped_count = 0
    
    for cat_data in BASE_CATEGORIES:
        # Проверяем, существует ли уже категория с таким slug
        existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        
        if existing:
            print(f"⚠️  Категория '{cat_data['name']}' уже существует, пропускаем...")
            skipped_count += 1
            continue
        
        # Создаём новую категорию
        category = Category(
            name=cat_data["name"],
            slug=cat_data["slug"],
            description=cat_data["description"],
            icon=cat_data["icon"],
            display_order=cat_data["display_order"],
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(category)
        added_count += 1
        print(f"✅ Добавлена категория: {cat_data['name']} ({cat_data['slug']})")
    
    try:
        db.commit()
        print(f"\n✅ Успешно добавлено категорий: {added_count}")
        if skipped_count > 0:
            print(f"⚠️  Пропущено (уже существуют): {skipped_count}")
        print(f"📊 Всего категорий в базе: {db.query(Category).count()}")
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при добавлении категорий: {str(e)}")
        raise


def main():
    """Главная функция"""
    db: Session = SessionLocal()
    try:
        seed_categories(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

