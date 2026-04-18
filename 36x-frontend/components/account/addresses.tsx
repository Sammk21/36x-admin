"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import {
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  type MedusaAddress,
} from "@/lib/auth";

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Form types ───────────────────────────────────────────────────────────────

interface AddressForm {
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  address_2: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
}

const EMPTY_FORM: AddressForm = {
  first_name: "",
  last_name: "",
  phone: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "in",
};

function addressToForm(a: MedusaAddress): AddressForm {
  return {
    first_name: a.first_name ?? "",
    last_name: a.last_name ?? "",
    phone: a.phone ?? "",
    address_1: a.address_1 ?? "",
    address_2: a.address_2 ?? "",
    city: a.city ?? "",
    province: a.province ?? "",
    postal_code: a.postal_code ?? "",
    country_code: a.country_code ?? "in",
  };
}

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

// ─── Address Modal (Add / Edit) ───────────────────────────────────────────────

function AddressModal({ open, onClose, initial, onSave, mode = "add", saving }: {
  open: boolean;
  onClose: () => void;
  initial: AddressForm;
  onSave: (form: AddressForm) => Promise<void>;
  mode?: "add" | "edit";
  saving: boolean;
}) {
  const [form, setForm] = useState<AddressForm>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const canSubmit = form.first_name.trim() && form.address_1.trim();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="addr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="addr-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg bg-[#0e0f11] rounded-2xl border border-white/10 shadow-2xl pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto"
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
                  <p className="text-3xl font-display uppercase text-white">
                    {mode === "edit" ? "Edit Address" : "Add New Address"}
                  </p>
                  <p className="text-white/30 text-sm font-body mt-1">
                    {mode === "edit" ? "Update your saved address" : "Add a new delivery address"}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First Name *" name="first_name" value={form.first_name} onChange={handleChange} placeholder="John" />
                    <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Doe" />
                  </div>
                  <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" type="tel" />
                  <Field label="Address Line 1 *" name="address_1" value={form.address_1} onChange={handleChange} placeholder="123, 1st Floor, 6th Street" />
                  <Field label="Address Line 2" name="address_2" value={form.address_2} onChange={handleChange} placeholder="Apt, suite, unit (optional)" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="Bangalore" />
                    <Field label="State / Province" name="province" value={form.province} onChange={handleChange} placeholder="Karnataka" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Postal Code" name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="560001" />
                    <Field label="Country Code" name="country_code" value={form.country_code} onChange={handleChange} placeholder="in" />
                  </div>
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
                    disabled={saving || !canSubmit}
                    className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-display uppercase tracking-widest hover:bg-white/90 disabled:opacity-40 transition flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    {mode === "edit" ? "Save Changes" : "Add Address"}
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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ open, onClose, onConfirm, deleting }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="del-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="del-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm bg-[#0e0f11] rounded-2xl border border-white/10 shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition z-10"
              >
                <X size={18} />
              </button>

              <div className="px-8 py-8">
                <p className="text-3xl font-display uppercase text-white mb-2">Delete Address?</p>
                <p className="text-white/40 text-sm font-body mb-6">
                  This address will be permanently removed from your account.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-sm font-body hover:text-white hover:border-white/25 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-display uppercase tracking-widest hover:bg-red-500 disabled:opacity-60 transition flex items-center justify-center gap-2"
                  >
                    {deleting && <Loader2 size={13} className="animate-spin" />}
                    Delete
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

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({ address, index, onEdit, onDelete }: {
  address: MedusaAddress;
  index: number;
  onEdit: (a: MedusaAddress) => void;
  onDelete: (id: string) => void;
}) {
  const fullName = [address.first_name, address.last_name].filter(Boolean).join(" ");
  const cityLine = [address.city, address.province].filter(Boolean).join(", ");
  const countryLine = [address.postal_code, address.country_code?.toUpperCase()].filter(Boolean).join(" — ");

  return (
    <div>
      <div className="flex items-baseline gap-4 mb-4">
        <h2 className="font-display text-3xl leading-none">Address #{index + 1}</h2>
        {address.is_default_shipping && (
          <span className="font-display text-xl text-zinc-500 leading-none">(Default)</span>
        )}
      </div>

      <div className="bg-black border border-white/8 rounded-xl p-5 flex flex-col gap-0">
        <div className="pb-4">
          {fullName && <p className="text-white font-semibold text-sm">{fullName}</p>}
          {address.phone && <p className="text-zinc-400 text-sm mt-0.5">{address.phone}</p>}
        </div>
        <div className="border-t border-white/10 pt-4 pb-5">
          {address.address_1 && <p className="text-zinc-300 text-sm leading-relaxed">{address.address_1}</p>}
          {address.address_2 && <p className="text-zinc-300 text-sm">{address.address_2}</p>}
          {cityLine && <p className="text-zinc-300 text-sm">{cityLine}</p>}
          {countryLine && <p className="text-zinc-300 text-sm">{countryLine}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onEdit(address)}
            className="flex items-center justify-center gap-2 bg-[#2a2d32] hover:bg-[#31353b] border border-white/8 rounded-lg py-2.5 text-sm text-white transition-colors"
          >
            <EditIcon />
            Edit
          </button>
          <button
            onClick={() => onDelete(address.id)}
            className="flex items-center justify-center gap-2 bg-[#2a2d32] hover:bg-[#31353b] border border-white/8 rounded-lg py-2.5 text-sm text-red-400 transition-colors"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const { token, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<MedusaAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MedusaAddress | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadAddresses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listAddresses(token);
      setAddresses(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAdd = async (form: AddressForm) => {
    if (!token) return;
    setSaving(true);
    try {
      await addAddress(token, {
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        phone: form.phone || null,
        address_1: form.address_1 || null,
        address_2: form.address_2 || null,
        city: form.city || null,
        province: form.province || null,
        postal_code: form.postal_code || null,
        country_code: form.country_code || null,
      });
      await loadAddresses();
      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (form: AddressForm) => {
    if (!token || !editTarget) return;
    setSaving(true);
    try {
      await updateAddress(token, editTarget.id, {
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        phone: form.phone || null,
        address_1: form.address_1 || null,
        address_2: form.address_2 || null,
        city: form.city || null,
        province: form.province || null,
        postal_code: form.postal_code || null,
        country_code: form.country_code || null,
      });
      await loadAddresses();
      setEditTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteId) return;
    setDeleting(true);
    try {
      await deleteAddress(token, deleteId);
      await loadAddresses();
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
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
    <>
      <div className="font-body min-h-screen mt-16 text-white">
        {/* Header */}
        <header className="flex items-center justify-between px-6 lg:px-10 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 border border-white/12 rounded-xl text-zinc-300 hover:text-white hover:border-white/25 transition-all"
            aria-label="Go back"
          >
            <BackIcon />
          </button>

          <h1 className="font-display text-4xl lg:text-5xl leading-none">Your Addresses</h1>

          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-zinc-200 hover:border-white/30 hover:text-white transition-all"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Add New Address</span>
            <span className="sm:hidden">Add</span>
          </button>
        </header>

        {/* Address Grid */}
        <main className="px-6 lg:px-10 pb-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-white/40 text-sm font-body">Loading addresses…</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="font-display text-3xl text-zinc-600">No Addresses Yet</p>
              <p className="text-zinc-500 text-sm">Add an address to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {addresses.map((addr, i) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  index={i}
                  onEdit={(a) => setEditTarget(a)}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Modal */}
      <AddressModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        initial={EMPTY_FORM}
        onSave={handleAdd}
        mode="add"
        saving={saving}
      />

      {/* Edit Modal */}
      <AddressModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        initial={editTarget ? addressToForm(editTarget) : EMPTY_FORM}
        onSave={handleEditSave}
        mode="edit"
        saving={saving}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </>
  );
}
