# CLAUDE.md — Equilibrium Food

## Estado actual
App full-stack live en Vercel. Auth completo (email + forgot/reset password). Checkout → Orders → OrderDetail con realtime tracking, print ticket, re-order y **order ratings** (1-5 estrellas + comentario, editable). Admin panel completo con 4 tabs (Dashboard con reviews panel · Orders con realtime · Menu CRUD · Restaurants CRUD). Favoritos con Supabase. LazyImage con IntersectionObserver. 52 tests en 7 archivos, 0 lint errors, 9 migraciones, 0 advisor warnings. Navegación/redirects auditada y corregida (M8). Layout completo en todas las páginas (Orders, OrderDetail, Profile, NotFound). TrackOrder page activa.

---

## Infra

| Recurso | Valor |
|---|---|
| Supabase Project | `rzevfdpsozjrdqixxiex` |
| Vercel Project | `equilibrium-food` · `prj_XXUmtmLkTo8nPmfiuoIF6RfGFGGE` |
| Vercel Team | `team_y858qJaSBj8WXao7BeeuNIlO` |
| POS (NO tocar) | `rkeqsfmfzacazgzacoin` |

Stack: React 18 + TS + Vite 5 · Vanilla CSS · Framer Motion 11 · React Router v6 · Supabase · Vercel

## Comandos
```bash
npm run dev     # puerto 3000
npm run lint    # 0 errores
npm test        # 52 tests, 7 archivos (pool: forks, maxForks: 2)
npm run build
```

## Arquitectura clave
- **DB tables**: `restaurants`, `menu_items`, `orders`, `order_items`, `addresses`, `profiles`, `favorites` (sin prefix eq_)
- **RLS**: anon lee restaurantes/menú. Auth requerida para órdenes/favoritos. Admin para writes.
- **Auth**: `AuthContext` → `supabase.auth` · `AuthGuard` / `AdminGuard` para rutas protegidas
- **Cart**: localStorage key `'cart'`. Checkout requiere login → redirect post-login.
- **Favorites**: `FavoritesContext` — optimistic updates, NOOP seguro fuera del provider (no throw).
- **LazyImage**: IntersectionObserver (rootMargin 200px) + fade-in, placeholder data URI, drop-in `<img>`. `realSrcSet` ref para detección fiable de onLoad; checks `el.complete` para imágenes cacheadas.
- **Modal fix**: `createPortal(modal, document.body)` en `ProductModal.tsx`. `AnimatePresence` en `FoodCard` (fuera del portal) para animación enter/exit correcta.
- **Tests**: vitest `pool: 'forks'`, `maxForks: 2` evita OOM de jsdom. `vi.hoisted()` para mocks con hoisting. `vi.unmock()` para override de setup.js en archivos específicos.
- **Migrations**: 001 tablas · 002 RLS · 003 trigger auto-profile · 004 seed · 005 RLS perf · 006 RLS unified · 007 favorites · 008 storage bucket
- **Storage**: bucket `images` (public). Upload via `src/lib/uploadImage.ts`. Transform/WebP via `src/lib/imageUrl.ts` → `transformImageUrl(url, {width, quality})`. `ImageUploadField` component: file picker + URL fallback + thumbnail preview.
- **Push notifications**: VAPID keys generated (public key in `.env.local` + Vercel, private key in Supabase secret N1). Service worker at `public/sw.js`. Subscription hook `useNotifications` stores endpoint+keys in `push_subscriptions` table. Bell button in Navbar for logged-in users. Admin order status change fires `supabase.functions.invoke('push-notify')`. Edge Function `push-notify` deployed.
- **Order reviews**: `order_reviews` table (migration 009). One review per order (UNIQUE). RLS: users own-row insert/update on delivered orders only, admin read all. `StarRating` component (`src/components/ui/StarRating.tsx`). Review form appears in OrderDetail when status = 'delivered'; editable after submit. Admin dashboard shows count + avg rating + recent reviews panel.
- **Navegación anchor**: Navbar links `Menu`/`Deals` usan `<Link to="/#menu">` / `<Link to="/#deals">` (internal). Handler `handleAnchorLink` en Navbar scrollea suavemente si ya estás en `/`, si no React Router navega a `/#hash`. `useEffect` en `Home.tsx` scrollea al `location.hash` con 80ms delay. Footer: `Restaurants` → `<Link to="/restaurants">`, `Menu`/`Deals` → `<Link to="/#...">`.
- **Auth redirect chain**: `AuthGuard` pasa `{ from: location }` a login state. `Login` lee `from.pathname` y redirige post-login. `Register` ahora propaga `from` state al navegar a login (post-confirmación y link "Sign in").
- **Layout universal**: `Orders`, `OrderDetail`, `Profile`, `NotFound` incluyen `TopBar + Navbar + Footer`. `Checkout` se mantiene minimal (flujo tipo Amazon sin navbar). `TrackOrder` page nueva en `/track-order` (AuthGuard): redirige automáticamente al OrderDetail del pedido activo más reciente; si no hay activo muestra empty state.
- **Footer coming soon**: Links de Company y Legal muestran toast `info` "X — coming soon!" via `handleComingSoon`. Footer `Track order` también vinculado a `/track-order`.
- **Deals section**: Añadido deal "Vegan Delight" (tercer card) para coincidir con TopBar ticker "🥗 Vegan Delight new arrival".
- **SEO universal**: `<Seo>` en todos los pages — Orders ("Your orders"), OrderDetail ("Order #…"), Profile ("My profile"), TrackOrder ("Track order"), NotFound ("Page not found"), Checkout ("Checkout"), Login ("Sign in"), Register ("Create account" / "Check your email"), ForgotPassword ("Reset password"), ResetPassword ("Set new password").
- **Footer Track order**: Link en columna Explore apunta a `/track-order` (interno con `<Link>`).

---

## PRÓXIMOS PASOS


### Completado ✓
- Auth completo (email, forgot/reset, redirect post-login, email confirmation)
- Checkout → Orders → OrderDetail (print ticket, re-order, realtime status via Supabase)
- Restaurants list + detail pages
- Sort/filter + load-more en MenuSection
- Favoritos (FavoritesContext + DB + FoodCard heart button)
- Admin panel 4 tabs: dashboard stats · orders con realtime · menu CRUD · restaurants CRUD
- Error boundaries por ruta · SEO · Toast de error · Skeletons
- LazyImage con IntersectionObserver en FoodCard
- 52 tests en 7 archivos (CartContext, FoodCard, cart-flow, Toast, auth-context, checkout-validation, favorites-context)
- Fix: LazyImage images invisible (ref-based onLoad, cached-image check, opacity en CSS transition)
- Fix: modal no abría (AnimatePresence movido a FoodCard fuera del portal, keys en motion.divs)
- Fix: Navbar Menu/Deals links rotos desde páginas no-home (#menu/#deals → /#menu//#deals con scroll handler)
- Fix: Footer Restaurants apuntaba a # → /restaurants. Footer Menu/Deals corregidos igual
- Fix: Register no propagaba from redirect state al volver a login post-confirmación
- Fix: Orders, OrderDetail, Profile, NotFound sin Navbar/Footer
- Fix: Track order era "Soon" sin ruta — ahora página real /track-order con auth + redirect a pedido activo
- Fix: Footer Company/Legal links dead (#) — ahora muestran coming soon toast
- Fix: DealsSection incompleta — añadido Vegan Delight para coincidir con TopBar
- Fix: SEO faltante en 10 páginas (Orders, OrderDetail, Profile, TrackOrder, NotFound, Checkout, Login, Register, ForgotPassword, ResetPassword)
- Fix: Footer Track order link apuntaba a # → /track-order

### M — Siguientes mejoras
- [ ] M1 · Google OAuth (H1-H4 arriba)
- [x] M2 · Supabase Storage bucket `images` (5 MB, WebP/PNG/JPEG/AVIF) · RLS admin write + public read · `uploadImage()` helper · `transformImageUrl()` render API · `ImageUploadField` en admin menu + restaurants modals · 8 migraciones
- [x] M3 · Infinite scroll en /restaurants con IntersectionObserver (PAGE_SIZE 6)
- [x] M4 · Realtime en admin restaurants tab (auto-refresh si otro admin edita)
- [x] M5 · Notificaciones push (Web Push API + VAPID + Edge Function push-notify + SW + bell en navbar)
- [x] M6 · Página de perfil con historial de favoritos + quick-add al carrito
- [x] M7 · Order ratings: 1-5 estrellas + comentario en OrderDetail (delivered) · `order_reviews` table + RLS · `StarRating` component · Admin dashboard reviews panel
- [x] M8 · Audit navegación/redirects: Navbar Menu+Deals funcionan desde cualquier ruta · Footer Restaurants corregido · Register preserva from state
- [x] M9 · Layout universal: TopBar+Navbar+Footer en Orders/OrderDetail/Profile/NotFound · Track order → /track-order real page · Footer coming-soon toast · Vegan deal en DealsSection
- [x] M10 · SEO en los 10 pages faltantes · Footer Track order → /track-order · build + lint 0 errores

### Pendientes solo manuales (requieren dashboards externos)
- [ ] N1 · Supabase → Edge Functions → push-notify → Secrets → `VAPID_PRIVATE_KEY`
- [ ] N2 · Vercel → Settings → Env Vars → `VITE_VAPID_PUBLIC_KEY`
- [ ] H1-H4 · Google OAuth (Supabase + Google Console)

---
*v5.4 · 2026-04-19*
