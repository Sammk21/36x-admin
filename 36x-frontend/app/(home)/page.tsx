import ArtistCollaborations from "@/components/home/artistCollab";
import InstagramFeedStackSection from "@/components/home/feed";
import HomeHero from "@/components/home/hero";
import HomePageShell from "@/components/home/HomePageShell";
import CollectionSection from "@/components/home/collections";
import { Masonry } from "@/components/home/Masonry";
import { strapi, strapiImage } from "@/lib/strapi";

export default async function Home() {
  const homePage = await strapi.pages.home();

  const topImageUrl =
    strapiImage(homePage.PageShell?.topImage) ?? "/images/top-off.png";
  const topImageOverlayUrl =
    strapiImage(homePage.PageShell?.topImageOverlay) ?? "/images/top-on.jpg";
  const bgTileImageUrl =
    strapiImage(homePage.PageShell?.bgTileImage) ?? "/images/bottom.jpg";

  const masonryProducts = (homePage.masonry_products?.products ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnailUrl: strapiImage(p.thumbnail),
  }));

  return (
    <HomePageShell
      topImage={topImageUrl}
      topImageOverlay={topImageOverlayUrl}
      bgTileImage={bgTileImageUrl}
    >
      <HomeHero />
      <CollectionSection />
      <ArtistCollaborations />
      <Masonry
        title="Fragments of movement"
        description="Explore our latest collection of curated pieces."
        products={masonryProducts}
        className="my-0"
        columns={3}
      />
      <InstagramFeedStackSection />
    </HomePageShell>
  );
}
