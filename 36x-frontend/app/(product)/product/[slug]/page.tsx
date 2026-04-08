import FeedStackSection from "@/components/home/feed";
import ProductDetail from "@/components/product/detail";
import ConceptSection from "@/components/product/detail/conceptSection";
import GoesWellWith from "@/components/product/detail/goes-well-with";
import ReviewsSentiment from "@/components/product/detail/reviewSentiment";

const ProductDetailPage = () => {
  return (
    <div className="bg-[#111111]">
      <ProductDetail />
      <ConceptSection />
      <GoesWellWith/>
      <FeedStackSection />
      <ReviewsSentiment />
    </div>
  );
};

export default ProductDetailPage;
