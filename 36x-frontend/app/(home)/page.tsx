import ArtistCollaborations from "@/components/home/artistCollab";
import FeedStackSection from "@/components/home/feed";
import HomeHero from "@/components/home/hero";
import HomePageShell from "@/components/home/HomePageShell";
import CollectionSection from "@/components/home/collections";
import { Masonry } from "@/components/home/Masonry";
import { strapi, strapiImage } from "@/lib/strapi";

export default async function Home() {
  const [homePage, socialFeedPosts] = await Promise.all([
    strapi.pages.home(),
    strapi.socialFeed.find({ activeOnly: true }),
  ]);

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
    imageUrl: strapiImage(a.cover_image) ?? "",
    handle: a.handle,
  }));

  const feedSection = homePage.feedSection?.[0] ?? null;
  const feedTitle =
    feedSection?.sectionIntro?.[0]?.title ?? feedSection?.title ?? null;
  const feedDescription =
    feedSection?.sectionIntro?.[0]?.subtitle ?? feedSection?.description ?? null;
  const feedButton = feedSection?.button ?? null;

  const feedPosts = socialFeedPosts.map((post) => ({
    id: post.id,
    image: strapiImage(post.image) ?? "",
    label: post.title,
    sub: post.subtitle ?? "",
  }));

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
      <CollectionSection collections={collections} />
      <ArtistCollaborations collaborations={artistCollabs} />
      <Masonry
        title="Fragments of movement"
        description="Explore our latest collection of curated pieces."
        products={masonryProducts}
        className="my-0"
        columns={3}
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
