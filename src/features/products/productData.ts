import type { Product } from '@/types/product';

const products: Product[] = [
  {
    id: 1,
    name: 'Smash Burger',
    price: 12.9,
    image: '/images/smash-burger.jpg',
    category: 'burgers',
    rating: 4.8,
    deliveryTime: '18',
    restaurant: 'Burger Republic',
    badge: { type: 'sale', label: '20% OFF' },
    description:
      'Double smash patty with caramelized onions, american cheese, pickles and our signature sauce.',
  },
  {
    id: 2,
    name: 'Pepperoni Feast',
    price: 16.5,
    image: '/images/pepperoni.jpg',
    category: 'pizza',
    rating: 4.7,
    deliveryTime: '22',
    restaurant: 'Pizza Palace',
    description:
      'Loaded with crispy pepperoni slices, mozzarella and slow-cooked tomato sauce on a wood-fired crust.',
  },
  {
    id: 3,
    name: 'Rainbow Roll',
    price: 19.0,
    image: '/images/rainbow-roll.jpg',
    category: 'sushi',
    rating: 4.9,
    deliveryTime: '30',
    restaurant: 'Sakura Sushi',
    badge: { type: 'new', label: 'NEW' },
    description:
      "Fresh salmon, tuna, avocado and cucumber wrapped in seasoned sushi rice. Chef's top pick.",
  },
  {
    id: 4,
    name: 'Vegan Bowl',
    price: 11.0,
    image: '/images/vegan-bowl.jpg',
    category: 'vegan',
    rating: 4.6,
    deliveryTime: '15',
    restaurant: 'Green Garden',
    description:
      'Quinoa base with roasted sweet potato, chickpeas, kale, cucumber and tahini dressing.',
  },
  {
    id: 5,
    name: 'Truffle Pasta',
    price: 18.0,
    image: '/images/truffle-pasta.jpg',
    category: 'pasta',
    rating: 4.8,
    deliveryTime: '20',
    restaurant: 'La Trattoria',
    badge: { type: 'popular', label: 'POPULAR' },
    description:
      'Fresh tagliatelle tossed in a rich black truffle cream sauce with parmesan and chives.',
  },
  {
    id: 6,
    name: 'Crispy Tacos',
    price: 13.5,
    image: '/images/crispy-tacos.jpg',
    category: 'tacos',
    rating: 4.5,
    deliveryTime: '17',
    restaurant: 'Taco Libre',
    description:
      'Three crunchy corn tacos with seasoned beef, fresh pico de gallo, guacamole and lime crema.',
  },
  {
    id: 7,
    name: 'Asado',
    price: 22.0,
    image: '/images/bbq-ribs.jpg',
    category: 'mains',
    rating: 4.9,
    deliveryTime: '35',
    restaurant: 'Smoke & Fire',
    description: 'Slow-cooked Argentine-style BBQ with chimichurri sauce and grilled provolone.',
  },
  {
    id: 8,
    name: 'Acai Smoothie Bowl',
    price: 9.5,
    image: '/images/acai-bowl.jpg',
    category: 'vegan',
    rating: 4.7,
    deliveryTime: '12',
    restaurant: 'Bloom Kitchen',
    badge: { type: 'new', label: 'NEW' },
    description:
      'Thick acai blend topped with granola, banana, strawberries, coconut flakes and honey.',
  },
];

export default products;
