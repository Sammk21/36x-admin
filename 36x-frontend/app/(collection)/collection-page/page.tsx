import PageShell from "@/components/listings/PageShell";
import Hero from "@/components/listings/ListingHero";
import { Masonry } from "@/components/home/Masonry";
import { strapi, strapiImage } from "@/lib/strapi";

export default async function CollectionPage() {
  const page = await strapi.pages.collectionsListing({ revalidate: 3600 });
  const col = page.collection?.product_collection ?? null;
  const heroBottom = strapiImage(page.Hero?.bannerImage?.[0]) ?? undefined;
  const heroTop = page.Hero?.overlayImage ?? undefined;
  const bgTileImage = strapiImage(page.pageShell?.bgTileImage) ?? undefined;
  const sectionTitle =
    page.collection?.sectionIntro?.[0]?.title ?? col?.title ?? "Collection";
  const sectionSubtitle =
    page.collection?.sectionIntro?.[0]?.subtitle ?? col?.subtitle ?? "";
  const masonryProducts = (col?.products ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnailUrl: strapiImage(p.thumbnail),
    collectionLabel: col?.title ?? undefined,
  }));

  return (
    <>
      <Hero bottomImage={heroBottom} topImage={heroTop} />
      <PageShell bgTileImage={bgTileImage}>
        <Masonry
          columns={3}
          title={sectionTitle}
          description={sectionSubtitle}
          products={masonryProducts}
          className="my-0"
        />
      </PageShell>
    </>
  );
}
