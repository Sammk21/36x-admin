import { notFound } from "next/navigation";
import Hero from "@/components/listings/ListingHero";
import PageShell from "@/components/listings/PageShell";
import CollectionProducts from "@/components/listings/collection/CollectionProducts";
import { strapi, strapiImage } from "@/lib/strapi";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params;

  const collection = await strapi.collections.findCollectionByHandle(id);
  if (!collection) notFound();

  const bannerImageUrl = strapiImage(collection.banner) ?? "/images/img9.png";

  return (
    <>
      <Hero bottomImage={bannerImageUrl} topImage="/images/collection-fore.png" />
      <PageShell>
        <CollectionProducts collection={collection} />
      </PageShell>
    </>
  );
}
