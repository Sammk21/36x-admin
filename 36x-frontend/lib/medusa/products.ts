import type { HttpTypes } from "@medusajs/types"
import { sdk } from "./client"

// ---------------------------------------------------------------------------
// Base fields requested on every product fetch
// Keeps variant prices, options, images, categories, and collection
// ---------------------------------------------------------------------------

const PRODUCT_FIELDS =
  "+variants,+variants.prices,+variants.options,+options,+options.values,+images,+tags,+categories,+collection"

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/**
 * Fetch a single product by handle.
 * Pass `extraFields` to request additional Medusa relations (e.g. virtual links).
 *
 * @example
 * const product = await retrieveProduct("my-tee")
 *
 * @example
 * // With a Strapi virtual link (defined in your Medusa backend)
 * const product = await retrieveProduct("my-tee", { extraFields: "*strapi_product" })
 */
export async function retrieveProduct(
  handle: string,
  options: { extraFields?: string } = {}
): Promise<HttpTypes.StoreProduct> {
  const fields = options.extraFields
    ? `${PRODUCT_FIELDS},${options.extraFields}`
    : PRODUCT_FIELDS

  const { products } = await sdk.store.product.list({ handle, fields })

  const product = products[0]
  if (!product) {
    throw new Error(`Product not found: handle="${handle}"`)
  }
  return product
}

/**
 * List products with optional filters.
 * Pass `extraFields` to append additional Medusa relations.
 *
 * @example
 * const { products } = await listProducts({ collection_id: ["pcol_123"] })
 */
export async function listProducts(
  params: {
    handle?: string
    collection_id?: string[]
    category_id?: string[]
    tags?: string[]
    limit?: number
    offset?: number
    extraFields?: string
  } = {}
): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> {
  const {
    extraFields,
    limit = 20,
    offset = 0,
    ...filters
  } = params

  const fields = extraFields
    ? `${PRODUCT_FIELDS},${extraFields}`
    : PRODUCT_FIELDS

  const { products, count } = await sdk.store.product.list({
    ...filters,
    limit,
    offset,
    fields,
  })

  return { products, count }
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function retrieveCollection(
  id: string,
  options: { extraFields?: string } = {}
): Promise<HttpTypes.StoreCollection> {
  const query = options.extraFields ? { fields: options.extraFields } : {}
  const { collection } = await sdk.store.collection.retrieve(id, query)
  return collection
}

export async function listCollections(
  params: {
    handle?: string[]
    limit?: number
    offset?: number
    extraFields?: string
  } = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  const { extraFields, limit = 100, offset = 0, handle } = params
  const query: Record<string, unknown> = { limit, offset }
  if (handle?.length) query.handle = handle
  if (extraFields) query.fields = extraFields

  const { collections, count } = await sdk.store.collection.list(
    query as Parameters<typeof sdk.store.collection.list>[0]
  )
  return { collections, count }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function retrieveCategory(
  id: string,
  options: { extraFields?: string } = {}
): Promise<HttpTypes.StoreProductCategory> {
  const query = options.extraFields ? { fields: options.extraFields } : {}
  const { product_category } = await sdk.store.category.retrieve(id, query)
  return product_category
}

export async function listCategories(
  params: {
    handle?: string
    parent_category_id?: string
    include_descendants_tree?: boolean
    limit?: number
    offset?: number
    extraFields?: string
  } = {}
): Promise<{
  product_categories: HttpTypes.StoreProductCategory[]
  count: number
}> {
  const { extraFields, ...rest } = params
  const query = extraFields ? { ...rest, fields: extraFields } : rest

  const { product_categories, count } = await sdk.store.category.list(
    query as Parameters<typeof sdk.store.category.list>[0]
  )
  return { product_categories, count }
}
