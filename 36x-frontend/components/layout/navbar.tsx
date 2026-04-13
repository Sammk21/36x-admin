"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, Search, User, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressiveBlur } from "../ui/progressive-blur";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import SearchOverlay from "../ui/searchOverlay";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { useAuth } from "@/lib/store/auth";
import MiniCart from "./MiniCart";
import AuthModal from "@/components/auth/AuthModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type DropdownItem = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href?: string;
  dropdown?: {
    sections: {
      title: string;
      items: DropdownItem[];
    }[];
  };
};

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Culture", href: "#" },
  {
    label: "Collections",
    href: "/collection-timeline",
    dropdown: {
      sections: [
        {
          title: "COLLECTIONS",
          items: [
            { label: "SS25 Drop", href: "#" },
            { label: "FW24 Archive", href: "#" },
            { label: "Capsule Series", href: "#" },
            { label: "Collabs", href: "#" },
          ],
        },
        {
          title: "CATEGORIES",
          items: [
            { label: "Tops", href: "#" },
            { label: "Bottoms", href: "#" },
            { label: "Outerwear", href: "#" },
            { label: "Accessories", href: "#" },
          ],
        },
      ],
    },
  },
  { label: "Community", href: "#" },
  { label: "Core", href: "#" },
];

// ─── Active dash indicator ────────────────────────────────────────────────────

function ActiveDash() {
  return (
    <span
      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 block bg-white rounded-full"
      style={{ width: 10, height: 2 }}
    />
  );
}

// ─── Dropdown panel (matches reference image) ────────────────────────────────

function NavDropdown({
  sections,
  onClose,
}: {
  sections: NavItem["dropdown"]["sections"];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -6, scaleY: 0.97 }}
      transition={{ duration: 0.2, ease: [0.42, 0, 0.58, 1] }}
      style={{ transformOrigin: "top center" }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
    >
      {/* Outer rounded card — steel gradient matching reference */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 min-w-[220px]"
        style={{
          background:
            "linear-gradient(160deg, #3d4b53 0%, #2c383e 40%, #1e2b30 100%)",
        }}
      >
        {/* Sections */}
        <div className="px-5 pt-5 pb-2">
          {sections.map((section:any, si:any) => (
            <div key={section.title}>
              {/* Section title */}
              <p className="font-display text-white font-black tracking-widest text-base mb-3">
                {section.title}
              </p>
              {/* Items */}
              <ul className="flex flex-col gap-2 mb-2">
                {section.items.map((item:any) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="font-display text-white/70 hover:text-white text-sm tracking-wide transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Divider between sections */}
              {si < sections.length - 1 && (
                <div className="my-3 border-t border-white/15" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom chevron row */}
        <div className="flex justify-center py-3">
          <ChevronUp size={16} className="text-white/50" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Single desktop nav link ──────────────────────────────────────────────────

function DesktopNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hasDropdown = !!item.dropdown;

  return (
    <div ref={ref} className="relative">
      {hasDropdown ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className={`relative font-display text-xl font-medium transition-colors cursor-pointer ${
            active || open ? "text-white" : "text-white/75 hover:text-white"
          }`}
        >
          {item.label}
          {(active || open) && <ActiveDash />}
        </button>
      ) : (
        <Link
          href={item.href ?? "#"}
          className={`relative font-display text-xl font-medium transition-colors ${
            active ? "text-white" : "text-white/75 hover:text-white"
          }`}
        >
          {item.label}
          {active && <ActiveDash />}
        </Link>
      )}

      {/* Dropdown */}
      {hasDropdown && (
        <AnimatePresence>
          {open && (
            <NavDropdown
              sections={item.dropdown!.sections}
              onClose={() => setOpen(false)}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, isOpen: cartOpen, openCart, closeCart, toggleCart } = useCart();
  const { customer, isAuthenticated, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="fixed -top-1 z-50 w-full">
      <div className="relative w-full h-full">
        <ProgressiveBlur
          className="absolute -top-1 inset-0 z-0"
          position="top"
          height="100%"
        />

        {/* ── Desktop bar ── */}
        <div className="relative z-10 mx-auto flex h-20 max-w-7xl items-center px-6">
          {/* Logo — left */}
          <div className="flex-1 flex justify-start">
            <Link href="/">
              <Image
                className="h-auto object-contain"
                src="/logo/36x-logo.svg"
                alt=""
                width={70}
                height={10}
              />
            </Link>
          </div>

          {/* Nav links — center */}
          <nav className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href && item.href !== "#"
                  ? pathname === item.href || pathname.startsWith(item.href)
                  : false;
              return (
                <DesktopNavLink
                  key={item.label}
                  item={item}
                  active={isActive}
                />
              );
            })}
          </nav>

          {/* Actions — right */}
          <div className="flex-1 flex justify-end items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex text-white/75 hover:text-white transition"
            >
              <Search size={18} />
            </button>

            {/* Cart */}
            <div
              className="relative hidden md:block"
              onMouseEnter={openCart}
              onMouseLeave={closeCart}
            >
              <Button
                ref={cartBtnRef}
                size="lg"
                variant="outline"
                onClick={toggleCart}
                className="flex items-center text-lg font-display gap-2 rounded-lg text-white hover:bg-white/10"
              >
                <img
                  className="h-3.5 w-3.5 mb-0.5"
                  src="/icons/Cart.svg"
                  alt=""
                />
                <span>CART</span>
                {itemCount > 0 && (
                  <span className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold leading-none">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Button>

              {/* Mini cart — stays open while hovering the button or panel */}
              <div onMouseEnter={openCart} onMouseLeave={closeCart}>
                <MiniCart open={cartOpen} onClose={closeCart} />
              </div>
            </div>

            {/* Sign In / Account */}
            {isAuthenticated ? (
              <div className="relative hidden md:block group">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center text-lg font-display gap-2 rounded-lg text-white hover:bg-white/10"
                >
                  <User size={16} />
                  {customer?.first_name ?? "Account"}
                </Button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-40 bg-[#1c2529] border border-white/10 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                  <Link
                    href="/my-account"
                    className="block px-4 py-3 text-xs font-display uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 transition"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-xs font-display uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 transition border-t border-white/10"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setAuthOpen(true)}
                className="hidden md:flex items-center text-lg font-display gap-2 rounded-lg text-white hover:bg-white/10"
              >
                <User size={16} />
                Sign In
              </Button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden text-white"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X size={26} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Menu size={26} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.42, 0, 0.58, 1] }}
            className="md:hidden backdrop-blur-xl bg-black/90 border-t border-white/10"
          >
            <div className="flex flex-col gap-5 px-6 py-6 text-white">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href && item.href !== "#"
                    ? pathname === item.href
                    : false;
                return (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    onClick={() => setMobileOpen(false)}
                    className={`relative font-display text-lg w-fit transition-colors ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {isActive && <ActiveDash />}
                  </Link>
                );
              })}

              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10 font-display"
                >
                  Cart
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10 font-display"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Auth modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
