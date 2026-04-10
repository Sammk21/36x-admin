import type {
  StrapiProduct,
  StrapiProductCategory,
  StrapiProductCollection,
} from "./strapi"

// ---------------------------------------------------------------------------
// Medusa v2 Store API shapes (subset used by this storefront)
// ---------------------------------------------------------------------------

export type MoneyAmount = {
  amount: number
  currency_code: string
}

export type CalculatedPrice = {
  calculated_amount: number
  original_amount: number
  currency_code: string
  is_calculated_price_price_list: boolean
  is_original_price_price_list: boolean
}

export type MedusaProductOptionValue = {
  id: string
  value: string
  option_id: string
  metadata: Record<string, unknown> | null
}

export type MedusaProductOption = {
  id: string
  title: string
  product_id: string
  values: MedusaProductOptionValue[]
  metadata: Record<string, unknown> | null
}

export type MedusaProductVariant = {
  id: string
  title: string
  sku: string | null
  barcode: string | null
  inventory_quantity: number
  allow_backorder: boolean
  manage_inventory: boolean
  prices: MoneyAmount[]
  calculated_price: CalculatedPrice | null
  options: MedusaProductOptionValue[]
  metadata: Record<string, unknown> | null
}

export type MedusaProductImage = {
  id: string
  url: string
  metadata: Record<string, unknown> | null
}

export type MedusaProductTag = {
  id: string
  value: string
}

export type MedusaProductType = {
  id: string
  value: string
}

export type MedusaProductCollection = {
  id: string
  title: string
  handle: string | null
  metadata: Record<string, unknown> | null
  // Virtual link — only present when fields=*strapi_collection is requested
  strapi_collection?: StrapiProductCollection
}

export type MedusaProductCategory = {
  id: string
  name: string
  handle: string
  description: string | null
  is_active: boolean
  is_internal: boolean
  parent_category_id: string | null
  metadata: Record<string, unknown> | null
  // Virtual link — only present when fields=*strapi_category is requested
  strapi_category?: StrapiProductCategory
}

export type MedusaProduct = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string | null
  status: "draft" | "proposed" | "published" | "rejected"
  thumbnail: string | null
  images: MedusaProductImage[]
  tags: MedusaProductTag[]
  type: MedusaProductType | null
  collection: MedusaProductCollection | null
  collection_id: string | null
  categories: MedusaProductCategory[]
  variants: MedusaProductVariant[]
  options: MedusaProductOption[]
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  // Virtual link — only present when fields=*strapi_product is requested
  strapi_product?: StrapiProduct
}

// ---------------------------------------------------------------------------
// Medusa API response wrappers
// ---------------------------------------------------------------------------

export type MedusaProductResponse = { product: MedusaProduct }
export type MedusaProductListResponse = {
  products: MedusaProduct[]
  count: number
  offset: number
  limit: number
}

export type MedusaCollectionResponse = { collection: MedusaProductCollection }
export type MedusaCollectionListResponse = {
  collections: MedusaProductCollection[]
  count: number
  offset: number
  limit: number
}

export type MedusaCategoryResponse = { product_category: MedusaProductCategory }
export type MedusaCategoryListResponse = {
  product_categories: MedusaProductCategory[]
  count: number
  offset: number
  limit: number
}

// ---------------------------------------------------------------------------
// Query option types
// ---------------------------------------------------------------------------

export type MedusaProductListParams = {
  handle?: string
  collection_id?: string | string[]
  category_id?: string | string[]
  tags?: string[]
  limit?: number
  offset?: number
  /** Include basic Strapi data via virtual link */
  withStrapi?: boolean
  /** Include category Strapi data via virtual link */
  withStrapiCategories?: boolean
  /** Include collection Strapi data via virtual link */
  withStrapiCollection?: boolean
  /** Raw extra fields string appended to the fields param */
  extraFields?: string
}

export type MedusaProductRetrieveParams = {
  /** Include basic Strapi data via virtual link */
  withStrapi?: boolean
  /** Include category Strapi data via virtual link */
  withStrapiCategories?: boolean
  /** Include collection Strapi data via virtual link */
  withStrapiCollection?: boolean
  /** Raw extra fields string appended to the fields param */
  extraFields?: string
}

export type MedusaCollectionListParams = {
  handle?: string[]
  limit?: number
  offset?: number
  withStrapi?: boolean
}

export type MedusaCategoryListParams = {
  handle?: string
  parent_category_id?: string
  include_descendants_tree?: boolean
  limit?: number
  offset?: number
  withStrapi?: boolean
}
