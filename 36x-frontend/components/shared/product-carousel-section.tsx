"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
// import Image from "next/image"; // ← uncomment when you have real assets

// ─── Types ────────────────────────────────────────────────────────────────────

interface CarouselSlide {
  id: number;
  imageSrc: string;
  imageAlt: string;
}

interface CategorySection {
  id: number;
  heading: string;
  subheading: string;
  viewHref: string;
  slides: CarouselSlide[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// Replace imageSrc values with your real asset paths / Next.js Image srcs

const categories: CategorySection[] = [
  {
    id: 1,
    heading: "Hoodies & Sweatshirts",
    subheading:
      "Heavyweight comfort meets graffiti soul. Built for long nights and city lights.",
    viewHref: "/collections/hoodies-sweatshirts",
    slides: [
      {
        id: 1,
        imageSrc: "/products/hoodie-1.jpg",
        imageAlt: "Model wearing black Bulls leather bomber from the back",
      },
      {
        id: 2,
        imageSrc: "/products/hoodie-2.jpg",
        imageAlt:
          "Two models — one in red Bulls varsity, one seated in black hoodie",
      },
      {
        id: 3,
        imageSrc: "/products/hoodie-3.jpg",
        imageAlt: "Model in black Off-White hoodie seated with basketball",
      },
      {
        id: 4,
        imageSrc: "/products/hoodie-4.jpg",
        imageAlt: "Close-up of graphic Bulls hoodie",
      },
    ],
  },
  {
    id: 2,
    heading: "Joggers & Bottoms",
    subheading: "Movement first. Street-ready, art-backed.",
    viewHref: "/collections/joggers-bottoms",
    slides: [
      {
        id: 1,
        imageSrc: "/products/jogger-1.jpg",
        imageAlt:
          "Model wearing black Bulls leather bomber from the back holding basketball",
      },
      {
        id: 2,
        imageSrc: "/products/jogger-2.jpg",
        imageAlt: "Model in Bulls joggers seated with basketball",
      },
      {
        id: 3,
        imageSrc: "/products/jogger-3.jpg",
        imageAlt: "Detail shot of Bulls jogger side panel",
      },
    ],
  },
];

// ─── Carousel ─────────────────────────────────────────────────────────────────

interface CarouselProps {
  slides: CarouselSlide[];
}

const Carousel: React.FC<CarouselProps> = ({ slides }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      {/* Viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3 sm:gap-4 md:gap-5">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={[
                "relative shrink-0 overflow-hidden rounded-2xl bg-neutral-800",
                "aspect-[3/4]",
                /* Width: show ~1.1 cards on mobile, ~2.1 on sm, ~2.8 on md+ */
                "w-[78vw] sm:w-[44vw] md:w-[36vw] lg:w-[28vw] xl:w-[24vw]",
              ].join(" ")}
            >
              {/*
                ── Replace this placeholder div with Next.js <Image> ──
                <Image
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 78vw, (max-width: 768px) 44vw, 30vw"
                />
              */}
              <div
                className="absolute inset-0 bg-neutral-700"
                role="img"
                aria-label={slide.imageAlt}
              />
              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Arrow button ─────────────────────────────────────────────────────────────

interface ArrowButtonProps {
  href: string;
}

const ViewArrowButton: React.FC<ArrowButtonProps> = ({ href }) => (
  <Link
    href={href}
    className={[
      "flex items-center gap-2 shrink-0",
      "rounded-xl border border-white/20 bg-white/5",
      "px-4 py-2.5 sm:px-5 sm:py-3",
      "text-white text-sm sm:text-base font-semibold tracking-wide",
      "transition-all duration-200 hover:bg-white/10 hover:border-white/40",
      "backdrop-blur-sm",
    ].join(" ")}
  >
    View
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </Link>
);

// ─── Single category block ────────────────────────────────────────────────────

interface CategoryBlockProps {
  category: CategorySection;
}

const CategoryBlock: React.FC<CategoryBlockProps> = ({ category }) => (
  <div className="flex flex-col gap-5 sm:gap-6 md:gap-7">
    {/* Header row */}
    <div className="flex items-start justify-between gap-4 px-4 sm:px-6 md:px-10 lg:px-14">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <h2
          className={[
            "font-black font-display uppercase leading-none  text-white",
            "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
          ].join(" ")}

        >
          {category.heading}
        </h2>
        <p className="text-white/60 font-body text-sm sm:text-base md:text-lg max-w-xl leading-snug">
          {category.subheading}
        </p>
      </div>

      {/* View button — top-right on desktop, icon-only arrow on mobile */}
      <div className="shrink-0 mt-1">
        {/* Desktop: text + arrow */}
        <div className="hidden sm:block">
          <ViewArrowButton href={category.viewHref} />
        </div>
        {/* Mobile: icon-only */}
        <Link
          href={category.viewHref}
          className={[
            "sm:hidden flex items-center justify-center",
            "w-10 h-10 rounded-xl border border-white/20 bg-white/5",
            "text-white transition-all duration-200 hover:bg-white/10",
          ].join(" ")}
          aria-label={`View ${category.heading}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>

    {/* Carousel — bleeds to edges via negative margin trick on the wrapper */}
    <div className="pl-4 sm:pl-6 md:pl-10 lg:pl-14">
      <Carousel slides={category.slides} />
    </div>
  </div>
);

// ─── Main section ─────────────────────────────────────────────────────────────

const CategoryCarouselSection: React.FC = () => (
  <section className="w-full bg-[#111111] py-10 sm:py-14 md:py-16 lg:py-20 flex flex-col gap-14 sm:gap-16 md:gap-20">
    {categories.map((cat) => (
      <CategoryBlock key={cat.id} category={cat} />
    ))}
  </section>
);

export default CategoryCarouselSection;
