"use client";

import { motion } from "framer-motion";
import type { ProductReviewStats, PublicProductReview } from "@/lib/medusa";
import ReviewForm from "./reviewForm";
import ReviewList from "./reviewList";

// Maps star ratings (5 → best, 1 → worst) to sentiment icons in order
const SENTIMENT_ICONS = [
  { star: 5, icon: "/images/review2.svg", label: "great" },
  { star: 4, icon: "/images/review1.svg", label: "good" },
  { star: 3, icon: "/images/review3.svg", label: "okay" },
  { star: 2, icon: "/images/review4.svg", label: "mixed" },
  { star: 1, icon: "/images/review5.svg", label: "bad" },
]

// Overall icon + label based on average rating
function getOverallSentiment(average: number | null) {
  if (average === null || average === 0) return { icon: "/images/review3.svg", label: "no reviews yet", color: "text-zinc-400" }
  if (average >= 4.5) return { icon: "/images/review2.svg", label: "great", color: "text-lime-400" }
  if (average >= 3.5) return { icon: "/images/review1.svg", label: "good", color: "text-blue-400" }
  if (average >= 2.5) return { icon: "/images/review3.svg", label: "okay", color: "text-yellow-400" }
  if (average >= 1.5) return { icon: "/images/review4.svg", label: "mixed", color: "text-orange-400" }
  return { icon: "/images/review5.svg", label: "negative", color: "text-red-400" }
}

type Props = {
  productId: string
  stats: ProductReviewStats | null
  reviews: PublicProductReview[]
}

export default function ReviewsSentiment({ productId, stats, reviews }: Props) {
  const total = stats?.review_count ?? 0

  console.log(stats ? `[ReviewsSentiment] Stats for product ${productId}:` : `[ReviewsSentiment] No stats available for product ${productId}`, stats)

  // Build per-star percentages (0–100)
  const sentiments = SENTIMENT_ICONS.map(({ star, icon, label }) => {
    const key = `rating_count_${star}` as keyof ProductReviewStats
    const count = total > 0 ? (stats?.[key] as number ?? 0) : 0
    return {
      star,
      icon,
      label,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      count,
    }
  })

  const overall = getOverallSentiment(stats?.average_rating ?? null)

  return (
    <section className="w-full h-full overflow-hidden text-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="font-display uppercase tracking-tighter text-4xl md:text-6xl">
          Reviews
        </h2>

        {total === 0 ? (
          <p className="mt-6 text-zinc-500 text-sm">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center justify-center w-64 h-64 md:w-80 md:h-80 rounded-full bg-zinc-900/50 backdrop-blur">
                <img
                  src={overall.icon}
                  alt="overall sentiment"
                  className="w-28 h-28 md:w-32 md:h-32"
                />
              </div>

              <div className="mt-8 max-w-md">
                <h3 className="font-black uppercase tracking-tight text-xl md:text-2xl leading-snug">
                  Customers are feeling{" "}
                  <span className={overall.color}>{overall.label}</span> about their
                  purchase.
                </h3>

                <p className="mt-4 text-zinc-400 text-sm md:text-base">
                  {stats?.average_rating != null
                    ? `${stats.average_rating.toFixed(1)} average rating across ${total} review${total !== 1 ? "s" : ""}.`
                    : "No rating data available."}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {sentiments.map((item, i) => (
                <motion.div
                  key={item.star}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 group"
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-12 h-12 transition-transform group-hover:scale-110"
                  />

                  <div className="flex-1 relative h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${item.value}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                      viewport={{ once: true }}
                    />
                  </div>

                  <span className="text-xs text-zinc-500 w-8 text-right">{item.value}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <ReviewList reviews={reviews} />
        <ReviewForm productId={productId} />
      </div>
    </section>
  );
}
