import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const CustomNavSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Fixed-height trigger — never changes size */}
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          backgroundColor: isOpen
            ? "rgba(26, 26, 26, 1)"
            : "rgba(255, 255, 255, 0.05)",
        }}
        transition={{ duration: 0.2 }}
        className="
          relative flex items-center justify-between
          rounded-[10px] border border-white/10
          px-5 h-[48px] select-none cursor-pointer
          w-[160px] shadow-2xl overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-500/10 to-white/5 pointer-events-none" />
        <span className="text-white/40 font-display text-[10px] uppercase tracking-[0.2em]">
          Menu
        </span>
        <motion.img
          src="/icons/arrowup.svg"
          alt="Toggle"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-4 h-auto opacity-90"
        />
      </motion.div>

      {/* Dropdown — absolutely positioned below, expands downward */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scaleY: 0, y: -4 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{ transformOrigin: "top center" }}
            className="
              absolute top-[calc(100%+6px)] left-0
              w-[160px] rounded-[10px] border border-white/10
              bg-[rgba(26,26,26,1)] shadow-2xl overflow-hidden
              flex flex-col items-center pt-3 pb-2
            "
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-500/10 to-white/5 pointer-events-none" />
            <button className="text-white font-display uppercase tracking-widest text-sm hover:opacity-70 transition-opacity mb-3 relative z-10">
              Collections
            </button>
            <span className="w-full h-px bg-white/20 mb-3" />
            <button className="text-white font-display uppercase tracking-widest text-sm hover:opacity-70 transition-opacity mb-1 relative z-10">
              Categories
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-[-1] cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
