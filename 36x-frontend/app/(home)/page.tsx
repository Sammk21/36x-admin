import ArtistCollaborations from "@/components/home/artistCollab";
import FeedStackSection from "@/components/home/feed";
import HomeHero from "@/components/home/hero";
import HomePageShell from "@/components/home/HomePageShell";
import CollectionSection from "@/components/home/collections";
import  { Masonry }  from "@/components/home/Masonry"; "@/components/home/Masonry";

const items = [
  {
    id: "1",
    img: "https://picsum.photos/id/1015/600/900?grayscale",
    url: "https://example.com/one",
    height: 400,
  },
  {
    id: "2",
    img: "https://picsum.photos/id/1011/600/750?grayscale",
    url: "https://example.com/two",
    height: 250,
  },
  {
    id: "3",
    img: "https://picsum.photos/id/1020/600/800?grayscale",
    url: "https://example.com/three",
    height: 600,
  },
  // ... more items
];

const images = Array.from({ length: 9 }, (_, i) => {
  const isLandscape = i % 2 === 0;
  const width = isLandscape ? 800 : 600;
  const height = isLandscape ? 600 : 800;
  return `https://picsum.photos/seed/${i + 1}/${width}/${height}`;
});




export default async function Home(props: {
  params: Promise<{ countryCode: string }>;
}) {
  const params = await props.params;



  return (
    <>
      <HomePageShell
   
      >
        <HomeHero />
        <CollectionSection />
        <ArtistCollaborations />
        <Masonry
          title="Fragments of movement"
          description="Explore our latest collection of curated pieces."
          images={images}
          className="my-0"
        />
        {/* <Masonry
          items={items}
          ease="power3.out"
          duration={0.6}
          stagger={0.05}
          animateFrom="bottom"
          scaleOnHover
          hoverScale={0.95}
          blurToFocus
          colorShiftOnHover={false}
        /> */}
        <FeedStackSection />
      </HomePageShell>
    </>
  );
}
