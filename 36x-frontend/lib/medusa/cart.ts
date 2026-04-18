import type { HttpTypes } from "@medusajs/types"
import { sdk } from "./client"

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

/**
 * Fields requested on every cart fetch.
 *
 * Syntax:
 *   *field        → expand all fields of a relation (incl. nested)
 *   +field        → include a specific computed / hidden field
 *
 * What each group gives us:
 *   *items                        → line item base fields (title, qty, thumbnail, etc.)
 *   *items.variant                → variant (id, title, sku, options)
 *   *items.variant.options        → option values (size, colour)
 *   *items.product                → product (handle, thumbnail, type)
 *   +items.total                  → computed line total (after discounts + tax)
 *   +items.original_total         → total before discounts
 *   +items.unit_price             → per-unit price
 *   +items.subtotal               → total before tax
 *   +items.discount_total         → discount applied to this item
 *   +items.tax_total              → tax on this item
 *   *region                       → region + countries list (used in checkout country select)
 *   *promotions                   → applied promo codes
 *   *shipping_methods             → selected shipping methods
 *   +shipping_methods.name        → shipping method display name
 *   +shipping_methods.total       → shipping method cost after discounts
 */
export const CART_FIELDS = [
  "*items",
  "*items.variant",
  "*items.variant.options",
  "*items.product",
  "+items.total",
  "+items.original_total",
  "+items.unit_price",
  "+items.subtotal",
  "+items.discount_total",
  "+items.tax_total",
  "*region",
  "*promotions",
  "*shipping_methods",
  "+shipping_methods.name",
  "+shipping_methods.total",
].join(",")

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

export async function listRegions(): Promise<HttpTypes.StoreRegion[]> {
  const { regions } = await sdk.store.region.list()
  return regions
}

// ---------------------------------------------------------------------------
// Cart CRUD
// ---------------------------------------------------------------------------

/** Create a new cart, optionally scoped to a region */
export async function createCart(
  regionId?: string
): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.create(
    regionId ? { region_id: regionId } : {},
    { fields: CART_FIELDS }
  )
  return cart
}

/**
 * Retrieve an existing cart by ID.
 * Expands items.* and shipping_methods.* so totals are included on
 * every line item — without this, item.unit_price / item.total are undefined.
 */
export async function retrieveCart(
  cartId: string
): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.retrieve(cartId, {
    fields: CART_FIELDS,
  })
  return cart
}

/** Add a line item (variant) to the cart */
export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity = 1
): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.createLineItem(
    cartId,
    { variant_id: variantId, quantity },
    { fields: CART_FIELDS }
  )
  return cart
}

/** Update quantity of an existing line item */
export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.updateLineItem(
    cartId,
    lineItemId,
    { quantity },
    { fields: CART_FIELDS }
  )
  return cart
}

/**
 * Remove a line item from the cart.
 *
 * DELETE returns { deleted, parent: cart } — SDK reads parent correctly.
 * We pass fields via query so the returned parent is fully populated.
 */
export async function removeLineItem(
  cartId: string,
  lineItemId: string
): Promise<HttpTypes.StoreCart> {
  const result = await sdk.store.cart.deleteLineItem(
    cartId,
    lineItemId,
    { fields: CART_FIELDS }
  )
  if (!result.parent) {
    throw new Error(`removeLineItem: no cart returned for item ${lineItemId}`)
  }
  return result.parent
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------

/**
 * Apply one or more promo codes to the cart.
 * Merges with existing codes — does not replace them.
 */
export async function applyPromoCode(
  cartId: string,
  code: string
): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.update(
    cartId,
    { promo_codes: [code] },
    { fields: CART_FIELDS }
  )
  return cart
}

/**
 * Remove a promo code from the cart.
 * Per Medusa docs: DELETE /store/carts/:id/promotions { promo_codes: [code] }
 */
export async function removePromoCode(
  cartId: string,
  code: string
): Promise<HttpTypes.StoreCart> {
  const res = await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
    `/store/carts/${cartId}/promotions`,
    {
      method: "DELETE",
      body: { promo_codes: [code] },
    }
  )
  return res.cart
}

// ---------------------------------------------------------------------------
// Checkout flow
// ---------------------------------------------------------------------------

/** Update cart shipping address + email */
export async function updateCart(
  cartId: string,
  payload: HttpTypes.StoreUpdateCart
): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.update(cartId, payload, {
    fields: CART_FIELDS,
  })
  return cart
}

/** List available shipping options for a cart (address must be set first) */
export async function listShippingOptions(
  cartId: string
): Promise<HttpTypes.StoreCartShippingOption[]> {
  const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
    cart_id: cartId,
  })
  return shipping_options
}

/** Add a shipping method to the cart */
export async function addShippingMethod(
  cartId: string,
  optionId: string
): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.addShippingMethod(
    cartId,
    { option_id: optionId },
    { fields: CART_FIELDS }
  )
  return cart
}

/** List payment providers available for a cart's region */
export async function listPaymentProviders(
  regionId: string
): Promise<HttpTypes.StorePaymentProvider[]> {
  const { payment_providers } = await sdk.store.payment.listPaymentProviders({
    region_id: regionId,
  })
  return payment_providers
}

/**
 * Create a payment collection and initialize a payment session in one step.
 *
 * The SDK's `initiatePaymentSession` handles both API calls internally:
 *  1. POST /store/payment-collections  (if not already on the cart)
 *  2. POST /store/payment-collections/:id/payment-sessions
 *
 * @param cart   - The full cart object (needed so the SDK can reuse an existing collection)
 * @param providerId - e.g. "pp_system_default" for Cash on Delivery
 */
export async function initiatePayment(
  cart: HttpTypes.StoreCart,
  providerId: string
): Promise<HttpTypes.StorePaymentCollection> {
  const { payment_collection } = await sdk.store.payment.initiatePaymentSession(
    cart,
    { provider_id: providerId }
  )
  return payment_collection
}

/**
 * Complete the cart.
 *
 * Returns either:
 *   { type: "order", order }  — success
 *   { type: "cart",  cart  }  — cart still open (e.g. payment failure)
 *
 * Always check `result.type` before assuming an order was created.
 */
export async function completeCart(
  cartId: string
): Promise<HttpTypes.StoreCompleteCartResponse> {
  return sdk.store.cart.complete(cartId)
}

// ---------------------------------------------------------------------------
// Customer association
// ---------------------------------------------------------------------------

/**
 * Transfer a guest cart to the currently logged-in customer.
 * Call this immediately after a customer logs in if a cart already exists.
 */
export async function transferCart(
  cartId: string
): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.transferCart(cartId)
  return cart
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatPrice(amount: number, currencyCode = "inr"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount)
}
