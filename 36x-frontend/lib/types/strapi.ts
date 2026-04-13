// ---------------------------------------------------------------------------
// Strapi v5 base primitives
// ---------------------------------------------------------------------------

export type StrapiMediaFormat = {
  url: string
  width: number
  height: number
  size: number
  name: string
  mime: string
}

export type StrapiMedia = {
  id: number
  documentId: string
  url: string
  name: string
  alternativeText: string | null
  caption: string | null
  width: number | null
  height: number | null
  formats: {
    thumbnail?: StrapiMediaFormat
    small?: StrapiMediaFormat
    medium?: StrapiMediaFormat
    large?: StrapiMediaFormat
  } | null
  mime: string
  size: number
}

export type StrapiPagination = {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export type StrapiListResponse<T> = {
  data: T[]
  meta: { pagination: StrapiPagination }
}

export type StrapiSingleResponse<T> = {
  data: T
  meta: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

export type HeroButton = {
  id: number
  text: string
  varient: string | null
  href: string
}

export type HeroComponent = {
  id: number
  title: string
  subtitle: string | null
  buttons: HeroButton[]
}

export type MasonryImage = {
  id: number
  image: StrapiMedia
  alt: string | null
}

// ---------------------------------------------------------------------------
// Product components
// ---------------------------------------------------------------------------

export type GalleryImage = {
  id: number
  image: StrapiMedia
  alt: string | null
  aspect: "tall" | "wide" | "square" | null
}

export type ConceptSlide = {
  id: number
  title: string
  subtitle: string | null
  description: string | null
  image: StrapiMedia
}

export type SentimentBar = {
  id: number
  value: number
  label: string
  icon: string | null
  color: string | null
}

export type ProductPairing = {
  id: number
  item_a_image: StrapiMedia
  item_a_alt: string | null
  item_b_image: StrapiMedia
  item_b_alt: string | null
  result_image: StrapiMedia
  result_alt: string | null
}

// ---------------------------------------------------------------------------
// Navigation components
// ---------------------------------------------------------------------------

export type NavDropdownItem = {
  id: number
  label: string
  href: string
}

export type NavDropdownSection = {
  id: number
  label: string | null
  items: NavDropdownItem[]
}

export type NavItem = {
  id: number
  label: string
  href: string | null
  dropdown_sections: NavDropdownSection[]
}

// ---------------------------------------------------------------------------
// Collection content types
// ---------------------------------------------------------------------------

export type CollectionTimeline = {
  id: number
  chapterTitle: string | null
  chapterNumber: number | null
  chapterBanner: StrapiMedia[] | null
  product_collection: StrapiProductCollection | null
}

// ---------------------------------------------------------------------------
// Synced collection types (bridge from Medusa)
// ---------------------------------------------------------------------------

export type StrapiProductOptionValue = {
  id: number
  documentId: string
  medusaId: string
  value: string
}

export type StrapiProductOption = {
  id: number
  documentId: string
  medusaId: string
  title: string
  values: StrapiProductOptionValue[]
}

export type StrapiProductVariant = {
  id: number
  documentId: string
  medusaId: string
  title: string
  sku: string | null
  images: StrapiMedia[]
  thumbnail: StrapiMedia | null
  option_values: StrapiProductOptionValue[]
}

export type StrapiArtistCollaboration = {
  id: number
  documentId: string
  title: string
  handle: string
  subtitle: string | null
  bio: string | null
  cover_image: StrapiMedia
  show_on_homepage: boolean
  homepage_order: number | null
}

export type StrapiProduct = {
  id: number
  documentId: string
  medusaId: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string
  // Media
  images: StrapiMedia[]
  thumbnail: StrapiMedia | null
  gallery_video: StrapiMedia | null
  // Components
  gallery_images: GalleryImage[]
  concept_slides: ConceptSlide[]
  pairings: ProductPairing[]
  // Review
  review_headline: string | null
  review_summary: string | null
  review_dominant_icon: string | null
  review_sentiment_bars: SentimentBar[]
  // Relations
  variants: StrapiProductVariant[]
  options: StrapiProductOption[]
  artist_collaborations: StrapiArtistCollaboration[]
}

export type StrapiProductCategory = {
  id: number
  documentId: string
  medusaId: string
  name: string
  handle: string
  description: string | null
  is_active: boolean
  is_internal: boolean
}

export type StrapiProductCollection = {
  id: number
  documentId: string
  medusaId: string
  title: string
  subtitle: string | null
  handle: string
  // Extended editorial fields
  chapter_number: number | null
  chapter_label: string | null
  chapter_subtitle: string | null
  accent_color: string | null
  artist_credit: string | null
  // Media
  banner: StrapiMedia | null
  thumbnail: StrapiMedia | null
  cover_image: StrapiMedia | null
  comic_strip_image: StrapiMedia | null
  // Components
  button: { id: number; text: string | null; varient: string | null; href: string | null }[]
  // Relations
  products: Pick<StrapiProduct, "id" | "documentId" | "medusaId" | "title" | "handle" | "thumbnail">[]
}

export type StrapiSocialFeedPost = {
  id: number
  documentId: string
  title: string
  subtitle: string | null
  image: StrapiMedia
  source: "instagram" | "manual"
  post_url: string | null
  display_order: number | null
  is_active: boolean
}

// ---------------------------------------------------------------------------
// Single types (page content)
// ---------------------------------------------------------------------------

export type StrapiPageShell = {
  id: number
  topImage: StrapiMedia | null
  topImageOverlay: StrapiMedia | null
  bgTileImage: StrapiMedia | null
}

export type StrapiFeedSection = {
  id: number
  title: string | null
  description: string | null
  postLink: string | null
  media: StrapiMedia | null
  button: HeroButton | null
  sectionIntro: { id: number; title: string | null; subtitle: string | null }[]
}

export type StrapiHomePage = {
  PageShell: StrapiPageShell | null
  HomeHero: HeroComponent | null
  collection: {
    id: number
    sectionIntro: { id: number; title: string | null; subtitle: string | null } | null
    product_collections: StrapiProductCollection[]
  } | null
  artistCollab: {
    id: number
    sectionIntro: { id: number; title: string | null; subtitle: string | null }[]
    artist_collaborations: StrapiArtistCollaboration[]
  } | null
  masonry_products: {
   products: Pick<StrapiProduct, "id" | "documentId" | "medusaId" | "title" | "handle" | "thumbnail">[]
  } | null
  category: {
    id: number
    sectionIntro: { id: number; title: string | null; subtitle: string | null }[]
    product_categories: StrapiProductCategory[]
  } | null
  feedSection: StrapiFeedSection[]
}

export type StrapiGlobalNavigation = {
  logo: StrapiMedia | null
  logo_alt: string | null
  nav_items: NavItem[]
  cart_label: string | null
  signin_label: string | null
}

export type StrapiCategoriesListingPage = {
  hero: HeroComponent[]
  product_category: StrapiProductCategory | null
}

export type ListingHeroComponent = {
  id: number
  bannerImage: StrapiMedia[]
  overlayImage: string | null
}

export type StrapiCollectionsListingPage = {
  Hero: ListingHeroComponent | null
  pageShell: { id: number; bgTileImage: StrapiMedia | null } | null
  collection: {
    id: number
    sectionIntro: { id: number; title: string | null; subtitle: string | null }[]
    product_collection: StrapiProductCollection | null
  } | null
}

export type StrapiCollectionTimelinePage = {
  sectionIntro: { id: number; title: string | null; subtitle: string | null }[]
  collectionTimeline: CollectionTimeline[]
}
