"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useCart } from "@/lib/store/cart"
import { formatPrice } from "@/lib/medusa/cart"
import type { HttpTypes } from "@medusajs/types"
type MedusaLineItem = HttpTypes.StoreCartLineItem

// ---------------------------------------------------------------------------
// Line item row
// ---------------------------------------------------------------------------

function LineItem({ item }: { item: MedusaLineItem }) {
  const { cart, updateItem, removeItem, isLoading } = useCart()

  return (
    <div className="flex gap-3 py-4 border-b border-white/10 last:border-0">
      {/* Thumbnail */}
      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-display uppercase tracking-wide truncate">
          {item.product_title}
        </p>
        {item.product_subtitle && (
          <p className="text-white/50 text-[10px] font-body mt-0.5 truncate">
            {item.product_subtitle}
          </p>
        )}
        {item.variant_title && (
          <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">
            {item.variant_title}
          </p>
        )}
        <p className="text-white/30 text-[10px] mt-0.5 font-body">
          Qty: {item.quantity}
        </p>

        <div className="flex items-center justify-between mt-2">
          {/* Qty stepper */}
          <div className="flex items-center gap-2">
            <button
              disabled={isLoading || item.quantity <= 1}
              onClick={() => updateItem(item.id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/50 disabled:opacity-30 transition"
            >
              <Minus size={10} />
            </button>
            <span className="text-white text-xs w-4 text-center font-body">
              {item.quantity}
            </span>
            <button
              disabled={isLoading}
              onClick={() => updateItem(item.id, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/50 disabled:opacity-30 transition"
            >
              <Plus size={10} />
            </button>
          </div>

          <p className="text-white text-xs font-body">
            {formatPrice(item.total ?? 0, cart?.currency_code)}
          </p>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.id)}
        disabled={isLoading}
        className="self-start mt-0.5 text-white/30 hover:text-white transition disabled:opacity-30"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mini cart panel
// ---------------------------------------------------------------------------

interface MiniCartProps {
  /** controlled open state */
  open: boolean
  onClose: () => void
}

export default function MiniCart({ open, onClose }: MiniCartProps) {
  const { cart, isLoading } = useCart()
  const items = cart?.items ?? []
  const isEmpty = items.length === 0
  const currencyCode = cart?.currency_code ?? "inr"

  const checkoutUrl = cart?.id ? `/checkout?cart_id=${cart.id}` : "/checkout"

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8, scaleY: 0.97 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.97 }}
            transition={{ duration: 0.22, ease: [0.42, 0, 0.58, 1] }}
            style={{ transformOrigin: "top right" }}
            className="fixed top-[72px] right-4 z-50 w-[340px] max-h-[calc(100vh-96px)] flex flex-col rounded-2xl overflow-hidden border bg-black border-white/10 shadow-2xl"
            // stop clicks inside from closing via backdrop
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glass background */}
            <div
              className="absolute inset-0 -z-10"
            />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={15} className="text-white/70" />
                <span className="text-white font-display text-base uppercase tracking-widest">
                  Cart
                </span>
                {items.length > 0 && (
                  <span className="text-white/40 text-xs font-body">
                    ({items.length})
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 min-h-0">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <ShoppingBag size={32} className="text-white/20" />
                  <p className="text-white/40 text-sm font-body">
                    Your cart is empty
                  </p>
                </div>
              ) : (
                items.map((item) => <LineItem key={item.id} item={item} />)
              )}
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div className="px-5 py-4 border-t border-white/10 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-xs font-body">
                  <span className="text-white/50 uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span className="text-white">
                    {formatPrice(
                      cart?.subtotal ?? 0,
                      cart?.currency_code
                    )}
                  </span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href={checkoutUrl}
                  onClick={onClose}
                  className="block w-full text-center py-3 rounded-xl bg-white text-black text-xs font-display uppercase tracking-widest hover:bg-white/90 transition"
                >
                  Checkout
                </Link>

                {/* View full cart */}
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full text-center py-2 text-white/40 hover:text-white text-[11px] font-body transition"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
