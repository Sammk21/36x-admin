import ArtistCollaborations from "@/components/home/artistCollab";
import InstagramFeedStackSection from "@/components/home/feed";
import HomeHero from "@/components/home/hero";
import HomePageShell from "@/components/home/HomePageShell";
import CollectionSection from "@/components/home/collections";
import { Masonry } from "@/components/home/Masonry";
import { strapi, strapiImage } from "@/lib/strapi";

const fallbackImages = Array.from({ length: 9 }, (_, i) => {
  const isLandscape = i % 2 === 0;
  const width = isLandscape ? 800 : 600;
  const height = isLandscape ? 600 : 800;
  return `https://picsum.photos/seed/${i + 1}/${width}/${height}`;
});

export default async function Home() {
  const homePage = await strapi.pages.home();

  // Resolve Strapi media to absolute URLs, fall back to local assets
  const topImageUrl =
    strapiImage(homePage.PageShell?.topImage) ?? "/images/top-off.png";
  const topImageOverlayUrl =
    strapiImage(homePage.PageShell?.topImageOverlay) ?? "/images/top-on.jpg";
  const bgTileImageUrl =
    strapiImage(homePage.PageShell?.bgTileImage) ?? "/images/bottom.jpg";


    console.log(homePage, "homePage")
  return (
    <div>

    </div>
    // <HomePageShell
    //   topImage={topImageUrl}
    //   topImageOverlay={topImageOverlayUrl}
    //   bgTileImage={bgTileImageUrl}
    // >
    //   <HomeHero />
    //   <CollectionSection />
    //   <ArtistCollaborations />
    //   <Masonry
    //     title="Fragments of movement"
    //     description="Explore our latest collection of curated pieces."
    //     images={fallbackImages}
    //     className="my-0"
    //   />
    //   <InstagramFeedStackSection />
    // </HomePageShell>
  );
}
