-- Insert test banners
INSERT INTO banners (image_url, partner_id, title, description, is_active, display_order, link_url, created_at, updated_at)
VALUES
-- Баннер 1: SIERRA Coffee
('https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=450&fit=crop', 1, 'SIERRA Coffee - Скидка 20%', 'Получите скидку 20% на весь ассортимент кофе', true, 1, '/partners/1', NOW(), NOW()),

-- Баннер 2: Ants
('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=450&fit=crop', 2, 'Ants - Европейская кухня', 'Попробуйте наши новые блюда европейской кухни', true, 2, '/partners/2', NOW(), NOW()),

-- Баннер 3: Supara
('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=450&fit=crop', 5, 'Supara - Национальная кухня', 'Этно-комплекс с традиционной кухней', true, 3, '/partners/5', NOW(), NOW()),

-- Баннер 4: Navat
('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=450&fit=crop', 6, 'Navat - Восточная кухня', 'Ресторан восточной кухни с кешбэком 8%', true, 4, '/partners/6', NOW(), NOW()),

-- Баннер 5: Save The Ales
('https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=450&fit=crop', 9, 'Save The Ales - Крафтовое пиво', 'Широкий выбор крафтового пива', true, 5, '/partners/9', NOW(), NOW()),

-- Баннер 6: Общий баннер (без партнёра)
('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop', NULL, 'Специальное предложение', 'Получите бонусы за каждую покупку', true, 6, '/promotions', NOW(), NOW())
ON CONFLICT DO NOTHING;

