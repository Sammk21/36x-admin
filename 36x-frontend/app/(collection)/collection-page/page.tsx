import PageShell from "@/components/listings/PageShell";
import Hero from "@/components/listings/ListingHero";
import Section from "@/components/listings/collection/collectonSection";
import ProductGrid from "@/components/listings/collection/collectonSection";
import { Masonry } from "@/components/home/Masonry";

const images = Array.from({ length: 9 }, (_, i) => {
  const isLandscape = i % 2 === 0;
  const width = isLandscape ? 800 : 600;
  const height = isLandscape ? 600 : 800;
  return `https://picsum.photos/seed/${i + 1}/${width}/${height}`;
});

export default function CollectionPage() {
  return (
    <>
      <Hero />
      <PageShell>
        <Masonry columns={2} description="Explore our latest collection of curated pieces." images={images} title="Coldplay" className="my-0" />
      </PageShell>
    </>
  );
}
