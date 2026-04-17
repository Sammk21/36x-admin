"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import SectionIntro from "../shared/SectionIntro";
import { ProductCard, ProductCardData } from "@/components/shared/ProductCard";
import { getMasonryAspectClass } from "@/lib/masonryAspect";

export type { ProductCardData as MasonryProduct };

// Tailwind requires full class strings — not dynamic concatenation.
const COLUMNS_CLASS: Record<number, string> = {
  1: "columns-1",
  2: "columns-2",
  3: "columns-2 md:columns-3",
  4: "columns-2 md:columns-3 lg:columns-4",
};

interface MasonryProps {
  title: React.ReactNode;
  description: React.ReactNode;
  products: ProductCardData[];
  /** Number of masonry columns. Default: 3 */
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function Masonry({
  title,
  description,
  products,
  columns = 3,
  className = "",
}: MasonryProps) {
  const columnsClass = COLUMNS_CLASS[columns] ?? COLUMNS_CLASS[3];

  return (
    <section className={`w-full text-white py-16 md:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 px-2 space-y-4">
          <SectionIntro
            descriptionClassName="text-neutral-200"
            title={title}
            className="text-6xl"
            description={description}
          />
        </div>
        <div className={`${columnsClass} gap-4 px-4`}>
          {products.map((product, idx) => (
            <div key={product.id} className="break-inside-avoid mb-4">
              <BlurFade delay={0.05 + idx * 0.04} inView>
                <ProductCard
                  product={product}
                  aspectClass={getMasonryAspectClass(idx, columns)}
                />
              </BlurFade>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
