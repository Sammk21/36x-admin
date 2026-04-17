import Navbar from "@/components/layout/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account — 36X",
  description: "Manage your profile, orders, and addresses",
};

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="antialiased bg-[#0e0f11]">
      <Navbar />
      {children}
    </main>
  );
}
