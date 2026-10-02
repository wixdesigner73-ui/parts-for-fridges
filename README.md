# Parts For Fridges – front-end prototype

Open `index.html` (hash-routed, no build step). Add `?sample=1` to preview product/model templates with dev-only fake data (`js/sample-data.js`, never ship).

## Files
- `js/data.js` – brands, 5 active models, empty parts list (no launch inventory supplied yet)
- `js/search.js` – normalisation + exact-match routing. Pure functions; paste into a Velo backend module (`search.web.js`) as-is
- `js/art.js` – SVG product-render placeholders; replace with real 3D renders (`<img>`) for production
- `js/app.js`, `css/styles.css` – templates: Home, Brands, Brand, Model, Product, Search result, info pages

## Wix mapping
| Prototype | Wix |
|---|---|
| `brands`, `models` (`active` flag) | CMS: Brands, RefrigeratorModels (Active Catalogue Model) |
| `parts[].mpn`, `models`, `compat` | CMS: PartDetails (MPN + normalised MPN, multi-ref / junction to models) → one Wix Stores product |
| `sku`, `price`, `stock` | Wix Stores native fields (one shared inventory) |
| `notCarried` | CMS: KnownParts not carried (optional) |
| Request form | Velo insert into `PartRequests`; prefill via query param |
| Breadcrumb `?model=` | Same pattern with a Velo query param; neutral fallback when absent |

Search rules: case-insensitive, spaces and hyphens ignored, `/` preserved (`/00` ≠ `/02`), complete identifiers only, ambiguous keys → "no exact match".

## Open items
- Client colours/fonts not supplied: tokens in `:root` of `styles.css` are a proposal.
- Brand logos: wordmark placeholders – use client-supplied logo files.
- Policy pages show "Client-approved content to be added".

## Photography (`img/`)
Unsplash-licensed stock photos used as placeholders (hero, brand tiles, search panels, featured, final CTA). They show third-party appliances and are not client product shots – replace with approved imagery. Floating part illustrations are SVG stand-ins for real 3D renders.
