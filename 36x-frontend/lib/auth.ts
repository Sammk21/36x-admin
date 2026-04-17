// ---------------------------------------------------------------------------
// Medusa v2 Customer Auth — Store API
// ---------------------------------------------------------------------------

import { MEDUSA_URL, MEDUSA_PUBLISHABLE_KEY } from "./env"

const AUTH_TOKEN_KEY = "36x_auth_token"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MedusaCustomer = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  has_account: boolean
  metadata: Record<string, unknown> | null
}

export type MedusaAddress = {
  id: string
  first_name: string | null
  last_name: string | null
  address_1: string | null
  address_2: string | null
  city: string | null
  country_code: string | null
  province: string | null
  postal_code: string | null
  phone: string | null
  is_default_shipping: boolean
  is_default_billing: boolean
}

export type MedusaOrder = {
  id: string
  display_id: number
  status: string
  fulfillment_status: string
  payment_status: string
  created_at: string
  total: number
  currency_code: string
  email: string | null
  customer_id: string | null
  items: {
    id: string
    title: string
    quantity: number
    unit_price: number
    total: number
    thumbnail: string | null
    product_id: string | null
  }[]
}

export type ProductReview = {
  id: string
  order_id: string
  order_line_item_id: string
  product_id: string
  rating: number
  content: string
  status: "pending" | "approved" | "flagged"
  created_at: string
}

// ---------------------------------------------------------------------------
// Core helper
// ---------------------------------------------------------------------------

async function authRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const url = `${MEDUSA_URL}${path}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      (body as { message?: string }).message ??
        `Auth API ${res.status} — ${url}`
    )
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Token helpers (localStorage)
// ---------------------------------------------------------------------------

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

/** Register a new customer — returns a JWT token */
export async function registerCustomer(payload: {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}): Promise<string> {
  // Step 1: create auth identity
  const { token } = await authRequest<{ token: string }>(
    "/auth/customer/emailpass/register",
    {
      method: "POST",
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    }
  )

  // Step 2: create customer profile (using the registration token)
  await authRequest<{ customer: MedusaCustomer }>(
    "/store/customers",
    {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
      }),
    },
    token
  )

  // Step 3: log in to get a fully resolved token with actor_id bound
  // The registration token has no actor_id so /store/customers/me returns 401
  const { token: resolvedToken } = await authRequest<{ token: string }>(
    "/auth/customer/emailpass",
    {
      method: "POST",
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    }
  )

  return resolvedToken
}

/** Login — returns a JWT token */
export async function loginCustomer(
  email: string,
  password: string
): Promise<string> {
  const { token } = await authRequest<{ token: string }>(
    "/auth/customer/emailpass",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  )
  return token
}

/** Fetch the current customer using a token */
export async function getCustomer(token: string): Promise<MedusaCustomer> {
  const res = await authRequest<{ customer: MedusaCustomer }>(
    "/store/customers/me",
    {},
    token
  )
  return res.customer
}

/** Update customer profile */
export async function updateCustomer(
  token: string,
  payload: Partial<Pick<MedusaCustomer, "first_name" | "last_name" | "phone">>
): Promise<MedusaCustomer> {
  const res = await authRequest<{ customer: MedusaCustomer }>(
    "/store/customers/me",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
  return res.customer
}

/** List customer orders */
export async function listOrders(token: string): Promise<MedusaOrder[]> {
  const res = await authRequest<{ orders: MedusaOrder[] }>(
    "/store/orders?fields=*items,items.product_id,+email,+customer_id",
    {},
    token
  )
  return res.orders
}

/** List reviews for a product scoped to the current customer */
export async function listProductReviews(
  token: string,
  productId: string
): Promise<ProductReview[]> {
  const res = await authRequest<{ product_reviews: ProductReview[] }>(
    `/store/product-reviews?product_id[]=${productId}`,
    {},
    token
  )
  return res.product_reviews ?? []
}

/** Upload images for a review — returns public URLs */
export async function uploadReviewImages(
  token: string,
  files: File[]
): Promise<{ url: string }[]> {
  const form = new FormData()
  files.forEach((f) => form.append("files", f))

  const url = `${MEDUSA_URL}/store/product-reviews/uploads`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any).message ?? `Upload failed: ${res.status}`)
  }

  const data = await res.json() as { files: { url: string }[] }
  return data.files.map((f) => ({ url: f.url }))
}

/** Submit or update a product review (requires a verified purchase) */
export async function upsertProductReview(
  token: string,
  data: {
    order_id: string
    order_line_item_id: string
    rating: number
    content: string
    images?: { url: string }[]
  }
): Promise<void> {
  await authRequest(
    "/store/product-reviews",
    {
      method: "POST",
      body: JSON.stringify({ reviews: [{ ...data, images: data.images ?? [] }] }),
    },
    token
  )
}

/** List customer addresses */
export async function listAddresses(token: string): Promise<MedusaAddress[]> {
  const res = await authRequest<{ addresses: MedusaAddress[] }>(
    "/store/customers/me/addresses",
    {},
    token
  )
  return res.addresses
}

/** Add an address */
export async function addAddress(
  token: string,
  payload: Omit<MedusaAddress, "id" | "is_default_shipping" | "is_default_billing">
): Promise<MedusaAddress> {
  const res = await authRequest<{ address: MedusaAddress }>(
    "/store/customers/me/addresses",
    { method: "POST", body: JSON.stringify(payload) },
    token
  )
  return res.address
}

/** Delete an address */
export async function deleteAddress(
  token: string,
  addressId: string
): Promise<void> {
  await authRequest(
    `/store/customers/me/addresses/${addressId}`,
    { method: "DELETE" },
    token
  )
}

/** Attach cart to a customer after login */
export async function attachCartToCustomer(
  token: string,
  cartId: string
): Promise<void> {
  await authRequest(
    `/store/carts/${cartId}`,
    { method: "POST", body: JSON.stringify({ customer_id: undefined }) },
    token
  )
}

/** Request transfer of a guest order to the logged-in customer */
export async function requestOrderTransfer(
  token: string,
  orderId: string,
  description?: string
): Promise<void> {
  await authRequest(
    `/store/orders/${orderId}/transfer/request`,
    {
      method: "POST",
      body: JSON.stringify(description ? { description } : {}),
    },
    token
  )
}

/** Initiate Google OAuth — returns a redirect URL */
export async function initiateGoogleLogin(): Promise<string> {
  const res = await authRequest<{ location?: string; token?: string }>(
    "/auth/customer/google",
    { method: "POST", body: JSON.stringify({}) }
  )
  if (res.location) return res.location
  throw new Error("No redirect URL returned from Google auth")
}

/** Validate Google OAuth callback and return a JWT token */
export async function validateGoogleCallback(
  params: Record<string, string>
): Promise<string> {
  const qs = new URLSearchParams(params).toString()
  const res = await authRequest<{ token: string }>(
    `/auth/customer/google/callback?${qs}`,
    { method: "POST", body: JSON.stringify({}) }
  )
  return res.token
}

/** Refresh token (used after social login to get actor-bound token) */
export async function refreshToken(token: string): Promise<string> {
  const res = await authRequest<{ token: string }>(
    "/auth/token/refresh",
    { method: "POST" },
    token
  )
  return res.token
}
