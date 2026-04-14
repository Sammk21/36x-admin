import Navbar from "@/components/layout/navbar";
import FooterGraffiti from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist — 36X",
  description: "Artist collaborations at 36X",
};

export default function ArtistLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="antialiased bg-[#111111]">
      <Navbar />
      {children}
      <FooterGraffiti />
    </main>
  );
}
