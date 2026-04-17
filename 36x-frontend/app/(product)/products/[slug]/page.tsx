import FeedStackSection from "@/components/home/feed";
import ProductDetail from "@/components/product/detail";
import ConceptSection from "@/components/product/detail/conceptSection";
import GoesWellWith from "@/components/product/detail/goes-well-with";
import ReviewsSentiment from "@/components/product/detail/reviewSentiment";
import { medusa } from "@/lib/medusa";
import { strapi, strapiImage } from "@/lib/strapi";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [strapiProduct, feedPosts] = await Promise.all([
    strapi.products.findByHandle(slug).catch(() => null),
    strapi.socialFeed.find({ activeOnly: true }).catch(() => []),
  ]);



  if (!strapiProduct) notFound();

  const [reviewStats, reviews] = await Promise.all([
    medusa.productReviews.listStats(strapiProduct.medusaId).catch(() => null),
    medusa.productReviews.list(strapiProduct.medusaId).catch(() => []),
  ]);

  // Gallery images from Strapi
  const galleryImages = (strapiProduct.gallery_images ?? []).map((gi) => ({
    id: gi.id,
    src: strapiImage(gi.image) ?? "",
    alt: gi.alt ?? gi.image?.name ?? "",
    aspect: gi.aspect ?? null,
  }));

  // Artist collaborations → concept section (top-level relation)
  const artists = (strapiProduct.artist_collaborations ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: a.subtitle,
    bio: a.bio,
    imageUrl: strapiImage(a.coverImage) ?? null,
    handle: a.handle,
  }));

  // Goes Well With pairings
  const pairings = (strapiProduct.productDuo ?? []).map((m) => ({
    id: m.id,
    productOne: m.productOne
      ? {
          id: m.productOne.id,
          title: m.productOne.title,
          handle: m.productOne.handle,
          thumbnailUrl: strapiImage(m.productOne.thumbnail) ?? null,
        }
      : null,
    productTwo: m.productTwo
      ? {
          id: m.productTwo.id,
          title: m.productTwo.title,
          handle: m.productTwo.handle,
          thumbnailUrl: strapiImage(m.productTwo.thumbnail) ?? null,
        }
      : null,
    resultImageUrl: strapiImage(m.Result) ?? null,
  }));

  // Derive variants, options and currency from Strapi synced data
  const strapiVariants = strapiProduct.variants ?? [];
  const strapiOptions = strapiProduct.options ?? [];
  const currencyCode =
    strapiVariants[0]?.prices?.[0]?.currency_code ?? "inr";

  return (
    <div className="bg-[#111111]">
      <ProductDetail
        title={strapiProduct.title}
        description={strapiProduct.description}
        strapiVariants={strapiVariants}
        strapiOptions={strapiOptions}
        currencyCode={currencyCode}
        galleryImages={galleryImages}
        galleryVideoUrl={strapiImage(strapiProduct.gallery_video) ?? null}
      />
      <ConceptSection artists={artists} />
      <GoesWellWith pairings={pairings} />
      <FeedStackSection posts={feedPosts} />
      <ReviewsSentiment
        productId={strapiProduct.medusaId}
        stats={reviewStats}
        reviews={reviews}
      />
    </div>
  );
}
