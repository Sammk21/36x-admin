import HomeHero from "@/components/home/hero";
import ProductCarouselSection from "@/components/shared/product-carousel-section";
import { strapi } from "@/lib/strapi";

export default async function CategoriesListingPage() {
  const page = await strapi.pages.categoriesListing({ revalidate: 3600 });

  // page.hero[0] → { title, subtitle, buttons[] }
  // page.product_category → linked Strapi category (name, handle, description)
  // Both are available here to pass to child components when they accept props.
  const hero = page.hero[0] ?? null;
  const linkedCategory = page.product_category ?? null;

  console.log("[categories page] hero:", hero, "category:", linkedCategory);

  return (
    <div>
      {/* HomeHero is currently hardcoded — wire hero.title/subtitle here
          once the component accepts CMS props */}
      <HomeHero />
      <ProductCarouselSection />
    </div>
  );
}
