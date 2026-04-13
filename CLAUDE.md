# CLAUDE.md — Equilibrium Food

## Estado actual
App full-stack live en Vercel. Auth email/password funcional. Checkout → Orders → OrderDetail completo. Google OAuth pendiente de config manual. 32 tests, 0 lint errors, 6 migraciones aplicadas, 0 advisor warnings.

---

## Infra

| Recurso | Valor |
|---|---|
| Supabase Project | `rzevfdpsozjrdqixxiex` · `https://rzevfdpsozjrdqixxiex.supabase.co` |
| Vercel Project | `equilibrium-food` · `prj_XXUmtmLkTo8nPmfiuoIF6RfGFGGE` |
| Vercel Team | `team_y858qJaSBj8WXao7BeeuNIlO` |
| POS (NO tocar) | `rkeqsfmfzacazgzacoin` |

Stack: React 18 + TS + Vite 5 · Vanilla CSS · Framer Motion 11 · React Router v6 · Supabase · Vercel

## Comandos
```bash
npm run dev     # puerto 3000
npm run lint    # 0 errores
npm test        # 32 tests
npm run build
```

## Arquitectura clave
- **DB prefix `eq_`**: tablas `eq_restaurants`, `eq_menu_items`, `eq_addresses`, `eq_orders`, `eq_order_items`, `profiles`
- **RLS**: anon lee restaurantes/menú. Auth requerida para órdenes/direcciones. Admin para writes.
- **Auth**: `AuthContext` → `supabase.auth` · sesión en localStorage · `AuthGuard` para rutas protegidas
- **Cart**: localStorage. Checkout requiere login → redirect `/auth/login?redirect=/checkout`
- **Modal fix (v2.1)**: `createPortal(modal, document.body)` en `ProductModal.tsx` — escapar transform stacking context de `motion.div layout`
- **DB migrations**: 001 tablas · 002 RLS · 003 trigger auto-profile · 004 seed · 005 RLS perf fixes · 006 RLS unified (0 warnings)

---

## PRÓXIMOS PASOS

### H — Google OAuth (solo config, código ya correcto)
- [ ] H1 · Supabase Dashboard → Auth → Providers → Google → Enable. Callback: `https://rzevfdpsozjrdqixxiex.supabase.co/auth/v1/callback`
- [ ] H2 · Google Console → OAuth 2.0 Client ID (Web) · redirect URI = callback de arriba · origin = `https://equilibrium-food.vercel.app`
- [ ] H3 · Pegar Client ID + Secret en Supabase → Save
- [ ] H4 · Verificar en producción

### I — UX Features
- [x] I1 · Print ticket: `window.print()` + `@media print` CSS en OrderDetail
- [x] I2 · Filtros precio/rating en MenuSection — sort select: default/top rated/price↑/price↓
- [ ] I3 · Infinite scroll o paginación en menú
- [ ] I4 · Página `/restaurants` con listado y menú individual
- [ ] I5 · Favoritos: tabla `eq_favorites` (user_id + menu_item_id)
- [ ] I6 · Realtime order tracking (Supabase subscriptions)
- [x] I7 · Re-order: botón en OrderDetail para re-añadir items al cart

### J — Auth & Onboarding
- [x] J1 · Email confirmation: página "Check your email" en Register.tsx (ya implementado)
- [x] J2 · Forgot password: `/auth/forgot-password` con `supabase.auth.resetPasswordForEmail()`
- [x] J3 · Reset password: `/auth/reset-password` callback con `supabase.auth.updateUser()`
- [x] J4 · Redirect post-login a `/checkout` — via `AuthGuard` → `state={{ from: location }}` → Login navega a `from.pathname`

### K — Calidad
- [ ] K1 · Tests de integración: Checkout, Orders, AuthContext
- [ ] K2 · Error boundaries por ruta
- [ ] K3 · Image optimization: WebP / IntersectionObserver
- [ ] K4 · SEO dinámico con react-helmet-async (OpenGraph)
- [x] K5 · Toast de error global — productService throws on network error, Home.tsx catches + toast
- [x] K6 · Skeleton en Profile y Orders durante carga (addr skeleton en Profile, list skeleton en Orders)

### L — Admin Panel (futuro)
- [ ] L1 · Ruta `/admin` protegida por `role = 'admin'`
- [ ] L2 · CRUD restaurantes + menu items
- [ ] L3 · Vista órdenes con cambio de status
- [ ] L4 · Dashboard métricas

---
*v3.0 · 2026-04-13*
