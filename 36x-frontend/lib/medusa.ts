import type {
  MedusaProduct,
  MedusaProductCollection,
  MedusaProductCategory,
  MedusaProductResponse,
  MedusaProductListResponse,
  MedusaCollectionResponse,
  MedusaCollectionListResponse,
  MedusaCategoryResponse,
  MedusaCategoryListResponse,
  MedusaProductListParams,
  MedusaProductRetrieveParams,
  MedusaCollectionListParams,
  MedusaCategoryListParams,
} from "./types/medusa"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MEDUSA_URL =
  process.env.NEXT_PUBLIC_MEDUSA_URL ?? "http://localhost:9000"

const MEDUSA_PUBLISHABLE_KEY = "pk_b5e6c02dcd611e3eac923182d4e4fbe4af845b7852439787d4e28f8b95cbe2e0"
  // process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ??
  // "pk_b5e6c02dcd611e3eac923182d4e4fbe4af845b7852439787d4e28f8b95cbe2e0";

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

type FetchOptions = {
  next?: NextFetchRequestConfig
}

async function medusaRequest<T>(
  path: string,
  params: Record<string, string> = {},
  options: FetchOptions = {}
): Promise<T> {
  const url = new URL(`${MEDUSA_URL}${path}`)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (MEDUSA_PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] = MEDUSA_PUBLISHABLE_KEY
  }

  const res = await fetch(url.toString(), {
    headers,
    next: options.next,
    cache: options.next ? undefined : "no-store",
  })

  if (!res.ok) {
    throw new Error(
      `Medusa request failed: ${res.status} ${res.statusText} — ${url.toString()}`
    )
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// fields builder
// ---------------------------------------------------------------------------

/**
 * Builds the `fields` query param string for a product request.
 *
 * Medusa virtual links are requested via the `fields` param:
 *   - `*strapi_product`            → basic Strapi product fields + variants/options
 *   - `categories.strapi_category` → Strapi data on each category
 *   - `collection.strapi_collection` → Strapi data on the collection
 *
 * Note: The virtual link returns basic Strapi fields. For full rich content
 * (gallery, pairings, concept slides, reviews) use `strapi.products.findOne()`
 * directly instead.
 */
function buildProductFields(params: MedusaProductRetrieveParams): string {
  const parts: string[] = [
    "+variants",
    "+variants.prices",
    "+variants.options",
    "+options",
    "+options.values",
    "+images",
    "+tags",
    "+categories",
    "+collection",
  ]

  if (params.withStrapi) {
    parts.push("*strapi_product")
  }
  if (params.withStrapiCategories) {
    parts.push("categories.*", "categories.strapi_category")
  }
  if (params.withStrapiCollection) {
    parts.push("collection.*", "collection.strapi_collection")
  }
  if (params.extraFields) {
    parts.push(params.extraFields)
  }

  return parts.join(",")
}

// ---------------------------------------------------------------------------
// products
// ---------------------------------------------------------------------------

async function retrieveProduct(
  handle: string,
  params: MedusaProductRetrieveParams = {},
  next?: NextFetchRequestConfig
): Promise<MedusaProduct> {
  const query: Record<string, string> = {
    handle,
    fields: buildProductFields(params),
  }

  const res = await medusaRequest<MedusaProductListResponse>(
    "/store/products",
    query,
    { next }
  )

  const product = res.products[0]
  if (!product) {
    throw new Error(`Product not found: handle="${handle}"`)
  }
  return product
}

async function listProducts(
  params: MedusaProductListParams = {},
  next?: NextFetchRequestConfig
): Promise<MedusaProductListResponse> {
  const {
    withStrapi,
    withStrapiCategories,
    withStrapiCollection,
    extraFields,
    handle,
    collection_id,
    category_id,
    tags,
    limit = 20,
    offset = 0,
  } = params

  const query: Record<string, string> = {
    fields: buildProductFields({
      withStrapi,
      withStrapiCategories,
      withStrapiCollection,
      extraFields,
    }),
    limit: String(limit),
    offset: String(offset),
  }

  if (handle) query["handle"] = handle
  if (limit) query["limit"] = String(limit)
  if (offset) query["offset"] = String(offset)

  if (collection_id) {
    const ids = Array.isArray(collection_id) ? collection_id : [collection_id]
    ids.forEach((id, i) => (query[`collection_id[${i}]`] = id))
  }
  if (category_id) {
    const ids = Array.isArray(category_id) ? category_id : [category_id]
    ids.forEach((id, i) => (query[`category_id[${i}]`] = id))
  }
  if (tags?.length) {
    tags.forEach((tag, i) => (query[`tags[${i}]`] = tag))
  }

  return medusaRequest<MedusaProductListResponse>("/store/products", query, {
    next,
  })
}

// ---------------------------------------------------------------------------
// collections
// ---------------------------------------------------------------------------

async function retrieveCollection(
  id: string,
  params: MedusaCollectionListParams = {},
  next?: NextFetchRequestConfig
): Promise<MedusaProductCollection> {
  const query: Record<string, string> = {}

  if (params.withStrapi) {
    query["fields"] = "*strapi_collection"
  }

  const res = await medusaRequest<MedusaCollectionResponse>(
    `/store/collections/${id}`,
    query,
    { next }
  )
  return res.collection
}

async function listCollections(
  params: MedusaCollectionListParams = {},
  next?: NextFetchRequestConfig
): Promise<MedusaCollectionListResponse> {
  const query: Record<string, string> = {
    limit: String(params.limit ?? 100),
    offset: String(params.offset ?? 0),
  }

  if (params.withStrapi) {
    query["fields"] = "*strapi_collection"
  }
  if (params.handle?.length) {
    params.handle.forEach((h, i) => (query[`handle[${i}]`] = h))
  }

  return medusaRequest<MedusaCollectionListResponse>(
    "/store/collections",
    query,
    { next }
  )
}

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------

async function retrieveCategory(
  id: string,
  params: MedusaCategoryListParams = {},
  next?: NextFetchRequestConfig
): Promise<MedusaProductCategory> {
  const query: Record<string, string> = {}

  if (params.withStrapi) {
    query["fields"] = "*strapi_category"
  }

  const res = await medusaRequest<MedusaCategoryResponse>(
    `/store/product-categories/${id}`,
    query,
    { next }
  )
  return res.product_category
}

async function listCategories(
  params: MedusaCategoryListParams = {},
  next?: NextFetchRequestConfig
): Promise<MedusaCategoryListResponse> {
  const query: Record<string, string> = {
    limit: String(params.limit ?? 100),
    offset: String(params.offset ?? 0),
  }

  if (params.withStrapi) {
    query["fields"] = "*strapi_category"
  }
  if (params.handle) {
    query["handle"] = params.handle
  }
  if (params.parent_category_id) {
    query["parent_category_id"] = params.parent_category_id
  }
  if (params.include_descendants_tree) {
    query["include_descendants_tree"] = "true"
  }

  return medusaRequest<MedusaCategoryListResponse>(
    "/store/product-categories",
    query,
    { next }
  )
}

// ---------------------------------------------------------------------------
// product reviews
// ---------------------------------------------------------------------------

export type ProductReviewStats = {
  product_id: string
  average_rating: number | null
  review_count: number
  rating_count_1: number
  rating_count_2: number
  rating_count_3: number
  rating_count_4: number
  rating_count_5: number
}

export type PublicProductReview = {
  id: string
  name: string | null
  rating: number
  content: string | null
  images: { id: string; url: string }[]
  response: { id: string; content: string } | null
  created_at: string
}

async function listPublicProductReviews(
  productId: string,
  next?: NextFetchRequestConfig
): Promise<PublicProductReview[]> {
  const res = await medusaRequest<{ product_reviews: PublicProductReview[] }>(
    "/store/product-reviews",
    {
      "product_id[]": productId,
      "status[]": "approved",
      "fields": "*images,*response",
      "limit": "50",
      "offset": "0",
    },
    { next }
  )
  return res.product_reviews ?? []
}

async function listProductReviewStats(
  productId: string,
  next?: NextFetchRequestConfig
): Promise<ProductReviewStats | null> {
  const res = await medusaRequest<{ product_review_stats: ProductReviewStats[] }>(
    "/store/product-review-stats",
    { "product_id[]": productId },
    { next }
  )
  return res.product_review_stats?.[0] ?? null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const medusa = {
  products: {
    /**
     * Fetch a single product by handle.
     *
     * @example
     * // Basic commerce data only
     * const product = await medusa.products.retrieve('my-tee')
     *
     * @example
     * // With basic Strapi virtual link data
     * const product = await medusa.products.retrieve('my-tee', { withStrapi: true })
     *
     * @example
     * // With Strapi data on product, categories, and collection
     * const product = await medusa.products.retrieve('my-tee', {
     *   withStrapi: true,
     *   withStrapiCategories: true,
     *   withStrapiCollection: true,
     * })
     */
    retrieve: retrieveProduct,

    /**
     * List products with optional filters and Strapi virtual link data.
     *
     * @example
     * const { products } = await medusa.products.list({ collection_id: 'pcol_123' })
     *
     * @example
     * const { products } = await medusa.products.list({
     *   category_id: 'pcat_456',
     *   withStrapi: true,
     *   withStrapiCategories: true,
     * })
     */
    list: listProducts,
  },

  collections: {
    /**
     * Fetch a single collection by ID.
     *
     * @example
     * const collection = await medusa.collections.retrieve('pcol_123', { withStrapi: true })
     */
    retrieve: retrieveCollection,

    /**
     * List all collections.
     *
     * @example
     * const { collections } = await medusa.collections.list({ withStrapi: true })
     */
    list: listCollections,
  },

  categories: {
    /**
     * Fetch a single category by ID.
     *
     * @example
     * const category = await medusa.categories.retrieve('pcat_123', { withStrapi: true })
     */
    retrieve: retrieveCategory,

    /**
     * List all categories.
     *
     * @example
     * const { product_categories } = await medusa.categories.list({ withStrapi: true })
     */
    list: listCategories,
  },

  productReviews: {
    /**
     * Fetch review stats for a product.
     */
    listStats: listProductReviewStats,
    /**
     * Fetch approved public reviews for a product.
     */
    list: listPublicProductReviews,
  },
}
