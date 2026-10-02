/* Parts For Fridges – catalogue data (source of truth for the prototype).
 *
 * Mirrors the CMS architecture in the Final Development Scope:
 *   Brands → Refrigerator Models (active / compatibility-only) → Parts (Part Details) ⇄ Wix Stores product.
 *
 * NO products are included: the launch inventory sheet has not been supplied.
 * Add parts here (or, on Wix, in the CMS / Wix Stores) – never duplicate a part per model.
 *
 * Part shape:
 * {
 *   slug, title,            // title may end with " – <MPN>"
 *   mpn,                    // manufacturer part number (separate from sku, used by search)
 *   sku,                    // Parts For Fridges SKU (Wix Stores SKU field)
 *   price, stock,           // from Wix Stores; stock is ONE shared quantity
 *   type,                   // 'drawer' | 'shelf' | 'filter' | 'bin' | 'other' (illustration only)
 *   description,            // optional approved text
 *   models:  [modelSlug],   // active models this part is listed under
 *   compat:  [ "MODEL/00" ] // compatibility-only model numbers (never browsable)
 * }
 */
window.PFF_DATA = {
  currency: 'CAD',
  brands: [
    { name: 'LG', slug: 'lg', active: true },
    { name: 'Samsung', slug: 'samsung', active: true },
    { name: 'Frigidaire', slug: 'frigidaire', active: true },
    { name: 'KitchenAid', slug: 'kitchenaid', active: true },
    { name: 'Whirlpool', slug: 'whirlpool', active: true },
    { name: 'Maytag', slug: 'maytag', active: true },
    { name: 'Amana', slug: 'amana', active: true },
    { name: 'Kenmore', slug: 'kenmore', active: true },
    { name: 'GE', slug: 'ge', active: true }
  ],
  // active = "Active Catalogue Model" (has its own page). Compatibility-only models
  // are recorded with active:false and never appear on brand pages.
  models: [
    { number: 'LFX28968S/00', brand: 'lg', slug: 'lfx28968s-00', active: true },
    { number: 'LTCS20020S/00', brand: 'lg', slug: 'ltcs20020s-00', active: true },
    { number: 'RT18M6213SR/AA', brand: 'samsung', slug: 'rt18m6213sr-aa', active: true },
    { number: 'RF28K9580SR/AC', brand: 'samsung', slug: 'rf28k9580sr-ac', active: true },
    { number: 'GRMC2273BF01', brand: 'frigidaire', slug: 'grmc2273bf01', active: true }
  ],
  parts: [],
  // Manufacturer part numbers we know of but do not currently carry.
  notCarried: []
};
