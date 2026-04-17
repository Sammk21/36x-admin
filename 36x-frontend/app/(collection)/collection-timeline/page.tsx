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
        chapterBanner: strapiImage(entry.storyBanner?.[0]) ?? undefined,
        collectionHandle: col.handle,
        collection: col.banner
          ? {
              title: col.title,
              subtitle: col.artist_credit ?? "",
              collectionBanner: strapiImage(col.banner) ?? "",
              accentColor: col.accent_color ?? "#0f2e12",
            }
          : undefined,
      };
    });

  return <Timeline chapters={chapters} />;
}
