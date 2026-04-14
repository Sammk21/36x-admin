import Hero from "@/components/listings/ListingHero";
import PageShell from "@/components/listings/PageShell";
import ProductGrid from "@/components/listings/collection/collectonSection";
import { strapi, strapiImage } from "@/lib/strapi";

export default async function CollectionsListingPage() {
  const page = await strapi.pages.collectionsListing({ revalidate: 3600 });

  // shared.listing-hero: bannerImage[] (media) + overlayImage (string)
  const bannerImageUrl =
    strapiImage(page.Hero?.bannerImage?.[0]) ?? "/images/img9.png";
  const overlayImageUrl =
    page.Hero?.overlayImage ?? "/images/collection-fore.png";

  return (
    <>
      <Hero bottomImage={bannerImageUrl} topImage={overlayImageUrl} />
      <PageShell>
        <ProductGrid />
      </PageShell>
    </>
  );
}
