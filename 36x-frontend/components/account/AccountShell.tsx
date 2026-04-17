"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/store/auth"
import {
  listOrders,
  listAddresses,
  addAddress,
  deleteAddress,
  requestOrderTransfer,
  updateCustomer,
  type MedusaOrder,
  type MedusaAddress,
} from "@/lib/auth"
import * as Dialog from "@radix-ui/react-dialog"
import { formatPrice } from "@/lib/cart"

// ─── Icons ────────────────────────────────────────────────────────────────────

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
  </svg>
)
const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
)
const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)
const SignOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" className="w-5 h-5">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" />
    <polyline points="16 17 21 12 16 7" strokeLinecap="round" />
    <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
  </svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
  </svg>
)
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" />
  </svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" />
  </svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
)
// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "profile" | "orders" | "addresses" | "logout"

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "profile", label: "Profile", icon: <UserIcon /> },
  { key: "orders", label: "Orders", icon: <BagIcon /> },
  { key: "addresses", label: "Addresses", icon: <MapIcon /> },
  { key: "logout", label: "Logout", icon: <SignOutIcon /> },
]

function Sidebar({
  active,
  onChange,
}: {
  active: Section
  onChange: (s: Section) => void
}) {
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <nav className="flex lg:flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left
              ${
                active === key
                  ? "bg-white/10 text-white"
                  : key === "logout"
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            {icon}
            <span className="hidden lg:inline">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const { customer, token, refresh } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    first_name: customer?.first_name ?? "",
    last_name: customer?.last_name ?? "",
    phone: customer?.phone ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm({
      first_name: customer?.first_name ?? "",
      last_name: customer?.last_name ?? "",
      phone: customer?.phone ?? "",
    })
  }, [customer])

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      await updateCustomer(token, form)
      await refresh()
      setEditing(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl">Profile</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 border border-white/15 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:text-white hover:border-white/30 transition"
          >
            <EditIcon />
            Edit
          </button>
        )}
      </div>

      <div className="bg-[#1a1c1f] border border-white/8 rounded-xl p-5 flex flex-col gap-4">
        {editing ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="First Name"
                value={form.first_name}
                onChange={(v) => setForm((f) => ({ ...f, first_name: v }))}
              />
              <FormField
                label="Last Name"
                value={form.last_name}
                onChange={(v) => setForm((f) => ({ ...f, last_name: v }))}
              />
            </div>
            <FormField
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              type="tel"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 border border-white/10 rounded-lg py-2.5 text-sm text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-white text-[#0e0f11] rounded-lg py-2.5 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-40 transition"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Name</p>
              <p className="text-white text-sm">
                {[customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Email</p>
              <p className="text-white text-sm">{customer?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Phone</p>
              <p className="text-white text-sm">{customer?.phone ?? "—"}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Orders Section ───────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === "completed" || status === "fulfilled") return "text-green-400"
  if (status === "cancelled") return "text-red-400"
  if (status === "pending") return "text-yellow-400"
  return "text-zinc-300"
}

function GuestTransferBanner({
  orderId,
  token,
  onDone,
}: {
  orderId: string
  token: string
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequest = async () => {
    setLoading(true)
    setError(null)
    try {
      await requestOrderTransfer(token, orderId)
      setDone(true)
      onDone()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transfer request failed")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="mt-3 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-xs text-green-400">
        Transfer request sent — check your email to confirm.
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-amber-400">Guest order detected</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          This order was placed without an account. Claim it to link it to your profile.
        </p>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
      <button
        onClick={handleRequest}
        disabled={loading}
        className="shrink-0 bg-amber-500 text-black text-xs font-semibold rounded-lg px-3 py-2 hover:bg-amber-400 disabled:opacity-50 transition"
      >
        {loading ? "…" : "Claim Order"}
      </button>
    </div>
  )
}

function OrderCard({
  order,
  token,
  customerEmail,
}: {
  order: MedusaOrder
  token: string
  customerEmail: string
}) {
  const [claimSent, setClaimSent] = useState(false)
  const isGuestOrder =
    !claimSent &&
    (order as any).customer_id === null &&
    (order as any).email === customerEmail

  const firstItem = order.items[0]

  return (
    <div className="bg-[#1a1c1f] border border-white/8 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Order</p>
            <p className="text-white font-mono text-sm font-semibold">#{order.display_id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Date</p>
            <p className="text-white font-mono text-xs">
              {new Date(order.created_at).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Total</p>
            <p className="text-white text-sm font-semibold">
              {formatPrice(order.total, order.currency_code)}
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold capitalize ${statusColor(order.fulfillment_status)}`}>
          {order.fulfillment_status?.replace(/_/g, " ") ?? order.status}
        </span>
      </div>

      {/* Items */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-12 h-12 rounded-md object-cover bg-zinc-800 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-md bg-zinc-800 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{item.title}</p>
              <p className="text-zinc-500 text-xs">Qty: {item.quantity}</p>
            </div>
            <p className="text-zinc-300 text-sm shrink-0">
              {formatPrice(item.total, order.currency_code)}
            </p>
          </div>
        ))}
      </div>

      {/* Guest order claim banner */}
      {isGuestOrder && (
        <div className="px-5 pb-4">
          <GuestTransferBanner
            orderId={order.id}
            token={token}
            onDone={() => setClaimSent(true)}
          />
        </div>
      )}
    </div>
  )
}

function OrdersSection() {
  const { token, customer } = useAuth()
  const [orders, setOrders] = useState<MedusaOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    listOrders(token)
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div>
      <h2 className="font-display text-3xl mb-6">Orders</h2>

      {loading && (
        <p className="text-zinc-500 text-sm">Loading orders…</p>
      )}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <BagIcon />
          <p className="text-zinc-500 text-sm">No orders yet</p>
        </div>
      )}
      {!loading && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              token={token!}
              customerEmail={customer?.email ?? ""}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Addresses Section ────────────────────────────────────────────────────────

const EMPTY_ADDR_FORM = {
  first_name: "",
  last_name: "",
  phone: "",
  address_1: "",
  address_2: "",
  city: "",
  country_code: "",
  province: "",
  postal_code: "",
}

function AddressDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (form: typeof EMPTY_ADDR_FORM) => Promise<void>
}) {
  const [form, setForm] = useState(EMPTY_ADDR_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof EMPTY_ADDR_FORM) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      setForm(EMPTY_ADDR_FORM)
      onOpenChange(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-[480px] bg-[#1a1c1f] border border-white/10 rounded-2xl p-6 shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="font-display text-2xl">Add Address</Dialog.Title>
            <Dialog.Close className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-zinc-400 hover:text-white transition">
              <CloseIcon />
            </Dialog.Close>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" value={form.first_name} onChange={set("first_name")} />
              <FormField label="Last Name" value={form.last_name} onChange={set("last_name")} />
            </div>
            <FormField label="Phone" value={form.phone} onChange={set("phone")} type="tel" />
            <FormField label="Address Line 1" value={form.address_1} onChange={set("address_1")} />
            <FormField label="Address Line 2" value={form.address_2} onChange={set("address_2")} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" value={form.city} onChange={set("city")} />
              <FormField label="Province / State" value={form.province} onChange={set("province")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Country Code" value={form.country_code} onChange={set("country_code")} placeholder="IN" />
              <FormField label="Postal Code" value={form.postal_code} onChange={set("postal_code")} />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>
          <div className="flex gap-3 mt-5">
            <Dialog.Close className="flex-1 border border-white/10 rounded-lg py-2.5 text-sm text-zinc-400 hover:text-white transition">
              Cancel
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-white text-[#0e0f11] rounded-lg py-2.5 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-40 transition"
            >
              {saving ? "Saving…" : "Add Address"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-[360px] bg-[#1a1c1f] border border-white/10 rounded-2xl p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-display text-2xl mb-2">Delete Address?</Dialog.Title>
          <Dialog.Description className="text-zinc-400 text-sm mb-6">
            This address will be permanently removed.
          </Dialog.Description>
          <div className="flex gap-3">
            <Dialog.Close className="flex-1 border border-white/10 rounded-lg py-2.5 text-sm text-zinc-400 hover:text-white transition">
              Cancel
            </Dialog.Close>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-red-500 transition"
            >
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function AddressCard({
  address,
  index,
  onDelete,
}: {
  address: MedusaAddress
  index: number
  onDelete: () => void
}) {
  const lines = [
    address.address_1,
    address.address_2,
    [address.city, address.province].filter(Boolean).join(", "),
    [address.country_code?.toUpperCase(), address.postal_code].filter(Boolean).join(" "),
  ].filter(Boolean)

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className="font-display text-2xl">Address #{index + 1}</h3>
        {address.is_default_shipping && (
          <span className="text-xs text-zinc-500">(Default)</span>
        )}
      </div>
      <div className="bg-[#1a1c1f] border border-white/8 rounded-xl p-5">
        <div className="pb-4">
          <p className="text-white font-semibold text-sm">
            {[address.first_name, address.last_name].filter(Boolean).join(" ") || "—"}
          </p>
          {address.phone && <p className="text-zinc-400 text-sm mt-0.5">{address.phone}</p>}
        </div>
        <div className="border-t border-white/10 pt-4 pb-5">
          {lines.map((l, i) => (
            <p key={i} className="text-zinc-300 text-sm leading-relaxed">{l}</p>
          ))}
        </div>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 w-full bg-[#2a2d32] hover:bg-[#31353b] border border-white/8 rounded-lg py-2.5 text-sm text-red-400 transition"
        >
          <TrashIcon />
          Delete
        </button>
      </div>
    </div>
  )
}

function AddressesSection() {
  const { token } = useAuth()
  const [addresses, setAddresses] = useState<MedusaAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchAddresses = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await listAddresses(token)
      setAddresses(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  const handleAdd = async (form: typeof EMPTY_ADDR_FORM) => {
    await addAddress(token!, form as any)
    await fetchAddresses()
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    await deleteAddress(token, deleteId)
    setDeleteId(null)
    await fetchAddresses()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl">Addresses</h2>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-zinc-200 hover:border-white/30 hover:text-white transition"
        >
          <PlusIcon />
          Add
        </button>
      </div>

      {loading && <p className="text-zinc-500 text-sm">Loading addresses…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {!loading && !error && addresses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <MapIcon />
          <p className="text-zinc-500 text-sm">No addresses yet</p>
        </div>
      )}
      {!loading && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((addr, i) => (
            <AddressCard
              key={addr.id}
              address={addr}
              index={i}
              onDelete={() => setDeleteId(addr.id)}
            />
          ))}
        </div>
      )}

      <AddressDialog open={addOpen} onOpenChange={setAddOpen} onSave={handleAdd} />
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null) }}
        onConfirm={handleDelete}
      />
    </div>
  )
}

// ─── Shared form field ─────────────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-zinc-500 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#0e0f11] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition"
      />
    </div>
  )
}

// ─── Main Shell ───────────────────────────────────────────────────────────────

export default function AccountShell() {
  const { customer, isLoading, isAuthenticated, logout } = useAuth()
  const [section, setSection] = useState<Section>("profile")

  const handleNav = (s: Section) => {
    if (s === "logout") {
      logout()
      return
    }
    setSection(s)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-zinc-500">
        <UserIcon />
        <p className="text-sm">Sign in to view your account</p>
      </div>
    )
  }

  return (
    <div className="font-body min-h-screen text-white pt-16">
      {/* Page header */}
      <header className="px-6 lg:px-10 pt-8 pb-6 border-b border-white/8">
        <p className="text-zinc-500 text-sm">Welcome back,</p>
        <h1 className="font-display text-4xl lg:text-5xl mt-0.5">
          {[customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || customer?.email}
        </h1>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-col lg:flex-row px-6 lg:px-10 py-8 gap-8 lg:gap-12">
        <Sidebar active={section} onChange={handleNav} />

        <div className="flex-1 min-w-0">
          {section === "profile" && <ProfileSection />}
          {section === "orders" && <OrdersSection />}
          {section === "addresses" && <AddressesSection />}
        </div>
      </div>
    </div>
  )
}
