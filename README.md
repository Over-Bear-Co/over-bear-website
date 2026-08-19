# OVERBEAR

Catalog landing page for **OVERBEAR** — an oversized streetwear brand cut for larger builds ("ไซซ์หมี"). A motion-heavy, single-page marketing site. There is no cart or checkout: the product grid is a showcase, and the only interactive conversion point is the "เข้าถ้ำ" newsletter form.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · plain CSS (no UI framework)
- **Rendering:** the page is prerendered as fully static HTML (`○ Static`); client components handle scroll/pointer motion and the mobile menu.

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
                     + BrandMark (shared logo mark)
  lib/
    motion.ts        Shared rAF Engine singleton + prefersReducedMotion / isFinePointer helpers
    products.ts      Product data (`price` is retained as reference data; the catalog does not render it)
public/brand/        Brand SVGs (overbear-icon-v2 / overbear-logo-v2)
legacy/              Pre-React standalone HTML origin of the design (reference only; not built)
```

## Architecture notes

- **Motion engine** (`lib/motion.ts`): one `requestAnimationFrame` loop drives every scroll/pointer effect. Each effect registers an `EngineItem`; an `IntersectionObserver` gates its `active` flag so off-screen and settled items stop stepping and the loop sleeps.
- **No shared client state:** there is no React context anywhere. The mobile menu is the only stateful UI, and `Nav` owns it outright — including the background `inert` toggle on `main`/`footer` while the menu overlay is open, and the Escape-to-close handler. The newsletter form is an intentionally stubbed demo (no backend/persistence).
- **Accessibility:** reduced-motion has a full static fallback; the Thai story reveal segments graphemes with `Intl.Segmenter` (never `split('')`) and keeps the original text for screen readers.
- **Imagery:** section media are CSS/SVG placeholders. Replace them with `next/image` (mark the hero `priority` — it is the LCP element); see the `แทนที่ .ph …` comments.

## Design tokens

Warm near-black (`--ink`) + bone type (`--bone`) + acid-lime accent (`--acid`) + kraft tan (`--tan`). Fonts: Anton (display) / Archivo (body) / Kanit (Thai display fallback) / Space Mono (tags & numerics).
