# Cart, Checkout & Auth — Implementation Guide

## Architecture overview

```
Medusa v2 backend (localhost:9000)
  │
  ├── /auth/customer/emailpass      ← register / login → JWT token
  ├── /store/customers/me           ← profile, addresses, orders
  └── /store/carts/*                ← cart CRUD, line items, checkout
        │
lib/auth.ts          ← raw auth fetch helpers
lib/cart.ts          ← raw cart fetch helpers
        │
lib/store/auth.tsx   ← AuthProvider + useAuth() hook
lib/store/cart.tsx   ← CartProvider + useCart() hook
        │
components/auth/AuthModal.tsx       ← login / register modal
components/layout/MiniCart.tsx      ← hover cart panel in navbar
components/layout/navbar.tsx        ← Sign In + CART buttons
        │
app/layout.tsx       ← <AuthProvider><CartProvider> wraps whole app
app/cart/page.tsx    ← full cart page (/cart)
app/(checkout)/
  layout.tsx         ← minimal checkout header
  checkout/page.tsx  ← 4-step checkout (/checkout)
```

Content (images, titles, descriptions) → **Strapi**.
Cart, auth, orders, checkout → **Medusa**.

---

## Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Low-level auth fetch helpers — no React |
| `lib/cart.ts` | Low-level cart fetch helpers — no React |
| `lib/store/auth.tsx` | `AuthProvider` + `useAuth()` hook |
| `lib/store/cart.tsx` | `CartProvider` + `useCart()` hook |
| `lib/types/medusa.ts` | All Medusa types including cart + customer |
| `components/auth/AuthModal.tsx` | Login/register modal |
| `components/layout/MiniCart.tsx` | Mini cart drawer in navbar |
| `components/layout/navbar.tsx` | Sign In + CART button, wires both modals |
| `app/layout.tsx` | Providers wrap the entire app |
| `app/cart/page.tsx` | Full cart page at `/cart` |
| `app/(checkout)/checkout/page.tsx` | 4-step checkout at `/checkout` |

---

## Authentication

### How it works
Medusa v2 uses **JWT-based auth** for customers. The flow:
1. `POST /auth/customer/emailpass/register` → returns `{ token }`
2. `POST /auth/customer/emailpass` (login) → returns `{ token }`
3. Token is stored in `localStorage` under `36x_auth_token`
4. All authenticated requests send `Authorization: Bearer <token>`

### `useAuth()` hook
```tsx
const {
  customer,        // MedusaCustomer | null
  token,           // string | null  (JWT)
  isLoading,       // boolean
  isAuthenticated, // boolean

  login,     // (email, password) => Promise<void>
  register,  // ({ email, password, first_name, last_name, phone? }) => Promise<void>
  logout,    // () => void
  refresh,   // () => Promise<void>  — re-fetch customer
} = useAuth()
```

### AuthModal
Controlled modal with Login and Register tabs. Auto-closes when auth succeeds.
```tsx
import AuthModal from "@/components/auth/AuthModal"

const [open, setOpen] = useState(false)
<AuthModal open={open} onClose={() => setOpen(false)} defaultTab="login" />
```

### Navbar integration
- **Unauthenticated:** "Sign In" button → opens `AuthModal`
- **Authenticated:** shows customer first name, hover dropdown with "My Account" + "Sign Out"

### localStorage keys
| Key | Value |
|-----|-------|
| `36x_auth_token` | Medusa JWT string |

---

## Cart

### How it works
- Cart ID persisted in `localStorage` under `36x_cart_id`
- Cart is **lazily created** on the first `addItem` call (not on page load)
- On page load, if a stored cart ID exists it's re-hydrated via `GET /store/carts/{id}`
- The mini cart opens automatically after `addItem`

### `useCart()` hook
```tsx
const {
  cart,        // MedusaCart | null
  isOpen,      // boolean — mini cart open state
  isLoading,   // boolean
  itemCount,   // number — sum of all quantities

  openCart, closeCart, toggleCart,

  addItem,     // (variantId: string, quantity?: number) => Promise<void>
  updateItem,  // (lineItemId: string, quantity: number) => Promise<void>
  removeItem,  // (lineItemId: string) => Promise<void>
} = useCart()
```

### Add to cart from product page
```tsx
"use client"
import { useCart } from "@/lib/store/cart"

export function AddToCartButton({ variantId }: { variantId: string }) {
  const { addItem, isLoading } = useCart()
  return (
    <button disabled={isLoading} onClick={() => addItem(variantId)}>
      Add to Cart
    </button>
  )
}
```

The `variantId` comes from `MedusaProduct.variants[n].id` — the Medusa variant ID.

### MiniCart
Opens on hover over the CART button in the navbar. Shows line items with:
- Thumbnail, title, variant option, quantity stepper, price, remove button
- Subtotal + Checkout CTA + "View full cart" link

### `lib/cart.ts` helpers
| Function | Description |
|----------|-------------|
| `createCart(regionId?)` | Create a new cart |
| `retrieveCart(cartId)` | Fetch cart by ID |
| `addLineItem(cartId, variantId, qty?)` | Add variant to cart |
| `updateLineItem(cartId, lineItemId, qty)` | Update quantity |
| `removeLineItem(cartId, lineItemId)` | Remove line item |
| `listRegions()` | Get available regions |
| `formatPrice(amount, currencyCode?)` | Format cents → display string |

---

## Checkout (`/checkout`)

### 4-step flow
```
Information → Shipping → Payment → Review → Confirmed
```

| Step | Data collected |
|------|---------------|
| Information | First/last name, email, phone, full shipping address |
| Shipping | Shipping method selection (Standard / Express) |
| Payment | Payment method (COD or Card placeholder) |
| Review | Summary of address + "Place Order" |

### Guest vs logged-in
- **Guest:** shown "Sign in for faster checkout" prompt that opens `AuthModal`
- **Logged in:** address form pre-filled from customer profile, badge shows their name

### Completing the order (current state)
The "Place Order" button currently simulates a 1.4s delay then shows a confirmation screen and clears the cart ID from localStorage.

**To wire real Medusa checkout**, replace the `placeOrder` function in `checkout/page.tsx`:
```ts
// 1. Set shipping address on cart
await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, {
  method: "POST",
  body: JSON.stringify({ shipping_address: address }),
  headers: { "x-publishable-api-key": KEY, "Content-Type": "application/json" },
})

// 2. Add shipping method
await fetch(`${MEDUSA_URL}/store/carts/${cartId}/shipping-methods`, {
  method: "POST",
  body: JSON.stringify({ option_id: selectedShipping }),
  ...
})

// 3. Create payment session (e.g. Stripe)
await fetch(`${MEDUSA_URL}/store/payment-sessions`, {
  method: "POST",
  body: JSON.stringify({ cart_id: cartId }),
  ...
})

// 4. Complete cart
await fetch(`${MEDUSA_URL}/store/carts/${cartId}/complete`, {
  method: "POST", ...
})
```

---

## Cart page (`/cart`)

Full cart at `/cart` with:
- Animated line item rows (add/remove transitions via `AnimatePresence`)
- Qty stepper per item
- Order summary with subtotal, shipping note, total
- "Proceed to Checkout" CTA

---

## Environment variables

```bash
# .env (or .env.local)
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

The publishable API key is in Medusa Admin → **Settings → API Keys**. It scopes the storefront to a specific sales channel.

---

## Provider tree

```tsx
// app/layout.tsx
<AuthProvider>       ← JWT token, customer session
  <CartProvider>     ← cart state, line items, open/close
    {children}
  </CartProvider>
</AuthProvider>
```

Both providers are client-side only. They read from localStorage on mount.

---

## localStorage summary

| Key | Value | Set by |
|-----|-------|--------|
| `36x_auth_token` | Medusa JWT | `AuthProvider` on login/register |
| `36x_cart_id` | Medusa cart ID | `CartProvider` on first `addItem` |
