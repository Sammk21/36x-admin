import type { Schema, Struct } from '@strapi/strapi';

export interface CategoryCategoryMasonry extends Struct.ComponentSchema {
  collectionName: 'components_category_category_masonries';
  info: {
    displayName: 'Collection Masonry';
  };
  attributes: {
    product_collection: Schema.Attribute.Relation<
      'oneToOne',
      'api::product-collection.product-collection'
    >;
    sectionIntro: Schema.Attribute.Component<'shared.section-intro', true>;
  };
}

export interface CategoryPageShell extends Struct.ComponentSchema {
  collectionName: 'components_category_page_shells';
  info: {
    displayName: 'Page Shell';
  };
  attributes: {
    bgTileImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface CollectionCollectionTimeline extends Struct.ComponentSchema {
  collectionName: 'components_collection_collection_timelines';
  info: {
    displayName: 'collectionTimeline';
  };
  attributes: {
    chapterBanner: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    chapterNumber: Schema.Attribute.Integer & Schema.Attribute.Unique;
    chapterTitle: Schema.Attribute.String;
    product_collection: Schema.Attribute.Relation<
      'oneToOne',
      'api::product-collection.product-collection'
    >;
  };
}

export interface CollectionCollectionTimelineCard
  extends Struct.ComponentSchema {
  collectionName: 'components_collection_collection_timeline_cards';
  info: {
    displayName: 'Collection timeline card';
  };
  attributes: {};
}

export interface HomeArtistCollab extends Struct.ComponentSchema {
  collectionName: 'components_home_artist_collabs';
  info: {
    displayName: 'Artist Collab';
  };
  attributes: {
    artist_collaborations: Schema.Attribute.Relation<
      'oneToMany',
      'api::artist-collaboration.artist-collaboration'
    >;
    sectionIntro: Schema.Attribute.Component<'shared.section-intro', true>;
  };
}

export interface HomeCategorySection extends Struct.ComponentSchema {
  collectionName: 'components_home_category_sections';
  info: {
    displayName: 'CategorySection';
  };
  attributes: {
    product_categories: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-category.product-category'
    >;
    sectionIntro: Schema.Attribute.Component<'shared.section-intro', true>;
  };
}

export interface HomeCollectionSection extends Struct.ComponentSchema {
  collectionName: 'components_home_collection_sections';
  info: {
    displayName: 'CollectionSection';
  };
  attributes: {
    product_collections: Schema.Attribute.Relation<
      'oneToMany',
      'api::product-collection.product-collection'
    >;
    sectionIntro: Schema.Attribute.Component<'shared.section-intro', false>;
  };
}

export interface HomeFeedSection extends Struct.ComponentSchema {
  collectionName: 'components_home_feed_sections';
  info: {
    displayName: 'FeedSection';
  };
  attributes: {
    posts: Schema.Attribute.Component<'home.posts', true>;
    sectionIntro: Schema.Attribute.Component<'shared.section-intro', false>;
  };
}

export interface HomePageShell extends Struct.ComponentSchema {
  collectionName: 'components_home_page_shells';
  info: {
    displayName: 'PageShell';
  };
  attributes: {
    bgTileImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    topImage: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    topImageOverlay: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface HomePosts extends Struct.ComponentSchema {
  collectionName: 'components_home_posts';
  info: {
    displayName: 'Posts';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.button', true>;
    description: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    postLink: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ProductArtist extends Struct.ComponentSchema {
  collectionName: 'components_product_artists';
  info: {
    displayName: 'Artist';
  };
  attributes: {
    artist_collaborations: Schema.Attribute.Relation<
      'oneToMany',
      'api::artist-collaboration.artist-collaboration'
    >;
    sectionIntro: Schema.Attribute.Component<'shared.section-intro', true>;
  };
}

export interface ProductConceptSlide extends Struct.ComponentSchema {
  collectionName: 'components_product_concept_slides';
  info: {
    description: 'Artist/concept carousel slide shown on the product detail page';
    displayName: 'Concept Slide';
    icon: 'image';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductGalleryImage extends Struct.ComponentSchema {
  collectionName: 'components_product_gallery_images';
  info: {
    description: 'A single image entry in the product gallery with layout aspect hint';
    displayName: 'Gallery Image';
    icon: 'landscape';
  };
  attributes: {
    alt: Schema.Attribute.String;
    aspect: Schema.Attribute.Enumeration<['tall', 'wide', 'square']>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface ProductMatchers extends Struct.ComponentSchema {
  collectionName: 'components_product_matchers';
  info: {
    displayName: 'Matchers';
  };
  attributes: {
    productOne: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    productTwo: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    Result: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface ProductProductPairing extends Struct.ComponentSchema {
  collectionName: 'components_product_pairings';
  info: {
    description: 'A Goes Well With pairing row: item A + item B = result look';
    displayName: 'Product Pairing';
    icon: 'plus';
  };
  attributes: {
    item_a_alt: Schema.Attribute.String;
    item_a_image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    item_b_alt: Schema.Attribute.String;
    item_b_image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    result_alt: Schema.Attribute.String;
    result_image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface ProductProductSpec extends Struct.ComponentSchema {
  collectionName: 'components_product_specs';
  info: {
    description: 'A single spec/detail line item shown in the product detail panel';
    displayName: 'Product Spec';
    icon: 'list';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductRelatedProduct extends Struct.ComponentSchema {
  collectionName: 'components_product_related_products';
  info: {
    displayName: 'Related Product';
  };
  attributes: {
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    sectionIntro: Schema.Attribute.Component<'shared.section-intro', false>;
  };
}

export interface ProductSentimentBar extends Struct.ComponentSchema {
  collectionName: 'components_product_sentiment_bars';
  info: {
    description: 'A single sentiment/emotion bar entry for the review sentiment section';
    displayName: 'Sentiment Bar';
    icon: 'emotionHappy';
  };
  attributes: {
    color: Schema.Attribute.String;
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    href: Schema.Attribute.String;
    text: Schema.Attribute.String;
    varient: Schema.Attribute.String;
  };
}

export interface SharedCategorySection extends Struct.ComponentSchema {
  collectionName: 'components_shared_category_sections';
  info: {
    description: 'A category block with heading, subheading, view link and product image carousel';
    displayName: 'Category Section';
    icon: 'dashboard';
  };
  attributes: {};
}

export interface SharedCategorySlide extends Struct.ComponentSchema {
  collectionName: 'components_shared_category_slides';
  info: {
    description: 'A single product image slide in a category carousel';
    displayName: 'Category Slide';
    icon: 'picture';
  };
  attributes: {};
}

export interface SharedCollectionHeroItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_collection_hero_items';
  info: {
    description: 'A single card in the home collections carousel';
    displayName: 'Collection Hero Item';
    icon: 'layer';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    tag: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedHero extends Struct.ComponentSchema {
  collectionName: 'components_shared_heroes';
  info: {
    displayName: 'Hero';
    icon: 'bold';
  };
  attributes: {
    buttons: Schema.Attribute.Component<'shared.button', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedListingHero extends Struct.ComponentSchema {
  collectionName: 'components_shared_listing_heroes';
  info: {
    displayName: 'ListingHero';
  };
  attributes: {
    bannerImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    overlayImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface SharedMasonryImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_masonry_images';
  info: {
    description: 'A single image entry in a masonry gallery grid';
    displayName: 'Masonry Image';
    icon: 'apps';
  };
  attributes: {
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
  };
}

export interface SharedNavDropdownItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_dropdown_items';
  info: {
    description: 'A single link inside a nav dropdown section';
    displayName: 'Nav Dropdown Item';
    icon: 'arrowRight';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'#'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavDropdownSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_dropdown_sections';
  info: {
    description: 'A titled group of links inside a nav dropdown panel';
    displayName: 'Nav Dropdown Section';
    icon: 'layout';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.nav-dropdown-item', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    description: 'A top-level navbar link, optionally with a dropdown panel';
    displayName: 'Nav Item';
    icon: 'link';
  };
  attributes: {
    dropdown_sections: Schema.Attribute.Component<
      'shared.nav-dropdown-section',
      true
    >;
    href: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSectionIntro extends Struct.ComponentSchema {
  collectionName: 'components_shared_section_intros';
  info: {
    displayName: 'SectionIntro';
  };
  attributes: {
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedSocialLinks extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'Social Links';
  };
  attributes: {
    facebook: Schema.Attribute.Text;
    instagram: Schema.Attribute.Text;
    twitter: Schema.Attribute.Text;
    Whatsapp: Schema.Attribute.Integer;
    youtube: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'category.category-masonry': CategoryCategoryMasonry;
      'category.page-shell': CategoryPageShell;
      'collection.collection-timeline': CollectionCollectionTimeline;
      'collection.collection-timeline-card': CollectionCollectionTimelineCard;
      'home.artist-collab': HomeArtistCollab;
      'home.category-section': HomeCategorySection;
      'home.collection-section': HomeCollectionSection;
      'home.feed-section': HomeFeedSection;
      'home.page-shell': HomePageShell;
      'home.posts': HomePosts;
      'product.artist': ProductArtist;
      'product.concept-slide': ProductConceptSlide;
      'product.gallery-image': ProductGalleryImage;
      'product.matchers': ProductMatchers;
      'product.product-pairing': ProductProductPairing;
      'product.product-spec': ProductProductSpec;
      'product.related-product': ProductRelatedProduct;
      'product.sentiment-bar': ProductSentimentBar;
      'shared.button': SharedButton;
      'shared.category-section': SharedCategorySection;
      'shared.category-slide': SharedCategorySlide;
      'shared.collection-hero-item': SharedCollectionHeroItem;
      'shared.hero': SharedHero;
      'shared.listing-hero': SharedListingHero;
      'shared.masonry-image': SharedMasonryImage;
      'shared.nav-dropdown-item': SharedNavDropdownItem;
      'shared.nav-dropdown-section': SharedNavDropdownSection;
      'shared.nav-item': SharedNavItem;
      'shared.section-intro': SharedSectionIntro;
      'shared.social-links': SharedSocialLinks;
    }
  }
}
