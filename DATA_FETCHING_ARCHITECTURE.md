# Data Fetching Architecture: Medusa + Strapi

## 1. Can you fetch Strapi-extended data via the Medusa SDK?

**Yes, partially.** Three `defineLink` virtual links wire Strapi data into Medusa's query engine:

| Link file | Medusa entity | `fields` alias |
|-----------|---------------|----------------|
| `src/links/product-strapi.ts` | Product | `strapi_product` |
| `src/links/product-category-strapi.ts` | ProductCategory | `strapi_category` |
| `src/links/product-collection-strapi.ts` | ProductCollection | `strapi_collection` |

These are `readOnly` links — Medusa routes the `fields=*strapi_*` query to `StrapiModuleService.list()`, which calls the Strapi REST API and returns the result inline.

### What comes back via the virtual link (currently):

| Alias | Fields returned | What is NOT returned |
|-------|----------------|----------------------|
| `strapi_product` | Core fields + `variants.option_values` + `options.values` | `gallery_images`, `concept_slides`, `pairings`, `review_*`, `gallery_video` |
| `strapi_category` | Core fields only | No media or component fields (no populate configured) |
| `strapi_collection` | Core fields only | `cover_image`, `comic_strip_image`, `chapter_*`, `accent_color`, `artist_credit` |

> The rich/extended component fields are missing because `StrapiModuleService.listProducts/Categories/Collections()` does not pass `populate` params for them. To include them, update `service.ts`.

### Performance caveat

`list()` fetches each entity with a separate HTTP call in a `for` loop — not a batch query. Listing 20 products triggers 20 sequential Strapi HTTP requests. This is an N+1 pattern.

---

## 2. API Query Examples (via Medusa `fields` param)

### Categories and Collections

```
GET /store/product-categories?fields=*strapi_category
GET /store/product-categories/:id?fields=*strapi_category

GET /store/collections?fields=*strapi_collection
GET /store/collections/:id?fields=*strapi_collection
```

### Products with nested Strapi extensions

```
# Product + its own Strapi data
GET /store/products/:id?fields=*strapi_product

# Product + category Strapi data
GET /store/products/:id?fields=*strapi_product,categories.strapi_category

# Product + collection Strapi data
GET /store/products/:id?fields=*strapi_product,collection.strapi_collection

# Everything in one call
GET /store/products/:id?fields=*strapi_product,categories.*,categories.strapi_category,collection.*,collection.strapi_collection
```

### Using the Medusa JS SDK

```ts
// Get category with Strapi data
const { product_category } = await medusa.admin.productCategories.retrieve(
  "pcat_123",
  { fields: "*strapi_category" }
)

// Get collection with Strapi data
const { collection } = await medusa.admin.collections.retrieve(
  "pcol_456",
  { fields: "*strapi_collection" }
)

// Get product with all Strapi extensions
const { product } = await medusa.products.retrieve(handle, {
  fields: [
    '*strapi_product',
    'categories.*',
    'categories.strapi_category',
    'collection.*',
    'collection.strapi_collection'
  ].join(',')
})
```

---

## 3. Data Ownership Map

### Medusa is the source of truth for:

| Entity | Fields |
|--------|--------|
| Product | title, subtitle, description, handle, images, thumbnail, status, tags |
| Product Variant | title, sku, prices, inventory |
| Product Option | title |
| Product Option Value | value |
| Product Category | name, handle, description, is_active, is_internal |
| Product Collection | title, handle |

### Strapi extends with (currently NOT returned by virtual link — needs `service.ts` populate update):

| Field | Type | Entity |
|-------|------|--------|
| `gallery_images` | component array | Product |
| `gallery_video` | media | Product |
| `concept_slides` | component array | Product |
| `review_headline`, `review_summary` | text | Product |
| `review_sentiment_bars` | component array | Product |
| `review_dominant_icon` | text | Product |
| `pairings` | component array | Product |
| `chapter_number`, `chapter_label`, `chapter_subtitle` | text | Collection |
| `comic_strip_image`, `cover_image` | media | Collection |
| `accent_color`, `artist_credit` | text | Collection |

### Strapi-only content types (no Medusa equivalent, always fetch from Strapi directly):

| Content Type | Strapi endpoint |
|-------------|-----------------|
| `artist-collaboration` | `/api/artist-collaborations` |
| `social-feed-post` | `/api/social-feed-posts` |
| `home-page` | `/api/home-page` (single type) |
| `global-navigation` | `/api/global-navigation` (single type) |
| `categories-listing-page` | `/api/categories-listing-page` (single type) |
| `collections-listing-page` | `/api/collections-listing-page` (single type) |
| `collection-timeline-page` | `/api/collection-timeline-page` (single type) |

---

## 4. Recommended Frontend Strategy

### Option A — Use the virtual link (simpler, fewer requests)

Best for: basic Strapi fields on product/category/collection pages where rich components aren't needed yet.

```ts
const { product } = await fetch(
  `${MEDUSA_URL}/store/products/${handle}?` +
  `fields=*strapi_product,categories.strapi_category,collection.strapi_collection`
).then(r => r.json())

// Core commerce data
const price = product.variants[0].calculated_price
// Basic Strapi data (no component fields until service.ts is updated)
const strapiTitle = product.strapi_product?.title
```

### Option B — Parallel fetch + merge (full rich content)

Best for: product detail pages that need gallery, pairings, concept slides, etc.

```ts
// In parallel
const [medusaProduct, strapiProduct] = await Promise.all([
  fetch(`${MEDUSA_URL}/store/products/${handle}?fields=+variants,+options,+categories,+collection`)
    .then(r => r.json()).then(r => r.product),

  fetch(
    `${STRAPI_URL}/api/products?filters[medusaId][$eq]=${medusaId}` +
    `&populate[gallery_images]=true` +
    `&populate[concept_slides]=true` +
    `&populate[review_sentiment_bars]=true` +
    `&populate[pairings][populate]=*` +
    `&populate[artist_collaborations][populate][cover_image]=true`
  ).then(r => r.json()).then(r => r.data[0])
])

const product = { ...medusaProduct, cms: strapiProduct }
```

### Strapi-only pages (always direct)

```ts
// Page layouts — no Medusa equivalent
const homePage = await fetch(`${STRAPI_URL}/api/home-page?populate=deep`).then(r => r.json())
const nav = await fetch(`${STRAPI_URL}/api/global-navigation?populate[nav_items][populate][dropdown_sections][populate]=*`).then(r => r.json())
const timeline = await fetch(`${STRAPI_URL}/api/collection-timeline-page?populate=deep`).then(r => r.json())

// Artist pages
const artist = await fetch(
  `${STRAPI_URL}/api/artist-collaborations?filters[handle][$eq]=${handle}` +
  `&populate[cover_image]=true&populate[products][populate][thumbnail]=true`
).then(r => r.json())
```

---

## 5. Architecture Summary Table

| Data need | Source | How |
|-----------|--------|-----|
| Product prices, inventory, stock | Medusa SDK | `store.product.retrieve()` |
| Product variants and options | Medusa SDK | `store.product.retrieve()` |
| Cart, checkout, orders | Medusa SDK | Native |
| Basic Strapi product/category/collection fields | Medusa SDK | `fields=*strapi_product` etc. |
| Rich product content (gallery, pairings, concept slides, reviews) | Strapi REST directly | `?filters[medusaId][$eq]=...&populate=...` |
| Collection editorial fields (chapter, cover, color) | Strapi REST directly | `?filters[medusaId][$eq]=...&populate=...` |
| Artist collaborations | Strapi REST directly | `/api/artist-collaborations` |
| Social feed posts | Strapi REST directly | `/api/social-feed-posts?sort=display_order` |
| Page layouts (home, nav, listing pages, timeline) | Strapi REST directly | Single type endpoints with `?populate=deep` |

---

## 6. Known Issues to Fix in `service.ts`

To make the virtual link return the full rich content, update the `listProducts`, `listCategories`, and `listCollections` methods in `medusa/src/modules/strapi/service.ts`:

```ts
// listProducts — add to populate:
populate: {
  variants: { populate: ["option_values", "images", "thumbnail"] },
  options: { populate: ["values"] },
  gallery_images: true,
  gallery_video: true,
  concept_slides: { populate: ["image"] },
  review_sentiment_bars: true,
  pairings: { populate: ["item_a_image", "item_b_image", "result_image"] },
  artist_collaborations: { populate: ["cover_image"] },
}

// listCollections — add populate:
populate: {
  cover_image: true,
  comic_strip_image: true,
}
```

> Note: adding more populate fields increases per-request payload. For listing pages with many products, Option B (parallel fetch) is more efficient.

---

## 7. Required Configuration

1. **Strapi CORS** — allow your frontend and Medusa backend domains.
2. **Strapi public role** — `find`/`findOne` permissions for product, product-category, product-collection, artist-collaboration, social-feed-post, and all single types.
3. **Strapi API token** — use a read-only token for frontend calls; set `STRAPI_API_TOKEN` env var.
4. **`medusaId` prerequisite** — the virtual link only works after the Medusa sync workflow has run. New products need the sync to complete before Strapi data is queryable.

---

## 8. Recommended Project Structure

```
lib/
  medusa.ts       — typed wrappers around Medusa SDK calls
  strapi.ts       — typed fetch helpers for Strapi REST API (direct calls)
  product.ts      — merges Medusa + Strapi into a unified ProductPage type
  pages/
    home.ts       — fetches home-page single type
    navigation.ts — fetches global-navigation single type
```
