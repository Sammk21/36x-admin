import { getStrapiMedia } from "@/lib/strapi";
import { StrapiProductCollection } from "@/lib/types";
import { BlurFade } from "@/components/ui/blur-fade";
import { ProductCard } from "@/components/shared/ProductCard";
import { getMasonryAspectClass } from "@/lib/masonryAspect";

interface CollectionProductsProps {
  collection: StrapiProductCollection;
  columns?: 1 | 2 | 3 | 4;
}

const COLUMNS_CLASS: Record<number, string> = {
  1: "columns-1",
  2: "columns-2",
  3: "columns-2 md:columns-3",
  4: "columns-2 md:columns-3 lg:columns-4",
};

export default function CollectionProducts({
  collection,
  columns = 3,
}: CollectionProductsProps) {
  const products = collection.products ?? [];
  const columnsClass = COLUMNS_CLASS[columns] ?? COLUMNS_CLASS[2];

  return (
    <section className="relative z-20 px-4 md:px-12 py-16">
      <div className="mb-10 flex flex-col gap-2 text-center">
        {collection.chapter_label && (
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/50">
            {collection.chapter_label}
          </span>
        )}
        <h1 className="text-white font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-tight">
          {collection.title}
        </h1>
        {collection.subtitle && (
          <p className="text-white font-body text-xl sm:text-2xl lg:text-3xl font-semibold mt-1">
            {collection.subtitle}
          </p>
        )}
        {collection.artist_credit && (
          <p className="text-white/40 font-body text-sm italic">
            {collection.artist_credit}
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-white/40 text-center py-20">
          No products in this collection yet.
        </p>
      ) : (
        <div className={`${columnsClass} gap-3 md:gap-4`}>
          {products.map((product, idx) => (
            <div key={product.documentId} className="break-inside-avoid mb-3 md:mb-4">
              <BlurFade delay={0.04 + idx * 0.03} inView>
                <ProductCard
                  product={{
                    id: product.documentId,
                    title: product.title,
                    handle: product.handle,
                    thumbnailUrl: getStrapiMedia(product.thumbnail?.url),
                  }}
                  aspectClass={getMasonryAspectClass(idx, columns)}
                />
              </BlurFade>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
