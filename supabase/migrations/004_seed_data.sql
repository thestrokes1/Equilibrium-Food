-- ============================================================
-- 004_seed_data.sql
-- Run this fourth in Supabase SQL Editor
-- Seeds restaurants and menu items from productData.ts
-- ============================================================

-- ── Restaurants ───────────────────────────────────────────────────────────────
INSERT INTO public.restaurants (name, slug, category, rating, delivery_time_min, delivery_fee, min_order, description) VALUES
  ('Burger Republic', 'burger-republic', 'burgers', 4.8, 18, 2.99, 8.00,  'Craft smash burgers made fresh to order with premium beef and house-made sauces.'),
  ('Pizza Palace',   'pizza-palace',   'pizza',   4.7, 22, 1.99, 10.00, 'Wood-fired artisan pizzas with slow-cooked tomato sauce and premium toppings.'),
  ('Sakura Sushi',   'sakura-sushi',   'sushi',   4.9, 30, 3.99, 15.00, 'Traditional Japanese sushi and rolls crafted by expert chefs with the freshest ingredients.'),
  ('Green Garden',   'green-garden',   'vegan',   4.6, 15, 1.99, 6.00,  '100% plant-based bowls and plates packed with nutrition and natural flavors.'),
  ('La Trattoria',   'la-trattoria',   'pasta',   4.8, 20, 2.49, 12.00, 'Authentic Italian pasta made in-house daily with imported ingredients from Italy.'),
  ('Taco Libre',     'taco-libre',     'tacos',   4.5, 17, 1.49, 8.00,  'Bold Mexican street-style tacos with house-made salsas and fresh tortillas.'),
  ('Smoke & Fire',   'smoke-and-fire', 'mains',   4.9, 35, 3.99, 20.00, 'Slow-smoked BBQ and Argentine-style grilled meats with chimichurri.'),
  ('Bloom Kitchen',  'bloom-kitchen',  'vegan',   4.7, 12, 1.99, 7.00,  'Fresh smoothie bowls and plant-powered meals for a healthy lifestyle.')
ON CONFLICT (slug) DO NOTHING;

-- ── Menu Items ────────────────────────────────────────────────────────────────
INSERT INTO public.menu_items
  (restaurant_id, name, description, price, image_url, category, badge_type, badge_label, rating, delivery_time, sort_order)
SELECT
  r.id,
  i.name, i.description, i.price, i.image_url, i.category,
  i.badge_type, i.badge_label, i.rating, i.delivery_time, i.sort_order
FROM (VALUES
  ('burger-republic', 'Smash Burger',
    'Double smash patty with caramelized onions, american cheese, pickles and our signature sauce.',
    12.90, '/images/smash-burger.jpg', 'burgers', 'sale', '20% OFF', 4.8, '18', 1),

  ('pizza-palace', 'Pepperoni Feast',
    'Loaded with crispy pepperoni slices, mozzarella and slow-cooked tomato sauce on a wood-fired crust.',
    16.50, '/images/pepperoni.jpg', 'pizza', NULL, NULL, 4.7, '22', 1),

  ('sakura-sushi', 'Rainbow Roll',
    'Fresh salmon, tuna, avocado and cucumber wrapped in seasoned sushi rice. Chef''s top pick.',
    19.00, '/images/rainbow-roll.jpg', 'sushi', 'new', 'NEW', 4.9, '30', 1),

  ('green-garden', 'Vegan Bowl',
    'Quinoa base with roasted sweet potato, chickpeas, kale, cucumber and tahini dressing.',
    11.00, '/images/vegan-bowl.jpg', 'vegan', NULL, NULL, 4.6, '15', 1),

  ('la-trattoria', 'Truffle Pasta',
    'Fresh tagliatelle tossed in a rich black truffle cream sauce with parmesan and chives.',
    18.00, '/images/truffle-pasta.jpg', 'pasta', 'popular', 'POPULAR', 4.8, '20', 1),

  ('taco-libre', 'Crispy Tacos',
    'Three crunchy corn tacos with seasoned beef, fresh pico de gallo, guacamole and lime crema.',
    13.50, '/images/crispy-tacos.jpg', 'tacos', NULL, NULL, 4.5, '17', 1),

  ('smoke-and-fire', 'Asado',
    'Slow-cooked Argentine-style BBQ with chimichurri sauce and grilled provolone.',
    22.00, '/images/bbq-ribs.jpg', 'mains', NULL, NULL, 4.9, '35', 1),

  ('bloom-kitchen', 'Acai Smoothie Bowl',
    'Thick acai blend topped with granola, banana, strawberries, coconut flakes and honey.',
    9.50, '/images/acai-bowl.jpg', 'vegan', 'new', 'NEW', 4.7, '12', 1)
) AS i(slug, name, description, price, image_url, category, badge_type, badge_label, rating, delivery_time, sort_order)
JOIN public.restaurants r ON r.slug = i.slug;
