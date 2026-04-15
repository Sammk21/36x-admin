/**
 * Re-exports from the new modular Medusa SDK layer.
 *
 * Existing imports like `import { medusa } from "@/lib/medusa"` still work,
 * but new code should import directly from `@/lib/medusa/*`.
 */

export {
  retrieveProduct,
  listProducts,
  retrieveCollection,
  listCollections,
  retrieveCategory,
  listCategories,
} from "@/lib/medusa/products"

// ---------------------------------------------------------------------------
// Product reviews (custom Medusa module — uses sdk.client.fetch)
// ---------------------------------------------------------------------------

import { sdk } from "@/lib/medusa/client"

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

export async function listPublicProductReviews(
  productId: string,
  next?: NextFetchRequestConfig
): Promise<PublicProductReview[]> {
  const res = await sdk.client.fetch<{
    product_reviews: PublicProductReview[]
  }>("/store/product-reviews", {
    method: "GET",
    query: {
      "product_id[]": productId,
      "status[]": "approved",
      fields: "*images,*response",
      limit: "50",
      offset: "0",
    },
    next,
    cache: next ? undefined : "no-store",
  })
  return res.product_reviews ?? []
}

export async function listProductReviewStats(
  productId: string,
  next?: NextFetchRequestConfig
): Promise<ProductReviewStats | null> {
  const res = await sdk.client.fetch<{
    product_review_stats: ProductReviewStats[]
  }>("/store/product-review-stats", {
    method: "GET",
    query: { "product_id[]": productId },
    next,
    cache: next ? undefined : "no-store",
  })
  return res.product_review_stats?.[0] ?? null
}

// ---------------------------------------------------------------------------
// Legacy namespace — kept for backward compat with existing call sites
// ---------------------------------------------------------------------------

import {
  retrieveProduct,
  listProducts,
  retrieveCollection,
  listCollections,
  retrieveCategory,
  listCategories,
} from "@/lib/medusa/products"

export const medusa = {
  products: {
    retrieve: retrieveProduct,
    list: listProducts,
  },
  collections: {
    retrieve: retrieveCollection,
    list: listCollections,
  },
  categories: {
    retrieve: retrieveCategory,
    list: listCategories,
  },
  productReviews: {
    listStats: listProductReviewStats,
    list: listPublicProductReviews,
  },
}
