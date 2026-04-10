import Timeline, { type ChapterData } from "@/components/collection/Timeline";
import { strapi, strapiImage } from "@/lib/strapi";

export default async function CollectionTimelinePage() {
  const page = await strapi.pages.collectionTimeline({ revalidate: 3600 });

  // Flatten all product_collections from every collectionTimeline entry,
  // preserving the order defined in Strapi.
  const allCollections = page.collectionTimeline.flatMap(
    (entry) => entry.product_collections
  );

  const chapters: ChapterData[] = allCollections.map((col, i) => ({
    id: col.documentId,
    chapter: col.chapter_label ?? `CH #${col.chapter_number ?? i + 1}`,
    chapterSub: col.chapter_subtitle ?? col.title,
    comicStripUrl: strapiImage(col.comic_strip_image) ?? undefined,
    collection: col.cover_image
      ? {
          title: col.title,
          subtitle: col.artist_credit ?? "",
          imageUrl: strapiImage(col.cover_image) ?? "",
          accentColor: col.accent_color ?? "#0f2e12",
        }
      : undefined,
  }));

  return (
    <div className="max-w-4xl mx-auto h-auto flex flex-col py-8">
      <Timeline chapters={chapters} />
    </div>
  );
}
