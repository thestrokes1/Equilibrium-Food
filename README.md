# Equilibrium Food 🍔

A modern food delivery landing page built as a frontend portfolio project.
Live demo → [equilibrium-food.vercel.app](https://equilibrium-food.vercel.app)

---

## Features

- Browse menu by category with live search
- Product detail modal with quantity selector
- Slide-in cart drawer with item management
- Free delivery threshold tracker
- Toast notifications on cart actions
- Loading skeleton cards
- Fully responsive — mobile, tablet, desktop
- Smooth animations powered by Framer Motion

## Tech stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Framer Motion | Animations |
| React Router | Navigation |
| CSS Modules | Styling |

## Project structure
```
src/
├── context/
│   ├── CartContext.jsx     # Global cart state
│   └── ToastContext.jsx    # Toast notification system
├── components/
│   ├── layout/             # TopBar, Navbar, Footer
│   ├── sections/           # Hero, MenuSection, DealsSection
│   ├── product/            # FoodCard, ProductModal, SkeletonCard
│   ├── cart/               # CartDrawer
│   └── ui/                 # Toast
├── features/products/      # Product data
└── pages/
    └── Home.jsx
```

## Running locally
```bash
git clone https://github.com/thestrokes1/Equilibrium-Food.git
cd Equilibrium-Food
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deployment

Deployed on Vercel with automatic deploys on every push to `main`.

---

Built by [@thestrokes1](https://github.com/thestrokes1) · Resistencia, Argentina 🇦🇷