"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import ConceptSection from "./conceptSection";
import ReviewsSentiment from "./reviewSentiment";
import GallerySection from "./gallery-section";

type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
} as any;

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

const imgVariant: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerInfo: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};

function StickyButtons({ selectedSize }: { selectedSize: Size | null }) {
  const [isVisible, setIsVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" id="buttons-sentinel" />
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#111111]/95 backdrop-blur-md border-t border-zinc-800 px-4 py-3 flex gap-3"
          >
            <Button
              size={"responsive" as any}
              variant="default"
              className="flex py-6 flex-1 items-center justify-center gap-2 bg-white text-black text-sm font-medium tracking-[0.15em] uppercase"
            >
              <img className="h-4.5 w-4.5" src={"/icons/cart.svg"} />
              Buy Now
            </Button>
            <Button
              size={"responsive" as any}
              variant="outline"
              className="flex py-6 flex-1 items-center justify-center gap-2 text-sm font-medium tracking-[0.15em] uppercase"
            >
              <img className="h-4.5 w-4.5" src={"/icons/shopping-bag.svg"} />
              Add to Cart
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ProductDetail() {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <div className="flex flex-col lg:flex-row min-h-screen">
       
          <GallerySection />
     
        <motion.section
          className="w-full lg:w-[40%] lg:sticky lg:top-0 lg:max-h-screen flex flex-col justify-between px-3 sm:px-5 py-10 lg:px-10 lg:py-0 border-l border-zinc-800/50"
          variants={staggerInfo}
          initial="hidden"
          animate="visible"
        >
          <div className="flex-1 flex flex-col justify-center">
            <motion.h1
              variants={slideUp}
              className="text-5xl lg:text-4xl  uppercase font-display leading-[100%]"
            >
              HOOD MONARCHY
            </motion.h1>

            <motion.div
              variants={slideUp}
              className="flex items-baseline gap-3 mt-2 mb-3"
            >
              <p className="text-2xl font-body font-medium leading-[100%]">
                ₹ 1,999
              </p>
            </motion.div>

            <motion.p
              variants={slideUp}
              className="text-sm tracking-wide leading-tight font-body text-white/60 mb-8 max-w-sm"
            >
              36X is the anchor piece of the brand — the one that sits closest
              to our identity. Built from 280 GSM super-combed cotton, it holds
              its structure and falls naturally. The wide 1×1 rib keeps the
              neckline crisp through every wash.
            </motion.p>

            <motion.div variants={slideUp} className="mb-10">
              <div className="flex items-center">
                <div className="flex flex-row-reverse   -space-x-px">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size, index) => (
                    <b
                      onClick={() => setSelectedSize(SIZES[index])}
                      key={size}
                      className={`
                        relative flex rounded-l-none last:rounded-l-[12px]  h-11 w-15 items-center justify-center
                        border-[0.5px] border-white/90 bg-[#111111] active:scale-96
                        text-sm font-medium hover:text-black cursor-pointer
                        transition-all hover:z-20 hover:bg-white
                        rounded-[12px]
                        -mr-3
                        z-${index}
                        ${selectedSize === size ? "bg-white text-black z-30" : ""}
                      `}
                    >
                      {size}
                    </b>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div variants={slideUp} className="mb-8">
              <button
                onClick={() => setDetailsOpen((prev) => !prev)}
                className="flex items-center gap-1  text-xs tracking-[0.2em] uppercase text-zinc-300 hover:text-white transition-colors"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
            
                + More Details
              </button>

              <AnimatePresence>
                {detailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <ul
                      className="mt-4 space-y-2 text-xs text-zinc-500 border-l border-zinc-700 pl-4"
                      style={{ fontFamily: "'Barlow', sans-serif" }}
                    >
                      <li>280 GSM Super-combed Cotton</li>
                      <li>Oversized drop-shoulder silhouette</li>
                      <li>1×1 Ribbed neckline &amp; cuffs</li>
                      <li>Screen-printed archival graphic</li>
                      <li>Machine washable · Cold water</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="pb-10 lg:pb-10">
            <StickyButtons selectedSize={selectedSize} />

            <motion.div
              variants={slideUp}
              className="flex gap-3"
              id="inline-buttons"
            >
              <Button
                size={"responsive" as any}
                variant="default"
                className="flex py-6 flex-1 items-center justify-center gap-2 bg-white text-black text-sm font-medium tracking-[0.15em] uppercase"
              >
                <img className="h-4.5 w-4.5" src={"/icons/cart.svg"} />
                Buy Now
              </Button>

              <Button
                size={"responsive" as any}
                variant="outline"
                className="flex py-6 flex-1 items-center justify-center gap-2 text-sm font-medium tracking-[0.15em] uppercase"
              >
                <img className="h-4.5 w-4.5" src={"/icons/shopping-bag.svg"} />
                Add to Cart
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </div>
    
    </main>
  );
}
