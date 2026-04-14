import Hero from "@/components/listings/ListingHero";
import PageShell from "@/components/listings/PageShell";
import CollectionGrid from "@/components/listings/collection/collectonSection";
import { strapi, strapiImage } from "@/lib/strapi";

export default async function CollectionsListingPage() {
  const [page, collections] = await Promise.all([
    strapi.pages.collectionsListing({ revalidate: 3600 }),
    strapi.collections.find(),
  ]);

  const bannerImageUrl =
    strapiImage(page.Hero?.bannerImage?.[0]) ?? "/images/img9.png";
  const overlayImageUrl =
    page.Hero?.overlayImage ?? "/images/collection-fore.png";

  return (
    <>
      <Hero bottomImage={bannerImageUrl} topImage={overlayImageUrl} />
      <PageShell>
        <CollectionGrid collections={collections} />
      </PageShell>
    </>
  );
}
