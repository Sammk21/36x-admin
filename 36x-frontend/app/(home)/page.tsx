import ArtistCollaborations from "@/components/home/artistCollab";
import FeedStackSection from "@/components/home/feed";
import HomeHero from "@/components/home/hero";
import HomePageShell from "@/components/home/HomePageShell";
import CollectionSection from "@/components/home/collections";
import { Masonry } from "@/components/home/Masonry";
import { strapi, strapiImage } from "@/lib/strapi";

export default async function Home() {
  const homePage = await strapi.pages.home();

  console.log("Home page data:", homePage); // Debug log to check the structure of the fetched data

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

  const collections = (homePage.collection?.product_collections ?? []).map((col) => ({
    id: col.documentId,
    title: col.title,
    tag: col.chapter_label ?? "Collection",
    image: strapiImage(col.banner ?? col.thumbnail) ?? "",
    handle: col.handle,
  }));

  const artistCollabs = (homePage.artistCollab?.artist_collaborations ?? []).map((a) => ({
    title: a.title,
    subtitle: a.subtitle,
    imageUrl: strapiImage(a.coverImage) ?? "",
    handle: a.handle ?? a.documentId,
  }));

  const feedSection = homePage.feedSection ?? null;
  const feedTitle = feedSection?.sectionIntro?.title ?? null
  const feedDescription = feedSection?.sectionIntro?.subtitle ?? null
  const feedButton = feedSection?.button?.[0] ?? null
  const feedPosts = feedSection?.posts ?? [];

  return (
    <HomePageShell
      topImage={topImageUrl}
      topImageOverlay={topImageOverlayUrl}
      bgTileImage={bgTileImageUrl}
    >
      <HomeHero
        title={homePage.HomeHero?.title}
        subtitle={homePage.HomeHero?.subtitle}
        buttons={homePage.HomeHero?.buttons}
      />
      <CollectionSection
        collections={collections}
        title={homePage.collection?.sectionIntro?.title}
        subtitle={homePage.collection?.sectionIntro?.subtitle}
      />
      <ArtistCollaborations
        collaborations={artistCollabs}
        title={homePage.artistCollab?.sectionIntro?.[0]?.title}
        subtitle={homePage.artistCollab?.sectionIntro?.[0]?.subtitle}
      />
      <Masonry
        title="Fragments of movement"
        description="Explore our latest collection of curated pieces."
        products={masonryProducts}
        className="my-0"

      />
      <FeedStackSection
        title={feedTitle}
        description={feedDescription}
        buttonText={feedButton?.text}
        buttonHref={feedButton?.href}
        posts={feedPosts}
      />
    </HomePageShell>
  );
}
