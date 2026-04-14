"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { MedusaCart, MedusaRegion } from "@/lib/types/medusa"
import {
  createCart,
  retrieveCart,
  addLineItem,
  updateLineItem,
  removeLineItem,
  listRegions,
} from "@/lib/cart"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CART_ID_KEY = "36x_cart_id"
const REGION_ID_KEY = "36x_region_id"

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

type CartState = {
  cart: MedusaCart | null
  region: MedusaRegion | null
  isOpen: boolean
  isLoading: boolean
  itemCount: number
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (variantId: string, quantity?: number) => Promise<void>
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartState | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<MedusaCart | null>(null)
  const [region, setRegion] = useState<MedusaRegion | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Derive item count from cart lines
  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  // ── Init: fetch region + hydrate cart ───────────────────────────────────

  useEffect(() => {
    const init = async () => {
      // 1. Fetch and cache region
      let activeRegion: MedusaRegion | null = null
      try {
        const storedRegionId = localStorage.getItem(REGION_ID_KEY)
        const regions = await listRegions()

        if (regions.length > 0) {
          // Use stored region if still valid, otherwise fall back to first
          activeRegion =
            regions.find((r) => r.id === storedRegionId) ?? regions[0]
          localStorage.setItem(REGION_ID_KEY, activeRegion.id)
          setRegion(activeRegion)
        }
      } catch {
        // Region fetch failed — proceed without, cart creation will use default
      }

      // 2. Hydrate existing cart
      const storedCartId = localStorage.getItem(CART_ID_KEY)
      if (!storedCartId) return

      try {
        const existing = await retrieveCart(storedCartId)
        setCart(existing)
      } catch {
        // Cart expired or not found — will create on first addItem
        localStorage.removeItem(CART_ID_KEY)
      }
    }

    init()
  }, [])

  // ── Ensure cart exists (lazy create with region) ─────────────────────────

  const ensureCart = useCallback(async (): Promise<MedusaCart> => {
    if (cart) return cart

    const newCart = await createCart(region?.id)
    localStorage.setItem(CART_ID_KEY, newCart.id)
    setCart(newCart)
    return newCart
  }, [cart, region])

  // ── Actions ─────────────────────────────────────────────────────────────

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setIsLoading(true)
      try {
        const activeCart = await ensureCart()
        const updated = await addLineItem(activeCart.id, variantId, quantity)
        setCart(updated)
        setIsOpen(true)
      } finally {
        setIsLoading(false)
      }
    },
    [ensureCart]
  )

  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cart) return
      setIsLoading(true)
      try {
        const updated = await updateLineItem(cart.id, lineItemId, quantity)
        setCart(updated)
      } finally {
        setIsLoading(false)
      }
    },
    [cart]
  )

  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart) return
      setIsLoading(true)
      try {
        const updated = await removeLineItem(cart.id, lineItemId)
        setCart(updated)
      } finally {
        setIsLoading(false)
      }
    },
    [cart]
  )

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((v) => !v), [])

  return (
    <CartContext.Provider
      value={{
        cart,
        region,
        isOpen,
        isLoading,
        itemCount,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}
