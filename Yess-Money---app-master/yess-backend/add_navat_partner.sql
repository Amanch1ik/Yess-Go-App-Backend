-- Скрипт для добавления/обновления партнёра "Нават"
-- Запустить через: docker-compose exec postgres psql -U yess_user -d yess_db -f /path/to/add_navat_partner.sql
-- Или через PgAdmin

-- Сначала проверяем, существует ли уже партнёр "Нават" или "Navat"
-- Если существует, обновляем, если нет - добавляем

-- Удаляем старую запись, если есть (на случай, если название было "Navat")
DELETE FROM partners WHERE name IN ('Navat', 'Нават');

-- Добавляем нового партнёра "Нават" с полными данными
INSERT INTO partners (
    name,
    description,
    category,
    logo_url,
    phone,
    email,
    website,
    is_active,
    is_verified,
    max_discount_percent,
    cashback_rate,
    default_cashback_rate,
    latitude,
    longitude,
    created_at,
    updated_at
) VALUES (
    'Нават',
    'Navat — популярное кафе кыргызской кухни в Бишкеке, где традиции встречаются с современным комфортом. Здесь подают свежие боорсоки, бешбармак, лагман, кuurdak, самсы из тандыра и наборы для компании; к блюдам — чаи и напитки местных рецептов. Интерьер с национальными деталями создаёт атмосферу гостеприимства, а внимательный сервис делает каждый визит по-особенному тёплым. Отличный выбор для семейных обедов, деловых встреч и душевных ужинов.',
    'cafe',
    'https://navat.kg/images/tild6336-3031-4866-a362-343230613330__navat_logo_2-01.jpg',
    '+996700454545',
    'info@navat.kg',
    'https://navat.kg',
    true,
    true,
    30.0,  -- max_discount_percent
    30.0,  -- cashback_rate
    30.0,  -- default_cashback_rate (30% кэшбек)
    42.855811,  -- latitude из 2GIS
    74.585781,  -- longitude из 2GIS
    NOW(),
    NOW()
);

-- Обновляем city_id (предполагаем, что есть город с id=1 - Бишкек)
UPDATE partners 
SET city_id = 1 
WHERE name = 'Нават' AND city_id IS NULL;

-- Если нужно создать локацию партнёра в таблице partner_locations
-- (если используется отдельная таблица для адресов)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'Asia Mall, Бишкек',
    42.855811,
    74.585781,
    '+996700454545',
    true,
    true,
    NOW(),
    NOW()
FROM partners
WHERE name = 'Нават'
ON CONFLICT DO NOTHING;

-- Проверка результата
SELECT 
    id,
    name,
    category,
    default_cashback_rate,
    phone,
    latitude,
    longitude,
    is_active,
    is_verified
FROM partners 
WHERE name = 'Нават';

