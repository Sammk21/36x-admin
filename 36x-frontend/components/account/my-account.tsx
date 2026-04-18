"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { listOrders, updateCustomer, type MedusaOrder } from "@/lib/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOrderTotal(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function fulfillmentLabel(status: string): string {
  const map: Record<string, string> = {
    not_fulfilled: "Pending",
    partially_fulfilled: "Partial",
    fulfilled: "Fulfilled",
    shipped: "Shipped",
    partially_shipped: "Part Shipped",
    returned: "Returned",
    partially_returned: "Part Returned",
    canceled: "Cancelled",
  };
  return map[status] ?? status;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const SignOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-4 h-4">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
  </svg>
);

const ContactsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, name, value, onChange, placeholder, type = "text" }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-widest text-white/40 font-body">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-white/20 focus:outline-none focus:border-white/30 transition"
      />
    </div>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

interface EditProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
}

function EditProfileModal({ open, onClose, initial, onSave, saving }: {
  open: boolean;
  onClose: () => void;
  initial: EditProfileForm;
  onSave: (form: EditProfileForm) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<EditProfileForm>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="profile-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md bg-black rounded-2xl border border-white/10 shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition z-10"
              >
                <X size={18} />
              </button>

              <div className="px-8 py-8">
                <div className="mb-6">
                  <p className="text-3xl font-display uppercase text-white">Edit Profile</p>
                  <p className="text-white/30 text-sm font-body mt-1">Update your account details</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} placeholder="John" />
                    <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Doe" />
                  </div>
                  <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" type="tel" />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-sm font-body hover:text-white hover:border-white/25 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onSave(form)}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-display uppercase tracking-widest hover:bg-white/90 disabled:opacity-40 transition flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Account Details Card ─────────────────────────────────────────────────────

function AccountDetailsCard() {
  const { customer, token, refresh } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fullName = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "—";
  const initial: EditProfileForm = {
    first_name: customer?.first_name ?? "",
    last_name: customer?.last_name ?? "",
    phone: customer?.phone ?? "",
  };

  const handleSave = useCallback(async (form: EditProfileForm) => {
    if (!token) return;
    setSaving(true);
    try {
      await updateCustomer(token, {
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        phone: form.phone || undefined,
      });
      await refresh();
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  }, [token, refresh]);

  return (
    <>
      <div className="bg-black rounded-xl border border-white/8 p-5 flex flex-col gap-0">
        <div className="pb-4">
          <p className="text-white font-semibold text-sm leading-snug">{fullName}</p>
          <p className="text-zinc-400 text-sm mt-0.5">{customer?.email ?? "—"}</p>
          {customer?.phone && (
            <p className="text-zinc-400 text-sm mt-0.5">{customer.phone}</p>
          )}
        </div>
        <div className="border-t border-white/10 pt-4 pb-4 flex flex-col gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="w-full flex items-center justify-center gap-2 border border-white/15 rounded-lg py-3 text-sm text-zinc-200 hover:border-white/30 hover:text-white transition-all"
          >
            <EditIcon />
            <span>Edit Profile</span>
          </button>
          <Link
            href="/my-addresses"
            className="w-full flex items-center justify-center gap-2 border border-white/15 rounded-lg py-3 text-sm text-zinc-200 hover:border-white/30 hover:text-white transition-all"
          >
            <ContactsIcon />
            <span>View Addresses</span>
          </Link>
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={initial}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}

// ─── Desktop Order Table ──────────────────────────────────────────────────────

function DesktopOrderTable({ orders }: { orders: MedusaOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 px-8 py-16 text-center">
        <p className="font-display text-3xl text-zinc-600">No Orders Yet</p>
        <p className="text-zinc-500 text-sm mt-2">Your past orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/8">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#1a1c1f]">
            {["Order #", "Product", "Qty", "Date", "Status", "Total"].map((h) => (
              <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-zinc-400 uppercase border-b border-white/8">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const firstItem = order.items?.[0];
            const statusLabel = fulfillmentLabel(order.fulfillment_status);
            const isFulfilled = order.fulfillment_status === "fulfilled" || order.fulfillment_status === "shipped";

            return (
              <tr key={order.id} className="bg-[#1a1c1f] border-b border-white/6 last:border-0 hover:bg-[#1f2124] transition-colors">
                <td className="px-5 py-4 text-zinc-300 font-mono text-xs">{order.display_id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {firstItem?.thumbnail && (
                      <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-zinc-800">
                        <img src={firstItem.thumbnail} alt={firstItem.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-white text-sm font-medium line-clamp-2 max-w-45">
                      {firstItem?.title ?? "—"}
                      {order.items?.length > 1 && (
                        <span className="text-zinc-500 text-xs ml-1">+{order.items.length - 1} more</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-300">
                  {order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0}
                </td>
                <td className="px-5 py-4 text-zinc-300 font-mono text-xs">{formatOrderDate(order.created_at)}</td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-medium ${isFulfilled ? "text-zinc-400" : "text-white"}`}>
                    {statusLabel}
                  </span>
                </td>
                <td className="px-5 py-4 text-white font-semibold text-sm">
                  {formatOrderTotal(order.total, order.currency_code)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mobile Order Card ────────────────────────────────────────────────────────

function MobileOrderCard({ order }: { order: MedusaOrder }) {
  const firstItem = order.items?.[0];
  const statusLabel = fulfillmentLabel(order.fulfillment_status);
  const isFulfilled = order.fulfillment_status === "fulfilled" || order.fulfillment_status === "shipped";
  const totalQty = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <div className="bg-[#1a1c1f] rounded-xl border border-white/8 overflow-hidden">
      <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-3 border-b border-white/8">
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Order #</p>
          <p className="text-white font-mono text-sm font-semibold">{order.display_id}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Date</p>
          <p className="text-white font-mono text-sm">{formatOrderDate(order.created_at)}</p>
        </div>
      </div>

      <div className="mx-3 my-3 bg-[#0e0f11] rounded-lg border border-white/6 p-3 flex items-center gap-3">
        {firstItem?.thumbnail ? (
          <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-zinc-800">
            <img src={firstItem.thumbnail} alt={firstItem.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-md shrink-0 bg-zinc-800" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{firstItem?.title ?? "—"}</p>
          {order.items?.length > 1 && (
            <p className="text-zinc-500 text-xs mt-0.5">+{order.items.length - 1} more item{order.items.length > 2 ? "s" : ""}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-bold text-zinc-500 uppercase">QTY</p>
          <p className="text-white font-semibold text-sm">{totalQty}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 pb-4">
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Status</p>
          <p className={`text-sm font-medium ${isFulfilled ? "text-zinc-400" : "text-white"}`}>{statusLabel}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Total</p>
          <p className="text-white font-semibold text-sm">{formatOrderTotal(order.total, order.currency_code)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { token, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<MedusaOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const data = await listOrders(token);
        setOrders(data);
      } catch {
        // silently fail — show empty state
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center">
        <p className="text-white/40 text-sm font-body">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="font-body min-h-screen pt-16 text-white">
      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between px-10 pt-10 pb-2">
        <h1 className="font-display text-6xl leading-none">My Account</h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-zinc-200 hover:border-red-500/50 hover:text-red-400 transition-all"
        >
          <SignOutIcon />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-5 pt-7 pb-2">
        <h1 className="font-display text-5xl leading-none">My Account</h1>
        <button
          onClick={handleSignOut}
          aria-label="Sign Out"
          className="flex items-center justify-center w-11 h-11 border border-white/15 rounded-lg hover:border-red-500/50 transition-all"
        >
          <SignOutIcon />
        </button>
      </div>

      {/* Content */}
      <main className="px-5 lg:px-10 py-8 lg:py-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] lg:gap-10 gap-10">

          {/* Left: Order History */}
          <section className="order-2 lg:order-1">
            <h2 className="font-display text-3xl mb-5">Order History</h2>

            {ordersLoading ? (
              <div className="rounded-xl border border-white/8 px-8 py-16 text-center">
                <p className="text-white/40 text-sm font-body">Loading orders…</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <DesktopOrderTable orders={orders} />
                </div>
                <div className="lg:hidden flex flex-col gap-4">
                  {orders.length === 0 ? (
                    <div className="rounded-xl border border-white/8 px-8 py-16 text-center">
                      <p className="font-display text-3xl text-zinc-600">No Orders Yet</p>
                      <p className="text-zinc-500 text-sm mt-2">Your past orders will appear here.</p>
                    </div>
                  ) : (
                    orders.map((order) => <MobileOrderCard key={order.id} order={order} />)
                  )}
                </div>
              </>
            )}
          </section>

          {/* Right: Account Details */}
          <section className="order-1 lg:order-2">
            <h2 className="font-display text-3xl mb-5">Account Details</h2>
            <AccountDetailsCard />
          </section>

        </div>
      </main>
    </div>
  );
}
