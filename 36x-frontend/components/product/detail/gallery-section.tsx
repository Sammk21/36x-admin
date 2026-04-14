"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

type ImageItem = { src: string; alt: string };

type GalleryImageProps = {
  src: string;
  alt: string;
  className?: string;
};

type AspectRatio = "tall" | "wide" | "square";
// ─── Data ────────────────────────────────────────────────────────────────────

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  aspect: AspectRatio | null;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
} as any;

const imgVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as any;

function GalleryImage({ src, alt, className = "" }: GalleryImageProps) {
  return (
    <motion.div
      variants={imgVariant}
      className={`relative overflow-hidden bg-zinc-900 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover grayscale-15 hover:scale-105 transition-transform duration-700 ease-out"
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />
    </motion.div>
  );
}

function DotPagination({
  count,
  active,
  onDotClick,
}: {
  count: number;
  active: number;
  onDotClick: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onDotClick(i)}
          className={`rounded-full transition-all duration-300 ${
            i === active
              ? "w-5 h-1.5 bg-brand-espresso"
              : "w-1.5 h-1.5 bg-brand-beige hover:bg-brand-milk"
          }`}
        />
      ))}
    </div>
  );
}

const noiseDataUrl =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")";

interface GallerySectionProps {
  images?: GalleryItem[];
  videoUrl?: string | null;
}

function MobileCarousel({ images = [], videoUrl }: GallerySectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const slideCount = (videoUrl ? 1 : 0) + images.length;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  return (
    <div className="w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {videoUrl && (
            <div className="flex-[0_0_100%] mr-3 relative overflow-hidden bg-[#111111] aspect-3/4">
              <video
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{ backgroundImage: noiseDataUrl }}
              />
            </div>
          )}
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] mr-3 relative overflow-hidden aspect-3/4"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <DotPagination
        count={slideCount}
        active={activeIndex}
        onDotClick={scrollTo}
      />
    </div>
  );
}

function DesktopLayout({ images = [], videoUrl }: GallerySectionProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start">
      {videoUrl && (
        <motion.div
          variants={imgVariant}
          className="
                     w-full lg:w-[30%]
                     h-screen lg:aspect-auto
                     lg:sticky lg:top-4
                     lg:self-start
                     relative overflow-hidden bg-[#111111]
                     mb-3 lg:mb-0
                     shrink
                   "
        >
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
            }}
          />
        </motion.div>
      )}

      <div className="flex-1 flex flex-col">
        {images.map((img) => (
          <GalleryImage
            key={img.id}
            src={img.src}
            alt={img.alt}
            className="w-full aspect-3/4"
          />
        ))}
      </div>
    </div>
  );
}

export default function GallerySection({ images = [], videoUrl }: GallerySectionProps) {
  return (
    <motion.section
      className="w-full lg:w-[60%]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="lg:hidden">
        <MobileCarousel images={images} videoUrl={videoUrl} />
      </div>
      <div className="hidden lg:block">
        <DesktopLayout images={images} videoUrl={videoUrl} />
      </div>
    </motion.section>
  );
}
