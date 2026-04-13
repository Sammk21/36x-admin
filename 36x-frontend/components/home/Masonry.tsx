"use client";

import Image from "next/image";
import { BlurFade } from "@/components/ui/blur-fade";
import SectionIntro from "../shared/SectionIntro";
import Link from "next/link";

export interface MasonryProduct {
  id: number | string;
  title: string;
  handle: string;
  thumbnailUrl: string | null;
  price?: string | null;
  collectionLabel?: string | null;
}

interface MasonryProps {
  title: React.ReactNode;
  description: React.ReactNode;
  products: MasonryProduct[];
  className?: string;
  columns?: number;
}

function ProductCard({ product }: { product: MasonryProduct }) {
  return (
    <Link href={`/products/${product.handle}`}>
      <div className="group relative w-full overflow-hidden rounded-2xl bg-[#1a1a1a] cursor-pointer">
        {/* Image */}
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800" />
          )}

          {/* Bottom gradient — always visible, intensifies on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300" />

          {/* Info overlay — slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            {product.collectionLabel && (
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 font-medium">
                {product.collectionLabel}
              </p>
            )}
            <p className="text-white font-display text-sm uppercase tracking-wide leading-tight">
              {product.title}
            </p>
            {product.price && (
              <p className="text-neutral-300 text-xs mt-1 font-body">
                {product.price}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function Masonry({
  columns = 3,
  title,
  description,
  products,
  className = "",
}: MasonryProps) {
  return (
    <section className={`w-full text-white py-16 md:py-24 ${className}`}>
      <div className="max-w-300 mx-auto">
        <div className="text-center mb-16 px-2 space-y-4">
          <SectionIntro
            descriptionClassName="text-neutral-200"
            title={title}
            className="text-6xl"
            description={description}
          />
        </div>
        <div className={`columns-2 md:columns-${columns} gap-6 px-4 space-y-6`}>
          {products.map((product, idx) => (
            <BlurFade key={product.id} delay={0.1 + idx * 0.05} inView>
              <ProductCard product={product} />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
