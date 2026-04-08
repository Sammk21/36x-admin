"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const products = new Array(6).fill(null).map((_, i) => ({
  id: i,
  title: "CONCRETE VERSES",
  price: "₹ 1,999",
  image: "/images/product.png", // replace
}));

export default function SearchOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-3xl"
        >
          <div className="flex h-full flex-col px-4 md:px-10 py-6">
            <div className="mt-10 flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-3xl bg-white/15 border border-white/10 px-5 py-4">
                <Search className="text-white/60" size={18} />
                <input
                  autoFocus
                  placeholder="Search..."
                  className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
                />
              </div>

              <button
                onClick={onClose}
                className="flex items-center justify-center text-white w-11 h-11 rounded-full border border-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 flex-1 overflow-hidden">
              <div className="hidden md:block text-white/70">
                <p className="text-xs uppercase tracking-wider mb-4">
                  Popular Suggestions
                </p>

                <div className="space-y-3 text-white text-sm">
                  <p className="hover:opacity-60 cursor-pointer">
                    Concrete Verses
                  </p>
                  <p className="hover:opacity-60 cursor-pointer">
                    Black T-Shirts
                  </p>
                  <p className="hover:opacity-60 cursor-pointer">
                    Hood Monarchy
                  </p>
                </div>
              </div>

              <div className="relative overflow-y-auto pr-2">
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                  {products.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, y: 40 },
                        show: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ scale: 1.04 }}
                      className="group relative overflow-hidden rounded-3xl"
                    >
                      {/* IMAGE */}
                      <div className="relative aspect-3/4">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* GRADIENT */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                      {/* TEXT */}
                      <div className="absolute bottom-4 left-4 right-4 text-center text-white">
                        <p className="text-sm font-semibold tracking-wide">
                          {item.title}
                        </p>
                        <p className="text-xs opacity-80 mt-1">{item.price}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="flex justify-center mt-10 pb-10">
                  <button className="border border-white/30 px-6 py-3 rounded-full text-white text-sm backdrop-blur-md hover:bg-white/10 transition">
                    View all →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
