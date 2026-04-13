import Timeline, { type ChapterData } from "@/components/collection/Timeline";
import { strapi, strapiImage } from "@/lib/strapi";

export default async function CollectionTimelinePage() {
  const page = await strapi.pages.collectionTimeline({ revalidate: 3600 });

  const chapters: ChapterData[] = page.collectionTimeline
    .filter((entry) => entry.product_collection !== null)
    .map((entry, i) => {
      const col = entry.product_collection!;
      return {
        id: col.documentId,
        chapter: entry.chapterTitle ?? `CH #${entry.chapterNumber ?? i + 1}`,
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
      };
    });

  return (
    <div className="max-w-4xl mx-auto h-auto flex flex-col py-8">
      <Timeline chapters={chapters} />
    </div>
  );
}
