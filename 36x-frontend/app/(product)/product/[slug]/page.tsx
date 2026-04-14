import FeedStackSection from "@/components/home/feed";
import ProductDetail from "@/components/product/detail";
import ConceptSection from "@/components/product/detail/conceptSection";
import GoesWellWith from "@/components/product/detail/goes-well-with";
import ReviewsSentiment from "@/components/product/detail/reviewSentiment";
import { medusa } from "@/lib/medusa";
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

  const reviewStats = await medusa.productReviews.listStats(product.id).catch(() => null)

  return (
    <div className="bg-[#111111]">
      <ProductDetail
        title={product.title}
        description={product.description}
        variants={product.variants}
        options={product.options}
        currencyCode={product.variants?.[0]?.prices?.[0]?.currency_code ?? "inr"}
      />
      <ConceptSection />
      <GoesWellWith />
      <FeedStackSection />
      <ReviewsSentiment productId={product.id} stats={reviewStats} />
    </div>
  );
}
