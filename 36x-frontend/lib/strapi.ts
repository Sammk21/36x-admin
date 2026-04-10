import type {
  StrapiListResponse,
  StrapiSingleResponse,
  StrapiProduct,
  StrapiProductCategory,
  StrapiProductCollection,
  StrapiArtistCollaboration,
  StrapiSocialFeedPost,
  StrapiHomePage,
  StrapiGlobalNavigation,
  StrapiCategoriesListingPage,
  StrapiCollectionsListingPage,
  StrapiCollectionTimelinePage,
  StrapiMedia,
} from "./types/strapi"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"

const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN ?? ""

// ---------------------------------------------------------------------------
// Image helper
// ---------------------------------------------------------------------------

/**
 * Resolves a Strapi media URL to an absolute URL.
 * Strapi v5 self-hosted returns relative paths like `/uploads/image.jpg`.
 */
export function strapiImage(
  media: StrapiMedia | null | undefined,
  format?: "thumbnail" | "small" | "medium" | "large"
): string | null {
  if (!media) return null
  const raw =
    format && media.formats?.[format]
      ? media.formats[format]!.url
      : media.url
  if (!raw) return null
  return raw.startsWith("http") ? raw : `${STRAPI_URL}${raw}`
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

type FetchOptions = {
  /** Next.js cache/revalidate options */
  next?: NextFetchRequestConfig
}

async function strapiRequest<T>(
  path: string,
  params: Record<string, string> = {},
  options: FetchOptions = {}
): Promise<T> {
  const url = new URL(`${STRAPI_URL}/api${path}`)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (STRAPI_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`
  }

  const res = await fetch(url.toString(), {
    headers,
    next: options.next,
  })

  if (!res.ok) {
    throw new Error(
      `Strapi request failed: ${res.status} ${res.statusText} — ${url.toString()}`
    )
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Populate builders
// ---------------------------------------------------------------------------

/** Default populate for a product with all rich content */
const PRODUCT_POPULATE = {
  "populate[images]": "true",
  "populate[thumbnail]": "true",
  "populate[gallery_video]": "true",
  "populate[gallery_images][populate][image]": "true",
  "populate[concept_slides][populate][image]": "true",
  "populate[review_sentiment_bars]": "true",
  "populate[pairings][populate][item_a_image]": "true",
  "populate[pairings][populate][item_b_image]": "true",
  "populate[pairings][populate][result_image]": "true",
  "populate[artist_collaborations][populate][cover_image]": "true",
  "populate[variants][populate][images]": "true",
  "populate[variants][populate][thumbnail]": "true",
  "populate[variants][populate][option_values]": "true",
  "populate[options][populate][values]": "true",
}

/** Default populate for a collection with all editorial fields */
const COLLECTION_POPULATE = {
  "populate[cover_image]": "true",
  "populate[comic_strip_image]": "true",
}

/** Default populate for an artist collaboration */
const ARTIST_POPULATE = {
  "populate[cover_image]": "true",
  "populate[products][populate][thumbnail]": "true",
  "populate[products][populate][images]": "true",
}

// ---------------------------------------------------------------------------
// products
// ---------------------------------------------------------------------------

type ProductFindParams = {
  medusaId?: string
  handle?: string
  next?: NextFetchRequestConfig
}

async function findProducts(
  params: ProductFindParams = {}
): Promise<StrapiProduct[]> {
  const query: Record<string, string> = { ...PRODUCT_POPULATE }

  if (params.medusaId) {
    query["filters[medusaId][$eq]"] = params.medusaId
  }
  if (params.handle) {
    query["filters[handle][$eq]"] = params.handle
  }

  const res = await strapiRequest<StrapiListResponse<StrapiProduct>>(
    "/products",
    query,
    { next: params.next }
  )
  return res.data
}

async function findOneProduct(
  medusaId: string,
  next?: NextFetchRequestConfig
): Promise<StrapiProduct | null> {
  const results = await findProducts({ medusaId, next })
  return results[0] ?? null
}

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------

type CategoryFindParams = {
  medusaId?: string
  handle?: string
  next?: NextFetchRequestConfig
}

async function findCategories(
  params: CategoryFindParams = {}
): Promise<StrapiProductCategory[]> {
  const query: Record<string, string> = {}

  if (params.medusaId) {
    query["filters[medusaId][$eq]"] = params.medusaId
  }
  if (params.handle) {
    query["filters[handle][$eq]"] = params.handle
  }

  const res = await strapiRequest<StrapiListResponse<StrapiProductCategory>>(
    "/product-categories",
    query,
    { next: params.next }
  )
  return res.data
}

async function findOneCategory(
  medusaId: string,
  next?: NextFetchRequestConfig
): Promise<StrapiProductCategory | null> {
  const results = await findCategories({ medusaId, next })
  return results[0] ?? null
}

// ---------------------------------------------------------------------------
// collections
// ---------------------------------------------------------------------------

type CollectionFindParams = {
  medusaId?: string
  handle?: string
  next?: NextFetchRequestConfig
}

async function findCollections(
  params: CollectionFindParams = {}
): Promise<StrapiProductCollection[]> {
  const query: Record<string, string> = { ...COLLECTION_POPULATE }

  if (params.medusaId) {
    query["filters[medusaId][$eq]"] = params.medusaId
  }
  if (params.handle) {
    query["filters[handle][$eq]"] = params.handle
  }

  const res = await strapiRequest<StrapiListResponse<StrapiProductCollection>>(
    "/product-collections",
    query,
    { next: params.next }
  )
  return res.data
}

async function findOneCollection(
  medusaId: string,
  next?: NextFetchRequestConfig
): Promise<StrapiProductCollection | null> {
  const results = await findCollections({ medusaId, next })
  return results[0] ?? null
}

// ---------------------------------------------------------------------------
// artists
// ---------------------------------------------------------------------------

type ArtistFindParams = {
  handle?: string
  homepageOnly?: boolean
  next?: NextFetchRequestConfig
}

async function findArtists(
  params: ArtistFindParams = {}
): Promise<StrapiArtistCollaboration[]> {
  const query: Record<string, string> = { ...ARTIST_POPULATE }

  if (params.handle) {
    query["filters[handle][$eq]"] = params.handle
  }
  if (params.homepageOnly) {
    query["filters[show_on_homepage][$eq]"] = "true"
    query["sort"] = "homepage_order:asc"
  }

  const res = await strapiRequest<
    StrapiListResponse<StrapiArtistCollaboration>
  >("/artist-collaborations", query, { next: params.next })
  return res.data
}

async function findOneArtist(
  handle: string,
  next?: NextFetchRequestConfig
): Promise<StrapiArtistCollaboration | null> {
  const results = await findArtists({ handle, next })
  return results[0] ?? null
}

// ---------------------------------------------------------------------------
// social feed
// ---------------------------------------------------------------------------

type SocialFeedParams = {
  activeOnly?: boolean
  limit?: number
  next?: NextFetchRequestConfig
}

async function findSocialFeedPosts(
  params: SocialFeedParams = {}
): Promise<StrapiSocialFeedPost[]> {
  const query: Record<string, string> = {
    "populate[image]": "true",
    "sort": "display_order:asc",
  }

  if (params.activeOnly !== false) {
    query["filters[is_active][$eq]"] = "true"
  }
  if (params.limit) {
    query["pagination[pageSize]"] = String(params.limit)
  }

  const res = await strapiRequest<StrapiListResponse<StrapiSocialFeedPost>>(
    "/social-feed-posts",
    query,
    { next: params.next }
  )
  return res.data
}

// ---------------------------------------------------------------------------
// Single types (page content)
// ---------------------------------------------------------------------------

async function getHomePage(
  next?: NextFetchRequestConfig
): Promise<StrapiHomePage> {
  const query: Record<string, string> = {
    "populate[topImage]": "true",
    "populate[topImageOverlay]": "true",
    "populate[bgTileImage]": "true",
    "populate[sections][populate]": "*",
  }
  const res = await strapiRequest<StrapiSingleResponse<StrapiHomePage>>(
    "/home-page",
    query,
    { next }
  )
  return res.data
}

async function getGlobalNavigation(
  next?: NextFetchRequestConfig
): Promise<StrapiGlobalNavigation> {
  const query: Record<string, string> = {
    "populate[logo]": "true",
    "populate[nav_items][populate][dropdown_sections][populate][items]": "true",
  }
  const res = await strapiRequest<StrapiSingleResponse<StrapiGlobalNavigation>>(
    "/global-navigation",
    query,
    { next }
  )
  return res.data
}

async function getCategoriesListingPage(
  next?: NextFetchRequestConfig
): Promise<StrapiCategoriesListingPage> {
  const query: Record<string, string> = {
    "populate[hero][populate][buttons]": "true",
    "populate[product_category]": "true",
  }
  const res = await strapiRequest<
    StrapiSingleResponse<StrapiCategoriesListingPage>
  >("/categories-listing-page", query, { next })
  return res.data
}

async function getCollectionsListingPage(
  next?: NextFetchRequestConfig
): Promise<StrapiCollectionsListingPage> {
  const query: Record<string, string> = {
    "populate[hero][populate][buttons]": "true",
    "populate[pageShell][populate]": "*",
  }
  const res = await strapiRequest<
    StrapiSingleResponse<StrapiCollectionsListingPage>
  >("/collections-listing-page", query, { next })
  return res.data
}

async function getCollectionTimelinePage(
  next?: NextFetchRequestConfig
): Promise<StrapiCollectionTimelinePage> {
  const query: Record<string, string> = {
    "populate[sectionIntro][populate]": "*",
    "populate[collectionTimeline][populate][cards][populate][image]": "true",
  }
  const res = await strapiRequest<
    StrapiSingleResponse<StrapiCollectionTimelinePage>
  >("/collection-timeline-page", query, { next })
  return res.data
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const strapi = {
  /** Fetch products from Strapi with full rich content populated */
  products: {
    find: findProducts,
    findOne: findOneProduct,
  },
  /** Fetch categories from Strapi */
  categories: {
    find: findCategories,
    findOne: findOneCategory,
  },
  /** Fetch collections from Strapi with editorial fields populated */
  collections: {
    find: findCollections,
    findOne: findOneCollection,
  },
  /** Fetch artist collaboration entries */
  artists: {
    find: findArtists,
    findOne: findOneArtist,
  },
  /** Fetch social feed posts */
  socialFeed: {
    find: findSocialFeedPosts,
  },
  /** Fetch Strapi single-type page content */
  pages: {
    home: getHomePage,
    navigation: getGlobalNavigation,
    categoriesListing: getCategoriesListingPage,
    collectionsListing: getCollectionsListingPage,
    collectionTimeline: getCollectionTimelinePage,
  },
  /** Resolve a Strapi media object to an absolute URL */
  imageUrl: strapiImage,
}
