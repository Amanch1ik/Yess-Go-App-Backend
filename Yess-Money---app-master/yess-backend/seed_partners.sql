-- Скрипт для добавления тестовых партнёров в базу данных
-- Запустить через: docker-compose exec postgres psql -U yess_user -d yess_db -f /path/to/script.sql
-- Или через PgAdmin

-- Добавляем тестовых партнёров с заполненными полями
INSERT INTO partners (name, description, category, logo_url, phone, email, website, is_active, is_verified, max_discount_percent, cashback_rate, default_cashback_rate, created_at, updated_at)
VALUES
    -- Кафе
    ('SIERRA Coffee', 'Сеть кофеен премиум-класса с уютной атмосферой', 'Кафе', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=SIERRA', '+996 555 111 111', 'info@sierra.kg', 'https://sierra.kg', true, true, 15.0, 5.0, 5.0, NOW(), NOW()),
    ('Ants', 'Современная кофейня с авторским кофе', 'Кафе', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=Ants', '+996 555 222 222', 'info@ants.kg', 'https://ants.kg', true, true, 10.0, 5.0, 5.0, NOW(), NOW()),
    ('Bublik Cafe', 'Уютное кафе с домашней выпечкой', 'Кафе', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=Bublik', '+996 555 333 333', 'info@bublik.kg', 'https://bublik.kg', true, true, 12.0, 5.0, 5.0, NOW(), NOW()),
    ('Flask Coffee', 'Кофейня для ценителей кофе', 'Кафе', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=Flask', '+996 555 444 444', 'info@flask.kg', 'https://flask.kg', true, true, 10.0, 5.0, 5.0, NOW(), NOW()),
    
    -- Рестораны
    ('Supara', 'Этно-комплекс с национальной кухней', 'Ресторан', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=Supara', '+996 555 555 555', 'info@supara.kg', 'https://supara.kg', true, true, 20.0, 7.0, 7.0, NOW(), NOW()),
    ('Нават', 'Navat — популярное кафе кыргызской кухни в Бишкеке, где традиции встречаются с современным комфортом. Здесь подают свежие боорсоки, бешбармак, лагман, кuurdak, самсы из тандыра и наборы для компании; к блюдам — чаи и напитки местных рецептов. Интерьер с национальными деталями создаёт атмосферу гостеприимства, а внимательный сервис делает каждый визит по-особенному тёплым. Отличный выбор для семейных обедов, деловых встреч и душевных ужинов.', 'cafe', 'https://navat.kg/images/tild6336-3031-4866-a362-343230613330__navat_logo_2-01.jpg', '+996700454545', 'info@navat.kg', 'https://navat.kg', true, true, 30.0, 30.0, 30.0, NOW(), NOW()),
    ('Faiza', 'Ресторан европейской кухни', 'Ресторан', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=Faiza', '+996 555 777 777', 'info@faiza.kg', 'https://faiza.kg', true, true, 18.0, 6.0, 6.0, NOW(), NOW()),
    ('Chicken Star', 'Сеть ресторанов быстрого питания', 'Ресторан', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=ChickenStar', '+996 555 888 888', 'info@chickenstar.kg', 'https://chickenstar.kg', true, true, 10.0, 5.0, 5.0, NOW(), NOW()),
    
    -- Бары
    ('Save The Ales', 'Крафтовый бар с пивоварней', 'Бар', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=SaveTheAles', '+996 555 999 999', 'info@savetheales.kg', 'https://savetheales.kg', true, true, 15.0, 5.0, 5.0, NOW(), NOW()),
    ('Promzona', 'Промышленный бар с живой музыкой', 'Бар', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=Promzona', '+996 555 000 000', 'info@promzona.kg', 'https://promzona.kg', true, true, 12.0, 5.0, 5.0, NOW(), NOW()),
    ('Teplo Bar', 'Уютный бар с камином', 'Бар', 'https://via.placeholder.com/200x200/0F6B53/FFFFFF?text=Teplo', '+996 555 101 010', 'info@teplo.kg', 'https://teplo.kg', true, true, 10.0, 5.0, 5.0, NOW(), NOW());

-- Обновляем city_id для всех партнёров (предполагаем, что есть город с id=1 - Бишкек)
UPDATE partners SET city_id = 1 WHERE city_id IS NULL;

-- Обновляем координаты для Нават
UPDATE partners 
SET 
    latitude = 42.855811,
    longitude = 74.585781
WHERE name = 'Нават';

