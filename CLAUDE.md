# CLAUDE.md — Equilibrium Food · Plan Profesional Completo v2.0

> Archivo de contexto para Claude Code. Auditoría completa + plan full-stack.
> Actualizar con [x] al completar cada ítem.

---

## Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite 5 | Puerto 3000 |
| Estilos | Vanilla CSS (Tailwind eliminado) | CSS modules por componente |
| Animaciones | Framer Motion 11 | useReducedMotion en todos |
| Routing | React Router DOM v6 | Routes/Route en App.tsx |
| State | React Context (Cart, Auth, Toast) | useCallback + useLocalStorage |
| Backend / BaaS | Supabase | PostgreSQL + Auth + Storage |
| DB Schema | public (POS existente) + tablas eq_* | Prefijo eq_ = Equilibrium Food |
| Auth | Supabase Auth | Email/password + Google OAuth |
| Deploy Frontend | Vercel | Auto-deploy en push a main |
| Deploy Backend | Supabase Cloud | sa-east-1 |
| Testing | Vitest + @testing-library | 32 tests, 0 errores |
| Linting | ESLint 9 flat config + Prettier | 0 errores |
| CI | GitHub Actions | lint → test → build |
| Hooks | Husky + lint-staged + commitlint | Conventional commits |

---

## Credenciales de infraestructura

| Recurso | ID / URL |
|---|---|
| Supabase Project ID | `rzevfdpsozjrdqixxiex` |
| Supabase URL | `https://rzevfdpsozjrdqixxiex.supabase.co` |
| Vercel Project | `equilibrium-food` (prj_XXUmtmLkTo8nPmfiuoIF6RfGFGGE) |
| Vercel Team | `team_y858qJaSBj8WXao7BeeuNIlO` |

> ⚠️ Las API keys NO van aquí — solo en .env.local y en Vercel env vars.
> ⚠️ El proyecto `rkeqsfmfzacazgzacoin` es el kiosko (POS nano) — NO modificar.

---

## Arquitectura de base de datos

Proyecto Supabase exclusivo para Equilibrium Food — base de datos vacía, tabla limpia sin prefijos.
La tabla `profiles` se crea desde cero aquí y se vincula a `auth.users` via trigger.

### Tablas

#### `restaurants`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| name | text | |
| slug | text UNIQUE | URL-friendly |
| description | text | |
| logo_url | text | |
| cover_url | text | |
| category | text | burgers, pizza, sushi, vegan, pasta, tacos, mains |
| rating | numeric(3,1) | 0.0–5.0 |
| delivery_time_min | integer | minutos estimados |
| delivery_fee | numeric(8,2) | 0 = gratis |
| min_order | numeric(8,2) | monto mínimo |
| is_active | boolean | default true |
| created_at | timestamptz | now() |

#### `eq_menu_items`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| restaurant_id | uuid FK → eq_restaurants | |
| name | text | |
| description | text | |
| price | numeric(8,2) | |
| image_url | text | |
| category | text | hereda de restaurant.category |
| badge_type | text | 'new' / 'popular' / 'sale' / null |
| badge_label | text | '20% OFF', 'NEW', etc. |
| rating | numeric(3,1) | |
| delivery_time | text | '18 min' |
| is_available | boolean | default true |
| sort_order | integer | default 0 |
| created_at | timestamptz | now() |

#### `eq_addresses`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid FK → auth.users | |
| label | text | 'Home', 'Work', etc. |
| street | text | |
| city | text | |
| zip | text | |
| is_default | boolean | default false |
| created_at | timestamptz | now() |

#### `eq_orders`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid FK → auth.users | |
| status | text | pending/confirmed/preparing/on_the_way/delivered/cancelled |
| subtotal | numeric(8,2) | |
| delivery_fee | numeric(8,2) | |
| total | numeric(8,2) | |
| address_snapshot | jsonb | copia del address en el momento del pedido |
| notes | text | instrucciones especiales |
| estimated_minutes | integer | tiempo estimado |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

#### `eq_order_items`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| order_id | uuid FK → eq_orders | |
| menu_item_id | uuid FK → eq_menu_items | |
| qty | integer | > 0 |
| unit_price | numeric(8,2) | precio al momento del pedido |
| item_name | text | copia del nombre |
| item_image | text | copia de la imagen |
| created_at | timestamptz | now() |

### RLS Policies

- **eq_restaurants**: SELECT público, INSERT/UPDATE/DELETE solo admin
- **eq_menu_items**: SELECT público, INSERT/UPDATE/DELETE solo admin
- **eq_addresses**: SELECT/INSERT/UPDATE/DELETE solo el propio user_id
- **eq_orders**: SELECT/INSERT propio user_id; admin ve todos; UPDATE solo admin
- **eq_order_items**: SELECT via order del propio user; INSERT al crear orden

---

## Estructura de archivos (v2.0 objetivo)

```
src/
├── components/
│   ├── cart/           CartDrawer.tsx (con checkout flow)
│   ├── layout/         Navbar.tsx, TopBar.tsx, Footer.tsx
│   ├── product/        FoodCard.tsx, ProductModal.tsx, SkeletonCard.tsx
│   ├── sections/       Hero.tsx, MenuSection.tsx, DealsSection.tsx
│   ├── ui/             Toast.tsx, Spinner.tsx, AuthGuard.tsx
│   └── ErrorBoundary.tsx
├── context/
│   ├── AuthContext.tsx  ← NUEVO
│   ├── CartContext.tsx
│   └── ToastContext.tsx
├── features/products/  productData.ts (fallback local, usar Supabase)
├── hooks/              useKeyPress, useLocalStorage, useFocusTrap
├── lib/
│   └── supabase.ts     ← NUEVO — cliente Supabase
├── pages/
│   ├── Home.tsx
│   ├── NotFound.tsx
│   ├── auth/
│   │   ├── Login.tsx   ← NUEVO
│   │   └── Register.tsx ← NUEVO
│   ├── Checkout.tsx    ← NUEVO
│   ├── Orders.tsx      ← NUEVO
│   ├── OrderDetail.tsx ← NUEVO
│   └── Profile.tsx     ← NUEVO
├── services/
│   └── productService.ts (getProducts, getCategories desde Supabase)
├── types/
│   └── product.ts      (+ tipos de auth, orders, addresses)
├── App.tsx             (Routes completas)
└── main.tsx
```

---

## Rutas (React Router v6)

| Path | Componente | Protegida |
|---|---|---|
| `/` | Home | No |
| `/auth/login` | Login | No (redirect si ya logueado) |
| `/auth/register` | Register | No (redirect si ya logueado) |
| `/checkout` | Checkout | Sí (requiere login) |
| `/orders` | Orders | Sí |
| `/orders/:id` | OrderDetail | Sí |
| `/profile` | Profile | Sí |
| `*` | NotFound | No |

---

## Variables de entorno

### `.env.local` (local, gitignoreado)
```
VITE_SUPABASE_URL=https://rkeqsfmfzacazgzacoin.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
```

### Vercel (Production)
Configurar en Vercel Dashboard → Project → Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## PLAN DE IMPLEMENTACIÓN v2.0

### BLOQUE A — Infraestructura Backend (Supabase)

- [x] A1 · Migración: crear tablas eq_restaurants, eq_menu_items, eq_addresses, eq_orders, eq_order_items
- [x] A2 · Migración: RLS policies en todas las tablas eq_*
- [x] A3 · Migración: trigger auto-create profile en auth.users insert
- [x] A4 · Seed: insertar restaurantes y menu items desde productData

### BLOQUE B — Cliente & Auth Frontend

- [x] B1 · Crear src/lib/supabase.ts (cliente Supabase)
- [x] B2 · Crear .env.local con credenciales
- [x] B3 · Crear src/context/AuthContext.tsx (user, login, register, logout, loading)
- [x] B4 · Actualizar main.tsx (AuthProvider wrapping App)
- [x] B5 · Crear src/components/ui/AuthGuard.tsx (protected route wrapper)
- [x] B6 · Actualizar App.tsx (todas las rutas + AuthGuard en rutas protegidas)

### BLOQUE C — Páginas de Auth

- [x] C1 · src/pages/auth/Login.tsx (form email/password + Google OAuth + link a register)
- [x] C2 · src/pages/auth/Register.tsx (form nombre/email/password + link a login)
- [x] C3 · Actualizar Navbar para mostrar user avatar / botón login / logout

### BLOQUE D — Data desde Supabase

- [x] D1 · Actualizar src/services/productService.ts para leer de eq_menu_items
- [x] D2 · Actualizar Home.tsx para usar async data con useEffect + loading state
- [x] D3 · Actualizar types/product.ts con tipos completos (MenuItem, Restaurant, Order, Address)

### BLOQUE E — Checkout & Órdenes

- [x] E1 · src/pages/Checkout.tsx (dirección + resumen + confirmar pedido → inserta en eq_orders + eq_order_items)
- [x] E2 · src/pages/Orders.tsx (historial de órdenes del usuario)
- [x] E3 · src/pages/OrderDetail.tsx (detalle de una orden con status timeline)
- [x] E4 · Actualizar CartDrawer: "Checkout →" navega a /checkout (solo si logueado, si no redirige a /auth/login)

### BLOQUE F — Perfil

- [x] F1 · src/pages/Profile.tsx (datos personales editables + direcciones guardadas)

### BLOQUE G — Deploy

- [x] G1 · Configurar env vars en Vercel
- [x] G2 · Verificar build de producción exitoso
- [x] G3 · Push a main → deploy automático

---

## NOTAS DE ARQUITECTURA v2.0

- **Supabase Auth**: sesión persistida en localStorage automáticamente por el SDK.
- **Profile trigger**: `auth.users` → trigger → `public.profiles` insert automático con role='cliente'.
- **Cart + Auth**: el carrito vive en localStorage (como ahora). Al hacer checkout, si el usuario no está logueado, se redirige a /auth/login?redirect=/checkout. Después del login, regresa al checkout con el carrito intacto.
- **Order flow**: Checkout → validar dirección → llamar Supabase para insertar eq_orders + eq_order_items en una transacción → limpiar carrito → navegar a /orders/:id.
- **RLS**: anon puede leer eq_restaurants y eq_menu_items. Solo authenticated puede insertar órdenes, ver sus direcciones, etc.
- **Prefijo eq_**: permite coexistir con el POS sin conflictos. El POS usa `products`, `categories`, `sales` en español. El food delivery usa `eq_menu_items`, `eq_restaurants`, `eq_orders` en inglés.

---

## COMANDOS RÁPIDOS

```bash
npm run dev          # Dev server en puerto 3000
npm run lint         # ESLint 0 errores
npm test             # 32 tests, 0 errores
npm run build        # Build de producción
npm run preview      # Previsualizar build
```

---

## PROGRESO v1.0 (COMPLETADO)

### Bugs ✅
- [x] B1–B8 todos corregidos

### Fase 1–8 ✅ (Fundamentos, Tests, TS, A11y, SEO, CI/CD, Features, Refactors)
- Todos los ítems marcados completos

---

## PROGRESO v2.0

### Bloque A — Backend Supabase
- [x] A1 · Tablas eq_* creadas
- [x] A2 · RLS policies
- [x] A3 · Trigger auto-profile
- [x] A4 · Seed datos

### Bloque B — Cliente & Auth Infrastructure
- [x] B1 · supabase.ts
- [x] B2 · .env.local
- [x] B3 · AuthContext.tsx
- [x] B4 · main.tsx actualizado
- [x] B5 · AuthGuard.tsx
- [x] B6 · App.tsx rutas completas

### Bloque C — Auth Pages
- [x] C1 · Login.tsx
- [x] C2 · Register.tsx
- [x] C3 · Navbar con auth state

### Bloque D — Data Supabase
- [x] D1 · productService.ts → Supabase
- [x] D2 · Home.tsx async data
- [x] D3 · types actualizados

### Bloque E — Checkout & Orders
- [x] E1 · Checkout.tsx
- [x] E2 · Orders.tsx
- [x] E3 · OrderDetail.tsx
- [x] E4 · CartDrawer → /checkout

### Bloque F — Profile
- [x] F1 · Profile.tsx

### Bloque G — Deploy
- [x] G1 · Vercel env vars
- [x] G2 · Build OK
- [x] G3 · Deploy

---

*Plan v2.0 — Fecha: 2026-04-13*
*Stack: React 18 + TypeScript + Supabase + Vercel*

---

## PLAN v3.0 — Mejoras pendientes (próximos pasos)

> Estado actual: app funcional y desplegada. Google OAuth requiere config manual.
> Bugs conocidos resueltos en v2.1: modal de producto usa createPortal (fix transform stacking context).

---

### BLOQUE H — Google OAuth (configuración manual requerida)

**El código ya está correcto** (`signInWithGoogle` en AuthContext.tsx). Falta solo configuración:

- [ ] H1 · Supabase Dashboard → Authentication → Providers → Google → **Enable**
  - Callback URL que Supabase muestra: `https://rzevfdpsozjrdqixxiex.supabase.co/auth/v1/callback`
- [ ] H2 · Google Console (`console.cloud.google.com`) → APIs & Services → Credentials → Create OAuth 2.0 Client ID
  - Application type: **Web application**
  - Authorized redirect URIs: `https://rzevfdpsozjrdqixxiex.supabase.co/auth/v1/callback`
  - Authorized JavaScript origins: `https://equilibrium-food.vercel.app`
- [ ] H3 · Copiar **Client ID** y **Client Secret** de Google Console → pegar en Supabase Google provider settings → Save
- [ ] H4 · Verificar login con Google en producción

---

### BLOQUE I — UX & Features pendientes

- [ ] I1 · **Página de confirmación de orden**: mejorar OrderDetail con opción de "descargar/imprimir ticket" (window.print() + CSS @media print)
- [ ] I2 · **Filtros de precio y rating** en MenuSection (slider de precio, orden por rating)
- [ ] I3 · **Paginación o infinite scroll** en el menú (actualmente carga todos los items)
- [ ] I4 · **Restaurantes page**: `/restaurants` con listado de restaurantes y su menú individual
- [ ] I5 · **Favoritos**: guardar items favoritos en `eq_favorites` (tabla nueva, user_id + menu_item_id)
- [ ] I6 · **Tracking en tiempo real**: actualización de status de orden sin recargar (Supabase Realtime subscriptions)
- [ ] I7 · **Re-order**: botón en OrderDetail para volver a añadir los mismos items al carrito

---

### BLOQUE J — Auth & Onboarding

- [ ] J1 · **Email confirmation flow**: actualmente Supabase envía email de confirmación. Considerar deshabilitar para demo o añadir página "check your email"
- [ ] J2 · **Forgot password**: página `/auth/forgot-password` con `supabase.auth.resetPasswordForEmail()`
- [ ] J3 · **Password reset**: página `/auth/reset-password` para el callback de reset (con `supabase.auth.updateUser()`)
- [ ] J4 · **Redirect after login**: si el usuario llegó desde `/checkout`, redirigir de vuelta al checkout después de login (ya parcialmente implementado con `location.state.from`)

---

### BLOQUE K — Calidad & Performance

- [ ] K1 · **Más tests**: añadir tests de integración para Checkout, Orders, y AuthContext
- [ ] K2 · **Error boundaries** por ruta (actualmente solo uno global en main.tsx)
- [ ] K3 · **Image optimization**: usar WebP o lazy-loading mejorado con `IntersectionObserver`
- [ ] K4 · **SEO dinámico**: meta tags por página con react-helmet-async (OpenGraph para redes sociales)
- [ ] K5 · **Toast de error global**: manejar errores de red en productService y mostrar toast
- [ ] K6 · **Skeleton en Profile y Orders**: actualmente muestran estado vacío sin skeleton durante carga

---

### BLOQUE L — Admin Panel (futuro)

- [ ] L1 · Ruta `/admin` protegida por `role = 'admin'`
- [ ] L2 · CRUD de restaurantes y menu items desde UI
- [ ] L3 · Vista de todas las órdenes con filtros de status y cambio de estado
- [ ] L4 · Dashboard con métricas (órdenes por día, revenue, items más vendidos)

---

## BUGS CONOCIDOS / FIXES APLICADOS (v2.1)

| Bug | Causa | Fix |
|---|---|---|
| Clic en card no abría modal | `motion.div layout` crea transform stacking context, `position:fixed` relativo al contenedor | `createPortal(modal, document.body)` en ProductModal.tsx |
| Google OAuth no funciona | Falta configuración en Supabase + Google Console | Ver Bloque H arriba |
| Peer deps en Vercel build | `@eslint/js@10` + `eslint@9` conflicto | `.npmrc` con `legacy-peer-deps=true` |

---

## ESTADO DE BASE DE DATOS (post v2.0)

| Migración | Descripción | Estado |
|---|---|---|
| 001_create_tables | Tablas principales + índices + triggers | ✅ Aplicada |
| 002_rls_policies | Políticas RLS iniciales | ✅ Aplicada |
| 003_auto_profile_trigger | Trigger auto-create profile en signup | ✅ Aplicada |
| 004_seed_data | 8 restaurantes + 8 menu items | ✅ Aplicada |
| 005_rls_performance_fixes | search_path en set_updated_at + índice menu_item_id | ✅ Aplicada |
| 006_rls_unified_policies | Políticas unificadas sin overlap, auth.uid() optimizado | ✅ Aplicada |

**Advisor status**: 0 security issues · 0 performance warnings · INFO unused indexes (esperados en DB nueva)

---

*Plan v3.0 — Fecha: 2026-04-13*
