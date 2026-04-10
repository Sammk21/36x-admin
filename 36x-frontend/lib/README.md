# Frontend Data Utilities

Typed fetch clients for Medusa (commerce) and Strapi (CMS) with full TypeScript support.

---

## Setup

Copy the env template and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key

NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_TOKEN=your_read_only_api_token
```

---

## File Structure

```
lib/
  medusa.ts        — Medusa Store API client
  strapi.ts        — Strapi REST API client + image helper
  types/
    medusa.ts      — Medusa response types, query param types
    strapi.ts      — Strapi content types, component types, media types
    index.ts       — re-exports all types
```

---

## Medusa Client (`lib/medusa.ts`)

Wraps the Medusa Store API with typed fetch helpers. Supports the Strapi virtual links via the `withStrapi*` options.

### Import

```ts
import { medusa } from '@/lib/medusa'
```

### `medusa.products.retrieve(handle, params?, next?)`

Fetch a single product by handle.

```ts
// Commerce data only
const product = await medusa.products.retrieve('my-tee')

// With basic Strapi data (variants, options — no rich fields)
const product = await medusa.products.retrieve('my-tee', {
  withStrapi: true,
})

// With Strapi data on product + its categories + its collection
const product = await medusa.products.retrieve('my-tee', {
  withStrapi: true,
  withStrapiCategories: true,
  withStrapiCollection: true,
})

// Access the virtual link data
product.strapi_product?.title
product.categories[0]?.strapi_category?.description
product.collection?.strapi_collection?.chapter_label
```

### `medusa.products.list(params?, next?)`

List products with optional filters.

```ts
// All products
const { products, count } = await medusa.products.list()

// By collection
const { products } = await medusa.products.list({
  collection_id: 'pcol_123',
})

// By category with Strapi data
const { products } = await medusa.products.list({
  category_id: 'pcat_456',
  withStrapi: true,
  withStrapiCategories: true,
  limit: 12,
  offset: 0,
})
```

**Available params:**

| Param | Type | Description |
|-------|------|-------------|
| `handle` | `string` | Filter by handle |
| `collection_id` | `string \| string[]` | Filter by collection |
| `category_id` | `string \| string[]` | Filter by category |
| `tags` | `string[]` | Filter by tags |
| `limit` | `number` | Page size (default: 20) |
| `offset` | `number` | Pagination offset |
| `withStrapi` | `boolean` | Include `strapi_product` via virtual link |
| `withStrapiCategories` | `boolean` | Include `strapi_category` on each category |
| `withStrapiCollection` | `boolean` | Include `strapi_collection` on collection |
| `extraFields` | `string` | Raw fields string appended to the query |

### `medusa.collections.retrieve(id, params?, next?)`

```ts
const collection = await medusa.collections.retrieve('pcol_123')

// With Strapi editorial fields via virtual link
const collection = await medusa.collections.retrieve('pcol_123', {
  withStrapi: true,
})
collection.strapi_collection?.chapter_label
collection.strapi_collection?.accent_color
```

### `medusa.collections.list(params?, next?)`

```ts
const { collections } = await medusa.collections.list()

const { collections } = await medusa.collections.list({ withStrapi: true })
```

### `medusa.categories.retrieve(id, params?, next?)`

```ts
const category = await medusa.categories.retrieve('pcat_123', {
  withStrapi: true,
})
category.strapi_category?.description
```

### `medusa.categories.list(params?, next?)`

```ts
const { product_categories } = await medusa.categories.list({
  withStrapi: true,
  include_descendants_tree: true,
})
```

---

## Strapi Client (`lib/strapi.ts`)

Direct Strapi REST API client. Use this when you need rich content fields that the virtual link doesn't populate (gallery images, pairings, concept slides, reviews, etc.) or for Strapi-only content types.

### Import

```ts
import { strapi, strapiImage } from '@/lib/strapi'
```

---

### Products

#### `strapi.products.find(params?)`

Returns products with **all rich fields populated**: gallery, concept slides, pairings, review data, artist collaborations, variants, options.

```ts
// All products
const products = await strapi.products.find()

// By Medusa ID
const products = await strapi.products.find({ medusaId: 'prod_123' })

// By handle
const products = await strapi.products.find({ handle: 'my-tee' })
```

#### `strapi.products.findOne(medusaId)`

Convenience wrapper — returns the first match or `null`.

```ts
const strapiProduct = await strapi.products.findOne('prod_123')

strapiProduct?.gallery_images       // GalleryImage[]
strapiProduct?.concept_slides       // ConceptSlide[]
strapiProduct?.pairings             // ProductPairing[]
strapiProduct?.review_headline      // string | null
strapiProduct?.review_sentiment_bars // SentimentBar[]
strapiProduct?.artist_collaborations // StrapiArtistCollaboration[]
```

---

### Categories

#### `strapi.categories.find(params?)`

```ts
const categories = await strapi.categories.find()
const categories = await strapi.categories.find({ handle: 'apparel' })
```

#### `strapi.categories.findOne(medusaId)`

```ts
const category = await strapi.categories.findOne('pcat_123')
category?.description  // rich text from Strapi
```

---

### Collections

#### `strapi.collections.find(params?)`

Returns collections with `cover_image` and `comic_strip_image` populated.

```ts
const collections = await strapi.collections.find()
const collections = await strapi.collections.find({ handle: 'ss-25' })
```

#### `strapi.collections.findOne(medusaId)`

```ts
const collection = await strapi.collections.findOne('pcol_123')

collection?.chapter_number    // number | null
collection?.chapter_label     // string | null
collection?.chapter_subtitle  // string | null
collection?.accent_color      // string | null
collection?.artist_credit     // string | null
collection?.cover_image       // StrapiMedia | null
collection?.comic_strip_image // StrapiMedia | null
```

---

### Artists

#### `strapi.artists.find(params?)`

```ts
// All artists
const artists = await strapi.artists.find()

// Only artists shown on homepage, sorted by homepage_order
const artists = await strapi.artists.find({ homepageOnly: true })
```

#### `strapi.artists.findOne(handle)`

```ts
const artist = await strapi.artists.findOne('jane-doe')

artist?.title
artist?.bio
artist?.cover_image  // StrapiMedia
```

---

### Social Feed

#### `strapi.socialFeed.find(params?)`

```ts
// Active posts, sorted by display_order
const posts = await strapi.socialFeed.find()

// Limit to 9
const posts = await strapi.socialFeed.find({ limit: 9 })

// Include inactive posts
const posts = await strapi.socialFeed.find({ activeOnly: false })
```

---

### Page Content (Single Types)

These have no Medusa equivalent — always fetched directly from Strapi.

#### `strapi.pages.home()`

```ts
const homePage = await strapi.pages.home()

homePage.topImage       // StrapiMedia | null
homePage.bgTileImage    // StrapiMedia | null
homePage.sections       // dynamic zone sections
```

#### `strapi.pages.navigation()`

```ts
const nav = await strapi.pages.navigation()

nav.logo        // StrapiMedia | null
nav.nav_items   // NavItem[] (with nested dropdown sections)
nav.cart_label  // string | null
```

#### `strapi.pages.categoriesListing()`

```ts
const page = await strapi.pages.categoriesListing()
page.hero  // HeroComponent[]
```

#### `strapi.pages.collectionsListing()`

```ts
const page = await strapi.pages.collectionsListing()
page.hero  // HeroComponent[]
```

#### `strapi.pages.collectionTimeline()`

```ts
const page = await strapi.pages.collectionTimeline()
page.collectionTimeline  // CollectionTimeline[]
```

---

### Image Helper

#### `strapiImage(media, format?)`

Resolves a `StrapiMedia` object to an absolute URL. Handles both relative paths (self-hosted Strapi) and absolute URLs (Strapi Cloud).

```ts
import { strapiImage } from '@/lib/strapi'

strapiImage(product.thumbnail)             // original URL
strapiImage(product.thumbnail, 'medium')   // responsive format
strapiImage(product.thumbnail, 'small')    // thumbnail size
strapiImage(null)                          // returns null safely
```

Use with Next.js `<Image>`:

```tsx
<Image
  src={strapiImage(collection.cover_image, 'large') ?? '/fallback.jpg'}
  alt={collection.cover_image?.alternativeText ?? collection.title}
  fill
/>
```

---

## When to use which client

| Data needed | Use |
|-------------|-----|
| Prices, inventory, cart, checkout | `medusa.*` |
| Product variants and options | `medusa.products.retrieve()` |
| Basic Strapi fields alongside Medusa data | `medusa.products.retrieve({ withStrapi: true })` |
| Gallery, concept slides, pairings, reviews | `strapi.products.findOne(medusaId)` |
| Collection editorial fields (chapter, cover, color) | `strapi.collections.findOne(medusaId)` |
| Artist collaboration pages | `strapi.artists.findOne(handle)` |
| Instagram / social feed | `strapi.socialFeed.find()` |
| Home page layout, navigation | `strapi.pages.home()` / `strapi.pages.navigation()` |
| Listing page hero content | `strapi.pages.categoriesListing()` etc. |

---

## Common Patterns

### Product detail page — full data

```ts
// app/(product)/product/[slug]/page.tsx
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const medusaProduct = await medusa.products.retrieve(params.slug)

  // Fetch rich CMS content in parallel
  const strapiProduct = await strapi.products.findOne(medusaProduct.id)

  return <ProductDetail product={medusaProduct} cms={strapiProduct} />
}
```

### Collection page

```ts
// app/(collection)/collection-page/[handle]/page.tsx
export default async function CollectionPage({ params }: { params: { handle: string } }) {
  const [medusaResult, strapiCollections] = await Promise.all([
    medusa.products.list({ limit: 24 }),
    strapi.collections.find({ handle: params.handle }),
  ])

  const cms = strapiCollections[0]

  return (
    <>
      {cms?.cover_image && (
        <Image src={strapiImage(cms.cover_image, 'large')!} alt={cms.title} fill />
      )}
      <ProductGrid products={medusaResult.products} />
    </>
  )
}
```

### Home page with navigation

```ts
// app/layout.tsx
export default async function RootLayout({ children }) {
  const nav = await strapi.pages.navigation({
    next: { revalidate: 3600 }, // cache for 1 hour
  })

  return (
    <html>
      <body>
        <Nav data={nav} />
        {children}
      </body>
    </html>
  )
}
```

### Next.js cache control

All functions accept a `next` parameter for fine-grained cache control:

```ts
// Cache for 1 hour
const nav = await strapi.pages.navigation({ next: { revalidate: 3600 } })

// Never cache (always fresh)
const product = await medusa.products.retrieve('my-tee', {}, { next: { revalidate: 0 } })

// Cache until manually revalidated
const homePage = await strapi.pages.home({ next: { revalidate: false } })
```

---

## TypeScript Types

All types are exported from `@/lib/types`:

```ts
import type {
  // Strapi
  StrapiProduct,
  StrapiProductCollection,
  StrapiProductCategory,
  StrapiArtistCollaboration,
  StrapiSocialFeedPost,
  StrapiMedia,
  GalleryImage,
  ConceptSlide,
  SentimentBar,
  ProductPairing,
  // Medusa
  MedusaProduct,
  MedusaProductCollection,
  MedusaProductCategory,
  MedusaProductVariant,
} from '@/lib/types'
```
