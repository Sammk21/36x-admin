import qs from "qs"
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
import { STRAPI_URL, STRAPI_TOKEN } from "./env"

// ---------------------------------------------------------------------------
// Image helper
// ---------------------------------------------------------------------------

/**
 * Resolves a Strapi media object to an absolute URL.
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

/**
 * Resolves a raw Strapi URL string (e.g. `/uploads/image.jpg`) to an absolute URL.
 * Use this in client components where you already have the URL string, not the full media object.
 */
export function getStrapiMedia(url: string | null | undefined): string  {
  if (!url) return "/placeholder.png"
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function strapiRequest<T>(
  path: string,
  query: object = {},
  next?: NextFetchRequestConfig
): Promise<T> {
  const queryString = qs.stringify(query, {
    encodeValuesOnly: true, // keeps bracket notation readable, e.g. filters[x][$eq]
  })

  const url = `${STRAPI_URL}/api${path}${queryString ? `?${queryString}` : ""}`

  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`

  const res = await fetch(url, { headers, next, cache: next ? undefined : "no-store" })

  if (!res.ok) {
    throw new Error(
      `Strapi ${res.status} ${res.statusText} — ${url}`
    )
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Pre-built populate queries
// ---------------------------------------------------------------------------

const PRODUCT_QUERY = {
  populate: {
    images: true,
    thumbnail: true,
    gallery_video: true,
    gallery_images: { populate: { image: true } },
    productDuo: {
      populate: {
        productOne: { populate: { thumbnail: true } },
        productTwo: { populate: { thumbnail: true } },
        Result: true,
      },
    },
    artist_collaborations: { populate: { coverImage: true } },
    Artist: {
      populate: {
        sectionIntro: true,
        artist_collaborations: { populate: { coverImage: true } },
      },
    },
  
    product_collection: true,
    variants: {
      populate: {
        images: true,
        thumbnail: true,
        option_values: true,
      },
    },
    options: { populate: { values: true } },
  },
}

const COLLECTION_QUERY = {
  populate: {
    banner: true,
    thumbnail: true,
    // comic_strip_image: true,
    button: true,
    products: {
      populate: { thumbnail: true },
    },
  },
}

const ARTIST_QUERY = {
  populate: {
    coverImage: true,
    bannerImages: true,
    socialLinks: true,
    products: {
      populate: { thumbnail: true },
    },
  },
}

const SOCIAL_FEED_QUERY = {
  populate: { image: true },
  sort: ["display_order:asc"],
}

const HOME_PAGE_QUERY = {
  populate: {
    PageShell: {
      populate: {
        topImage: true,
        topImageOverlay: true,
        bgTileImage: true,
      },
    },
    HomeHero: {
      populate: { buttons: true },
    },
    collection: {
      populate: {
        sectionIntro: true,
        product_collections: {populate:{thumbnail: true}},
      },
    },
    artistCollab: {
      populate: {
        sectionIntro: true,
        artist_collaborations: { populate: { coverImage: true } },
      },
    },
    masonry_products: { populate: { products: { populate: { thumbnail: true } } } },
    category: {
      populate: {
        sectionIntro: true,
        product_categories: true,
      },
    },
    feedSection: {
      populate: {
        sectionIntro: true,
         button:true,
        posts: { populate: { media: true } },
      },
    },
  },
};

const NAVIGATION_QUERY = {
  populate: {
    logo: true,
    nav_items: {
      populate: {
        dropdown_sections: {
          populate: { items: true },
        },
      },
    },
  },
}

const CATEGORIES_LISTING_QUERY = {
  populate: {
    hero: { populate: { buttons: true } },
    product_category: true,
  },
}

const COLLECTIONS_LISTING_QUERY = {
  populate: {
    Hero: {
      populate: { bannerImage: true },
    },
    pageShell: true,
    collection: true
  },
}

const COLLECTION_TIMELINE_QUERY = {
  populate: {
    sectionIntro: true,
    collectionTimeline: {
      populate: {
        chapterBanner: true,
        storyBanner: true,
        product_collection: {
          populate: { banner: true },
        },
      },
    },
  },
}

// ---------------------------------------------------------------------------
// products
// ---------------------------------------------------------------------------

type ProductFindParams = {
  medusaId?: string
  handle?: string
  next?: NextFetchRequestConfig
}

async function findProducts(params: ProductFindParams = {}): Promise<StrapiProduct[]> {
  const query: Record<string, unknown> = { ...PRODUCT_QUERY }

  if (params.medusaId || params.handle) {
    query.filters = {
      ...(params.medusaId && { medusaId: { $eq: params.medusaId } }),
      ...(params.handle && { handle: { $eq: params.handle } }),
    }
  }

  const res = await strapiRequest<StrapiListResponse<StrapiProduct>>(
    "/products",
    query,
    params.next
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

async function findProductByHandle(
  handle: string,
  next?: NextFetchRequestConfig
): Promise<StrapiProduct | null> {
  const results = await findProducts({ handle, next })
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

async function findCategories(params: CategoryFindParams = {}): Promise<StrapiProductCategory[]> {
  const query: Record<string, unknown> = {}

  if (params.medusaId || params.handle) {
    query.filters = {
      ...(params.medusaId && { medusaId: { $eq: params.medusaId } }),
      ...(params.handle && { handle: { $eq: params.handle } }),
    }
  }

  const res = await strapiRequest<StrapiListResponse<StrapiProductCategory>>(
    "/product-categories",
    query,
    params.next
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

async function findCollections(params: CollectionFindParams = {}): Promise<StrapiProductCollection[]> {
  const query: Record<string, unknown> = { ...COLLECTION_QUERY }

  if (params.medusaId) {
    query.filters = { medusaId: { $eq: params.medusaId } }
  }
  if (params.handle) {
    query.filters = { handle: { $eq: params.handle } };
  }

  const res = await strapiRequest<StrapiListResponse<StrapiProductCollection>>(
    "/product-collections",
    query,
    params.next
  )

  if (params.handle) {
    return res.data.filter((c) => c.handle === params.handle)
  }

  return res.data
}

async function findOneCollection(
  medusaId: string,
  next?: NextFetchRequestConfig
): Promise<StrapiProductCollection | null> {
  const results = await findCollections({ medusaId, next })
  return results[0] ?? null
}

async function findCollectionByHandle(
  handle: string,
  next?: NextFetchRequestConfig
): Promise<StrapiProductCollection | null> {
  const results = await findCollections({ handle, next })
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

async function findArtists(params: ArtistFindParams = {}): Promise<StrapiArtistCollaboration[]> {
  const query: Record<string, unknown> = { ...ARTIST_QUERY }

  if (params.handle) {
    query.filters = { handle: { $eq: params.handle } }
  }
  if (params.homepageOnly) {
    query.filters = { ...((query.filters as object) ?? {}), show_on_homepage: { $eq: true } }
    query.sort = ["homepage_order:asc"]
  }

  const res = await strapiRequest<StrapiListResponse<StrapiArtistCollaboration>>(
    "/artist-collaborations",
    query,
    params.next
  )
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

async function findSocialFeedPosts(params: SocialFeedParams = {}): Promise<StrapiSocialFeedPost[]> {
  const query: Record<string, unknown> = { ...SOCIAL_FEED_QUERY }

  if (params.activeOnly !== false) {
    query.filters = { is_active: { $eq: true } }
  }
  if (params.limit) {
    query.pagination = { pageSize: params.limit }
  }

  const res = await strapiRequest<StrapiListResponse<StrapiSocialFeedPost>>(
    "/social-feed-posts",
    query,
    params.next
  )
  return res.data
}

// ---------------------------------------------------------------------------
// Single types (page content)
// ---------------------------------------------------------------------------

async function getHomePage(next?: NextFetchRequestConfig): Promise<StrapiHomePage> {
  const res = await strapiRequest<StrapiSingleResponse<StrapiHomePage>>(
    "/home-page",
    HOME_PAGE_QUERY,
    next
  )
  return res.data
}

async function getGlobalNavigation(next?: NextFetchRequestConfig): Promise<StrapiGlobalNavigation> {
  const res = await strapiRequest<StrapiSingleResponse<StrapiGlobalNavigation>>(
    "/global-navigation",
    NAVIGATION_QUERY,
    next
  )
  return res.data
}

async function getCategoriesListingPage(next?: NextFetchRequestConfig): Promise<StrapiCategoriesListingPage> {
  const res = await strapiRequest<StrapiSingleResponse<StrapiCategoriesListingPage>>(
    "/categories-listing-page",
    CATEGORIES_LISTING_QUERY,
    next
  )
  return res.data
}

async function getCollectionsListingPage(next?: NextFetchRequestConfig): Promise<StrapiCollectionsListingPage> {
  const res = await strapiRequest<StrapiSingleResponse<StrapiCollectionsListingPage>>(
    "/collections-listing-page",
    COLLECTIONS_LISTING_QUERY,
    next
  )
  return res.data
}

async function getCollectionTimelinePage(next?: NextFetchRequestConfig): Promise<StrapiCollectionTimelinePage> {
  const res = await strapiRequest<StrapiSingleResponse<StrapiCollectionTimelinePage>>(
    "/collection-timeline-page",
    COLLECTION_TIMELINE_QUERY,
    next
  )
  return res.data
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const strapi = {
  products: {
    find: findProducts,
    findOne: findOneProduct,
    findByHandle: findProductByHandle,
  },
  categories: {
    find: findCategories,
    findOne: findOneCategory,
  },
  collections: {
    find: findCollections,
    findOne: findOneCollection,
    findCollectionByHandle: findCollectionByHandle,
  },
  artists: {
    find: findArtists,
    findOne: findOneArtist,
  },
  socialFeed: {
    find: findSocialFeedPosts,
  },
  pages: {
    home: getHomePage,
    navigation: getGlobalNavigation,
    categoriesListing: getCategoriesListingPage,
    collectionsListing: getCollectionsListingPage,
    collectionTimeline: getCollectionTimelinePage,
  },
  imageUrl: strapiImage,
}
