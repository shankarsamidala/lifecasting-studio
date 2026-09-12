# Spec: Lifecasting Studio Website (Rebuild)

Status: **DRAFT — awaiting review**
Date: 2026-08-26
Reference site: https://lifecastingstudio.in (see `docs/reference-lifecastingstudio.md`)

---

## ASSUMPTIONS I'M MAKING (correct me or I proceed)

1. Greenfield build in this repo — we do NOT have the reference site's source code; we rebuild from scratch using scraped content as the base.
2. Web app (responsive mobile-first), not a native app. Mobile experience is designed FIRST.
3. Booking happens via WhatsApp deep-link (same number as reference: +91 63838 93672), not an online payment checkout.
4. Content (models, prices, photos) is managed as static data files (JSON/TS) edited by us — no CMS/admin panel in v1.
5. Tech stack: React + Vite + Tailwind CSS (mirrors the reference site's stack; fast, cheap hosting).
6. The two frame options are: **Classic Frame** and **Display Box** — exact names/photos pending from you.
7. "Aashirvaad Casting" stays as its own menu item (not merged into couple casting); Malini will supply updated sample photos.
8. Prices shown are STARTING prices; final quote depends on frame size and is settled on WhatsApp/in person.

---

## Objective

Rebuild the Lifecasting Studio website as a **mobile-first catalog for women customers** (expecting mothers, wives, families). Success = a first-time visitor can go from opening the site → seeing all options for a service with prices → tapping Book Now in **under 60 seconds and at most 3 taps**, without ever needing to understand "categories" or navigate hierarchies.

### User stories
- As a mother-to-be on my phone, I open the hamburger menu, tap "Baby Casting", and instantly see every model (2C/4C × Standard/Customized) with its starting price.
- As a visitor on any model, I see photos from multiple angles, what's included, measurements, why customized costs more, and a Book Now button.
- As a curious visitor, I can request something custom ("Others") and reach the studio in one tap.

---

## Capability Map

| Module id | Responsibility | Depends on |
|---|---|---|
| `shell-nav` | Layout, left-side drawer/hamburger menu, header/footer, pink theme | — |
| `catalog-data` | Static data model: categories, models, variants, price rules, frame options, photos | — |
| `category-pages` | One page per casting type listing ALL models flat (no drill-down) | `catalog-data`, `shell-nav` |
| `product-detail` | Model page: angle gallery, info, measurements, customization breakdown, price-by-age, Book Now, "You may also like" | `catalog-data`, `shell-nav` |
| `booking` | WhatsApp deep-link CTA carrying product/variant/age context; contact page & form | `catalog-data` |
| `landing-page` | Home: hero, category grid, how-it-works, safety/trust, testimonials, FAQ, CTA | `catalog-data`, `shell-nav`, `booking` |
| `content-pages` | Privacy, Terms, About/Contact static pages | `shell-nav` |

**Build order:** `catalog-data` + `shell-nav` → `category-pages` → `product-detail` → `booking` → `landing-page` → `content-pages`

---

## Catalog & Menu Structure (v1)

Left drawer menu order (proposed — confirm):

1. **Baby Casting** → flat grid of 4 models:
   - 2 Casts (1 Hand + 1 Feet) — Standard
   - 2 Casts (1 Hand + 1 Feet) — Customized
   - 4 Casts (2 Hands + 2 Feet) — Standard
   - 4 Casts (2 Hands + 2 Feet) — Customized
2. **Couple Casting**
3. **Family Casting**
4. **Belly Casting**
5. **Pet Casting**
6. **Aashirvaad (Blessing) Casting**
7. **Resin Art & Keepsakes** — resin work without metal; baby detail preservation (hair, mother's milk) described simply as "keepsake preservation" on-page
8. **Garland Preservation** — couple/wedding garlands
9. **Baby Kits**
10. **Others** — custom requests → routes to WhatsApp/contact form

Non-negotiable UX rules:
- Clicking a category shows ALL its models on ONE page. No intermediate "choose style/category" step (removes the reference site's two-level drill-down).
- Standard vs Customized are clearly labeled on each card — not hidden behind a toggle.
- Every card shows starting price. Price must be visible without scrolling into fine print.
- If a category has only 1–2 items it still gets its own page (simple beats clever).
- Gallery removed as a top-level destination (photos live inside category/model pages). Theme color: pink.

## Pricing Rules

- All prices in INR, displayed as "Starting from ₹X".
- Baby casting age groups: **0–1 year** (base price) and **Above 1 year** (+₹500–₹1000 depending on frame size). Selector appears on baby product pages only.
- Customization premium explained inline in a "Why this price?" / configuration section (what changes: frame type, finish, extras).
- Final price depends on chosen frame option and size; negotiated via WhatsApp. Disclaimer line shown near price.

## Product Detail Page (per model)

1. Photo gallery — multiple angles, swipeable on mobile
2. Title, clear variant label ("2C — Standard"), short description
3. What's included + measurements (reuse existing measurement content)
4. Age-group selector (baby only) → updates starting price
5. Frame option selector (exactly 2 options)
6. "Why this price?" configuration breakdown for Customized
7. Book Now (WhatsApp deep link pre-filled with model + variant + age group)
8. "You may also like" — related models (e.g., viewing 2C Standard suggests 4C and Customized variants)

## Commands

```
Dev:        npm run dev
Build:      npm run build
Preview:    npm run preview
Lint:       npm run lint
Test:       npm test
E2E:        npm run test:e2e   (Playwright, added when UI exists)
```
(Final tooling confirmed in TDD; commands locked once scaffolded.)

## Project Structure

```
docs/            → SPEC.md, TDD.md, reference notes
tasks/           → plan.md, todo.md (task tracking)
src/
  components/    → shared UI (Drawer, ProductCard, PriceTag, Gallery…)
  pages/         → route components (Home, Category, Product, Contact…)
  data/          → catalog.json / catalog.ts (single source of truth)
  lib/           → pricing helpers, whatsapp link builder
tests/           → unit tests
e2e/             → Playwright specs
public/images/   → product photography
```

## Testing Strategy

- Unit: pricing logic (age group × frame × variant = displayed starting price) and WhatsApp link builder — Vitest.
- Component: Drawer navigation renders all categories; category page renders ALL models flat — Testing Library.
- E2E (Playwright): the core journey — open menu → tap Baby Casting → see 4 models with prices → open 2C Standard → select age group → price updates → Book Now opens correct WhatsApp link.
- Coverage bar: 100% on `lib/` (pricing/link builders); component smoke tests on all pages.

## Boundaries

**Always**
- Keep every price change in one place (`data/catalog.*`), never hardcoded in components
- Test pricing logic before changing it
- Verify mobile layout (≤400px viewport) before considering any UI done
- Keep copy in simple language; avoid over-explaining keepsake preservation items

**Ask first**
- Adding/removing a category or model
- Changing displayed prices or the ₹ differential between age groups
- Adding dependencies, CMS/backend, payments
- Renaming routes after launch

**Never**
- Show a price that isn't labeled as a starting price
- Put metal/preservation technical details on public resin-art pages (client instruction)
- Commit real customer photos/data without consent
- Add online payment in v1

## Success Criteria

- [ ] Hamburger menu lists all 10 menu entries; each opens directly to a flat model list
- [ ] Baby Casting page shows exactly 4 models with clearly labeled variants + starting prices, no drill-down steps
- [ ] Any model reachable in ≤3 taps from cold load; total taps menu→Book Now ≤3
- [ ] Age selector toggles price by the configured differential (₹500–1000)
- [ ] Exactly 2 frame options selectable per model
- [ ] Book Now opens WhatsApp with correct pre-filled model/variant/age text
- [ ] Pink theme applied globally; no legacy gallery entry point
- [ ] Lighthouse mobile performance ≥ 85; zero console errors
- [ ] All pricing values sourced from catalog data file only

## Open Questions

1. Exact names/photos for the TWO frame options?
2. Final prices per model/variant/age group (need your numbers — spec carries placeholders)?
3. Confirm menu list & order (esp. Belly Casting inclusion and where Aashirvaad sits)?
4. Do Resin Art, Garland Preservation, Baby Kits get real model cards now, or placeholder pages until Malini's photos arrive?
5. Domain/hosting target (keep lifecastingstudio.in?) and does old URL structure need redirects?
6. Language: English only, or English + Kannada/Hindi toggle later?
