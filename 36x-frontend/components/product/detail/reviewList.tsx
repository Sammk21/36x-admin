"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PublicProductReview } from "@/lib/medusa"

// Maps API rating (1–5) back to the closest sentiment icon
const RATING_ICON: Record<number, string> = {
  5: "/images/review1.svg",
  4: "/images/review2.svg",
  3: "/images/review3.svg",
  2: "/images/review4.svg",
  1: "/images/review5.svg",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function ImageLightbox({ images, startIndex, onClose }: {
  images: { url: string }[]
  startIndex: number
  onClose: () => void
}) {
  const [current, setCurrent] = useState(startIndex)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

      <div className="relative max-w-3xl w-full px-12" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current].url}
          alt={`review image ${current + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-lg"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-2xl w-10 h-10 flex items-center justify-center hover:text-zinc-300"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-2xl w-10 h-10 flex items-center justify-center hover:text-zinc-300"
            >
              ›
            </button>
            <div className="flex justify-center gap-1.5 mt-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-zinc-600"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

function ReviewCard({ review }: { review: PublicProductReview }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const icon = RATING_ICON[review.rating] ?? "/images/review3.svg"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="border-b border-zinc-800 pb-8"
    >
      <div className="flex items-start gap-4">
        {/* Sentiment icon */}
        <img src={icon} alt={`rating ${review.rating}`} className="w-10 h-10 mt-0.5 shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <span className="text-sm font-medium text-white">
              {review.name ?? "Anonymous"}
            </span>
            <span className="text-xs text-zinc-600">{formatDate(review.created_at)}</span>
          </div>

          {/* Content */}
          {review.content && (
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{review.content}</p>
          )}

          {/* Images */}
          {review.images?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {review.images.map((img, i) => (
                <button
                  key={img.id ?? i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  <img
                    src={img.url}
                    alt={`review photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Admin response */}
          {review.response && (
            <div className="mt-4 pl-4 border-l-2 border-zinc-700">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">36x response</p>
              <p className="text-sm text-zinc-400">{review.response.content}</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <ImageLightbox
            images={review.images}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

type Props = {
  reviews: PublicProductReview[]
}

export default function ReviewList({ reviews }: Props) {
  if (!reviews.length) return null

  return (
    <div className="mt-12 border-t border-zinc-800 pt-10 space-y-8">
      <h3 className="font-black uppercase tracking-tight text-lg">
        What people are saying
      </h3>
      <div className="space-y-8">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
