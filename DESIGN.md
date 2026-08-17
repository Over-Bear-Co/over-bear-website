# Design System: OVERBEAR

> Source of truth for generating new OVERBEAR screens with Google Stitch.
> Extracted from the live implementation (`src/app/globals.css`, `src/components/*`), not authored from a template.
> **Every value below is real.** Where a number is not listed here, it does not exist — do not invent one.

---

## 1. Visual Theme & Atmosphere

OVERBEAR is a Bangkok oversized-streetwear label cut for larger builds — *"ไซซ์หมี"* (bear size). The interface has to feel like the product: **heavy, dark, unapologetic, and physically substantial.**

The atmosphere is a **darkroom, not a showroom**. Near-black ground, bone type, olive as the only chromatic note, and a constant film-grain haze over everything. Nothing is bright, nothing is clinical, nothing is cute. Type is enormous and crops off the frame edge on purpose — the layout should feel like it cannot contain the brand, the same way the garment does not contain the wearer.

The palette is almost monochrome by design: two achromatic poles with a single desaturated olive between them. Colour is never used to decorate — it appears only where something must be marked as *live* (an eyebrow, a badge, the brand mark, an active state).

The recurring structural device is the **care label**: small monospace uppercase chips with 1px borders and heavy letter-spacing, the kind stitched into a collar. They appear as badges, eyebrows, spec labels, size chips, and footer payment marks. When in doubt about how to present a small piece of metadata, make it a care label.

**Dials:**

| Dimension | Value | Reading |
|---|---|---|
| Creativity | 9 / 10 | Art-directed. Signature devices over safe conventions. |
| Variance | 8 / 10 | Offset asymmetric. Split grids, negative-margin bleeds, vertical rails. |
| Motion | 8 / 10 | Cinematic choreography — orchestrated load, scroll shear, pointer torch. |
| Density | 4 / 10 | Airy sections, generous vertical rhythm. **Exception:** the spec table and size chips run at 7 — all numerals there are monospace. |

**Tone words:** heavy · nocturnal · tactile · confident · warm-dark · workwear-precise
**Anti-tone words:** soft · playful · airy-white · corporate · minimal-Scandinavian · techy

---

## 2. Color Palette & Roles

The palette is **locked**. Three raw CI values, and every usable token is derived from them. Never introduce a hue outside this set.

### Raw CI values (brand sheet — never modify)

| Name | Hex | Role |
|---|---|---|
| Off Black | `#0E0E0E` | Ground |
| Olive | `#6B705C` | Accent |
| Bone | `#F3F1EC` | Light |

Three values, and every usable token derives from them. Each also exists as a **channel triple** (`--ink-rgb`, `--bone-rgb`, `--olive-rgb`) so anything needing alpha composes from the palette instead of re-typing the colour.

### Surfaces — the black ladder

Each step is nudged a few points toward olive so the panels belong to the palette rather than reading as neutral grey.

- **Page Ground** (`#0E0E0E`) — the base canvas for every screen. The whole site is dark; there is no light mode.
- **Lifted Panel** (`#161713`) — one step up. Marquee tape and brand-story band, always fenced with hairline rules top and bottom.
- **Card Surface** (`#1E201A`) — two steps up. Product cards and table headers only.
- **Deep Neutral** (`#232420`) — image-placeholder floor and inset tracks, so photography wells read as *absence of light* rather than as another panel.

### Type colors

- **Bone** (`#F3F1EC`) — primary headings and display type. **17.1:1** on the page ground.
- **Bone Dim** (`#A5A29A`) — body copy, nav links, table cells. **7.6:1**.
- **Ash** (`#8F8C85`) — captions, metadata, footer legal. Sits deliberately *off* the olive axis so it never competes with the accent, and is lifted until it clears AA on **all three** surfaces: **5.8 / 5.4 / 4.9:1** on ground / panel / card. The card surface is the binding constraint.

### Accent — one, and only one

- **Slab** (`#F3F1EC`) — **the bright surface**. Announcement bar, primary button fill, newsletter panel, focus rings, selection highlight, marquee asterisk. Ground-on-slab reads **17.1:1**. Same value as Bone but a different *role*: Bone is type, Slab is surface. Keeping them separate is what lets one move without dragging the other.
- **Accent** (`#949C82`) — **the accent as type**. Eyebrows, the hero period, emphasised words, table column headers, footer section labels, the brand mark. **6.7 / 6.3 / 5.8:1** on ground / panel / card.
- **Accent Raw** (`#6B705C`) — **fill only, never text.** Measured at **3.77 / 3.51 / 3.21:1** — it fails AA on every surface. Use it as a background wash or gradient stop. Bone on top of it is 4.5:1, which passes but only barely, so avoid small text there.

### Hairlines

- **Line** `rgb(var(--bone-rgb) / .14)` — default 1px structural rule, card borders, section fences.
- **Line Strong** `rgb(var(--bone-rgb) / .28)` — care-label borders, hover states, scrollbar thumbs.

### Token names describe roles, not colours

`--slab`, `--accent`, `--accent-raw`, `--ink`, `--bone`. The previous palette named them after what they looked like — `--sand`, `--tan` — and the names became lies the moment the palette changed. A role name survives any number of swaps.

The same lesson applies to alpha: 19 values were once hand-typed as `rgba(246,242,234,.14)`-style literals, which meant a palette change simply did not reach them and every one had to be hunted down by hand. **Never write a raw `rgba(r,g,b,a)` for a palette colour** — compose from the channel triples instead.

### Color rules

1. **Saturation stays low.** The single accent sits near 10% saturation. Never raise it.
2. **Never pure black** (`#000000`) and never pure white (`#ffffff`). The palette's extremes are Off Black `#0E0E0E` and Bone `#F3F1EC` — close to the poles, deliberately not at them.
3. **Raw CI dark values are surfaces; lifted tints are type.** This split is the whole accessibility strategy — do not collapse it.
4. **No second accent.** If a screen seems to need one, it needs better hierarchy instead.
5. **No purple, no neon, no cyan, no gradient-glow.** Streetwear is not a SaaS dashboard.
6. **Grain is mandatory.** A fixed, full-viewport fractal-noise overlay at 5% opacity in `overlay` blend mode sits above everything at all times. It is what keeps the flat near-black feeling like fabric rather than like a void. It is a fixed pseudo-element and must never be animated.

---

## 3. Typography

### The stack

- **Display — Anton**, 400 weight only, uppercase, `line-height: .84`, letter-spacing `.005em` (tightening to `-.02em` at hero scale). Condensed, heavy, poster-grade. Every headline, product name, and spec value.
- **Thai — Kanit**, weights 400 / 700 / 800, Thai subset only. The site's only Thai face, and it serves *every* Thai slot, not just headings — see the fallback chains below. None of the three Latin faces ship Thai glyphs.
- **Body — Archivo**, `clamp(1rem, .96rem + .2vw, 1.075rem)`, `line-height: 1.6`. Measure capped at 40–48ch. Body copy is always Bone Dim, never full Bone.
- **Mono — Space Mono**, 400 and 700. Care labels, eyebrows, buttons, prices, table data, captions, nav links, footer. **All numerals are monospace, everywhere, without exception** — sizes, prices, GSM, measurements, drop numbers.

`font-synthesis: weight none` is set on every display element. Faux-bold on Anton is a visible defect.

### Fallback chains are load-bearing — never inline a font stack

Neither Latin face covers Thai, and CSS font matching runs **per character**. Both stacks therefore carry a Thai step at the end, and both must be used through their token:

```
--display : Anton      → Kanit → Impact → Arial Narrow → sans-serif
--sans    : Archivo    → Kanit → system-ui → -apple-system → Segoe UI → sans-serif
--mono    : Space Mono → ui-monospace → Kanit → system-ui → monospace
```

**Kanit is the site's only Thai face, and it is in all three chains.** Anton, Archivo and Space Mono all ship Latin-only subsets, so every chain needs a Thai step or the Thai in that slot falls to whatever the OS picks. Three weights are loaded, Thai subset only:

| Weight | Serves |
|---|---|
| 800 | Display headings — matched to Anton 400's optical mass |
| 700 | Thai inside bold mono slots: buttons, announcement bar, form status |
| 400 | Thai body copy, table cells, spec labels, product colors |

Because Kanit sits *after* the Latin faces in every chain, its Latin is never reached — Latin and numerals still resolve at Anton / Archivo / Space Mono untouched (verified: `FREE SHIP 1500` measures identically before and after).

### The `฿` trade-off

**`฿` is U+0E3F — it sits in the Thai block, not in Currency Symbols (U+20A0–20CF)** — so it is outside every subset Space Mono ships, and Kanit claims it along with the Thai letters. Measured in the DOM at 16px:

| | Width | Note |
|---|---|---|
| Space Mono digit | `9.80px` | the mono grid every price aligns to |
| `฿` before any fix | `10.91px` | 11% over grid — visibly misaligned |
| `฿` via `system-ui` | `9.77px` | matches the grid — but only on this Mac |
| `฿` via Kanit (current) | `10.10px` | 3% over grid — **identical on every platform** |

`system-ui` is deliberately *not* placed ahead of Kanit. Its 9.77px was a macOS coincidence, not a designed property: on Windows or Android `system-ui` is a different face with an unknown baht width. Kanit is a webfont this site ships, so 10.10px is the same everywhere. **A consistent 3% beats a coincidence that happens to be perfect on one machine.**

**Verify before extending any chain.** A face added on assumption usually does nothing: `Menlo` sat in the mono chain on the belief that it carried `฿`, and measurement showed it does not.

Always use the tokens — never inline `var(--font-mono), monospace` or `var(--font-archivo), system-ui`.

### The scale

| Role | Size | Face |
|---|---|---|
| Hero line | `clamp(3.6rem, 15vw, 13.5rem)` | Display |
| Section heading | `clamp(2.6rem, 8vw, 6rem)` | Display |
| Story / newsletter heading | `clamp(2.4rem, 6vw, 4.5rem)` | Display |
| Spec value | `1.7rem` | Display |
| Product name | `1.35rem` | Display |
| Body | `clamp(1rem, …, 1.075rem)` | Body |
| Button | `.82rem` / `.1em` tracking | Mono 700 |
| Eyebrow | `.72rem` / `.28em` tracking | Mono |
| Care label | `.68rem` / `.16em` tracking | Mono |
| Caption / meta | `.72rem` / `.12em` tracking | Mono |

Hierarchy comes from **face and color**, then size. A Display-face 1.35rem product name outranks a 1.6rem body paragraph, because the face carries the weight.

### Typographic devices

- **The eyebrow rule.** Every eyebrow is preceded by a `1.6em × 1px` horizontal rule in the eyebrow's own color, inline, with `.6em` gap. It is the section's tick mark. Tan by default; Sand when the eyebrow sits on the lifted panel.
- **Outlined second line.** In the hero, line two is `color: transparent` with a `2px` Bone text-stroke. Filled line, then hollow line — never two filled, never two hollow.
- **The tan period.** A single `.` in Tan terminates the hero's first line. It is the only punctuation with color.
- **Spec line.** A monospace string carrying origin and drop number — `EST. 2026 — BANGKOK / DROP 01` — sits in normal flow directly under the hero headline. Hidden below 900px.
  It used to be a `writing-mode: vertical-rl` rail pinned to the hero's top-right, and that no longer works: once the headline is large enough to actually bleed, it occupies the entire top-right. Line 2 crosses exactly the x-band the rail sat in, and the arithmetic has no escape — the rail only clears the second line at a font size of ~492px. A flow element cannot collide with anything by construction, needs no `z-index` or magic offsets, and fills the gap under the headline that was previously dead space.

### Banned typography

- **Inter** — banned outright.
- **Serif of any kind** — banned outright. This is a garment brand in condensed grotesque; there is no editorial serif exception here.
- System-UI stacks as a display face.
- Any font not in the four-face stack above.
- Gradient-filled headline text.
- Faux bold or faux italic on the display face.

---

## 4. Component Stylings

### Buttons

Rectangular, `3px` radius — barely softened, not pill-shaped. `1.05em / 1.7em` padding. Space Mono 700 uppercase at `.82rem` with `.1em` tracking.

- **Primary:** Slab fill, ground-coloured text.
- **Ghost:** transparent fill, Bone text, Line-Strong border. On hover the border goes full Bone; **the ghost variant never takes a shadow.**
- **Hover:** `translateY(-3px)` plus a diffused shadow tinted to the button's own color (`0 12px 30px -8px rgba(232,221,206,.24)`). Never a neutral gray shadow, never an outer glow.
- **Active:** settles to `translateY(-1px)` — a tactile press, not a bounce.
- Buttons carrying a `→` glyph advance it `translateX(4px)` on hover, on its own transition.
- **On the Slab newsletter panel the primary button inverts** — Navy fill, Sand text — and its focus ring switches to Navy. Slab-on-slab is invisible; this inversion is required, not optional.

### Care labels (the signature chip)

`.42em / .7em` padding, `2px` radius, 1px Line-Strong border, translucent dark fill `rgba(20,27,33,.38)`, Bone Dim mono at `.68rem` / `.16em`. Optional leading `.5em` dot in `currentColor`.

Two solid variants for emphasis, both with ground-coloured text at 700 weight: **Slab** and **Accent**. Use a solid variant only for a genuine product fact (`240 GSM`, `BESTSELLER`, `NEW`) — never for decoration.

### Cards

`8px` radius, Card Surface fill, 1px Line border, clipped overflow. Column flex so the price row can push to the bottom with `margin-top: auto`.

- Hover lifts `-4px` and brightens the border to Line Strong. **The card lifts; the image inside does not zoom** — the pointer-tilt engine owns the media transform and a competing scale would fight it.
- Media is `1 / 1.05` aspect — a hair taller than square.
- Reserve cards for the product catalogue. For specification data use the **inset grid** instead: a 1px-gap grid whose gaps are the Line color showing through, producing hairline dividers with zero extra border markup.

### Inputs

Label or eyebrow above, message below, never a floating label. Ground-coloured fill with a matching border, `3px` radius, `1.05em / 1.2em` padding, Space Mono at `.9rem`, Ash placeholder. Focus ring is `2.5px` Slab at `3px` offset — inverted to the ground colour whenever the field sits on a Slab panel.

Validation messages render in the form's own monospace at `.85rem` / 700 weight, in a container with `min-height` reserved so the layout does not jump when a message appears.

### Tables

Minimum width `560px` inside a horizontally scrollable, `8px`-radius bordered wrapper. Space Mono throughout at `.86rem`.

- Header: Card Surface background, **Tan** uppercase labels at `.74rem` / `.1em`, Line-Strong bottom rule.
- Body: Bone Dim cells, Line row rules, no rule on the last row.
- First column is full Bone at 700 — it is the row's identity.
- Row hover washes `rgba(232,221,206,.05)` and lifts the text to full Bone.

### Media placeholders

Until real photography lands, image wells are a composed placeholder, never a gray box: a radial Accent-Raw wash at 34% from the upper right, over a `160deg` gradient from Card Surface into Deep Neutral, `6px` radius, Line border, an independent noise layer at 40% in overlay blend, the bear mark centered at 52% width and 50% opacity with a deep drop shadow, and a dashed monospace annotation chip in the lower left. The bear's eyes are filled with the **placeholder's own dark token** so a palette change can never strand them.

### Image specification

Every media well is still a placeholder. These are the **measured** slot sizes — the number to hand a photographer, and the number `next/image` must be told about.

| Well | Aspect | Max displayed (CSS px) | File @2x | File @3x |
|---|---|---|---|---|
| Hero | 4:5 | 558 × 698 | 1116 × 1396 | 1674 × 2094 |
| Story | 5:6 | 574 × 689 | 1148 × 1378 | 1722 × 2067 |
| Product card | 1:1.05 | **459 × 482** | 918 × 964 | 1377 × 1446 |
| Lookbook | 3:4 | 360 × 480 | 720 × 960 | 1080 × 1440 |

**Crop to the listed aspect at export.** Each well enforces `aspect-ratio`, so an off-ratio file is cropped by `object-fit: cover` and the subject's head or feet get cut somewhere outside your control.

**The product card's maximum is not at the widest viewport.** `repeat(auto-fill, minmax(300px, 1fr))` means the card is widest just before a column is added:

| Viewport | Columns | Card width |
|---|---|---|
| ~1029px | 2 | **459px** ← the maximum |
| 1100–1300px | 3 | 321–383px |
| 1440–1920px | 4 | 302px |

Sizing product images from a 1440px desktop yields 302px files that go soft across the entire laptop range. Size from 459px.

**Never exceed the @3x column.** Every well stops growing at its cap, so extra pixels past it are pure file weight with no visible gain.

**`sizes` strings** — each mirrors its slot's real breakpoints, so the browser never over-fetches. Ready-to-use `<Image>` calls sit as comments at each `.ph` in the components.

```
Hero    (max-width:456px) 92vw, (max-width:900px) 420px, (max-width:1391px) 42vw, 558px   + priority
Story   (max-width:900px) 92vw, (max-width:1391px) 42vw, 574px
Card    (max-width:1100px) 46vw, (max-width:1391px) 31vw, 302px
Look    (max-width:750px) 240px, (max-width:1125px) 32vw, 360px
```

The hero image is the page's **LCP element** and must carry `priority`. It is also the one the UV torch reveals — see §7 — so it should be shot with visible fabric texture and construction detail, or the site's signature interaction has nothing to expose.

### Selection chips (sizes)

`.35em / .55em` padding, `2px` radius, Line border, mono `.66rem`. Selected state inverts to Bone fill with Navy text at 700. On mobile the padding grows to `.5em / .7em` to clear the 44px tap target.

### Loading and empty states

Skeletal blocks matching the exact final layout dimensions, using the placeholder gradient at reduced opacity. **No circular spinners.** Empty states are composed — the bear mark plus a care label explaining what will appear — never the words "No data".

---

## 5. Layout Principles

- **Container:** `min(1280px, 92vw)`, centered. The 4vw side gutter is a token so full-bleed sections can align their inner content to it.
- **Section rhythm:** `clamp(4.5rem, 10vw, 8.5rem)` vertical padding. Consistent everywhere; density comes from content, not from squeezing the sections.
- **CSS Grid over flexbox math.** No `calc()` percentage hacks. Product grids use `repeat(auto-fill, minmax(300px, 1fr))`.
- **Asymmetric splits are the default.** Hero is `1.1fr / .9fr`, aligned to `end` so the type baseline and the media bottom edge agree. The story band is `.95fr / 1.05fr`, aligned center. **Never `1fr / 1fr`** — a dead-even split reads as a template.
- **Type bleeds off the frame — one line only, by design.** Three things have to be true together, and removing any one of them silently kills the effect:
  1. **The hero section is full-bleed, not `.wrap`.** `overflow: clip` lives on `.hero`, so it clips at the *viewport* edge. The inner `.hero__inner` carries `.wrap` and does **not** clip, so the type overflows the content column freely and is only cut at the screen edge. If `.wrap` moves back onto `.hero`, the type gets clipped at the column edge instead, leaving an empty gutter that reads as a bug.
  2. **The type is sized to exceed the viewport.** `clamp(4.2rem, 21.5vw, 26rem)`. Anton's real proportions are `OVERSIZED.` ≈ 3.88em and `UNAPOLOGETIC` ≈ 5.05em, so at 21.5vw the long line runs ~14% past the screen while the short line lands at ~83% of it. Measured at 1440px: `OVERSIZED.` inks 58→1258 (complete), `UNAPOLOGETIC` inks 83→1647 against a 1440 viewport. Verified at 390px too, with zero horizontal page overflow.
     The earlier `clamp(3.6rem, 15vw, 13.5rem)` never bled at *any* width — 15vw against a 92vw container holds the same ratio everywhere, so the machinery was present but never triggered.
  3. **Only the long line bleeds.** Line 1 must read complete — losing the `D.` of `OVERSIZED.` costs the headline its word. The composition is deliberate: the first line resolves, the second runs out of the frame.
- **Vertical padding has to scale with the type.** `line-height: .8` makes glyphs overshoot their line box by ≈`.355 × font-size`. Since the size is `vw`-based, `padding-top` must be too — `clamp(2.5rem, 9vw, 10rem)`. With a fixed value the glyph tops push up into the deliberately-transparent nav and the nav links become unreadable over white type.
- **Fenced bands.** Any surface shift (marquee, story) is bounded top and bottom by a 1px Line rule. A panel change without fences reads as an accident.
- **No overlapping content.** The only stacked layers are the grain overlay, the pointer torch, and absolutely positioned care labels pinned into a media well's own corner. Text never overlaps text; text never overlaps a photograph's subject.
- **Full-height sections use `min-h: 100dvh`, never `100vh`.** iOS Safari's toolbar collapse makes `vh` jump catastrophically.

### Section archetypes

| Archetype | Shape |
|---|---|
| Announcement bar | Full-bleed Sand strip, centered mono, `.6em` padding |
| Nav | Sticky, transparent over the hero, materializing into `blur(14px)` glass with a gradient hairline once the hero scrolls past |
| Hero | Full-bleed section; bleeding display type stack, spec line, then an asymmetric lede / media split |
| Tape | Full-bleed lifted panel, two counter-scrolling monospace rows |
| Catalogue | Section head, then auto-fill card grid |
| Story | Fenced lifted panel, asymmetric media / copy split, inset spec grid |
| Reference | Section head, then a scroll-wrapped table |
| Lookbook | Horizontal snap-scroll strip of `clamp(240px, 32vw, 360px)` items with mono captions |
| Conversion | Rounded `12px` Sand panel, inverted colors — **the one place centered layout is correct** |
| Footer | `1.6fr / 1fr / 1fr / 1fr` grid, brand block first, mono bottom bar |

### Section heads

Left block holds eyebrow then display heading; right block holds an optional care label or link; `justify-content: space-between`, aligned to `flex-end`, wrapping on narrow screens.

---

## 6. Responsive Rules

Two breakpoints, deliberately few.

**≤ 900px**
- Nav links give way to a burger; the mobile menu is a full-screen Navy panel sliding in from `translateY(-100%)` over `.5s`, with display-face links at `clamp(2.2rem, 11vw, 4rem)` separated by Line rules.
- All asymmetric splits collapse to one column.
- The hero's vertical rail is hidden — vertical text at phone width is unreadable.
- Hero media caps at `420px` and portrait media re-crops from `5/6` to `5/4`.
- Footer becomes two columns with the brand block spanning full width.

**≤ 520px**
- The product grid holds a **firm two-up** — `auto-fill` would otherwise drop to a single column in the 521–677px band and leave the layout looking broken.
- Load choreography runs ~30% faster via a global stagger multiplier.
- Spec grid and footer go single column; footer bottom bar stacks left-aligned.
- Nav height drops from 74px to 64px.

**Universal**
- **No horizontal page scroll, ever.** `overflow-x: clip` on the body. Wide content — tables, lookbook strips — scrolls inside its own container.
- All headline sizing via `clamp()`. Body never below `1rem`.
- Every interactive target ≥ 44px on coarse pointers.
- Pointer-driven effects are gated behind `(pointer: fine)` and given a non-pointer equivalent — a one-pass automatic sweep — rather than being silently dropped.

---

## 7. Motion & Interaction

Motion is a first-class part of this brand, not decoration. It is also budgeted.

### Engine

A **single `requestAnimationFrame` loop** drives every scroll and pointer effect on the page. Each effect registers as an item; an `IntersectionObserver` gates its active flag; an item that returns "settled" is skipped and the loop sleeps entirely when nothing is moving. **Never open a second rAF loop and never bind a raw scroll listener that writes styles.**

### Easing

Primary curve is `cubic-bezier(.16, 1, .3, 1)` — expo-out, heavy front, long settle. This is the "weighty premium" feel; it is the spring equivalent of roughly `stiffness 100 / damping 20`. **No linear easing anywhere.** The single exception is the marquee tape, which must be linear to loop seamlessly.

Continuous scroll and pointer values are smoothed by lerping toward the target at `0.1` per frame, snapping to target below a `0.05` epsilon so the loop can sleep.

### The choreography

1. **Gated load.** A raw inline `<script>`, placed as the **first child of `<body>`**, marks the document as scripted before the rest of the markup is parsed, then races `document.fonts.ready` against a 350ms timeout before releasing the entrance. If the browser restores a mid-page scroll position, the intro is fast-forwarded to its end state.
   **Never deliver this through `next/script`.** With `strategy="beforeInteractive"` and inline children it does not compile to an executable inline tag — the built HTML gets `(self.__next_s = self.__next_s || []).push([0, {"children": "…"}])`, a data push drained later by an async framework chunk. The Next docs say as much for this strategy: *"execution does not block page hydration."* Because the `.js` rules are what **hide** the intro elements (`opacity: 0`, `translateY(112%)`), landing them after first paint means the page paints the topbar, nav and hero in final position, then jumps them back to hidden and animates them in — the exact flash the gate exists to prevent. A raw tag in that position blocks the parser until it runs, so the elements below it are never painted un-gated.
2. **Slab rise.** Hero lines translate up from `112%` inside a clipping mask, staggered `.12s` then `.26s`. The mask opens `.45em` at the top so the display face's overshoot is never sliced — only the bottom edge clips.
3. **Cascade.** Eyebrow and lede at `.45s`, CTA at `.58s`, media at `.7s`, vertical rail at `.85s`, then the tan period pops from `scale(0)` at `1s` on a slight back-out curve. Nothing mounts instantly; nothing mounts simultaneously.
4. **Scroll shear.** The two hero lines translate horizontally in *opposite* directions as the page scrolls, clamped to 22% of viewport width, at roughly half rate on coarse pointers. The media drifts at a tenth of that. The entrance animation hands its transform to the scroll engine on `animationend` so the two never fight.
5. **Pull-up headings.** Section headings rise from `118%` behind a clipping mask on reveal, with an 80ms per-word stagger.
6. **Spec cascade.** Table rows slide in from `-14px` at 70ms intervals, and each row's identity cell holds Tan for the first 55% of its animation before resolving to Bone — a readout settling.
7. **Card tilt and glare.** On fine pointers only, cards tilt toward the cursor with a soft radial highlight tracking across the media.
8. **The torch (signature).** The hero media clones its own content into a brightened, saturated layer revealed through a 200px radial mask that follows the cursor, exposing hidden monospace annotations calling out real garment construction. On touch devices this runs once as an automatic 2.2s sweep when the media first enters view.
9. **Counter-scrolling tape.** Two monospace rows scrolling in opposite directions, pausing on hover, carrying different copy so the pair reads as a printed care label rather than a duplicated ticker.
10. **Thai ink reveal.** Story paragraphs fade in per grapheme as they scroll. **Thai text must be segmented with `Intl.Segmenter`** at grapheme granularity — `split('')` detaches vowels and tone marks from their consonants and produces broken Thai. Coarse pointers segment by *word* to keep the node count near 60 instead of 300. The unsegmented original is always preserved for screen readers.

### Performance rules

- Animate **only** `transform` and `opacity`. Never `top`, `left`, `width`, `height`, or `margin`.
- Grain and noise live on fixed pseudo-elements. They are never animated and never repainted.
- `will-change` is applied only to genuinely continuous transforms, and only when reduced motion is not requested.
- Style writes are deduplicated — compare against the last written value before touching the DOM.
- Every effect tears down its observers, listeners, timers, injected nodes, and engine registration on unmount.

### Reduced motion

`prefers-reduced-motion: reduce` is a **complete static fallback**, not a degradation. All content is fully visible and untransformed, the torch layer is removed from the DOM entirely, the ink reveal is at full opacity, smooth scrolling is off, and the two tape rows are offset statically so they still show different copy. Reveal rules must beat the scripted hiding rules on specificity, so content can never be trapped invisible if an observer fails to fire.

---

## 8. Voice & Copy — the bilingual rule

OVERBEAR is a Thai brand that thinks in two languages, and the split is **not** decorative. There is one governing rule, and it holds across every string in the product.

### The rule

> **English is the brand naming its own things. Thai is the brand speaking to you about yours.**

English carries taxonomy, posture, and garment fact — the label's own vocabulary for its own objects. Thai carries anything the customer has to act on, pay for, or measure against their own body.

**The second-person test:** read the string and ask *whose* thing it is. If it belongs to the brand — a section name, a product name, a spec value, a construction fact — it is English. If it belongs to the customer — their body, their size, their money, their next tap — it is Thai.

### Applied

| Slot | Language | Live examples |
|---|---|---|
| Display headline — brand posture | **EN** | `OVERSIZED. UNAPOLOGETIC` · `The Drop` · `On the streets` |
| Display headline — about the customer | **TH** (Kanit 800) | `ตัดมาเพื่อหุ่นหมีโดยเฉพาะ` · `ไซซ์หุ่นหมี` · `เข้าถ้ำก่อนใคร` |
| Eyebrow | **EN** | `Drop 01 — Dark Basics` · `Made for size` · `Size guide` · `Join the den` |
| Nav / footer taxonomy | **EN** | `Shop` · `The Fits` · `Size` · `Contact` |
| Footer groups the customer needs | **TH** | `ช่วยเหลือ` · `ติดตาม` |
| Care labels & badges | **EN** | `240 GSM` · `BESTSELLER` · `NEW` · `FLATLOCK SEAM` |
| Vertical rail & lookbook captions | **EN** | `EST. 2026 — BANGKOK / DROP 01` · `Fit 01` |
| Product names | **EN** | `Midnight Heavy Tee` · `Shadow Drop-Shoulder` |
| Product colors | **TH** | `ดำสนิท` · `ดำวอช` · `เทากราไฟต์` |
| Spec **labels** | **TH** | `น้ำหนักผ้า` · `ทรง` · `ช่วงไซซ์` |
| Spec **values** | **EN / numeric** | `240 GSM` · `Drop shoulder` · `M–5XL` · `Pre shrunk` |
| Table headers | **TH** | `ไซซ์` · `รอบอก (นิ้ว)` · `เหมาะกับน้ำหนัก` |
| Buttons & CTAs | **TH** | `ช้อปดรอปล่าสุด →` · `ดูตารางไซซ์` · `สมัคร →` |
| Form fields, validation, status | **TH** | `อีเมลของคุณ` · `ใส่อีเมลให้ถูกต้องก่อนนะ` |
| Announcement bar | **TH** | `ส่งฟรีเมื่อซื้อครบ ฿1,500 · ไซซ์ M–5XL ครบทุกตัว` |
| Body copy | **TH** | conversational, second person, no honorific stiffness |
| Payment marks | **EN** | `VISA` · `MASTER` · `PROMPTPAY` · `COD` |

**CTAs are Thai. Always.** This is the rule's most load-bearing consequence and the one most likely to be broken by an English-default generator. A button is the customer's action, never the brand's label.

### The two sanctioned mixes

1. **The tape.** The marquee deliberately interleaves both languages, because a real garment care label does — `100% Heavy Cotton` → `240 GSM` → `ไซซ์หมี สไตล์เท่` → `Machine Wash Cold` → `ตัดเผื่อหุ่นหมี`. English carries the specs, Thai carries the brand's voice, alternating.
2. **Fact-plus-count strings**, where an English quantity leads a Thai qualifier: `6 Styles · จำนวนจำกัด`, `สี ดำสนิท · 240 GSM · Oversized`. The English half is always the measurable part.

Any other mid-sentence language switch is a mistake.

### Typographic consequences

- **Tracking scales inversely with Thai string length.** Thai has no inter-word spaces, so word boundaries are carried by visual clustering and tracking erodes them. A 1–3 word Thai label inside a tracked mono slot is fine and is a real convention in Thai graphic design — `ช่วยเหลือ` at `.16em`, `น้ำหนักผ้า` at `.14em`, `สมัคร` at `.1em` all hold. A full Thai **sentence** at that tracking does not. Keep Thai running text at or below `.06em`.
- `text-transform: uppercase` is a no-op on Thai. Never rely on it for emphasis in a Thai string.
- Thai display headings must resolve to Kanit 800, never to the body face. Anton covers Latin only; the fallback order is what keeps a Thai heading at display weight.
- Thai is never letter-animated by code unit. Grapheme segmentation only — see §7.

### Register

The **bear / den metaphor is the brand's own and is used sincerely.** `เข้าถ้ำ` for joining, `หุ่นหมี` for the body it serves. Warm, direct, never a joke at the customer's expense and never coy about size. The brand's whole argument is in one line of its own copy — *"เบื่อกับเสื้อไซซ์ใหญ่ที่จริงๆ แค่ยืดไซซ์ปกติออก"* — so the voice is a maker's, stating what was actually done to the pattern.

Never write: "Elevate", "Seamless", "Unleash", "Next-Gen", "Curated experience", "Redefine" — or their Thai equivalents in marketing register (`ยกระดับ`, `เหนือระดับ`, `ที่สุดแห่ง`).

---

## 9. Data Integrity

**Every number on this site is a real product fact. Never generate a new one.**

The complete set of legitimate figures:

- Fabric weight `240 GSM`; construction `FLATLOCK SEAM`; cut `DROP +6CM`
- Sizes `M` through `5XL`
- Size table: chest 42–54in, length 28–34in, shoulder 20–26in, mapped to 60kg through 130kg+, with a stated ±1in tolerance
- Prices ฿890–฿990; free shipping threshold ฿1,500
- Origin `BANGKOK`, `EST. 2026`, `DROP 01`

If a new screen needs a figure that is not on that list, render a labeled placeholder such as `[metric]` and flag it. **Absolutely banned:** invented uptime percentages, response times, customer counts, satisfaction scores, "10,000+ happy bears", star ratings, or any "BY THE NUMBERS" / "KEY STATISTICS" panel. Fabricated metrics are the single loudest tell that a screen was machine-generated.

---

## 10. Anti-Patterns (Banned)

**Type**
- `Inter`, system-UI display stacks, any font outside Anton / Kanit / Archivo / Space Mono
- Serif fonts of any kind, including "distinctive modern" ones
- Gradient-filled headlines; faux bold or faux italic on the display face
- Non-monospace numerals anywhere

**Color**
- Pure black `#000000` or pure white `#ffffff`
- Any hue outside the three CI values
- A second accent color; oversaturated accents above ~40% saturation
- Purple, neon, cyan, or any glow-gradient aesthetic
- Accent Raw (`#6B705C`) as text on any surface — measured 3.77 / 3.51 / 3.21:1, fails AA everywhere
- Slab-coloured elements on a Slab panel; light-mode variants of anything

**Layout**
- Centered hero sections — the newsletter panel is the *only* sanctioned centered block
- Even `1fr 1fr` splits
- The generic three-equal-benefit-card row. *(The product catalogue grid is exempt — a catalogue is a catalogue. The ban is on feature/benefit cards.)*
- Overlapping text; absolutely positioned content stacking
- `100vh` on full-height sections
- Horizontal page overflow on mobile
- A surface change without hairline fences

**Motion**
- A second rAF loop, or a scroll listener that writes styles directly
- Linear easing on anything but the tape
- Animating layout properties
- Effects with no reduced-motion fallback; pointer-only effects with no touch equivalent
- `split('')` on Thai text — use `Intl.Segmenter`

**Content**
- **Emojis anywhere.** The bear mark is the brand's own success/affirmation glyph — the newsletter confirmation renders it as an inline `currentColor` SVG at `1.35em`, never `🐻`.
- Thai **sentences** inside a wide-tracked mono slot; inline `var(--font-mono), monospace` stacks that strand Thai — see §3 and §8.
- English CTAs — see §8.
- Fabricated metrics, statistics, or dashboard-style "system performance" panels
- `LABEL // YEAR` formatting. The vertical rail may carry real origin and drop data — `EST. 2026 — BANGKOK / DROP 01` — but never `SYSTEM // 2024`.
- Generic placeholder names — "John Doe", "Acme", "Nexus"
- Fake round numbers — `99.99%`, `50%`
- Filler UI text — "Scroll to explore", "Swipe down", scroll arrows, bouncing chevrons
- AI copywriting clichés — "Elevate", "Seamless", "Unleash", "Next-Gen"
- Broken Unsplash links — use `picsum.photos` or the bear SVG placeholder
- Circular loading spinners; bare "No data" empty states
- Custom mouse cursors

---

## Deviation from the generic taste baseline

The house taste baseline prescribes **inline image typography** — small contextual photos embedded between words in the headline — as its signature hero technique. **That is deliberately not adopted here.** OVERBEAR already owns two stronger, brand-native signatures: bleeding oversized type with counter-directional scroll shear, and the pointer torch that reveals garment construction annotations. Inserting photo-punctuation into an Anton headline would break the `nowrap` bleed that makes the hero work, and would dilute a device that is already distinct.

The inline-image technique remains available for **editorial and lookbook screens**, where the display type is not bleeding off-frame — at type height, `2px` radius, stacking below the headline on mobile.
