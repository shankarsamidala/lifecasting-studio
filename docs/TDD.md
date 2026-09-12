# TDD: Technical Design Document — Lifecasting Studio Website

Status: **DRAFT — awaiting review** (pairs with `docs/SPEC.md`)
Date: 2026-08-26

---

## 1. Architecture Overview

Single-page React application, statically generated content, zero backend in v1.

```
┌────────────────────────────────────────────────┐
│ Browser (mobile-first)                         │
│  React SPA (Vite)                              │
│   ├── Router (react-router-dom)                │
│   ├── Pages ── read from ──► catalog data      │
│   ├── Drawer nav (shell-nav module)            │
│   └── Booking CTA → wa.me deep link (external) │
├────────────────────────────────────────────────┤
│ Static hosting (Netlify/Vercel/Cloudflare)     │
│  - built assets                                │
│  - /images product photography                 │
└────────────────────────────────────────────────┘
No database. No API. No auth. Content = one typed data file.
```

**Why no backend:** prices/models change a few times a month at most; editing a JSON file + redeploy (~1 min) beats operating a CMS for v1. A headless CMS can be bolted onto `catalog-data` later without touching pages (the interface is the data shape).

## 2. Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Same family as reference site; instant HMR; cheap static build |
| Routing | react-router-dom v6 | Nested layout routes for shell + drawer |
| Styling | Tailwind CSS | Pink theme via CSS variables/tokens; fast mobile-first iteration |
| State | None global — local component state only | Catalog is static; only selectors (age/frame/gallery index) are stateful |
| Data | TypeScript-typed `src/data/catalog.ts` (+ JSON assets for copy if large) | Type-checked content = fewer broken pages |
| Tests | Vitest + Testing Library; Playwright for E2E | Fast unit loop; real-journey E2E for the ≤3-tap rule |
| Deploy | Netlify or Cloudflare Pages preview per branch | Client can review every change on a live URL |

## 3. Data Model (`catalog-data`)

```ts
type CategoryId =
  | 'baby' | 'couple' | 'family' | 'belly' | 'pet'
  | 'aashirvaad' | 'resin-art' | 'garland' | 'baby-kits' | 'others';

interface FrameOption {
  id: 'classic-frame' | 'display-box';   // exactly two, per spec
  name: string;
  photo: string;
  priceDelta: number;                    // added to base starting price
}

type AgeGroup = '0-1y' | '1y-plus';

interface PriceRule {
  baseInr: number;                       // starting price, 0-1y / non-baby
  aboveOneYearDeltaInr?: number;         // baby only: ₹500–1000
}

interface ProductModel {                 // one card on a category page
  id: string;                            // e.g. 'baby-2c-standard'
  categoryId: CategoryId;
  label: string;                         // '2 Casts (1 Hand + 1 Feet)'
  variant: 'standard' | 'customized';
  tagline: string;
  photos: string[];                      // multiple angles
  includes: string[];
  measurements?: string;                 // reuse existing measurement content
  ageGroups?: AgeGroup[];                // present ⇒ baby-style selector renders
  frames: FrameOption[];
  whyCustomized?: string;                // "Why this price?" config breakdown
  relatedIds: string[];                  // drives "You may also like"
}

interface Category {
  id: CategoryId;
  name: string;                          // menu + page title
  blurb: string;
  heroImage: string;
  models: ProductModel[];                // ALL rendered flat — no sub-categories
}
```

Derived pricing lives in `src/lib/pricing.ts`:

```ts
startingPrice(model, ageGroup?, frameId?) → number
// = model.base + (age === '1y-plus' ? delta : 0) + frame.priceDelta
```

WhatsApp link builder `src/lib/booking.ts`:
`wa.me/916383893672?text=<urlencoded>` with message template:
*"Hi! I'd like to book: {Category} — {Model} ({variant}), age group {age}, frame {frame}. Starting price shown: ₹X."*

## 4. Routing Map

| Path | Component | Notes |
|---|---|---|
| `/` | LandingPage | Phase target of next planning session |
| `/casting/:categoryId` | CategoryPage | Flat list of all models |
| `/casting/:categoryId/:modelId` | ProductPage | Gallery, selectors, Book Now |
| `/contact`, `/privacy`, `/terms` | static pages | |
| `*` | NotFound → home redirect | |

Legacy compatibility: `/baby-casting` etc. redirect to `/casting/baby` (cheap catch-all redirect map). Decide at deploy whether to keep old URLs instead — open question #5.

## 5. Shell & Navigation (`shell-nav`)

- **Mobile (<lg):** fixed header with hamburger **on the left**. Drawer slides in from left listing all 10 categories (SPEC order). Tap category → navigate + close drawer. Drawer reachable on every route.
- **Desktop:** same categories become the header nav (10 items fit as a compact bar or "Casting" dropdown); drawer still available.
- Theme: pink palette defined once as Tailwind tokens (e.g. `primary` rose scale + neutral warm grays); no hardcoded hex in components.
- Footer: contact, WhatsApp button, social links, legal pages.

## 6. Key Components

| Component | Responsibility |
|---|---|
| `AppDrawer` | Slide-in menu, focus-trapped, closes on route change |
| `CategoryPage` | Maps `category.models` → grid of `ProductCard`; zero filtering UI |
| `ProductCard` | Photo, clear variant label ("2C — Standard"), starting price, tap target ≥48px |
| `ProductGallery` | Swipeable multi-angle viewer (embla or native scroll-snap) |
| `PricePanel` | Age-group selector (baby only), frame selector (2 options), computed starting price, "final price depends on frame size" disclaimer |
| `WhyThisPrice` | Customized configuration breakdown |
| `BookNowButton` | Builds WhatsApp URL from current selection context |
| `AlsoLike` | Renders `relatedIds` cards |

## 7. Build Order & Verification Checkpoints

| # | Slice | Verify before proceeding |
|---|---|---|
| 1 | Scaffold (Vite+React+Tailwind), theme tokens, router shell, AppDrawer with 10 categories | Drawer works on 375px viewport; all routes resolve |
| 2 | `catalog.ts` schema + seed data for Baby Casting (4 models, real copy from reference) + pricing/booking libs + unit tests | Pricing tests green; WhatsApp URL matches template |
| 3 | CategoryPage + ProductCard (Baby first, then replicate to other categories) | E2E: menu→baby→4 models with prices ≤3 taps |
| 4 | ProductPage: gallery, PricePanel, WhyThisPrice, BookNow, AlsoLike | E2E: select age+frame → price updates → correct wa.me link |
| 5 | Seed remaining categories (couple/family/belly/pet/aashirvaad/resin/garland/kits/others) | Each category page renders its models; placeholders flagged where photos pending (Malini) |
| 6 | Landing page (detailed plan after SPEC approval) | Lighthouse mobile ≥85 |
| 7 | Contact/privacy/terms, legacy redirects, deploy pipeline | Clean console; production URL live |

Risks & mitigations:
- **Missing photography** (Aashirvaad, resin art, garlands) → placeholder-styled cards labeled "Photos coming soon"; data model already supports it.
- **Price changes mid-build** → all in `catalog.ts`; single edit point by design.
- **Scope creep into e-commerce/payments** → out of scope v1 (spec Boundary: never).

## 8. Performance & Accessibility Budgets

- Images: WebP/AVIF, responsive `srcset`, lazy-load below fold; gallery images pre-sized.
- JS budget: <200KB gzipped initial bundle (code-split product page if needed).
- Every interactive element ≥44px touch target, visible focus ring, drawer traps focus, alt text on all product photos.
- Zero CLS: explicit width/height on all images.

## 9. Open Technical Questions (mirrors SPEC)

1. Final host + domain strategy (redirects from old URLs?)
2. Real prices per variant → fill `baseInr` values
3. Frame option names/photos → fill `FrameOption`
4. Do we keep old `/baby-casting/product/…` URLs for SEO continuity?
