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

  console.log("Fetching product with slug:", slug);

  let product;
  try {
    product = await medusa.products.retrieve(slug);
    console.log(product ? "Product found:" : "Product not found for slug:", product);
  } catch {
    notFound();
  }

  const [reviewStats, reviews, strapiProduct, socialFeedPosts] = await Promise.all([
    medusa.productReviews.listStats(product.id).catch(() => null),
    medusa.productReviews.list(product.id).catch(() => []),
    strapi.products.findOne(product.id).catch(() => null),
    strapi.socialFeed.find({ activeOnly: true }).catch(() => []),
  ]);

  console.log("Fetched product review stats:", reviewStats);

  // Gallery data from Strapi
  const galleryImages = (strapiProduct?.gallery_images ?? []).map((gi) => ({
    id: gi.id,
    src: strapiImage(gi.image) ?? "",
    alt: gi.alt ?? gi.image?.name ?? "",
    aspect: gi.aspect ?? null,
  }));
  const galleryVideoUrl = strapiImage(strapiProduct?.gallery_video) ?? null;

  // Artist collaborations → drives the "concept behind the piece" slider
  const artists = (strapiProduct?.artist_collaborations ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: a.subtitle,
    bio: a.bio,
    imageUrl: strapiImage(a.cover_image) ?? null,
    handle: a.handle,
  }));

  // Goes Well With — product relations + custom result image
  const pairings = (strapiProduct?.productDuo ?? []).map((m) => ({
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

  // Social feed posts for the stacked slider
  const feedPosts = socialFeedPosts.map((post) => ({
    id: post.id,
    image: strapiImage(post.image) ?? "",
    label: post.title,
    sub: post.subtitle ?? "",
  }));

  return (
    <div className="bg-[#111111]">
      <ProductDetail
        title={product.title}
        description={product.description}
        variants={product.variants}
        options={product.options}
        currencyCode={product.variants?.[0]?.prices?.[0]?.currency_code ?? "inr"}
        galleryImages={galleryImages}
        galleryVideoUrl={galleryVideoUrl}
      />
      <ConceptSection artists={artists} />
      <GoesWellWith pairings={pairings} />
      <FeedStackSection posts={feedPosts} />
      <ReviewsSentiment productId={product.id} stats={reviewStats} reviews={reviews} />
    </div>
  );
}
