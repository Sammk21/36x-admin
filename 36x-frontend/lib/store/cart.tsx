"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { HttpTypes } from "@medusajs/types"
import {
  createCart,
  retrieveCart,
  addLineItem,
  updateLineItem,
  removeLineItem,
  updateCart,
  listRegions,
} from "@/lib/medusa/cart"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CART_ID_KEY = "36x_cart_id"
const REGION_ID_KEY = "36x_region_id"

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

type CartState = {
  cart: HttpTypes.StoreCart | null
  region: HttpTypes.StoreRegion | null
  regions: HttpTypes.StoreRegion[]
  isOpen: boolean
  isLoading: boolean
  itemCount: number
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (variantId: string, quantity?: number) => Promise<void>
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  /** Switch the active region — updates cart region if a cart exists */
  switchRegion: (regionId: string) => Promise<void>
  /** Directly replace cart state — use after mutations that return an updated cart */
  setCart: React.Dispatch<React.SetStateAction<HttpTypes.StoreCart | null>>
  /** Clear cart state + localStorage — call after order is placed or customer logs out */
  refreshCart: () => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartState | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null)
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  // ── Init: fetch region + hydrate cart ───────────────────────────────────

  useEffect(() => {
    const init = async () => {
      // 1. Resolve region
      let activeRegion: HttpTypes.StoreRegion | null = null
      try {
        const storedRegionId = localStorage.getItem(REGION_ID_KEY)
        const regions = await listRegions()

        if (regions.length > 0) {
          activeRegion =
            regions.find((r) => r.id === storedRegionId) ?? regions[0]
          localStorage.setItem(REGION_ID_KEY, activeRegion.id)
          setRegions(regions)
          setRegion(activeRegion)
        }
      } catch {
        // proceed without region — cart creation will use backend default
      }

      // 2. Hydrate existing cart
      const storedCartId = localStorage.getItem(CART_ID_KEY)
      if (!storedCartId) return

      try {
        const existing = await retrieveCart(storedCartId)
        setCart(existing)
      } catch {
        // Cart expired or not found — will lazily create on first addItem
        localStorage.removeItem(CART_ID_KEY)
      }
    }

    init()
  }, [])

  // ── Lazily create cart when needed ──────────────────────────────────────

  const ensureCart = useCallback(async (): Promise<HttpTypes.StoreCart> => {
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

  /**
   * Switch the active region.
   * Persists to localStorage and updates the cart's region_id if a cart exists.
   */
  const switchRegion = useCallback(async (regionId: string) => {
    const next = regions.find((r) => r.id === regionId)
    if (!next) return
    localStorage.setItem(REGION_ID_KEY, regionId)
    setRegion(next)
    if (cart) {
      try {
        const updated = await updateCart(cart.id, { region_id: regionId })
        setCart(updated)
      } catch {
        // cart update failed — region UI still reflects selection
      }
    }
  }, [regions, cart])

  /**
   * Wipe cart from state + localStorage.
   * Call this after a successful order, or when the customer logs out.
   */
  const refreshCart = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY)
    setCart(null)
    setIsOpen(false)
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((v) => !v), [])

  return (
    <CartContext.Provider
      value={{
        cart,
        region,
        regions,
        isOpen,
        isLoading,
        itemCount,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateItem,
        removeItem,
        switchRegion,
        setCart,
        refreshCart,
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
