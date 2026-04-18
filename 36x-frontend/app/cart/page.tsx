"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/medusa/cart";
import type { HttpTypes } from "@medusajs/types";
type MedusaLineItem = HttpTypes.StoreCartLineItem;
import Navbar from "@/components/layout/navbar";
import { convertToLocale } from "@/lib/util/money";

function CartRow({ item, currencyCode }: { item: MedusaLineItem; currencyCode: string }) {
  const { updateItem, removeItem, isLoading } = useCart()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-5 py-6 border-b border-white/10 last:border-0"
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.product_title || ""}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
            <ShoppingBag size={20} className="text-white/20" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <p className="text-white font-display text-base uppercase tracking-wide truncate">
              {item.product_title}
            </p>
            {item.product_subtitle && (
              <p className="text-white/40 text-xs font-body mt-0.5">{item.product_subtitle}</p>
            )}
            {item.variant_title && (
              <p className="text-white/40 text-xs font-body mt-0.5 uppercase tracking-wider">
                {item.variant_title}
              </p>
            )}
          </div>
          <button
            onClick={() => removeItem(item.id)}
            disabled={isLoading}
            className="text-white/20 hover:text-white transition ml-4 shrink-0 disabled:opacity-30"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Qty stepper */}
          <div className="flex items-center gap-0 border border-white/15 rounded-xl overflow-hidden">
            <button
              onClick={() =>
                item.quantity > 1
                  ? updateItem(item.id, item.quantity - 1)
                  : removeItem(item.id)
              }
              disabled={isLoading}
              className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition disabled:opacity-30"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-white text-sm font-body">
              {item.quantity}
            </span>
            <button
              onClick={() => updateItem(item.id, item.quantity + 1)}
              disabled={isLoading}
              className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition disabled:opacity-30"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <p className="text-white font-body text-sm">
            {formatPrice(item.unit_price * item.quantity, currencyCode)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}


export default function CartPage() {
  const { cart, isLoading } = useCart()
  const items = cart?.items ?? []
  const isEmpty = items.length === 0
  const currencyCode = cart?.currency_code ?? "inr"

  return (
    <div className="min-h-screen bg-[#0e0f11] text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/"
            className="text-white/30 hover:text-white transition flex items-center gap-1.5 text-xs font-body uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Continue shopping
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-display uppercase  text-white mb-10">
          Your Cart
        </h1>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <ShoppingBag size={48} className="text-white/10" />
            <p className="text-white/40 font-body">Your cart is empty.</p>
            <Link
              href="/"
              className="px-8 py-3 rounded-xl bg-white text-black text-xs font-display uppercase tracking-widest hover:bg-white/90 transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
            {/* Items */}
            <div>
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <CartRow key={item.id} item={item} currencyCode={currencyCode} />
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-28 h-fit">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-2xl  font-display uppercase  t text-white/50">
                  Summary
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-body text-white/50">
                    <span>Subtotal</span>
                    <span className="text-white">
                      {convertToLocale({amount:cart?.subtotal ?? 0, currency_code:cart?.currency_code})}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-body text-white/50">
                    <span>Shipping</span>
                    <span className="text-white/40">Free</span>
                  </div>
                  {(cart?.tax_total ?? 0) > 0 && (
                    <div className="flex justify-between text-sm font-body text-white/50">
                      <span>Tax</span>
                      <span className="text-white">
                        {convertToLocale({amount:cart!.tax_total, currency_code: cart!.currency_code})}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-display uppercase  border-t border-white/10 pt-3 mt-1">
                    <span className="text-white/70">Total</span>
                    <span className="text-white">
                      {convertToLocale({amount:cart?.total ?? 0, currency_code: cart?.currency_code})}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center py-4 rounded-xl bg-white text-black text-md font-display uppercase  hover:bg-white/90 transition"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-center text-white/20 text-[11px] font-body">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
