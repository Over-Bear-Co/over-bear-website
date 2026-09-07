# OVERBEAR

Homepage for **OVERBEAR** — a plus-size menswear brand cut for larger builds ("ไซซ์หมี"), sizes **XL–5XL**. Single-page, Thai-first.

**It is a catalog, not a shop.** There is no cart, no checkout, no prices, no wishlist and no search — the product grid is a showcase, and the only interactive conversion point is the newsletter form at `#den`. The cart was built and deliberately removed twice (`528bef0`, `1a8248b`); do not reintroduce commerce UI without a backend behind it.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · plain CSS (no UI framework)
- **Rendering:** fully static HTML (`○ Static`). Four client components: `Nav` (mobile menu), `Newsletter` (form), `SizeGuide` (the size recommender dialog) and `Reveal` (the scroll-reveal observer). Everything else is a server component.

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm run start          # serve the production build
npx eslint src         # `next lint` was removed in Next 16
```

## Where the design comes from

The layout is a port of `Overbear-Homepage.html` — a Google Stitch mockup of a full e-commerce homepage. Values were read off the rendered DOM, not eyeballed: container `1400px`, three alternating cream grounds, card radius `10px`, type scale 12–43px, and the per-section grid ratios (story `397:598:265`, built `401:382:489`, …).

**Four things were deliberately *not* copied:**

| Mockup has | This site does | Why |
|---|---|---|
| Prices, SALE badges, strikethrough | No prices anywhere | Catalog-only; `price` stays in `products.ts` as reference data |
| Cart badge, wishlist, search | None | No backend; cart was removed twice already |
| `PLUS SIZE 2XL–6XL` | `XL–5XL` | `lib/sizes.ts` holds real garment measurements for XL–5XL only; there is no 6XL data |
| Fake contact data (`02-123-4567`, `hello@overbear.co.th`) | Omitted | Shipping placeholder contact details would be worse than none — see the ⚠️ in `Footer.tsx` |

**The mockup is not responsive** — at a 390px viewport it overflows to 1320px and the whole document contains one media query. Every breakpoint here was designed from scratch.

## Project structure

```
src/
  app/
    layout.tsx    Root layout: metadata, next/font (Anuphan + EB Garamond), .js flag script
    page.tsx      Server component composing the 13-block stack in mockup order
    globals.css   Design tokens + every component style + responsive + reduced-motion
    icon.svg      Favicon (auto-linked by the App Router metadata convention)
  components/     One file per block, in page order:
                    Topbar · Nav* · Hero · BestSellers · TrustBar · Story · WhyOverbear
                    FabricDetail · BuiltForBiggerDays · CustomerVoice · ShopByCategory
                    PromoBanner · Newsletter* · Footer          (* = client component)
                  Shared: Frame (photo slot) · Placeholder (empty slot) · Reveal* · icons
                  Size guide: SizeGuide* (dialog + form) · FitFigure (SVG) · lib/fit.ts (engine)
  lib/
    products.ts   6 colourways. `price` and `unit` are reference data; no card renders them
    sizes.ts      Single source of truth for the size range. Change the range here, then
                  grep for the label — Topbar, Hero badge and product cards all repeat it
    fit.ts        Size recommendation engine. Pure, no React — `scripts/verify-fit.ts` runs it
                  directly under Node. Model constants and their limits: see the design spec in
                  docs/superpowers/specs/
public/brand/     Brand SVGs — kept, but no longer referenced by code: the nav
                  wordmark is now live text (EB Garamond), following the mockup
public/media/     18 images, every one referenced: hero/room (hero background) ·
                  hero/model-cutout (LCP; a WebP with a real alpha channel — the hero
                  layout depends on it, see Hero.tsx) ·
                  promo/rack · story/model · product/ (6) · fabric/ (4) · street/ (4)
legacy/           Pre-React standalone HTML origin (reference only; not built)
code.html         Earlier Stitch capture (reference only; not built)
Overbear-Homepage.html   The mockup this layout was ported from (reference only; not built)
```

## Architecture notes

- **No motion engine.** The previous design ran a shared `requestAnimationFrame` loop (`lib/motion.ts`) for hero parallax and a pointer-tracked spotlight; both are gone, and so are those files. All that remains is one `IntersectionObserver` in `Reveal.tsx` that adds `.in` once per element and unobserves it. Under `prefers-reduced-motion` it adds `.in` to everything up front and never observes.
- **The hero background** (`.hero__bg` in `Hero.tsx`): a soft interior still, `hero/room.jpg`,
  1920x640 and only 60KB — the source is smooth gradients, so it compresses to almost nothing.
  `object-position: right center` keeps the arch and the vase, since a 3:1 source in a ~2:1 box
  crops the sides.

  Two contrast values here were measured off this image, not chosen. The hero lead uses `--text-2`
  where every other section uses `--text-3`: the darkest pixel under the copy is `#c4ad99`, where
  `--text-3` scores 2.47:1 and `--text-2` reaches 6.24:1. And `.hero__badge` borders in `--red`
  rather than `--red-ink`, because the badge is delimited either by its ring (over bright wall) or
  by its opaque cream fill (over shadow), and at the mid-tone `#ae9681` both were under 3:1 with
  `--red-ink` (2.47 and 2.50); `--red` lifts the ring to 3.35:1. Rendered-page results against
  actual glyphs: h1 11.54:1, sub 7.44:1, lead 6.92:1.

  **Sample glyph rectangles, not element boxes.** `h1`'s box spans the grid column out to 48% of the
  viewport while its glyphs stop at 26%, so box-sampling reports failures from bare background the
  type never touches — it produced a phantom "sub 2.98:1" while auditing this change.

- **`Frame` vs `Placeholder`.** Both render `.frame`/`.ph`, which share their radius, background and clipping rules. Swapping one for the other never moves the layout — that is the point. Every slot currently has a real photograph; `Placeholder` survives as the fallback for a `Product` with no `image`.
- **`next/image` with `fill` needs a sized parent.** `.frame` provides `position:relative`; the caller provides height via `aspect-ratio` or the grid. Watch out for `align-items`: `.fcard--media` must set `align-items:stretch` because `.fcard` sets `flex-start`, and in a column flex container that collapses the frame to zero width — `aspect-ratio` then multiplies zero and the photo vanishes.
- **Accessibility:** WCAG AA is the standard. Every text/background pair in the palette clears 4.5:1 and the input border clears 3:1 (1.4.11); decorative card borders are intentionally below 3:1, which that criterion exempts. There is no fourth text tier — `--text-3` clears AA by only 0.36, so any lighter tier that still passed would be visually indistinguishable from it.
- **Replacing a photo:** prefer a new filename over overwriting one. `next/image` keys its cache on `url + w + q`, not on file contents, so reusing a path serves the old bytes from `.next/dev/cache/images` (dev) or `.next/cache/images` (`next start`) until those are deleted — and in production from the browser and CDN too. `curl -sI '<origin>/_next/image?url=…'` and check `X-Nextjs-Cache: HIT|MISS` to tell cache from source.

## Design tokens

Cream grounds (`--bg` `#f8f5ef`, `--bg-warm`, `--surface`) · near-black type (`--text` `#16181a`) · deep red for surfaces (`--red` `#8b1719`, white on it = 9.4:1) and a lighter red for type on cream (`--red-ink` `#a0342e`, 6.4:1). Two reds are needed because no single value serves both roles on a light ground.

Fonts: **Anuphan** (everything — covers Thai and Latin in one family, which is why no separate Thai fallback is needed) and **EB Garamond** (the `OVERBEAR` wordmark only).

## Known gaps

- `Footer.tsx` — `SOCIAL` and `CONTACT` are empty arrays awaiting real handles, phone, email and hours. Policy links (shipping, returns, FAQ) have no destinations yet.
- `Newsletter.tsx` — client-side only; submitting does not persist anything.
- `ShopByCategory` tiles and the `BestSellers` "ขอแคตตาล็อกเต็ม" link point back into the page because there are no category pages yet.
