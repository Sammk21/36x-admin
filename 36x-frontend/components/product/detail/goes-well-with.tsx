"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductRef {
  id: number;
  title: string;
  handle: string;
  thumbnailUrl: string | null;
}

interface PairingRow {
  id: number;
  productOne: ProductRef | null;
  productTwo: ProductRef | null;
  resultImageUrl: string | null;
}

interface GoesWellWithProps {
  pairings?: PairingRow[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProductCard: React.FC<{ product: ProductRef }> = ({ product }) => (
  <Link href={`/products/${product.handle}`} className="block group">
    <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-800">
      {product.thumbnailUrl ? (
        <Image
          src={product.thumbnailUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 28vw, 20vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      <p className="absolute bottom-2 left-2 right-2 text-[10px] font-medium uppercase tracking-widest text-white/80 truncate">
        {product.title}
      </p>
    </div>
  </Link>
);

const ResultCard: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-800">
    <Image
      src={imageUrl}
      alt="Result look"
      fill
      sizes="(max-width: 640px) 70vw, (max-width: 1024px) 28vw, 20vw"
      className="object-cover object-top"
      draggable={false}
    />
  </div>
);

const PlusSymbol: React.FC = () => (
  <div className="flex items-center justify-center flex-shrink-0 px-1 sm:px-2">
    <span className="text-neutral-600 font-black text-2xl sm:text-3xl lg:text-5xl leading-none select-none">+</span>
  </div>
);

const EqualsSymbol: React.FC = () => (
  <div className="flex items-center justify-center flex-shrink-0 px-1 sm:px-2">
    <span className="text-neutral-600 font-black text-2xl sm:text-3xl lg:text-5xl leading-none select-none">=</span>
  </div>
);

// ─── Main Export ──────────────────────────────────────────────────────────────

const GoesWellWith: React.FC<GoesWellWithProps> = ({ pairings = [] }) => {
  const validPairings = pairings.filter(
    (p) => p.productOne && p.productTwo && p.resultImageUrl
  );

  if (validPairings.length === 0) return null;

  return (
    <section className="w-full bg-black px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
      <h2 className="mb-6 font-display uppercase tracking-tight text-white text-3xl sm:text-5xl lg:text-6xl sm:mb-8 lg:mb-10">
        Goes Well With
      </h2>

      <div className="flex flex-col gap-3 sm:gap-5 lg:gap-7">
        {validPairings.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 sm:gap-3 lg:gap-5"
          >
            <ProductCard product={row.productOne!} />
            <PlusSymbol />
            <ProductCard product={row.productTwo!} />
            <EqualsSymbol />
            <ResultCard imageUrl={row.resultImageUrl!} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GoesWellWith;
