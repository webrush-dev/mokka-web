# Mokka Web Brand Guidelines (Launch 2025)

**Scope:** Website, countdown & landing experiences, admin, marketing pages\
**Stack context:** Next.js + Tailwind + shadcn/ui + lucide-react\
**Language:** BG primary, EN alt

---

## 1) Brand Essence (for the web)

**Mission (owners):** Да дадем възможност на всеки да опита **прясно изпечени в България кафета от целия свят**.

**Core values:** Честност • Последователно качество • Образование • Разнообразие

**Primary tagline:** **Вкусът на света в твоята чаша.**\
*Alternatives:* „Прясно изпечено в България, вкусове от целия свят.“ / „Открий света с всяка глътка.“

**Voice (5):** честна, топла, любопитна, модерна, образователна.

**Key messages (web‑first):**

- **New owners, new Mokka.** Същото уютно място, по‑висок стандарт.
- Specialty **кафе, изпечено в България**; ротация от произходи.
- **Evenings at Mokka:** spritz/beer pairings + насоки за умерена консумация (18+).
- **Community + образование:** дегустации, Origin Explorer, Mokka Passport.

---

## 2) Logo & Marks

**Primary mark:** Minimal wordmark “Mokka” with subtle **steam wave/moka pot hint**.\
**Colorways:** Turquoise on cream; Brown on cream; White on graphite; Single‑color black.

**Clear space:** ≥ height of letter “o” on all sides.\
**Min size (web):** Header logo ≥ 24px height; Footer ≥ 18px; Social OG ≥ 256px width.

**Don’ts:** stretch, add drop shadows, outline, gradient fill on wordmark, place on busy photos without an overlay.

**Favicon/Mask:** 32×32/48×48 PNG; 180×180 Apple Touch; monochrome SVG mask (steam wave).

---

## 3) Color System (tokens + usage)

**Core palette:**

- **Turquoise / **``: **#2BBECF** (HSL 188, 66%, 50%) — primary actions, links, accents.
- **Brown / **``: **#6B4A2C** (HSL 27, 43%, 30%) — headings, key UI, dividers.
- **Cream / **``: **#F7F3EE** (HSL 36, 43%, 95%) — backgrounds, cards.
- **Graphite / **``: **#1F2937** (HSL 215, 28%, 17%) — text on light, overlays.

**Extended (semantic):**

- **Success:** #16A34A • **Warning:** #F59E0B • **Danger:** #DC2626 • **Info:** #0EA5E9

**Usage ratios (light mode):** Background 70% Cream, 15% White, 10% Brown (type/dividers), 5% Turquoise accents.\
**Dark mode:** Invert: Graphite bg, Cream text, Turquoise accents; Brown for cards/headings.

**Tailwind/theme variables (example):**

```css
:root{
  --mokka-tq: 43 64% 50%; /* hsl */
  --mokka-br: 27 43% 30%;
  --mokka-cr: 36 43% 95%;
  --mokka-gy: 215 28% 17%;
  --radius: 1rem; /* 16px = rounded-2xl */
}
.dark{
  --mokka-cr: 36 43% 95%; /* used as text */
}
```

```ts
// tailwind.config.ts (excerpt)
extend:{
  colors:{
    mokka:{
      tq:{ DEFAULT:"hsl(var(--mokka-tq))" },
      br:{ DEFAULT:"hsl(var(--mokka-br))" },
      cr:{ DEFAULT:"hsl(var(--mokka-cr))" },
      gy:{ DEFAULT:"hsl(var(--mokka-gy))" },
    }
  },
  borderRadius:{ '2xl':'var(--radius)'}
}
```

---

## 4) Typography

**Headings:** *Sora* (Google) — bold for H1/H2, semibold H3/H4. Fallback: `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif`.

**Body/UI:** *Inter* (Google) — regular/medium.

**Scale (fluid clamp):**

- H1: `clamp(32px, 4vw, 48px)`
- H2: `clamp(26px, 3vw, 36px)`
- H3: 22–28px; Body: 16–18px; Small: 14px.\
  **Line-height:** headings 1.1–1.25; body 1.6.\
  **Letterspacing:** headings -0.01em; all caps (buttons) 0.06em.

**Do’s:** short lines ≤ 72ch, emphasize with weight not underline; use Turquoise only for links/CTAs.

---

## 5) Iconography & Illustration

- **Icons:** `lucide-react`, stroke 1.5px, round joins, 20–24px in buttons, 16px in inputs.
- **Illustration/Patterns:** Subtle **steam wave** and **coffee ring** textures at ≤8% opacity; avoid busy backgrounds under copy.

---

## 6) Imagery & Video

**Mood:** warm, evening‑first ambience; natural skin tones; rustic‑modern textures.\
**Subjects:** latte art macros, bar moments, Anелия’s pastry close‑ups, spritz/beer pours, smiling guests (consent), exterior with pin.\
**Video:** 10–18s loops, muted autoplay, no hard cuts; ASMR acceptable at low volume.\
**Overlays:** 8–16% brown gradient for text legibility.\
**Alt text:** descriptive, Bulgarian first (e.g., „Бариста прави лате арт сърце“).

---

## 7) Layout & Grid

**Breakpoints:** `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.\
**Container max:** 1200px; gutters 16–24–32px by breakpoint.\
**Grid:** 12‑col desktop, 6‑col tablet, 4‑col mobile.\
**Spacing scale:** 4/8/12/16/24/32/48/64.\
**Radii:** `rounded-2xl` default on cards/buttons; avoid sharp corners.

---

## 8) Components (shadcn/ui conventions)

**Buttons**

- Primary (Turquoise): solid; hover darken 6%; focus ring 2px Turquoise; disabled 40% opacity.
- Secondary (Brown outline): text Brown, border Brown 24%; hover bg Brown 6%.
- Ghost: text Graphite; hover bg Cream 50%.
- Destructive: Danger red.

**Inputs/Textareas**

- 44px min height; 12px x 14px padding; label top‑aligned; error text red‑600; success green‑600.
- Icons inside fields left 16px; clear affordance for invalid.

**Cards**

- Soft shadow `shadow-[0_6px_20px_rgba(0,0,0,.08)]`; `rounded-2xl`; internal padding 20–24px.

**Navigation**

- Sticky top, 64px height; transparent over hero → solid after 60px scroll; menu sheet on mobile.

**Countdown**

- Big digits, mono tabular (`tabular-nums`), unit labels small caps; subtle steam wave background.

**Event Card**

- Title, time, seat‑left badge; CTA “RSVP” or “Remind me”; color code tasting (Turquoise) / party (Brown).

**RSVP Modal/Form**

- Steps: Select session → Details → Confirm; success with confetti burst (reduced motion aware).
- Show capacity in real time; disable over‑capacity; clear 18+ notice for alcohol events.

**Loyalty Widget**

- Explainer + QR Register; 7 stamp icons (outline → fill on hover); Origin Explorer progress (6 chips).

**Tiles: “This Week at Mokka”**

- Nameplate, date/time badge; consistent template; one line of copy.

**Banners**

- Cookie consent (Cream); Alcohol 18+ (Graphite bg, Cream text); Temporary promo (Turquoise left bar).

**Toasts**

- Success (Turquoise icon), error (Red), info (Brown). Auto hide 3.5s.

---

## 9) Content & Copy (BG‑first)

**Tone:** дружелюбен, кратък, с ясни ползи.\
**CTAs:** “Запази място”, “Присъедини се”, “Виж офертите тази вечер”.\
**Numbers & time:** 24‑часов формат (17:00–20:00).\
**Alcohol:** задължително „18+“ + „Пий отговорно“.\
**Self‑serve microcopy:** “Поръчай → Плати → Вземи” + „Търси табелата Pick‑up“.\
**Accessibility in language:** избягвай ALL CAPS; използвай емоджита пестеливо (макс 1 на абзац).

---

## 10) Accessibility

- Contrast AA: body ≥ 4.5:1; buttons ≥ 3:1.
- Focus visible: `outline-2 outline-mokka.tq` + offset.
- Keyboard: trap focus in modals; ESC closes; Enter submits.
- `prefers-reduced-motion`: disable parallax, confetti becomes fade.
- Forms: aria‑describedby for errors; labels must associate; 44px touch targets.

---

## 11) Motion & Easing

- Durations: 150ms micro, 250ms interactive, 400ms overlays.
- Easing: `ease-out` for entrances, `ease-in` for exits; spring for small icon hovers only.
- Page transitions: fade/slide 8–12px; never block input.

---

## 12) SEO, Social & Metadata

- Title ≤ 60 chars; Description 140–160 chars (BG/EN).
- OG images: cream background, Brown headline, Turquoise badge for dates (e.g., “Launch Party 06.09, 17:00–20:00”).
- Schema: `LocalBusiness` (address, hours, geo), `Event` for tasting sessions + party.
- Robots: index after Sep 1; pre‑launch `noindex`.

---

## 13) File & Code Conventions

**Assets:**

```
/public/og/og-countdown.jpg
/public/og/og-landing.jpg
/public/tiles/tile_opening.jpg
/public/tiles/tile_pastry.jpg
/public/tiles/tile_playlist.jpg
/public/tiles/tile_cocktail.jpg
/public/tiles/tile_tasting.jpg
/public/tiles/tile_party.jpg
/public/tiles/tile_locals.jpg
/public/video/heroVideo.mp4
/public/video/teaserLatteSpritz.mp4
```

**Naming:** kebab‑case; locale files in `/locales/{bg,en}.json`.\
**Shadcn theme:** keep tokens in `globals.css`; do not hardcode hex in components.\
**Icons:** lucide; consistent sizes (20/24).

---

## 14) QA Checklist (pre‑launch)

-

---

## 15) Do & Don’t (visual)

**Do:** warm evening photos; clean cards; short copy; plenty of breathing room.\
**Don’t:** neon gradients; busy textures behind text; more than 2 fonts; shadowy low‑contrast text; overuse of emojis.

---

## 16) Downloadables & Templates (to prepare)

- Logo pack (SVG/PNG), favicon set, mask icon.
- Social/OG templates (Figma).
- Story/post frames for “Launch Week” nameplates.
- Cookie + 18+ banner components (prebuilt).
- Tailwind theme file with tokens.

---

## 17) Governance

- Brand changes require approval by **Ivan** (internal), content/copy reviewed by **Petar Studio**; founders sign off on bio facts, menu names, alcohol notices.
- Use this guide as single source of truth for web UI until the full Brand Book is issued.

