"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const sentiments = [
  { id: 1, value: 40, color: "text-blue-500", icon: "/images/review1.svg" },
  { id: 2, value: 85, color: "text-lime-400", icon: "/images/review2.svg" },
  { id: 3, value: 50, color: "text-yellow-400", icon: "/images/review3.svg" },
  { id: 4, value: 0, color: "text-orange-500", icon: "/images/review4.svg" },
  { id: 5, value: 5, color: "text-red-500", icon: "/images/review5.svg" },
  { id: 6, value: 10, color: "text-red-700", icon: "/images/review6.svg" },
];

export default function ReviewsSentiment() {
  return (
    <section className="w-full h-full overflow-hidden  text-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="font-black uppercase tracking-tighter text-4xl md:text-6xl">
          Reviews
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center justify-center w-64 h-64 md:w-80 md:h-80 rounded-full bg-zinc-900/50 backdrop-blur">
              <img
                src="/images/review2.svg"
                alt="overall sentiment"
                className="w-28 h-28 md:w-32 md:h-32"
              />
            </div>

            <div className="mt-8 max-w-md">
              <h3 className="font-black uppercase tracking-tight text-xl md:text-2xl leading-snug">
                Customers are feeling{" "}
                <span className="text-lime-400">great</span> about their
                purchase.
              </h3>

              <p className="mt-4 text-zinc-400 text-sm md:text-base">
                People have mixed opinions for this product, but the accumulated
                reaction is positive.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {sentiments.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 group"
              >
                <img
                  src={item.icon}
                  alt={`review-${item.id}`}
                  className="w-12 h-12 transition-transform group-hover:scale-110"
                />

                <div className="flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Progress
                      value={item.value}
                      className="h-2 bg-zinc-800"
                      //   indicatorClassName="bg-white"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
