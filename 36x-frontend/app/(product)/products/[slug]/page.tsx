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

  // Strapi (content) and Medusa (variants/prices) fire in parallel
  const [strapiProduct, medusaProduct, feedPosts] = await Promise.all([
    strapi.products.findByHandle(slug).catch(() => null),
    medusa.products.retrieve(slug).catch(() => null),
    strapi.socialFeed.find({ activeOnly: true }).catch(() => []),
  ]);

  if (!strapiProduct) notFound();

  // Reviews keyed by Medusa product ID — run after we have medusaId from Strapi
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

  // Artist collaborations → concept section
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

console.log(artists)

  return (
    <div className="bg-[#111111]">
      {/* Variants/options/prices from Medusa; all content from Strapi */}
      <ProductDetail
        title={strapiProduct.title}
        description={strapiProduct.description}
        variants={medusaProduct?.variants ?? undefined}
        options={medusaProduct?.options ?? undefined}
        currencyCode={
          (medusaProduct?.variants?.[0]?.calculated_price as { currency_code?: string } | undefined)
            ?.currency_code ?? "inr"
        }
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
