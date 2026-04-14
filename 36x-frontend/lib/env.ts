// ---------------------------------------------------------------------------
// Centralised environment config
// All lib files should import from here — never read process.env directly.
// ---------------------------------------------------------------------------

export const MEDUSA_URL =
  process.env.NEXT_PUBLIC_MEDUSA_URL ?? "http://localhost:9000"

export const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"

export const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ?? ""
