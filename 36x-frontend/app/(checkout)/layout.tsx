import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Checkout — 36X",
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0e0f11] text-white">
      {/* Minimal header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo/36x-logo.svg"
            alt="36X"
            width={56}
            height={10}
            className="h-auto"
          />
        </Link>
        <p className="text-white/30 text-xs font-display uppercase tracking-widest">
          Secure Checkout
        </p>
      </header>
      {children}
    </div>
  )
}
