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

// ---------------------------------------------------------------------------
// Cart types (Medusa v2 Store API)
// ---------------------------------------------------------------------------

export type MedusaAddress = {
  first_name: string | null
  last_name: string | null
  address_1: string | null
  address_2: string | null
  city: string | null
  country_code: string | null
  province: string | null
  postal_code: string | null
  phone: string | null
}

export type MedusaLineItem = {
  id: string
  cart_id?: string
  // Product-level fields (flat on the line item)
  title: string
  product_title: string
  product_subtitle: string | null
  product_handle: string | null
  product_id: string | null
  // Variant-level fields (flat on the line item)
  variant_id: string | null
  variant_title: string | null
  variant_sku: string | null
  // Media
  thumbnail: string | null
  // Pricing
  quantity: number
  unit_price: number
  compare_at_unit_price: number | null
  is_tax_inclusive: boolean
  // Totals (present on cart response)
  total?: number
  subtotal?: number
  original_total?: number
  discount_total?: number
  metadata: Record<string, unknown> | null
}

export type MedusaShippingMethod = {
  id: string
  name: string
  amount: number
}

export type MedusaCart = {
  id: string
  currency_code: string
  email: string | null
  region_id: string | null
  sales_channel_id: string | null
  customer_id: string | null
  shipping_address: MedusaAddress | null
  billing_address: MedusaAddress | null
  items: MedusaLineItem[]
  shipping_methods: MedusaShippingMethod[]
  // Totals
  total: number
  subtotal: number
  tax_total: number
  discount_total: number
  discount_subtotal: number
  shipping_total: number
  shipping_subtotal: number
  item_total: number
  item_subtotal: number
  original_total: number
  metadata: Record<string, unknown> | null
}

export type MedusaRegion = {
  id: string
  name: string
  currency_code: string
  countries: { iso_2: string; display_name: string }[]
}

export type MedusaCartResponse = { cart: MedusaCart }
export type MedusaRegionListResponse = { regions: MedusaRegion[] }

export type MedusaShippingOption = {
  id: string
  name: string
  amount: number
  currency_code: string
  provider_id: string
  service_zone: { name: string } | null
}

export type MedusaShippingOptionListResponse = {
  shipping_options: MedusaShippingOption[]
}

export type MedusaPaymentSession = {
  id: string
  provider_id: string
  status: string
  amount: number
  currency_code: string
  data: Record<string, unknown>
}

export type MedusaPaymentCollection = {
  id: string
  status: string
  amount: number
  currency_code: string
  payment_sessions: MedusaPaymentSession[]
}

export type MedusaPaymentCollectionResponse = {
  payment_collection: MedusaPaymentCollection
}

export type MedusaOrder = {
  id: string
  display_id: number
  status: string
  email: string | null
  currency_code: string
  total: number
  subtotal: number
  shipping_total: number
  tax_total: number
  items: MedusaLineItem[]
  shipping_address: MedusaAddress | null
}

export type MedusaOrderResponse = { order: MedusaOrder }
