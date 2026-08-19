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
  components/        One file per section (Nav, Hero, Marquee, Story, Sections, Footer)
                     + BrandMark (shared logo mark)
                     Ported from the Stitch mockup: IndustrialPrecision, FabricTechnology,
                     HeavyweightArchive, OnTheStreets, IndustrialSpec, SpecificationSheet
                     Sections.tsx now holds only Den (newsletter) + MotionRoot (the shared
                     reveal observer); its SizeTable and Lookbook were superseded by
                     SpecificationSheet and OnTheStreets
  lib/
    motion.ts        Shared rAF Engine singleton + prefersReducedMotion / isFinePointer helpers
    useTorch.ts      The UV-torch spotlight as a hook (Hero + IndustrialPrecision share it)
    products.ts      Product data (`price` is retained as reference data; the catalog does not render it)
public/brand/        Brand SVGs (overbear-icon-v2 / overbear-logo-v2)
public/media/        Photography: hero/ (LCP model shot), story/ (brand-narrative model shot),
                     product/ (6 colourways), street/ (4 fit shots), fabric/ (4 macro details)
legacy/              Pre-React standalone HTML origin of the design (reference only; not built)
code.html            Google Stitch capture the six ported sections came from (reference only; not built)
```

## Architecture notes

- **Motion engine** (`lib/motion.ts`): one `requestAnimationFrame` loop drives every scroll/pointer effect. Each effect registers an `EngineItem`; an `IntersectionObserver` gates its `active` flag so off-screen and settled items stop stepping and the loop sleeps.
- **No shared client state:** there is no React context anywhere. The mobile menu is the only stateful UI, and `Nav` owns it outright — including the background `inert` toggle on `main`/`footer` while the menu overlay is open, and the Escape-to-close handler. The newsletter form is an intentionally stubbed demo (no backend/persistence).
- **Accessibility:** reduced-motion has a full static fallback; the Thai story reveal segments graphemes with `Intl.Segmenter` (never `split('')`) and keeps the original text for screen readers.
- **Imagery:** real photographs live in `public/media/` and are rendered with `next/image` inside a `.frame` wrapper (`position:relative` + `overflow:hidden`, so `fill` has a sized parent). The hero shot carries `priority` — it is the LCP element and must not lazy-load. Every section now ships a real photograph; `.ph` (the bear-SVG placeholder) survives only as the fallback for a product with no `image`, and `.frame` matches its border, radius and stacking so the two sit side by side without a seam. Section photos top out at 512px on the long edge so large panels are upscaled (the hero is 1024px). `Product.image` is optional: a product with no photograph falls back to `.ph` rather than borrowing another colourway's shot — all six colourways are photographed today, so no card currently takes that path.
- **Replacing a photo:** prefer a new filename over overwriting one. `next/image` keys its cache on `url + w + q`, not on file contents, so reusing a path serves the old bytes from `.next/dev/cache/images` (dev) or `.next/cache/images` (`next start`) until those are deleted — and in production from the browser and CDN too. `curl -sI '<origin>/_next/image?url=…'` and check `X-Nextjs-Cache: HIT|MISS` to tell cache from source.

## Design tokens

Warm near-black (`--ink`) + bone type (`--bone`) + acid-lime accent (`--acid`) + kraft tan (`--tan`). Fonts: Anton (display) / Archivo (body) / Kanit (Thai display fallback) / Space Mono (tags & numerics).
