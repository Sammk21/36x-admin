// "use client";

// import { useRouter } from "next/navigation";
// import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useState } from "react";

// const initialAddresses = [
//   {
//     id: 1,
//     name: "John Doe",
//     phone: "+91 98765 43210",
//     address: `123, 1st Floor, 6th Street\nBangalore KA\nIndia 560102`,
//     lastUsed: false,
//   },
//   {
//     id: 2,
//     name: "John Doe",
//     phone: "+91 98765 43210",
//     address: `123, 1st Floor, 6th Street\nBangalore KA\nIndia 560102`,
//     lastUsed: true,
//   },
// ];

// export default function AddressPage() {
//   const router = useRouter();
//   const [addresses, setAddresses] = useState(initialAddresses);

//   const deleteAddress = (id: number) => {
//     setAddresses((prev) => prev.filter((a) => a.id !== id));
//   };

//   return (
//     <div className="min-h-screen bg-black text-white px-4 md:px-10 pb-10 pt-18">
      
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
        
//         <button
//           onClick={() => router.back()}
//           className="w-10 h-10 flex items-center justify-center border border-white/20 rounded-lg"
//         >
//           <ArrowLeft size={18} />
//         </button>

//         <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
//           Your Addresses
//         </h1>

//         <button className="flex items-center gap-2 border border-white/20 px-4 py-2 rounded-lg">
//           <Plus size={16} />
//           Add New Address
//         </button>
//       </div>

//       {/* GRID */}
//       <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
//         <AnimatePresence>
//           {addresses.map((addr, i) => (
//             <motion.div
//               key={addr.id}
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               className="bg-zinc-900 rounded-2xl p-6"
//             >
//               {/* TITLE */}
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="uppercase font-bold text-lg">
//                   Address #{i + 1}
//                 </h2>

//                 {addr.lastUsed && (
//                   <span className="text-xs text-white/50">
//                     (Last Used)
//                   </span>
//                 )}
//               </div>

//               {/* CONTENT */}
//               <div className="text-sm text-white/80 space-y-2">
//                 <p className="text-white font-medium">{addr.name}</p>
//                 <p>{addr.phone}</p>

//                 <div className="pt-2 whitespace-pre-line">
//                   {addr.address}
//                 </div>
//               </div>

//               {/* ACTIONS */}
//               <div className="flex gap-4 mt-6">
//                 <button className="flex-1 flex items-center justify-center gap-2 border border-white/20 py-2 rounded-lg hover:bg-white/10 transition">
//                   <Pencil size={16} />
//                   Edit
//                 </button>

//                 <button
//                   onClick={() => deleteAddress(addr.id)}
//                   className="flex-1 flex items-center justify-center gap-2 border border-white/20 py-2 rounded-lg hover:border-red-500 hover:text-red-500 transition"
//                 >
//                   <Trash2 size={16} />
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

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
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_ADDRESSES = [
  {
    id: 1,
    name: "John Doe",
    phone: "+91 98765 43210",
    line1: "123, 1st Floor, 6th Street",
    line2: "Bangalore KA",
    line3: "India 560102",
    lastUsed: false,
  },
  {
    id: 2,
    name: "John Doe",
    phone: "+91 98765 43210",
    line1: "123, 1st Floor, 6th Street",
    line2: "Bangalore KA",
    line3: "India 560102",
    lastUsed: true,
  },
];

const EMPTY_FORM = { name: "", phone: "", line1: "", line2: "", line3: "" };

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, placeholder, type = "text" }:any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold  text-zinc-500 uppercase">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-[#0e0f11] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
      />
    </div>
  );
}

// ─── Add / Edit Dialog ────────────────────────────────────────────────────────
function AddressDialog({ open, onOpenChange, initial, onSave, mode = "add" }:any) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  // sync when dialog opens with new initial data
  const handleOpenChange = (val:any) => {
    if (val) setForm(initial || EMPTY_FORM);
    onOpenChange(val);
  };

  const handleChange = (e:any) => setForm((f:any) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.line1.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 data-[state=open]:animate-[fadeIn_150ms_ease]" />

        {/* Content */}
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[92vw] max-w-[480px] bg-[#1a1c1f] border border-white/10 rounded-2xl
            p-6 shadow-2xl focus:outline-none
            data-[state=open]:animate-[dialogIn_180ms_ease]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="font-display text-3xl  leading-none">
              {mode === "edit" ? "Edit Address" : "Add New Address"}
            </Dialog.Title>
            <Dialog.Close className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/25 transition-all">
              <CloseIcon />
            </Dialog.Close>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" type="tel" />
            </div>
            <Field label="Address Line 1" name="line1" value={form.line1} onChange={handleChange} placeholder="123, 1st Floor, 6th Street" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City / State" name="line2" value={form.line2} onChange={handleChange} placeholder="Bangalore KA" />
              <Field label="Country & PIN" name="line3" value={form.line3} onChange={handleChange} placeholder="India 560102" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Dialog.Close className="flex-1 border border-white/10 rounded-lg py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/25 transition-all">
              Cancel
            </Dialog.Close>
            <button
              onClick={handleSave}
              className="flex-1 bg-white text-[#0e0f11] rounded-lg py-2.5 text-sm font-semibold hover:bg-zinc-100 transition-colors"
            >
              {mode === "edit" ? "Save Changes" : "Add Address"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteDialog({ open, onOpenChange, onConfirm }:any) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[92vw] max-w-[360px] bg-[#1a1c1f] border border-white/10 rounded-2xl
            p-6 shadow-2xl focus:outline-none"
        >
          <Dialog.Title className="font-display text-2xl  mb-2">Delete Address?</Dialog.Title>
          <Dialog.Description className="text-zinc-400 text-sm mb-6">
            This address will be permanently removed from your account.
          </Dialog.Description>
          <div className="flex gap-3">
            <Dialog.Close className="flex-1 border border-white/10 rounded-lg py-2.5 text-sm text-zinc-400 hover:text-white hover:border-white/25 transition-all">
              Cancel
            </Dialog.Close>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────────
function AddressCard({ address, index, onEdit, onDelete }:any) {
  return (
    <div>
      {/* Section heading */}
      <div className="flex items-baseline gap-4 mb-4">
        <h2 className="font-display text-3xl  leading-none">Address #{index + 1}</h2>
        {address.lastUsed && (
          <span className="font-display text-xl  text-zinc-500 leading-none">(Last Used)</span>
        )}
      </div>

      {/* Card */}
      <div className="bg-[#1a1c1f] border border-white/8 rounded-xl p-5 flex flex-col gap-0">
        {/* Contact */}
        <div className="pb-4">
          <p className="text-white font-semibold text-sm">{address.name}</p>
          <p className="text-zinc-400 text-sm mt-0.5">{address.phone}</p>
        </div>
        {/* Address */}
        <div className="border-t border-white/10 pt-4 pb-5">
          <p className="text-zinc-300 text-sm leading-relaxed">{address.line1}</p>
          <p className="text-zinc-300 text-sm">{address.line2}</p>
          <p className="text-zinc-300 text-sm">{address.line3}</p>
        </div>
        {/* Actions */}
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
export default function AddressesPage({ onBack }:any) {
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  let nextId = Math.max(...addresses.map((a) => a.id)) + 1;

  const handleAdd = (form:any) => {
    setAddresses((prev) => [...prev, { id: nextId++, ...form, lastUsed: false }]);
  };

  const handleEditSave = (form:any) => {
    // @ts-ignore
    setAddresses((prev) => prev.map((a) => (a.id === editTarget.id ? { ...a, ...form } : a)));
    setEditTarget(null);
  };

  const handleDelete = () => {
    setAddresses((prev) => prev.filter((a) => a.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <>
     

      <div className="font-body min-h-screen mt-16  text-white">
        {/* Header */}
        <header className="flex items-center justify-between px-6 lg:px-10 py-8">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 border border-white/12 rounded-xl text-zinc-300 hover:text-white hover:border-white/25 transition-all"
            aria-label="Go back"
          >
            <BackIcon />
          </button>

          <h1 className="font-display text-4xl lg:text-5xl  leading-none">Your Addresses</h1>

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
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="font-display text-3xl  text-zinc-600">No Addresses Yet</p>
              <p className="text-zinc-500 text-sm">Add an address to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {addresses.map((addr, i) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  index={i}
                  onEdit={(a:any) => setEditTarget(a)}
                  onDelete={(id:any) => setDeleteId(id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Dialog */}
      <AddressDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={EMPTY_FORM}
        onSave={handleAdd}
        mode="add"
      />

      {/* Edit Dialog */}
      <AddressDialog
        open={!!editTarget}
        onOpenChange={(v:any) => { if (!v) setEditTarget(null); }}
        initial={editTarget}
        onSave={handleEditSave}
        mode="edit"
      />

      {/* Delete Confirm */}
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(v:any) => { if (!v) setDeleteId(null); }}
        onConfirm={handleDelete}
      />
    </>
  );
}