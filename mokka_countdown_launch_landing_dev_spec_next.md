# Mokka Countdown & Launch Landing — Dev Spec (Next.js)

**Owner:** Petar Studio (Full‑stack dev)\
**Client:** Mokka Coffee (Trakiya, Plovdiv)\
**Due:** Go‑live **Aug 24**, countdown active **Aug 24–Aug 31**, auto‑switch to landing **Sep 1 (00:01, Europe/Sofia)**\
**Repo target:** Next.js 14+ (App Router) + TypeScript + Tailwind + shadcn/ui\
**Deploy:** Vercel (prod + preview)

---

## 0) Purpose & Success Criteria

**Purpose:** Single codebase that runs a **Countdown Page** pre‑launch, then **Landing Page** from **Sep 1** onward. Capture waitlist & RSVPs, enable simple loyalty capture (hybrid), and support ad/analytics tracking that aligns with our launch plan.

**Success by Sep 7:**

- ≥300 waitlist/RSVP contacts captured with consent (BG/EN).
- 24 tasting seats filled (2 × 12).
- Auto‑switch at **Europe/Sofia** midnight; no manual deploy needed.
- Pixel + GA4 receive all specified events with UTMs preserved.
- Admin can export contacts (.csv) and see RSVP counts by session in dashboard.

---

## 1) Tech Stack & Libraries

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui components, Framer Motion (light), Lucide icons.
- **Forms & Validation:** React Hook Form + Zod.
- **State/Server:** Next Server Actions; optional tRPC if dev prefers.
- **DB:** Postgres (Supabase) via Prisma ORM.
- **Auth (admin only):** NextAuth (email link / Google) or Supabase Auth.
- **Email:** Resend (or Brevo/Mailgun) for confirmations + reminders.
- **SMS (optional):** Twilio verify‑capable sender (fallback email only if not provisioned).
- **Payments (optional for tasting tickets):** Stripe (mode=optional; default disabled).
- **Analytics:** GA4 (gtag), Meta Pixel + Conversions API (via server‑side endpoint).
- **Maps:** Google Maps static embed (no key) or Mapbox (if available).
- **i18n:** next‑intl with BG (default) + EN.
- **Security/consent:** next‑cookie + Cookiebot (or self‑made GDPR consent).
- **QR/ICS:** `qrcode` (node) for loyalty cards; `ics` package to generate calendar invites.

---

## 2) Environment & Config

Create `.env` with:

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_ENV=prod|preview|dev
NEXT_PUBLIC_DEFAULT_LOCALE=bg
NEXT_PUBLIC_LAUNCH_SWITCH_ISO=2025-09-01T00:01:00+03:00
NEXT_PUBLIC_MAPS_EMBED_URL=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA4_ID=
RESEND_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
DATABASE_URL=postgres://...
CONVERSIONS_API_TOKEN=
STRIPE_SECRET_KEY= (optional)
TWILIO_SID= (optional)
TWILIO_TOKEN= (optional)
TWILIO_FROM= (optional)
ADMIN_EMAIL_WHITELIST=ivan@...,petar@...
```

- **Time zone:** All gating logic uses **Europe/Sofia (UTC+3)**; server should convert based on `NEXT_PUBLIC_LAUNCH_SWITCH_ISO`.

---

## 3) Routing & Pages (App Router)

```
/
  (countdown) – shown if now < LAUNCH_SWITCH
  (landing) – shown if now ≥ LAUNCH_SWITCH
/api
  /lead (POST) – waitlist + consent
  /rsvp (POST) – RSVP for events (tasting)
  /notify (POST) – Launch Party reminder opt‑in
  /stamp (POST, admin) – optional digital stamp (phase 2)
  /capi/meta (POST) – Meta CAPI forwarding
  /ics/[event].ics (GET) – calendar file
/admin (protected)
  /dashboard – metrics, exports, RSVPs
  /events – CRUD for sessions/capacities (optional)
```

---

## 4) Data Model (Prisma)

```prisma
model Lead { id String @id @default(cuid())
  createdAt DateTime @default(now())
  locale String @default("bg")
  name String?
  email String?
  phone String?
  source String? // utm_source or "qr"/"ig_dm"
  utm UTM?
  consentMarketing Boolean @default(false)
  tags String[] // ["waitlist","loyalty","party"]
}

model RSVP { id String @id @default(cuid())
  createdAt DateTime @default(now())
  name String
  email String
  phone String?
  sessionId String
  session EventSession @relation(fields: [sessionId], references: [id])
  seats Int @default(1)
  status RSVPStatus @default(PENDING) // PENDING|CONFIRMED|CANCELLED
  payment Payment? // optional
  utm UTM?
}

enum RSVPStatus { PENDING CONFIRMED CANCELLED }

model Event { id String @id @default(cuid())
  slug String @unique // coffee-tasting, launch-party
  title String
  description String
  isTicketed Boolean @default(false)
}

model EventSession { id String @id @default(cuid())
  eventId String
  event Event @relation(fields: [eventId], references: [id])
  start DateTime
  end DateTime
  capacity Int
  reserved Int @default(0) // derived but denormalized for speed
}

model LoyaltyCard { id String @id @default(cuid())
  createdAt DateTime @default(now())
  code String @unique // short code printed on card QR
  owner Lead? @relation(fields: [ownerId], references: [id])
  ownerId String?
  stamps Int @default(0) // phase 2 digital; initially informational only
  originBadges String[]
}

model Payment { id String @id @default(cuid())
  rsvpId String @unique
  amount Int // in stotinki
  currency String @default("BGN")
  status String // created|paid|refunded
  provider String // stripe
  providerRef String?
}

model UTM { id String @id @default(cuid())
  source String?
  medium String?
  campaign String?
  content String?
  term String?
}
```

---

## 5) Countdown Page (Aug 24–Aug 31)

**Goal:** Capture emails/phones for **Waitlist**, push IG follow, and allow **Launch Party reminders**.

**Sections (top→bottom):**

1. **Hero** (full‑bleed)
   - Placeholder: *Evening exterior of café with turquoise/brown color wash; subtle steam overlay.*
   - Copy: "**Mokka идва в Тракия** — ново управление. Откриване **01.09**."
   - Elements: Logo wordmark (minimal), countdown timer (to `LAUNCH_SWITCH_ISO`), CTAs: **Join Waitlist**, **Get Party Reminder**.
2. **What’s New**
   - Bullets: new ownership, better menu, specialty coffees roasted in BG, evening spritz/beer pairings.
   - Placeholder: *Short 15s video loop of latte art + spritz pour (muted autoplay).*
3. **Events Teaser**
   - Cards (2): **Coffee Tasting – Fri 05.09** (18:30, 19:30), **Launch Party – Sat 06.09** (17:00–20:00).
   - Buttons: **RSVP** (tasting) / **Remind Me** (party).
4. **Sign‑up Panel**
   - Form: name (optional), email (required), phone (optional), opt‑in checkbox (GDPR).
   - Tag: store as `tags:["waitlist"]`.
   - Success: “Ще ти пишем с първи новини + Sunset Sips на 01.09”.
5. **Location**
   - Map embed + address + “Get Directions” (two buttons: Google/Apple).
6. **Footer**
   - IG/FB/TikTok links; Privacy Policy; Cookie consent.

**Behaviors:**

- Persist UTMs in session (localStorage + cookies) → attach to `/api/lead` submission.
- Fire analytics events (see §12).
- Display BG by default; EN via toggle.

---

## 6) Landing Page (from Sep 1)

**Goal:** Drive visits (evening focus), sell out **tasting sessions**, and collect loyalty registrations.

**Sections:**

1. **Hero**
   - Placeholder: *Space glow‑up video loop (before→after) or static collage.*
   - Copy: “**Вкусът на света в твоята чаша.** Ново управление, същото уютно място, по‑добро кафе.”
   - CTAs: **See Menu**, **Tonight’s Offers**, **RSVP Tasting**.
2. **This Week at Mokka** (nameplates)
   - Horizontal scroll of tiles: *Opening Night: Sunset Sips (Mon)*, *Tuesday Delights*, *Playlist Night*, *Cocktail Night*, *Coffee Tasting Fri*, *Launch Party Sat*, *Locals Day Sun*.
   - Each tile → modal with short copy and time; add to calendar if applicable.
   - Placeholder: *Tile images (abstract steam, pastries, cocktails, crowd).*
3. **Menu Highlights**
   - 6 core drinks + 6 foods static grid (title, price, short descriptor).
   - Placeholder: *Macro coffee shots; Aneliya’s pastry close‑ups.*
   - “Evening Pairings”: spritz/beer + toast bundle.
4. **Coffee Tasting – RSVP**
   - Two session cards: **18:30** and **19:30**, show live availability (`capacity - reserved`).
   - CTA → RSVP form (see flow in §7).
5. **Loyalty & Origin Explorer**
   - Explainer of **Mokka Passport** (paper) + QR registration.
   - CTA: **Register your Passport** (short lead form; tag `loyalty`).
   - “Collect 6 origins → Origin badge” graphic.
6. **Location & Hours**
   - Map embed, address, hours, parking/transit tips.
7. **Footer**
   - Socials, legal, credits.

---

## 7) Forms & Flows

### 7.1 Waitlist / Loyalty (Lead)

- Fields: name?, email\*, phone?, consent\*.
- Hidden: locale, source, utm.
- POST `/api/lead` → create Lead; send Resend email (BG/EN) with: thank you + links (IG, add Launch Party to calendar).
- Tag values: `waitlist` or `loyalty` depending on CTA.

### 7.2 Launch Party – Remind Me

- Minimal form (email/phone).
- Tag: `party`.
- Create calendar file `/ics/launch-party.ics` (17:00–20:00, Sep 6) for download.
- Optional reminder: email morning of Sep 6 (08:00 EEST).

### 7.3 Coffee Tasting – RSVP

- Session select (18:30 or 19:30); show seats left.
- Fields: name\*, email\*, phone?, seats (default 1, max 2).
- **Optional payments:** if `STRIPE_SECRET_KEY` present and `Event.isTicketed=true`, take payment (15–20 BGN) then set `RSVP.status=CONFIRMED`; else mark `PENDING` and send email “pay in‑store”.
- Seat reservation logic: transactionally increment `reserved` only on `CONFIRMED` or `PENDING` with 30‑min hold; cron job clears expired holds.

**Admin:** dashboard shows RSVPs per session, export CSV, manual confirm/cancel.

---

## 8) CMS / Admin (MVP)

- `/admin/dashboard` (protected via email whitelist):
  - Cards: Total Leads, Waitlist, Loyalty signups, Party reminders, RSVPs by session.
  - Table: Last 50 leads with tags/consent, export CSV.
- `/admin/events` (optional): CRUD events/sessions, set capacities, toggle ticketing.

---

## 9) Loyalty Program — Hybrid (Phase 1 + Phase 2)

**Phase 1 (launch):** Paper **Mokka Passport** with QR to `Register Passport` form (Lead + optional `LoyaltyCard.code`). Stamps tracked on paper; digital used for messaging only.\
**Phase 2 (after Sep):** Enable `/api/stamp` (admin‑only PIN) to add digital stamps; show "Your stamps" widget when user visits with code param.\
**Origin Explorer:** checkbox tracker per origin (admin marks completed; unlocks badge on site + sticker in‑store).

---

## 10) Integrations

- **GA4:** install gtag; send events (see §12).
- **Meta Pixel:** client events + `/api/capi/meta` server forward with fbp/fbc + email/phone hashed.
- **ManyChat/IG DMs:** add smart links in CTA buttons (deep link to IG DM with prefilled keyword `MOKKA` / `EVENT`); no API work required day‑one.
- **Email:** Resend transactional templates (BG/EN).
- **Payments:** Stripe (optional).
- **Maps:** Google static embed + link to Directions.

---

## 11) Content Placeholders (provide slots only)

- **Hero video (landing):** `heroVideo.mp4` — *space glow‑up before→after, 12–18s, loop, muted.*
- **Teaser loop (countdown):** `teaserLatteSpritz.mp4` — *latte art + spritz clink, 10–12s, loop.*
- **Tiles:** `tile_opening.jpg`, `tile_pastry.jpg`, `tile_playlist.jpg`, `tile_cocktail.jpg`, `tile_tasting.jpg`, `tile_party.jpg`, `tile_locals.jpg`.
- **Menu photos:** 12 placeholders across coffee + foods.

---

## 12) Analytics & Events (GA4 + Pixel)

**Naming (snake\_case):**

- `lead_submitted` {form\_type: "waitlist"|"loyalty"|"party", locale, source, utm\_\*}
- `rsvp_started` {event: "coffee\_tasting", session\_time}
- `rsvp_completed` {status: "confirmed"|"pending", session\_time, seats}
- `party_reminder_set` {}
- `countdown_view` {time\_to\_launch\_ms}
- `landing_view` {}
- `cta_clicked` {cta\_id} (e.g., `cta_menu`, `cta_offers`, `cta_rsvp`)
- Pixel standard events: `Lead`, `CompleteRegistration`, `ViewContent`, `AddToCart` (if Stripe), `Purchase` (if Stripe).
- **CAPI:** mirror `Lead` / `CompleteRegistration` with hashed email/phone.

**UTM:** Persist query params in localStorage + `utm` table; attach to all POSTs.

---

## 13) SEO & Sharing

- Titles/descriptions BG primary; EN alt tags.
- OG image placeholders for countdown and landing; include time badges (e.g., "Launch Party 06.09, 17:00–20:00").
- Schema.org `LocalBusiness` with address, hours, geo, sameAs socials.

---

## 14) Accessibility & Performance

- WCAG AA: color contrast (turquoise/brown palette), focus states, semantic landmarks.
- Motion reduce for videos; provide static fallbacks.
- LCP < 2.5s on 4G: lazy‑load videos, preconnect fonts, compress images.
- i18n toggle accessible; form errors readable by screen readers.

---

## 15) Security, Privacy, Compliance

- GDPR consent checkbox; store `consentMarketing`.
- Double opt‑in email optional (flag).
- Cookie consent banner for analytics/ads.
- Rate limiting on POST endpoints; bot protection (hCaptcha optional).
- Hash PII for CAPI; do not log raw PII in server logs.
- Admin protected by NextAuth + email whitelist; CSRF enabled.

---

## 16) Acceptance Criteria (MVP)

- Countdown shows until **Sep 1 00:01 EEST**, then landing automatically.
- Working forms: `/api/lead`, `/api/rsvp`, `/api/notify` with validation + success toasts.
- Admin dashboard shows counts + CSV export.
- GA4 + Pixel events fire; UTMs persist.
- i18n BG/EN toggle works.
- Mobile responsive and accessible; no CLS.

---

## 17) Nice‑to‑Have (Phase 2)

- Digital stamps UI + staff PIN page.
- Wallet passes for tasting tickets.
- Stripe Ticketing "Pay now".
- Loyalty portal: view stamps, claim reward QR.
- Micro CMS (e.g., Sanity) for menu and "This Week" tiles.

---

## 18) Copy Blocks (BG/EN) — to wire now

**Countdown hero (BG):** „Mokka идва в Тракия – **01.09**. Ново управление, същото уютно място, по‑добро кафе.“\
**Countdown CTAs:** „Присъедини се към списъка“ / „Напомни ми за партито 06.09“\
**Landing hero (BG):** „**Вкусът на света в твоята чаша.** Specialty кафе, изпечено в България.“\
**Events teaser (BG):** „Coffee Tasting – петък 18:30/19:30 (24 места) • Launch Party – събота 17:00–20:00“\
**Loyalty (BG):** „Вземи своя **Mokka Passport** на бара и регистрирай QR за бонус печат.“\
*(Provide EN alts similarly in **`locales/en.json`**.)*

---

## 19) Dev Tasks Checklist

-

---

## 20) Handover Notes

- Provide admin credentials and `.env` template.
- Share Resend/Stripe/Twilio keys securely.
- Confirm final copy for Sunset Sips (free shot vs +1 лв) and Unity Duo pricing to update Landing tiles.

