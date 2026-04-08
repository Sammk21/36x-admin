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
  aspect: AspectRatio;
}

const IMAGES: GalleryItem[] = [
  {
    id: 1,
    src: "/images/img1.png",
    alt: "Hood Monarchy back detail",
    aspect: "tall",
  },
  {
    id: 2,
    src: "/images/img2.png",
    alt: "Hood Monarchy editorial shot 1",
    aspect: "wide",
  },
  {
    id: 3,
    src: "/images/img3.png",
    alt: "Hood Monarchy editorial shot 2",
    aspect: "wide",
  },
  {
    id: 4,
    src: "/images/img4.png",
    alt: "Hood Monarchy editorial shot 3",
    aspect: "square",
  },
];

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

const SLIDE_COUNT = 1 + IMAGES.length;

function MobileCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });
  const [activeIndex, setActiveIndex] = useState(0);

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
          <div className="flex-[0_0_100%] mr-3 relative overflow-hidden bg-[#111111] aspect-3/4">
            <video
              src="/videos/orbit.mp4"
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
          {IMAGES.map((img, i) => (
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
        count={SLIDE_COUNT}
        active={activeIndex}
        onDotClick={scrollTo}
      />
    </div>
  );
}

function DesktopLayout() {
  return (
    <div className="flex flex-col lg:flex-row  lg:items-start">
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
          src="/videos/orbit.mp4"
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

      <div className="flex-1 flex flex-col ">
        <GalleryImage
          src={IMAGES[0].src}
          alt={IMAGES[0].alt}
          className="w-full aspect-3/4"
        />

        <GalleryImage
          src={IMAGES[1].src}
          alt={IMAGES[1].alt}
          className="w-full aspect-3/4"
        />
        <GalleryImage
          src={IMAGES[2].src}
          alt={IMAGES[2].alt}
          className="w-full aspect-3/4"
        />

        <GalleryImage
          src={IMAGES[3].src}
          alt={IMAGES[3].alt}
          className="w-full aspect-3/4"
        />
      </div>
    </div>
  );
}

export default function GallerySection() {
  return (
    <motion.section
      className="w-full lg:w-[60%]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="lg:hidden">
        <MobileCarousel />
      </div>
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>
    </motion.section>
  );
}
