import { getStrapiMedia } from "@/lib/strapi";
import { StrapiProductCollection } from "@/lib/types";
import Link from "next/link";

interface CollectionGridProps {
  collections: StrapiProductCollection[];
}

export default function CollectionGrid({ collections }: CollectionGridProps) {
  if (!collections.length) {
    return (
      <section className="relative z-20 px-6 md:px-20 py-20">
        <p className="text-white/40 text-center">No collections found.</p>
      </section>
    );
  }

  return (
    <section className="relative z-20 px-6 md:px-20 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.map((col) => {
          const imageUrl =
            getStrapiMedia(col.banner?.url ?? col.thumbnail?.url) ??
            "/images/product.jpg";

          return (
            <Link
              key={col.documentId}
              href={`/collections/${col.handle}`}
              className="group rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm relative aspect-[4/3] block"
            >
              <img
                src={imageUrl}
                alt={col.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 flex flex-col gap-1">
                {col.chapter_label && (
                  <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/60">
                    {col.chapter_label}
                  </span>
                )}
                <h3 className="text-white font-display text-xl leading-tight">
                  {col.title}
                </h3>
                {col.products?.length > 0 && (
                  <span className="text-white/40 text-xs mt-1">
                    {col.products.length} piece{col.products.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
