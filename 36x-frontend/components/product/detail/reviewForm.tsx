"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/store/auth"
import { listOrders, listProductReviews, upsertProductReview } from "@/lib/auth"

// icon 1 = great (leftmost), icon 6 = bad (rightmost)
// API rating: icon1→5, icon2→4, icon3→3, icon4→2, icon5→1, icon6→1
const REVIEW_ICONS = [
  { index: 1, src: "/images/review1.svg", label: "Great",    apiRating: 5 },
  { index: 2, src: "/images/review2.svg", label: "Good",     apiRating: 4 },
  { index: 3, src: "/images/review3.svg", label: "Okay",     apiRating: 3 },
  { index: 4, src: "/images/review4.svg", label: "Mixed",    apiRating: 2 },
  { index: 5, src: "/images/review5.svg", label: "Bad",      apiRating: 1 },
  { index: 6, src: "/images/review6.svg", label: "Terrible", apiRating: 1 },
]

function IconSlider({
  selected,
  onChange,
}: {
  selected: number   // icon index 1–6, or 0 for none
  onChange: (index: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || selected

  // track fill width as a percentage of the container
  const fillPct = active > 0 ? ((active - 1) / (REVIEW_ICONS.length - 1)) * 100 : 0

  return (
    <div className="relative w-full max-w-sm">
      {/* Track */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-px bg-zinc-700 mx-6" />
      {/* Fill */}
      <motion.div
        className="absolute top-1/2 left-6 -translate-y-1/2 h-px bg-white origin-left"
        animate={{ scaleX: fillPct / 100 }}
        style={{ width: "calc(100% - 3rem)", transformOrigin: "left" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Icons */}
      <div className="relative flex justify-between items-center py-4">
        {REVIEW_ICONS.map((icon) => {
          const isActive = active >= icon.index
          const isSelected = selected === icon.index

          return (
            <button
              key={icon.index}
              type="button"
              aria-label={icon.label}
              onClick={() => onChange(icon.index)}
              onMouseEnter={() => setHovered(icon.index)}
              onMouseLeave={() => setHovered(0)}
              className="relative flex flex-col items-center gap-2 focus:outline-none group"
            >
              <motion.img
                src={icon.src}
                alt={icon.label}
                animate={{
                  scale: isSelected ? 1.4 : hovered === icon.index ? 1.2 : 1,
                  opacity: active > 0 ? (isActive ? 1 : 0.25) : 0.5,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-9 h-9"
              />
              {isSelected && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-5 text-[10px] uppercase tracking-widest text-zinc-400 whitespace-nowrap"
                >
                  {icon.label}
                </motion.span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type PurchaseMatch = {
  orderId: string
  lineItemId: string
}

type Props = {
  productId: string
  onSuccess?: () => void
}

export default function ReviewForm({ productId, onSuccess }: Props) {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth()

  const [purchase, setPurchase] = useState<PurchaseMatch | null>(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [checking, setChecking] = useState(false)

  const [selectedIcon, setSelectedIcon] = useState(0)  // icon index 1–6
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

   useEffect(() => {
    console.log("[ReviewForm] Auth State:", {
      token: !!token,
      isAuthenticated,
      authLoading,
    })
  }, [token, isAuthenticated, authLoading])

  // 🔍 Check purchase + reviews
  useEffect(() => {
    if (!token) {
      console.log("[ReviewForm] Skipping check: No token")
      return
    }

    console.log("[ReviewForm] Starting purchase & review check", {
      productId,
    })

    setChecking(true)

    Promise.allSettled([
      listOrders(token),
      listProductReviews(token, productId),
    ])
      .then(([ordersResult, reviewsResult]) => {
        // Orders — if this fails we can't verify purchase
        if (ordersResult.status === "fulfilled") {
          const orders = ordersResult.value
          console.log("[ReviewForm] Orders fetched:", orders)

          let foundPurchase: PurchaseMatch | null = null

          for (const order of orders) {
            console.log("[ReviewForm] Checking order:", order.id)
            const item = order.items.find((i) => i.product_id === productId)
            if (item) {
              console.log("[ReviewForm] ✅ Matching purchase found", {
                orderId: order.id,
                lineItemId: item.id,
              })
              foundPurchase = { orderId: order.id, lineItemId: item.id }
              break
            }
          }

          if (!foundPurchase) {
            console.warn("[ReviewForm] ❌ No purchase found for product", { productId })
          }

          setPurchase(foundPurchase)
        } else {
          console.error("[ReviewForm] ❌ Failed to fetch orders:", ordersResult.reason)
          setPurchase(null)
        }

        // Reviews — if this fails, default to false so the form still shows.
        // The API will reject a duplicate server-side.
        if (reviewsResult.status === "fulfilled") {
          const hasReviewed = reviewsResult.value.length > 0
          console.log("[ReviewForm] Reviews fetched, already reviewed:", hasReviewed)
          setAlreadyReviewed(hasReviewed)
        } else {
          console.warn("[ReviewForm] ⚠️ Failed to fetch reviews, defaulting to not reviewed:", reviewsResult.reason)
          setAlreadyReviewed(false)
        }
      })
      .finally(() => {
        console.log("[ReviewForm] Finished checking")
        setChecking(false)
      })
  }, [token, productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !purchase || selectedIcon === 0) return

    const apiRating = REVIEW_ICONS.find((i) => i.index === selectedIcon)?.apiRating ?? 3

    setSubmitting(true)
    setError(null)

    try {
      await upsertProductReview(token, {
        order_id: purchase.orderId,
        order_line_item_id: purchase.lineItemId,
        rating: apiRating,
        content,
      })
      setSuccess(true)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message ?? "Failed to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (authLoading || checking) {
    return (
      <div className="mt-12 border-t border-zinc-800 pt-10">
        <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" />
      </div>
    )
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="mt-12 border-t border-zinc-800 pt-10">
        <p className="text-zinc-400 text-sm">
          <a href="/account/login" className="text-white underline underline-offset-2">
            Log in
          </a>{" "}
          to leave a review.
        </p>
      </div>
    )
  }

  // ── No purchase found ─────────────────────────────────────────────────────
  if (!purchase) {
    return (
      <div className="mt-12 border-t border-zinc-800 pt-10">
        <p className="text-zinc-500 text-sm">
          Only verified buyers can leave a review. Purchase this product to share your thoughts.
        </p>
      </div>
    )
  }

  // ── Already reviewed ──────────────────────────────────────────────────────
  if (alreadyReviewed && !success) {
    return (
      <div className="mt-12 border-t border-zinc-800 pt-10">
        <p className="text-zinc-400 text-sm">You've already reviewed this product. Thank you!</p>
      </div>
    )
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="mt-12 border-t border-zinc-800 pt-10">
        <p className="text-lime-400 text-sm font-medium uppercase tracking-widest">
          Review submitted — thank you!
        </p>
        <p className="text-zinc-500 text-xs mt-1">Your review will appear once approved.</p>
      </div>
    )
  }

  // ── Review form ───────────────────────────────────────────────────────────
  return (
    <div className="mt-12 border-t border-zinc-800 pt-10">
      <h3 className="font-black uppercase tracking-tight text-lg mb-6">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
        {/* Icon slider */}
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-6">How do you feel about it?</p>
          <IconSlider selected={selectedIcon} onChange={setSelectedIcon} />
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Your thoughts</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            placeholder="What did you think about this product?"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || selectedIcon === 0 || !content.trim()}
          className="px-8 py-3 bg-white text-black text-xs font-medium uppercase tracking-[0.15em] rounded-lg disabled:opacity-40 hover:bg-zinc-200 transition-colors"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  )
}
