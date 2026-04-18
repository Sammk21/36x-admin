"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Check, Loader2, ShoppingBag, Lock, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useCart } from "@/lib/store/cart"
import { useAuth } from "@/lib/store/auth"
import {
  formatPrice,
  updateCart,
  listShippingOptions,
  addShippingMethod,
  initiatePayment,
  completeCart,
  applyPromoCode,
  removePromoCode,
} from "@/lib/cart"
import AuthModal from "@/components/auth/AuthModal"
import type { HttpTypes } from "@medusajs/types";
import { convertToLocale } from "@/lib/util/money"
import { listAddresses, MedusaAddress } from "@/lib/auth"


// ---------------------------------------------------------------------------
// Local type aliases
// ---------------------------------------------------------------------------

type MedusaCart = HttpTypes.StoreCart
type StoreShippingOption = HttpTypes.StoreCartShippingOption

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

type Step = "information" | "shipping" | "payment" | "review"

// Shipping is hidden from the default flow — only shown if manually opened
const STEPS: { id: Step; label: string }[] = [
  { id: "information", label: "Information" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
]

type AddressForm = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
}

const EMPTY_ADDRESS: AddressForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "in",
}

// ---------------------------------------------------------------------------
// Shared field
// ---------------------------------------------------------------------------

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required,
  half,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  half?: boolean
}) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-[11px] uppercase tracking-widest text-white/40 font-body mb-1.5">
        {label}
        {required && <span className="text-white/30 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-white/20 focus:outline-none focus:border-white/30 transition"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step breadcrumb
// ---------------------------------------------------------------------------

function StepBreadcrumb({ current }: { current: Step }) {
  const displayCurrent = current === "shipping" ? "information" : current
  const currentIdx = STEPS.findIndex((s) => s.id === displayCurrent)
  return (
    <div className="flex items-center gap-2 mb-8 flex-wrap">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-display transition-colors ${
                i < currentIdx
                  ? "bg-white text-black"
                  : i === currentIdx
                  ? "border border-white text-white"
                  : "border border-white/20 text-white/30"
              }`}
            >
              {i < currentIdx ? <Check size={10} /> : i + 1}
            </div>
            <span
              className={`text-xs font-display uppercase tracking-wider ${
                i === currentIdx
                  ? "text-white"
                  : i < currentIdx
                  ? "text-white/60"
                  : "text-white/20"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <ChevronRight size={12} className="text-white/20" />
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Order summary sidebar (with promo code input)
// ---------------------------------------------------------------------------

function OrderSummary({ cart, onCartUpdate }: { cart: MedusaCart | null; onCartUpdate: (c: MedusaCart) => void }) {
  const [promoCode, setPromoCode] = useState("")
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  const handleApplyPromo = async () => {
    if (!cart || !promoCode.trim()) return
    setPromoLoading(true)
    setPromoError(null)
    try {
      const updated = await applyPromoCode(cart.id, promoCode.trim())
      onCartUpdate(updated)
      setAppliedCode(promoCode.trim())
      setPromoCode("")
    } catch {
      setPromoError("Invalid or expired promo code")
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = async () => {
    if (!cart || !appliedCode) return
    setPromoLoading(true)
    try {
      const updated = await removePromoCode(cart.id, appliedCode)
      onCartUpdate(updated)
      setAppliedCode(null)
    } catch {
      // ignore
    } finally {
      setPromoLoading(false)
    }
  }

  if (!cart) return null

  const hasDiscount = cart.discount_total > 0

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sticky top-8">
      <h3 className="text-xs font-display uppercase tracking-widest text-white/50 mb-4">
        Order Summary
      </h3>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {(cart.items ?? []).map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
              {item.thumbnail ? (
                <Image src={item.thumbnail} alt={item.product_title} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <ShoppingBag size={16} className="text-white/20" />
                </div>
              )}
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white/80 text-black text-[9px] font-bold flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-display uppercase tracking-wide truncate">{item.product_title}</p>
              {item.variant_title && <p className="text-white/40 text-[10px] font-body mt-0.5 truncate">{item.variant_title}</p>}
              <p className="text-white/30 text-[10px] font-body mt-0.5">Qty: {item.quantity}</p>
            </div>
            <p className="text-white text-xs font-body shrink-0">
              {formatPrice(item.unit_price * item.quantity, cart.currency_code)}
            </p>
          </div>
        ))}
      </div>

      {/* Promo code */}
      <div className="mb-4">
        {appliedCode ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs font-body text-green-400">"{appliedCode}" applied</span>
            <button
              onClick={handleRemovePromo}
              disabled={promoLoading}
              className="text-white/30 hover:text-white text-[11px] font-body transition disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value); setPromoError(null) }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
              placeholder="Promo code"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-body placeholder-white/20 focus:outline-none focus:border-white/30 transition"
            />
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoCode.trim()}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-display uppercase tracking-wider hover:bg-white/20 disabled:opacity-40 transition flex items-center gap-1.5"
            >
              {promoLoading ? <Loader2 size={11} className="animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
        {promoError && <p className="text-red-400 text-[11px] font-body mt-1.5">{promoError}</p>}
      </div>

      {/* Totals */}
      <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="flex justify-between text-xs font-body text-white/50">
          <span>Subtotal</span>
          <span className="text-white">{convertToLocale({amount:cart.subtotal ?? 0, currency_code: cart.currency_code})}</span>
        </div>
        {hasDiscount && (
          <div className="flex justify-between text-xs font-body text-white/50">
            <span>Discount</span>
            <span className="text-green-400">−{formatPrice(cart.discount_total, cart.currency_code)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs font-body text-white/50">
          <span>Shipping</span>
          <span className="text-white/40">
            {(cart.shipping_total ?? 0) > 0
              ? convertToLocale({amount:cart.shipping_total ?? 0, currency_code:cart.currency_code})
              : "Calculated next"}
          </span>
        </div>
        {(cart.tax_total ?? 0) > 0 && (
          <div className="flex justify-between text-xs font-body text-white/50">
            <span>Tax</span>
            <span className="text-white">{convertToLocale({amount:cart.tax_total ?? 0, currency_code:cart.currency_code})}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-display uppercase tracking-wide border-t border-white/10 pt-3 mt-2">
          <span className="text-white/70">Total</span>
          <span className="text-white">{convertToLocale({amount:cart.total ?? 0, currency_code:cart.currency_code})}</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Saved address picker (shown when authenticated + has saved addresses)
// ---------------------------------------------------------------------------

function SavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: MedusaAddress[]
  selectedId: string | null
  onSelect: (a: MedusaAddress | null) => void
}) {
  return (
    <div className="mb-6">
      <p className="text-[11px] uppercase tracking-widest text-white/40 font-body mb-3">
        Saved Addresses
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
        {/* "New address" tile */}
        <button
          onClick={() => onSelect(null)}
          className={`snap-start shrink-0 w-44 text-left px-4 py-3.5 rounded-xl border transition ${
            selectedId === null
              ? "border-white bg-white/10"
              : "border-white/10 bg-white/[0.03] hover:border-white/25"
          }`}
        >
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-body mb-1.5">New</p>
          <p className="text-white text-xs font-display uppercase">Enter manually</p>
        </button>

        {addresses.map((a) => {
          const name = [a.first_name, a.last_name].filter(Boolean).join(" ") || "—"
          const line = [a.address_1, a.city].filter(Boolean).join(", ")
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              className={`snap-start shrink-0 w-44 text-left px-4 py-3.5 rounded-xl border transition ${
                selectedId === a.id
                  ? "border-white bg-white/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-body mb-1.5">
                {a.is_default_shipping ? "Default" : "Saved"}
              </p>
              <p className="text-white text-xs font-display uppercase truncate">{name}</p>
              <p className="text-white/40 text-[11px] font-body truncate mt-0.5">{line}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Information (email + shipping address + billing address)
// Per docs: update cart with email, shipping_address, and billing_address
// ---------------------------------------------------------------------------

function InformationStep({
  address,
  onChange,
  onNext,
  isLoading,
}: {
  address: AddressForm
  onChange: (field: keyof AddressForm, value: string) => void
  onNext: () => void
  isLoading: boolean
}) {
  const { customer, token, isAuthenticated } = useAuth()
  const { region } = useCart()
  const [authOpen, setAuthOpen] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<MedusaAddress[]>([])
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)

  // Fetch saved addresses once customer is authenticated
  useEffect(() => {
    if (!token || !isAuthenticated) return
    listAddresses(token)
      .then((addrs) => {
        setSavedAddresses(addrs)
        // Auto-select default shipping address if present
        const def = addrs.find((a) => a.is_default_shipping) ?? addrs[0]
        if (def) handleSelectSaved(def)
      })
      .catch(() => {/* silently ignore */})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated])

  const handleSelectSaved = (a: MedusaAddress | null) => {
    if (!a) {
      // "New address" — clear address fields (keep email/phone from customer)
      setSelectedSavedId(null);
      (["address_1", "address_2", "city", "province", "postal_code"] as const).forEach(
        (f) => onChange(f, "")
      )
      onChange("first_name", customer?.first_name ?? "")
      onChange("last_name", customer?.last_name ?? "")
      onChange("phone", customer?.phone ?? "")
      return
    }
    setSelectedSavedId(a.id)
    const map: [keyof AddressForm, string | null][] = [
      ["first_name", a.first_name],
      ["last_name", a.last_name],
      ["phone", a.phone],
      ["address_1", a.address_1],
      ["address_2", a.address_2],
      ["city", a.city],
      ["province", a.province],
      ["postal_code", a.postal_code],
      ["country_code", a.country_code],
    ]
    map.forEach(([field, val]) => onChange(field, val ?? ""))
  }

  const valid =
    address.first_name &&
    address.last_name &&
    address.email &&
    address.address_1 &&
    address.city &&
    address.postal_code

  return (
    <div>
      {!isAuthenticated ? (
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs font-body text-white/50">
            Have an account?{" "}
            <button onClick={() => setAuthOpen(true)} className="text-white underline hover:text-white/80 transition">
              Sign in
            </button>{" "}
            for faster checkout.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6">
          <Check size={13} className="text-green-400" />
          <p className="text-xs font-body text-white/60">
            Signed in as <span className="text-white">{customer?.first_name} {customer?.last_name}</span>
          </p>
        </div>
      )}

      {/* Saved address picker — only shown when authenticated + has saved addresses */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <SavedAddressPicker
          addresses={savedAddresses}
          selectedId={selectedSavedId}
          onSelect={(a) => handleSelectSaved(a)}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" value={address.first_name} onChange={(v) => onChange("first_name", v)} half required autoComplete="given-name" />
        <Field label="Last Name" value={address.last_name} onChange={(v) => onChange("last_name", v)} half required autoComplete="family-name" />
        <Field label="Email" type="email" value={address.email} onChange={(v) => onChange("email", v)} required autoComplete="email" />
        <Field label="Phone" type="tel" value={address.phone} onChange={(v) => onChange("phone", v)} half autoComplete="tel" />
        <Field label="Address" value={address.address_1} onChange={(v) => onChange("address_1", v)} required autoComplete="address-line1" placeholder="Street address" />
        <Field label="Apartment, suite, etc." value={address.address_2} onChange={(v) => onChange("address_2", v)} autoComplete="address-line2" placeholder="Optional" />
        <Field label="City" value={address.city} onChange={(v) => onChange("city", v)} half required autoComplete="address-level2" />
        <Field label="State / Province" value={address.province} onChange={(v) => onChange("province", v)} half autoComplete="address-level1" />
        <Field label="Postal Code" value={address.postal_code} onChange={(v) => onChange("postal_code", v)} half required autoComplete="postal-code" />
        <div className="col-span-1">
          <label className="block text-[11px] uppercase tracking-widest text-white/40 font-body mb-1.5">
            Country <span className="text-white/30">*</span>
          </label>
          <select
            value={address.country_code}
            onChange={(e) => onChange("country_code", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-white/30 transition"
          >
            {(region?.countries ?? []).map((c) => (
              <option key={c.iso_2} value={c.iso_2} className="bg-[#1c2529]">
                {c.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        disabled={!valid || isLoading}
        onClick={onNext}
        className="mt-6 w-full py-4 rounded-xl bg-white text-black text-xs font-display uppercase tracking-widest hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={13} className="animate-spin" />}
        Continue to Shipping
      </button>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Shipping
// Per docs: list options, handle price_type === "calculated" separately,
// add shipping method via sdk.store.cart.addShippingMethod
// ---------------------------------------------------------------------------

function ShippingStep({
  options,
  calculatedPrices,
  selected,
  onSelect,
  onNext,
  onBack,
  isLoading,
  currencyCode,
}: {
  options: StoreShippingOption[]
  calculatedPrices: Record<string, number>
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
  onBack: () => void
  isLoading: boolean
  currencyCode: string
}) {
  const getPrice = (opt: StoreShippingOption): string | null => {
    if (opt.price_type === "flat") {
      return opt.amount === 0 ? "Free" : convertToLocale({amount:opt.amount, currency_code: currencyCode})
    }
    const calc = calculatedPrices[opt.id]
    if (calc === undefined) return null // still loading
    return calc === 0 ? "Free" : convertToLocale({amount:calc, currency_code: currencyCode})
  }

  return (
    <div>
      {isLoading && options.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-white/30" />
        </div>
      ) : options.length === 0 ? (
        <p className="text-white/30 text-sm font-body py-8 text-center">
          No shipping options available for your region.
        </p>
      ) : (
        <div className="space-y-3 mb-6">
          {options.map((opt) => {
            const price = getPrice(opt)
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                disabled={price === null} // calculated price not yet loaded
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition ${
                  selected === opt.id
                    ? "border-white bg-white/10"
                    : "border-white/10 bg-white/0.03 hover:border-white/30"
                } disabled:opacity-40`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${selected === opt.id ? "border-white" : "border-white/30"}`}>
                    {selected === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <p className="text-white text-sm font-display uppercase tracking-wide text-left">{opt.name}</p>
                </div>
                <p className="text-white text-sm font-body">
                  {price ?? <Loader2 size={12} className="animate-spin" />}
                </p>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl border border-white/20 text-white text-xs font-display uppercase tracking-widest hover:bg-white/5 transition">
          Back
        </button>
        <button
          disabled={!selected || isLoading}
          onClick={onNext}
          className="flex-2 py-4 rounded-xl bg-white text-black text-xs font-display uppercase tracking-widest hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 size={13} className="animate-spin" />}
          Continue to Payment
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Payment
// Per docs: list payment providers, let customer select, then call
// sdk.store.payment.initiatePaymentSession(cart, { provider_id })
// Re-fetch cart after to get updated payment_collection
// ---------------------------------------------------------------------------

function PaymentStep({
  paymentProviders,
  selectedProvider,
  onSelectProvider,
  onNext,
  onBack,
  isLoading,
}: {
  paymentProviders: HttpTypes.StorePaymentProvider[]
  selectedProvider: string | null
  onSelectProvider: (id: string) => void
  onNext: () => void
  onBack: () => void
  isLoading: boolean
}) {
  // For each known provider, show a friendly label
  const getProviderLabel = (id: string) => {
    if (id.startsWith("pp_system_default")) return "Cash on Delivery"
    if (id.startsWith("pp_stripe_")) return "Credit / Debit Card (Stripe)"
    return id
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {paymentProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelectProvider(provider.id)}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border transition ${
              selectedProvider === provider.id
                ? "border-white bg-white/10"
                : "border-white/10 bg-white/0.03 hover:border-white/30"
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${selectedProvider === provider.id ? "border-white" : "border-white/30"}`}>
              {selectedProvider === provider.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-display uppercase tracking-wide">
                {getProviderLabel(provider.id)}
              </p>
              {provider.id.startsWith("pp_system_default") && (
                <p className="text-white/40 text-xs font-body">Pay when your order arrives</p>
              )}
            </div>
          </button>
        ))}

        {paymentProviders.length === 0 && !isLoading && (
          <p className="text-white/30 text-sm font-body py-4 text-center">
            No payment methods available.
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-white/30 text-[11px] font-body mb-6">
        <Lock size={11} />
        <span>All transactions are secure and encrypted</span>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl border border-white/20 text-white text-xs font-display uppercase tracking-widest hover:bg-white/5 transition">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedProvider || isLoading}
          className="flex-2 py-4 rounded-xl bg-white text-black text-xs font-display uppercase tracking-widest hover:bg-white/90 disabled:opacity-40 transition flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 size={13} className="animate-spin" />}
          Review Order
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 — Review
// ---------------------------------------------------------------------------

function ReviewStep({
  address,
  shippingOption,
  paymentProviderLabel,
  currencyCode,
  onBack,
  onPlace,
  onChangeShipping,
  isPlacing,
}: {
  address: AddressForm
  shippingOption: StoreShippingOption | null
  paymentProviderLabel: string
  currencyCode: string
  onBack: () => void
  onPlace: () => void
  onChangeShipping: () => void
  isPlacing: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 space-y-1">
        <p className="text-[11px] uppercase tracking-widest text-white/40 font-body mb-2">Ship to</p>
        <p className="text-white text-sm font-body">{address.first_name} {address.last_name}</p>
        <p className="text-white/60 text-xs font-body">
          {address.address_1}{address.address_2 ? `, ${address.address_2}` : ""}, {address.city}, {address.province} {address.postal_code}
        </p>
        <p className="text-white/60 text-xs font-body">{address.email}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/40 font-body mb-1">Shipping</p>
          <p className="text-white text-sm font-body">
            {shippingOption ? shippingOption.name : "Included"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-white text-sm font-body">
            {shippingOption?.amount === 0 || !shippingOption ? "Free" : formatPrice(shippingOption.amount ?? 0, currencyCode)}
          </p>
          <button
            onClick={onChangeShipping}
            className="text-white/30 hover:text-white text-[11px] font-body uppercase tracking-wider transition"
          >
            Change
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex justify-between">
        <p className="text-[11px] uppercase tracking-widest text-white/40 font-body self-center">Payment</p>
        <p className="text-white text-sm font-body">{paymentProviderLabel}</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl border border-white/20 text-white text-xs font-display uppercase tracking-widest hover:bg-white/5 transition">
          Back
        </button>
        <button
          onClick={onPlace}
          disabled={isPlacing}
          className="flex-2 py-4 rounded-xl bg-white text-black text-xs font-display uppercase tracking-widest hover:bg-white/90 disabled:opacity-60 transition flex items-center justify-center gap-2"
        >
          {isPlacing && <Loader2 size={13} className="animate-spin" />}
          Place Order
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Order confirmed
// ---------------------------------------------------------------------------

function OrderConfirmed({ order, onContinue }: { order: HttpTypes.StoreOrder; onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6">
        <Check size={28} className="text-white" />
      </div>
      <p className="text-white/40 text-xs font-body uppercase tracking-widest mb-1">
        Order #{order.display_id}
      </p>
      <h2 className="text-3xl font-display uppercase tracking-widest text-white mb-2">Order Placed</h2>
      <p className="text-white/40 text-sm font-body max-w-sm mb-2">
        Thank you! You'll receive a confirmation email shortly.
      </p>
      <p className="text-white text-lg font-body mb-8">
        {convertToLocale({amount:order.total ?? 0, currency_code: order.currency_code})}
      </p>
      <button
        onClick={onContinue}
        className="px-8 py-3 rounded-xl bg-white text-black text-xs font-display uppercase tracking-widest hover:bg-white/90 transition"
      >
        Continue Shopping
      </button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Root page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const { cart, region, closeCart } = useCart()
  // Local cart override so promo updates reflect immediately in the summary
  const [localCart, setLocalCart] = useState<MedusaCart | null>(null)
  const activeCart = localCart ?? cart
  const { customer } = useAuth()
  const router = useRouter()

  console.log(cart)

  const [step, setStep] = useState<Step>("information")
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS)
  const [shippingOptions, setShippingOptions] = useState<StoreShippingOption[]>([])
  const [calculatedPrices, setCalculatedPrices] = useState<Record<string, number>>({})
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
  const [paymentProviders, setPaymentProviders] = useState<HttpTypes.StorePaymentProvider[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [stepLoading, setStepLoading] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill address from region/customer
  useEffect(() => {
    setAddress((prev) => ({
      ...prev,
      country_code: prev.country_code || region?.countries?.[0]?.iso_2 || "in",
      first_name: prev.first_name || customer?.first_name || "",
      last_name: prev.last_name || customer?.last_name || "",
      phone: prev.phone || customer?.phone || "",
      email: prev.email || customer?.email || "",
    }))
  }, [region, customer])

  useEffect(() => { closeCart() }, [closeCart])

  const setField = (field: keyof AddressForm, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }))

  // ── Step 1: Information ─────────────────────────────────────────────────
  // Per docs: update cart email + shipping_address + billing_address

  const handleInformationNext = useCallback(async () => {
    if (!activeCart) return
    setStepLoading(true)
    setError(null)
    try {
      const shippingAddress = {
        first_name: address.first_name,
        last_name: address.last_name,
        phone: address.phone,
        address_1: address.address_1,
        address_2: address.address_2,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code,
        country_code: address.country_code,
      }
      await updateCart(activeCart.id, {
        email: address.email,
        shipping_address: shippingAddress,
      })
      // Auto-apply first shipping option silently (shipping is included)
      const opts = await listShippingOptions(activeCart.id)
      setShippingOptions(opts)
      if (opts.length > 0) {
        const firstId = opts[0].id
        setSelectedShippingId(firstId)
        await addShippingMethod(activeCart.id, firstId)
      }
      setStep("payment")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save address")
    } finally {
      setStepLoading(false)
    }
  }, [activeCart, address])

  const handleShippingNext = useCallback(async () => {
    if (!activeCart || !selectedShippingId) return
    setStepLoading(true)
    setError(null)
    try {
      await addShippingMethod(activeCart.id, selectedShippingId)
      setStep("review")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add shipping method")
    } finally {
      setStepLoading(false)
    }
  }, [activeCart, selectedShippingId])

  const handlePaymentNext = useCallback(async () => {
    if (!activeCart) return
    setStepLoading(true)
    setError(null)
    try {
      await initiatePayment(activeCart, selectedProviderId ?? "pp_system_default")
      setStep("review")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to initialize payment")
    } finally {
      setStepLoading(false)
    }
  }, [activeCart, selectedProviderId])

  const handlePlaceOrder = useCallback(async () => {
    if (!activeCart) return
    setIsPlacing(true)
    setError(null)
    try {
      const result = await completeCart(activeCart.id)
      if (result.type === "order" && result.order) {
        localStorage.removeItem("36x_cart_id")
        setConfirmedOrder(result.order)
      } else {
        setError("Payment incomplete. Please try again.")
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to place order")
    } finally {
      setIsPlacing(false)
    }
  }, [activeCart])

  // ── Render ──────────────────────────────────────────────────────────────

  if (confirmedOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <OrderConfirmed order={confirmedOrder} onContinue={() => router.push("/")} />
      </div>
    )
  }

  if (!activeCart || activeCart?.items?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <ShoppingBag size={40} className="text-white/20" />
        <p className="text-white/40 font-body text-sm">Your cart is empty.</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-white text-black text-xs font-display uppercase tracking-widest hover:bg-white/90 transition">
          Shop Now
        </Link>
      </div>
    )
  }

  const selectedShippingOption = shippingOptions.find((o) => o.id === selectedShippingId) ?? null
  const selectedProviderLabel = (() => {
    if (!selectedProviderId) return "None"
    if (selectedProviderId.startsWith("pp_system_default")) return "Cash on Delivery"
    if (selectedProviderId.startsWith("pp_stripe_")) return "Credit / Debit Card"
    return selectedProviderId
  })()

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
        <div>
          <StepBreadcrumb current={step} />

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-body">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: [0.42, 0, 0.58, 1] }}
            >
              {step === "information" && (
                <InformationStep
                  address={address}
                  onChange={setField}
                  onNext={handleInformationNext}
                  isLoading={stepLoading}
                />
              )}
              {step === "shipping" && (
                <ShippingStep
                  options={shippingOptions}
                  calculatedPrices={calculatedPrices}
                  selected={selectedShippingId}
                  onSelect={setSelectedShippingId}
                  onNext={handleShippingNext}
                  onBack={() => setStep("review")}
                  isLoading={stepLoading}
                  currencyCode={cart?.currency_code ?? "inr"}
                />
              )}
              {step === "payment" && (
                <PaymentStep
                  paymentProviders={paymentProviders}
                  selectedProvider={selectedProviderId}
                  onSelectProvider={setSelectedProviderId}
                  onNext={handlePaymentNext}
                  onBack={() => setStep("information")}
                  isLoading={stepLoading}
                />
              )}
              {step === "review" && (
                <ReviewStep
                  address={address}
                  shippingOption={selectedShippingOption}
                  paymentProviderLabel={selectedProviderLabel}
                  currencyCode={cart?.currency_code ?? "inr"}
                  onBack={() => setStep("payment")}
                  onPlace={handlePlaceOrder}
                  onChangeShipping={() => setStep("shipping")}
                  isPlacing={isPlacing}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <OrderSummary cart={activeCart} onCartUpdate={setLocalCart} />
      </div>
    </div>
  )
}
