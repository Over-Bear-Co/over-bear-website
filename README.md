# OVERBEAR

Storefront landing page for **OVERBEAR** — an oversized streetwear brand cut for larger builds ("ไซซ์หมี"). A motion-heavy, single-page marketing site with an in-browser demo cart.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · plain CSS (no UI framework)
- **Rendering:** the page is prerendered as fully static HTML (`○ Static`); client components handle scroll/pointer motion and the cart.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (note: `next lint` was removed in Next 16)
```

## Project structure

```
src/
  app/
    layout.tsx      Root layout: metadata, next/font, beforeInteractive motion-boot script
    page.tsx        Server component composing the section stack
    globals.css     Design tokens + all component styles + motion system + responsive
    icon.svg        Favicon (auto-linked by the App Router metadata convention)
  components/        One file per section (Nav, Hero, Marquee, ProductGrid, Story, Sections, Footer)
                     + CartProvider / CartDrawer (client cart) + BrandMark (shared logo mark)
  lib/
    motion.ts        Shared rAF Engine singleton + prefersReducedMotion / isFinePointer helpers
    products.ts      Product data, sizes, free-ship threshold, currency formatter
public/brand/        Brand SVGs (overbear-icon-v2 tight / -margin safe-area variant / overbear-logo-v2 lockup)
legacy/              Pre-React standalone HTML origin of the design (reference only; not built)
```

## Architecture notes

- **Motion engine** (`lib/motion.ts`): one `requestAnimationFrame` loop drives every scroll/pointer effect. Each effect registers an `EngineItem`; an `IntersectionObserver` gates its `active` flag so off-screen and settled items stop stepping and the loop sleeps.
- **Cart** (`CartProvider`): client-only in-memory state — checkout and the newsletter are intentionally stubbed demos (no backend/persistence). `CartProvider` also owns background `inert` for both the cart drawer and the mobile menu so the two modal layers never fight over it.
- **Accessibility:** reduced-motion has a full static fallback; the Thai story reveal segments graphemes with `Intl.Segmenter` (never `split('')`) and keeps the original text for screen readers.
- **Imagery:** section media are CSS/SVG placeholders. Replace them with `next/image` (mark the hero `priority` — it is the LCP element); see the `แทนที่ .ph …` comments.

## Design tokens

CI palette: deep navy (`--ink`) + off-white type (`--bone`) + warm-sand accent (`--sand`) + bear-brown (`--tan`) + olive-moss meta (`--ash`). Raw brand values live in the `--ci-*` block at the top of `globals.css`; every semantic token derives from them. Fonts: Anton (display) / Archivo (body) / Kanit (Thai display fallback) / Space Mono (tags & numerics).
