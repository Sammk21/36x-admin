"use client";

import Image from "next/image";
import Link from "next/link";

export interface ProductCardData {
  id: number | string;
  title: string;
  handle: string;
  thumbnailUrl: string | null;
  price?: string | null;
  collectionLabel?: string | null;
}

// Named presets for convenience
type AspectPreset = "tall" | "medium" | "landscape" | "square";

const ASPECT_PRESET_CLASS: Record<AspectPreset, string> = {
  tall:      "aspect-[3/5]",
  medium:    "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square:    "aspect-square",
};

export const MASONRY_ASPECT_PATTERN: AspectPreset[] = [
  "tall", "medium", "landscape", "medium", "tall", "landscape",
];

interface ProductCardProps {
  product: ProductCardData;
  /** Named preset — used by Masonry/home components */
  aspect?: AspectPreset;
  /** Raw Tailwind aspect class e.g. "aspect-[4/5]" — takes precedence over aspect preset */
  aspectClass?: string;
  masonry?: boolean;
}

export function ProductCard({
  product,
  aspect = "medium",
  aspectClass,
  masonry = false,
}: ProductCardProps) {
  const resolvedAspect = aspectClass ?? ASPECT_PRESET_CLASS[aspect];

  return (
    <Link href={`/products/${product.handle}`}>
      <div
        className={`group relative w-full overflow-hidden rounded-2xl bg-[#111] cursor-pointer${masonry ? " mb-4 break-inside-avoid" : ""}`}
      >
        <div className={`relative w-full overflow-hidden ${resolvedAspect}`}>
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800" />
          )}

          {/* Gradient overlay — slides up from bottom on hover */}
          <div
            className="
              absolute bottom-0 left-0 right-0
              h-[28%] 
              bg-gradient-to-t from-black/90 via-black/50 to-transparent
              translate-y-full group-hover:translate-y-0
              transition-transform duration-300 ease-out
              flex flex-col justify-end px-4 pb-4
            "
          >
            {product.collectionLabel && (
              <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5 font-medium">
                {product.collectionLabel}
              </p>
            )}
            <p className="text-white font-display text-lg uppercase tracking-wide leading-tight">
              {product.title}
            </p>
            {product.price && (
              <p className="text-neutral-300 text-xs mt-0.5 font-body">
                {product.price}
              </p>
            )}
          </div>
        </div>

        {/* Mobile info — below image */}
        <div className="md:hidden px-1 pt-2 pb-1">
          {product.collectionLabel && (
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-0.5 font-medium">
              {product.collectionLabel}
            </p>
          )}
          <p className="text-white font-display text-sm uppercase tracking-wide leading-tight">
            {product.title}
          </p>
          {product.price && (
            <p className="text-neutral-400 text-xs mt-0.5 font-body">
              {product.price}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
