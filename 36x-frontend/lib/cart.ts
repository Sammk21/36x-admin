import type {
  MedusaCart,
  MedusaCartResponse,
  MedusaRegion,
  MedusaRegionListResponse,
  MedusaShippingOption,
  MedusaShippingOptionListResponse,
  MedusaPaymentCollection,
  MedusaPaymentCollectionResponse,
  MedusaOrderResponse,
  MedusaOrder,
} from "./types/medusa"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MEDUSA_URL =
  process.env.NEXT_PUBLIC_MEDUSA_URL ?? "http://localhost:9000"

const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ??
  "pk_fd48be98158d52808635a4ab75d68b1721c0403741b31fadd63d5d26f6a82a7b";

// ---------------------------------------------------------------------------
// Core fetch helper (client-safe — no Next cache)
// ---------------------------------------------------------------------------

async function cartRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${MEDUSA_URL}${path}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY }
      : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Cart API ${res.status} — ${url}\n${body}`)
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

export async function listRegions(): Promise<MedusaRegion[]> {
  const res = await cartRequest<MedusaRegionListResponse>("/store/regions")
  return res.regions
}

// ---------------------------------------------------------------------------
// Cart CRUD
// ---------------------------------------------------------------------------

/** Create a new cart, optionally scoped to a region */
export async function createCart(regionId?: string): Promise<MedusaCart> {
  const body: Record<string, unknown> = {}
  if (regionId) body.region_id = regionId

  const res = await cartRequest<MedusaCartResponse>("/store/carts", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return res.cart
}

/** Retrieve an existing cart by ID */
export async function retrieveCart(cartId: string): Promise<MedusaCart> {
  const res = await cartRequest<MedusaCartResponse>(
    `/store/carts/${cartId}`
  )
  return res.cart
}

/** Add a line item (variant) to the cart */
export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity = 1
): Promise<MedusaCart> {
  const res = await cartRequest<MedusaCartResponse>(
    `/store/carts/${cartId}/line-items`,
    {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    }
  )
  return res.cart
}

/** Update quantity of an existing line item */
export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<MedusaCart> {
  const res = await cartRequest<MedusaCartResponse>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }
  )
  return res.cart
}

/** Remove a line item from the cart */
export async function removeLineItem(
  cartId: string,
  lineItemId: string
): Promise<MedusaCart> {
  const res = await cartRequest<MedusaCartResponse>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    { method: "DELETE" }
  )
  return res.cart
}

// ---------------------------------------------------------------------------
// Checkout flow
// ---------------------------------------------------------------------------

/** Update cart shipping address + email */
export async function updateCart(
  cartId: string,
  payload: {
    email?: string
    shipping_address?: Record<string, string>
  }
): Promise<MedusaCart> {
  const res = await cartRequest<MedusaCartResponse>(
    `/store/carts/${cartId}`,
    { method: "POST", body: JSON.stringify(payload) }
  )
  return res.cart
}

/** List available shipping options for a cart */
export async function listShippingOptions(
  cartId: string
): Promise<MedusaShippingOption[]> {
  const res = await cartRequest<MedusaShippingOptionListResponse>(
    `/store/shipping-options?cart_id=${cartId}`
  )
  return res.shipping_options
}

/** Add a shipping method to the cart */
export async function addShippingMethod(
  cartId: string,
  optionId: string
): Promise<MedusaCart> {
  const res = await cartRequest<MedusaCartResponse>(
    `/store/carts/${cartId}/shipping-methods`,
    { method: "POST", body: JSON.stringify({ option_id: optionId }) }
  )
  return res.cart
}

/** Create a payment collection for the cart */
export async function createPaymentCollection(
  cartId: string
): Promise<MedusaPaymentCollection> {
  const res = await cartRequest<MedusaPaymentCollectionResponse>(
    "/store/payment-collections",
    { method: "POST", body: JSON.stringify({ cart_id: cartId }) }
  )
  return res.payment_collection
}

/** Initialize a payment session on a payment collection */
export async function initPaymentSession(
  paymentCollectionId: string,
  providerId: string
): Promise<MedusaPaymentCollection> {
  const res = await cartRequest<MedusaPaymentCollectionResponse>(
    `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
    { method: "POST", body: JSON.stringify({ provider_id: providerId }) }
  )
  return res.payment_collection
}

/** Complete the cart — creates an order */
export async function completeCart(cartId: string): Promise<MedusaOrder> {
  const res = await cartRequest<MedusaOrderResponse>(
    `/store/carts/${cartId}/complete`,
    { method: "POST" }
  )
  return res.order
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Medusa money amount (integer cents) to a display string */
export function formatPrice(amount: number, currencyCode = "inr"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
