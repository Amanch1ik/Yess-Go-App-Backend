-- Скрипт для заполнения локаций партнёров в Бишкеке
-- Запустить через: docker-compose exec postgres psql -U yess_user -d yess_db -f /path/to/fill_partner_locations.sql
-- Или через PgAdmin

-- Сначала удаляем старые локации (опционально, если нужно пересоздать)
-- DELETE FROM partner_locations;

-- Вставляем локации для каждого партнёра
-- Координаты взяты из популярных мест в Бишкеке

-- 1. SIERRA Coffee (сеть кофеен - несколько локаций)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Чуй 123, Бишкек',  -- Центральная локация
    42.8746,  -- Координаты центра Бишкека
    74.5698,
    '+996 555 111 111',
    '{"mon": "08:00-22:00", "tue": "08:00-22:00", "wed": "08:00-22:00", "thu": "08:00-22:00", "fri": "08:00-22:00", "sat": "09:00-23:00", "sun": "09:00-21:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'SIERRA Coffee' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 2. Ants (кофейня)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Ибраимова 115, Бишкек',
    42.8700,
    74.5800,
    '+996 555 222 222',
    '{"mon": "09:00-21:00", "tue": "09:00-21:00", "wed": "09:00-21:00", "thu": "09:00-21:00", "fri": "09:00-22:00", "sat": "10:00-22:00", "sun": "10:00-20:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Ants' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 3. Bublik Cafe
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'пр. Чуй 136, Бишкек',
    42.8800,
    74.5700,
    '+996 555 333 333',
    '{"mon": "08:00-20:00", "tue": "08:00-20:00", "wed": "08:00-20:00", "thu": "08:00-20:00", "fri": "08:00-21:00", "sat": "09:00-21:00", "sun": "09:00-20:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Bublik Cafe' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 4. Flask Coffee
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Московская 189, Бишкек',
    42.8650,
    74.5750,
    '+996 555 444 444',
    '{"mon": "08:00-21:00", "tue": "08:00-21:00", "wed": "08:00-21:00", "thu": "08:00-21:00", "fri": "08:00-22:00", "sat": "09:00-22:00", "sun": "09:00-20:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Flask Coffee' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 5. Supara (этно-комплекс)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Логвиненко 65, Бишкек',  -- Известное место Supara
    42.8550,
    74.5900,
    '+996 555 555 555',
    '{"mon": "11:00-23:00", "tue": "11:00-23:00", "wed": "11:00-23:00", "thu": "11:00-23:00", "fri": "11:00-00:00", "sat": "11:00-00:00", "sun": "11:00-23:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Supara' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 6. Нават (уже есть координаты в partners, но нужно создать локацию)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Логвиненко 65, Бишкек',  -- Известное место Нават
    42.855811,  -- Координаты из seed_partners.sql
    74.585781,
    '+996700454545',
    '{"mon": "10:00-22:00", "tue": "10:00-22:00", "wed": "10:00-22:00", "thu": "10:00-22:00", "fri": "10:00-23:00", "sat": "10:00-23:00", "sun": "10:00-22:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Нават' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 7. Faiza (ресторан)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'пр. Чуй 155, Бишкек',
    42.8750,
    74.5650,
    '+996 555 777 777',
    '{"mon": "12:00-23:00", "tue": "12:00-23:00", "wed": "12:00-23:00", "thu": "12:00-23:00", "fri": "12:00-00:00", "sat": "12:00-00:00", "sun": "12:00-23:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Faiza' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 8. Chicken Star (сеть ресторанов)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ТЦ Дордой Плаза, пр. Чуй, Бишкек',
    42.8800,
    74.5800,
    '+996 555 888 888',
    '{"mon": "10:00-22:00", "tue": "10:00-22:00", "wed": "10:00-22:00", "thu": "10:00-22:00", "fri": "10:00-23:00", "sat": "10:00-23:00", "sun": "10:00-22:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Chicken Star' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 9. Save The Ales (крафтовый бар)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Токтогула 167, Бишкек',
    42.8700,
    74.5700,
    '+996 555 999 999',
    '{"mon": "17:00-02:00", "tue": "17:00-02:00", "wed": "17:00-02:00", "thu": "17:00-02:00", "fri": "17:00-03:00", "sat": "17:00-03:00", "sun": "17:00-01:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Save The Ales' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 10. Promzona (бар)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Московская 189, Бишкек',
    42.8650,
    74.5750,
    '+996 555 000 000',
    '{"mon": "18:00-02:00", "tue": "18:00-02:00", "wed": "18:00-02:00", "thu": "18:00-02:00", "fri": "18:00-03:00", "sat": "18:00-03:00", "sun": "18:00-01:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Promzona' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 11. Teplo Bar
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Ибраимова 115, Бишкек',
    42.8700,
    74.5800,
    '+996 555 101 010',
    '{"mon": "17:00-01:00", "tue": "17:00-01:00", "wed": "17:00-01:00", "thu": "17:00-01:00", "fri": "17:00-02:00", "sat": "17:00-02:00", "sun": "17:00-00:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Teplo Bar' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 12. Глобус (супермаркет - несколько филиалов)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'пр. Чуй 136, Бишкек',  -- Главный филиал
    42.8800,
    74.5700,
    '+996 312 123456',
    '{"mon": "08:00-22:00", "tue": "08:00-22:00", "wed": "08:00-22:00", "thu": "08:00-22:00", "fri": "08:00-22:00", "sat": "08:00-22:00", "sun": "09:00-21:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Глобус' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 13. Фрунзе (торговый центр)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'пр. Чуй 155, Бишкек',
    42.8750,
    74.5650,
    '+996 312 234567',
    '{"mon": "10:00-21:00", "tue": "10:00-21:00", "wed": "10:00-21:00", "thu": "10:00-21:00", "fri": "10:00-21:00", "sat": "10:00-21:00", "sun": "10:00-20:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Фрунзе' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 14. Дордой (рынок)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Дордой, Бишкек',
    42.8900,
    74.6000,
    '+996 312 345678',
    '{"mon": "06:00-18:00", "tue": "06:00-18:00", "wed": "06:00-18:00", "thu": "06:00-18:00", "fri": "06:00-18:00", "sat": "06:00-18:00", "sun": "07:00-17:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Дордой' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 15. Бишкек Парк (торговый центр)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Логвиненко 65, Бишкек',
    42.8550,
    74.5900,
    '+996 312 456789',
    '{"mon": "10:00-22:00", "tue": "10:00-22:00", "wed": "10:00-22:00", "thu": "10:00-22:00", "fri": "10:00-22:00", "sat": "10:00-22:00", "sun": "10:00-21:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Бишкек Парк' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- 16. Айчурек (кафе)
INSERT INTO partner_locations (
    partner_id,
    address,
    latitude,
    longitude,
    phone_number,
    working_hours,
    is_active,
    is_main_location,
    created_at,
    updated_at
)
SELECT 
    id,
    'ул. Московская 189, Бишкек',
    42.8650,
    74.5750,
    '+996 312 567890',
    '{"mon": "09:00-21:00", "tue": "09:00-21:00", "wed": "09:00-21:00", "thu": "09:00-21:00", "fri": "09:00-22:00", "sat": "09:00-22:00", "sun": "09:00-20:00"}'::jsonb,
    true,
    true,
    NOW(),
    NOW()
FROM partners WHERE name = 'Айчурек' AND NOT EXISTS (
    SELECT 1 FROM partner_locations WHERE partner_id = partners.id
);

-- Проверка результата
SELECT 
    p.name as partner_name,
    pl.address,
    pl.latitude,
    pl.longitude,
    pl.is_active
FROM partner_locations pl
JOIN partners p ON p.id = pl.partner_id
ORDER BY p.name;

