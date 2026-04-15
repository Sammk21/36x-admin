import Medusa from "@medusajs/js-sdk"

/**
 * Single SDK instance shared across the entire storefront.
 *
 * The SDK automatically:
 *  - Attaches x-publishable-api-key to every request
 *  - Sends credentials (cookies) so logged-in customer sessions attach
 *  - Handles base URL resolution
 */
export const sdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_URL ?? "http://localhost:9000",
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
})
