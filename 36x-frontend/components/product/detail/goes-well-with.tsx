"use client";

import React from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
  src: string;
  alt: string;
}

interface PairingRow {
  id: number;
  itemA: ProductImage;
  itemB: ProductImage;
  result: ProductImage;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// Replace src values with your actual product image paths / URLs

const PAIRINGS: PairingRow[] = [
  {
    id: 1,
    itemA: {
      src: "/images/img1.png",
      alt: "Bulls Varsity Jacket – Red",
    },
    itemB: {
      src: "/images/img2.png",
      alt: "Bulls Leather Bomber – Black",
    },
    result: { src: "/images/img3.png", alt: "Full look 1" },
  },
  {
    id: 2,
    itemA: {
      src: "/images/img1.png",
      alt: "Bulls Varsity Jacket – Red",
    },
    itemB: {
      src: "/images/img2.png",
      alt: "Bulls Leather Bomber – Black",
    },
    result: { src: "/images/img3.png", alt: "Full look 2" },
  },
  {
    id: 3,
    itemA: {
      src: "/images/img1.png",
      alt: "Bulls Varsity Jacket – Red",
    },
    itemB: {
      src: "/images/img2.png",
      alt: "Bulls Leather Bomber – Black",
    },
    result: { src: "/images/img3.png", alt: "Full look 3" },
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ProductCardProps {
  image: ProductImage;
}

const ProductCard: React.FC<ProductCardProps> = ({ image }) => (
  <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-800">
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes="(max-width: 640px) 70vw, (max-width: 1024px) 28vw, 20vw"
      className="object-cover object-top transition-transform duration-500 ease-out hover:scale-105"
      draggable={false}
    />
  </div>
);

const PlusSymbol: React.FC = () => (
  <div className="flex items-center justify-center flex-shrink-0 px-1 sm:px-2">
    <span className="text-neutral-600 font-black text-2xl sm:text-3xl lg:text-5xl leading-none select-none">
      +
    </span>
  </div>
);

const EqualsSymbol: React.FC = () => (
  <div className="flex items-center justify-center flex-shrink-0 px-1 sm:px-2">
    <span className="text-neutral-600 font-black text-2xl sm:text-3xl lg:text-5xl leading-none select-none">
      =
    </span>
  </div>
);

interface PairingRowProps {
  row: PairingRow;
}

const PairingRowComponent: React.FC<PairingRowProps> = ({ row }) => (
  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 sm:gap-3 lg:gap-5">
    <ProductCard image={row.itemA} />
    <PlusSymbol />
    <ProductCard image={row.itemB} />
    <EqualsSymbol />
    <ProductCard image={row.result} />
  </div>
);

// ─── Main Export ──────────────────────────────────────────────────────────────

const GoesWellWith: React.FC = () => {
  return (
    <section className="w-full bg-black px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      {/* Heading */}
      <h2 className="mb-6 font-display uppercase tracking-tight text-white text-3xl sm:text-5xl lg:text-6xl sm:mb-8 lg:mb-10">
        Goes Well With
      </h2>

      {/* Pairing rows stacked vertically */}
      <div className="flex flex-col gap-3 sm:gap-5 lg:gap-7">
        {PAIRINGS.map((row) => (
          <PairingRowComponent key={row.id} row={row} />
        ))}
      </div>
    </section>
  );
};

export default GoesWellWith;
