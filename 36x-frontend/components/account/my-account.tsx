// "use client";

// import Image from "next/image";
// import { LogOut, MapPinned } from "lucide-react";
// import Link from "next/link";

// const orders = [
//   {
//     id: "#1024",
//     name: "Concrete Verses Hoodie",
//     qty: 1,
//     date: "12 Feb 2026",
//     status: "Fulfilled",
//     total: "₹ 1,999",
//     image: "/images/product.png",
//   },
//   {
//     id: "#1025",
//     name: "Black Tee",
//     qty: 2,
//     date: "10 Feb 2026",
//     status: "Out For Delivery",
//     total: "₹ 2,499",
//     image: "/images/product.png",
//   },
// ];

// export default function AccountPage() {
//   return (
//     <div className="min-h-screen bg-black text-white px-4 md:px-10 pb-10 pt-18">
      
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
//           My Account
//         </h1>

//         <button className="flex items-center gap-2 border border-white/20 px-4 py-2 rounded-lg hover:border-red-500 hover:text-red-500 transition">
//           <LogOut size={16} />
//           Sign Out
//         </button>
//       </div>

//       {/* GRID */}
//       <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* ORDER HISTORY */}
//         <div className="lg:col-span-2 bg-zinc-900 rounded-2xl p-6">
//           <h2 className="text-xl font-bold uppercase mb-6">
//             Order History
//           </h2>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="text-white/60 border-b border-white/10">
//                 <tr>
//                   <th className="text-left py-3">Order</th>
//                   <th className="text-left py-3">Product</th>
//                   <th>Qty</th>
//                   <th>Date</th>
//                   <th>Status</th>
//                   <th>Total</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {orders.map((order, i) => (
//                   <tr
//                     key={i}
//                     className="border-b border-white/5 hover:bg-white/5 transition"
//                   >
//                     <td className="py-4">{order.id}</td>

//                     <td className="flex items-center gap-3 py-4">
//                       <div className="relative w-12 h-16 rounded-md overflow-hidden">
//                         <Image
//                           src={order.image}
//                           alt=""
//                           fill
//                           className="object-cover"
//                         />
//                       </div>
//                       {order.name}
//                     </td>

//                     <td className="text-center">{order.qty}</td>
//                     <td className="text-center">{order.date}</td>

//                     <td className="text-center">
//                       <span
//                         className={
//                           order.status === "Fulfilled"
//                             ? "text-green-400"
//                             : "text-yellow-400"
//                         }
//                       >
//                         {order.status}
//                       </span>
//                     </td>

//                     <td className="text-center">{order.total}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* ACCOUNT DETAILS */}
//         <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col justify-between">
//           <div>
//             <h2 className="text-xl font-bold uppercase mb-6">
//               Account Details
//             </h2>

//             <div className="space-y-2 text-white/80 text-sm">
//               <p className="font-medium text-white">John Doe</p>
//               <p>+91 98765 43210</p>
//               <p className="pt-2">
//                 123, 1st Floor, 6th Street <br />
//                 Bangalore KA <br />
//                 India 560102
//               </p>
//             </div>
//           </div>

//           <Link href="/account/addresses">
//             <button className="mt-6 w-full flex items-center justify-center gap-2 border border-white/20 px-4 py-3 rounded-lg hover:bg-white/10 transition">
//               <MapPinned size={16} />
//               View Addresses
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }   

"use client";
import { useState } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const USER = {
  name: "John Doe",
  phone: "+91 98765 43210",
  address: {
    line1: "123, 1st Floor, 6th Street",
    line2: "Bangalore KA",
    line3: "India 560102",
  },
};

const ORDERS = [
  {
    id: "924",
    product: "Moonphase - Coldplay",
    variant: "Hood Monarchy Hood Mon...",
    qty: 2,
    date: "02/02/26",
    status: "Out For Delivery",
    total: "Rs. 1,998",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop",
    rating: null,
  },
  {
    id: "363",
    product: "Concrete Verses",
    variant: null,
    qty: 1,
    date: "19/01/26",
    status: "Fulfilled",
    total: "Rs. 1,099",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop",
    rating: "happy",
  },
];

// ─── Rating Icons ─────────────────────────────────────────────────────────────
const FACE_ICONS = [
  {
    key: "angry",
    label: "Angry",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15s1.5-2 4-2 4 2 4 2" strokeLinecap="round" />
        <path d="M9 9l2 1M15 9l-2 1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "sad",
    label: "Sad",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 16s1.5-2 4-2 4 2 4 2" strokeLinecap="round" transform="rotate(180 12 15)" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "neutral",
    label: "Neutral",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "good",
    label: "Good",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 13s1.5 2.5 4 2.5 4-2.5 4-2.5" strokeLinecap="round" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "happy",
    label: "Happy",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12s1.5 3.5 4 3.5 4-3.5 4-3.5" strokeLinecap="round" />
        <circle cx="9" cy="9.5" r="1" fill="currentColor" />
        <circle cx="15" cy="9.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

const HappyFaceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12s1.5 3.5 4 3.5 4-3.5 4-3.5" strokeLinecap="round" />
    <circle cx="9" cy="9.5" r="1" fill="#22c55e" />
    <circle cx="15" cy="9.5" r="1" fill="#22c55e" />
  </svg>
);

// ─── Sign Out Icon ────────────────────────────────────────────────────────────
const SignOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-4 h-4">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
    <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
    <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
  </svg>
);

const ContactsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

// ─── Rating Row ───────────────────────────────────────────────────────────────
function RatingRow({ order }:any) {
  const [selected, setSelected] = useState(null);
  if (order.rating === "happy") {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
        <span className="text-[11px] font-bold  text-green-400 uppercase">Happy Purchase</span>
        <HappyFaceIcon />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
      <span className="text-[10px] font-bold  text-zinc-400 uppercase">Rate Your Purchase</span>
      <div className="flex gap-1.5">
        {FACE_ICONS.map((face) => (
          <button
            key={face.key}
            aria-label={face.label}
            onClick={() => setSelected(face.key as any)}
            className={`transition-colors ${selected === face.key ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            {face.svg}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Account Details Card ─────────────────────────────────────────────────────
function AccountDetailsCard() {
  return (
    <div className="bg-[#1a1c1f] rounded-xl border border-white/8 p-5 flex flex-col gap-0">
      <div className="pb-4">
        <p className="text-white font-semibold text-sm leading-snug">{USER.name}</p>
        <p className="text-zinc-400 text-sm mt-0.5">{USER.phone}</p>
      </div>
      <div className="border-t border-white/10 pt-4 pb-4">
        <p className="text-zinc-300 text-sm leading-relaxed">{USER.address.line1}</p>
        <p className="text-zinc-300 text-sm">{USER.address.line2}</p>
        <p className="text-zinc-300 text-sm">{USER.address.line3}</p>
      </div>
      <button className="w-full mt-1 flex items-center justify-center gap-2 border border-white/15 rounded-lg py-3 text-sm text-zinc-200 hover:border-white/30 hover:text-white transition-all">
        <ContactsIcon />
        <span>View Addresses</span>
      </button>
    </div>
  );
}

// ─── Desktop Table ────────────────────────────────────────────────────────────
function DesktopOrderTable() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/8">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#1a1c1f]">
            {["Order #", "Product Name", "Qty", "Date", "Status", "Total"].map((h) => (
              <th
                key={h}
                className="px-5 py-4 text-left text-xs font-semibold  text-zinc-400 uppercase border-b border-white/8 first:rounded-tl-xl last:rounded-tr-xl"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((order, i) => (
            <tr
              key={order.id}
              className={`bg-[#1a1c1f] border-b border-white/6 last:border-0 hover:bg-[#1f2124] transition-colors`}
            >
              <td className="px-5 py-4 text-zinc-300 font-mono text-xs">{order.id}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={order.img}
                      alt={order.product}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white text-sm font-medium line-clamp-2 max-w-[180px]">{order.product}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-zinc-300">{order.qty}</td>
              <td className="px-5 py-4 text-zinc-300 font-mono text-xs">{order.date}</td>
              <td className="px-5 py-4">
                <span
                  className={`text-sm font-medium ${
                    order.status === "Fulfilled" ? "text-zinc-400" : "text-white"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-5 py-4 text-white font-semibold text-sm">{order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mobile Order Card ────────────────────────────────────────────────────────
function MobileOrderCard({ order }:any) {
  return (
    <div className="bg-[#1a1c1f] rounded-xl border border-white/8 overflow-hidden">
      {/* Top: order # + date */}
      <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-3 border-b border-white/8">
        <div>
          <p className="text-[10px] font-bold  text-zinc-500 uppercase mb-0.5">Order #</p>
          <p className="text-white font-mono text-sm font-semibold">{order.id}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold  text-zinc-500 uppercase mb-0.5">Date</p>
          <p className="text-white font-mono text-sm">{order.date}</p>
        </div>
      </div>

      {/* Product inner card */}
      <div className="mx-3 my-3 bg-[#0e0f11] rounded-lg border border-white/6 p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
          <img src={order.img} alt={order.product} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{order.variant || order.product}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[9px] font-bold  text-zinc-500 uppercase">QTY</p>
          <p className="text-white font-semibold text-sm">{order.qty}</p>
        </div>
      </div>

      {/* Status + Total */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-4">
        <div>
          <p className="text-[10px] font-bold  text-zinc-500 uppercase mb-0.5">Status</p>
          <p className={`text-sm font-medium ${order.status === "Fulfilled" ? "text-zinc-400" : "text-white"}`}>
            {order.status}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold  text-zinc-500 uppercase mb-0.5">Total</p>
          <p className="text-white font-semibold text-sm">{order.total}</p>
        </div>
      </div>

      {/* Rating / confirmation */}
      <RatingRow order={order} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccountPage() {
  return (
    <>
   

      <div className="font-body min-h-screen pt-16 text-white">

        {/* ── Desktop Header ─────────────────────────────────── */}
        <header className="hidden lg:flex items-center justify-between px-10 pt-10 pb-2">
          <h1 className="font-display text-6xl  leading-none">My Account</h1>
          <button className="flex items-center gap-2 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-zinc-200 hover:border-white/30 hover:text-white transition-all">
            <SignOutIcon />
            <span>Sign Out</span>
          </button>
        </header>

        {/* ── Mobile Header ──────────────────────────────────── */}
        <div className="lg:hidden flex items-center justify-between px-5 pt-7 pb-2">
          <h1 className="font-display text-5xl  leading-none">My Account</h1>
          <button
            aria-label="Sign Out"
            className="flex items-center justify-center w-11 h-11 border border-white/15 rounded-lg hover:border-white/30 transition-all"
          >
            <SignOutIcon />
          </button>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <main className="px-5 lg:px-10 py-8 lg:py-10">

          {/* Desktop: side-by-side; Mobile: stacked with details first */}
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] lg:gap-10 gap-10">

            {/* ── Left: Order History ──────────────────────────── */}
            <section className="order-2 lg:order-1">
              <h2 className="font-display text-3xl  mb-5">Order History</h2>

              {/* Desktop Table */}
              <div className="hidden lg:block">
                <DesktopOrderTable />
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden flex flex-col gap-4">
                {ORDERS.map((order) => (
                  <MobileOrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>

            {/* ── Right: Account Details ───────────────────────── */}
            <section className="order-1 lg:order-2">
              <h2 className="font-display text-3xl  mb-5">Account Details</h2>
              <AccountDetailsCard />
            </section>

          </div>
        </main>
      </div>
    </>
  );
}