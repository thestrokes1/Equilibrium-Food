# CLAUDE.md — Equilibrium Food

## Estado actual
App full-stack live en Vercel. Auth completo (email + forgot/reset password). Checkout → Orders → OrderDetail con realtime tracking, print ticket y re-order. Admin panel completo con 4 tabs (Dashboard · Orders con realtime · Menu CRUD · Restaurants CRUD). Favoritos con Supabase. LazyImage con IntersectionObserver. 52 tests en 7 archivos, 0 lint errors, 7 migraciones, 0 advisor warnings.

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
- **Migrations**: 001 tablas · 002 RLS · 003 trigger auto-profile · 004 seed · 005 RLS perf · 006 RLS unified · 007 favorites

---

## PRÓXIMOS PASOS

### H — Google OAuth (solo config manual, código listo)
- [ ] H1 · Supabase Dashboard → Auth → Providers → Google → Enable. Callback: `https://rzevfdpsozjrdqixxiex.supabase.co/auth/v1/callback`
- [ ] H2 · Google Console → OAuth 2.0 Client ID · redirect URI = callback · origin = `https://equilibrium-food.vercel.app`
- [ ] H3 · Pegar Client ID + Secret en Supabase → Save
- [ ] H4 · Verificar en producción

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

### M — Siguientes mejoras
- [ ] M1 · Google OAuth (H1-H4 arriba)
- [ ] M2 · Supabase Storage para imágenes + transform API (WebP/resize)
- [ ] M3 · Infinite scroll en /restaurants (actualmente carga todo)
- [ ] M4 · Realtime en admin restaurants tab (auto-refresh si otro admin edita)
- [ ] M5 · Notificaciones push (Supabase Webhooks → Edge Function → Web Push API)
- [ ] M6 · Página de perfil con historial de favoritos

---
*v5.1 · 2026-04-14*
