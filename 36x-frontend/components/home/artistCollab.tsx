"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionIntro from "../shared/SectionIntro";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";

gsap.registerPlugin(CustomEase, ScrollTrigger);

CustomEase.create("elastic-css", ".2, 1.33, .25, 1");
CustomEase.create("ease-in-css", ".25, 1, 0.1, 1");

interface CollaborationItem {
  title: string;
  subtitle: string | null;
  imageUrl: string;
  handle: string;
}

interface ArtistCollaborationsProps {
  collaborations?: CollaborationItem[];
  title?: string | null;
  subtitle?: string | null;
}

export default function ArtistCollaborations({ collaborations = [], title, subtitle }: ArtistCollaborationsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 3 },
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCarouselActive, setIsCarouselActive] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setIsCarouselActive(emblaApi.internalEngine().options.active);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    onInit();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("reInit", onInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi, onSelect, onInit]);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });

      // ── Header: title words slide up ──────────────────────────────
      gsap.set(".collab-word-inner", { yPercent: 101 });

      tl.to(".collab-word-inner", {
        yPercent: 0,
        rotate: 0.001,
        stagger: 0.05,
        duration: 1,
        ease: "elastic-css",
        clearProps: "all",
      });

      // ── Description slide in parallel ────────────────────────────
      tl.fromTo(
        ".collab-desc",
        { yPercent: 101 },
        {
          yPercent: 0,
          rotate: 0.001,
          duration: 1,
          ease: "ease-in-css",
          clearProps: "all",
        },
        "<0.15",
      );

      // ── Cards: staggered fade + lift ─────────────────────────────
      tl.fromTo(
        ".collab-card",
        { y: "40px", opacity: 0 },
        {
          y: "0px",
          opacity: 1,
          rotate: 0.001,
          stagger: 0.1,
          duration: 1,
          ease: "elastic-css",
          clearProps: "all",
        },
        "<0.2",
      );
    },
    { scope: sectionRef },
  );
  const titleWords = (title ?? "").split(" ").filter(Boolean);

  return (
    <section
      ref={sectionRef}
      className="w-full h-fit text-white my-16 lg:my-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-14 space-y-4">
          {titleWords.length > 0 && (
            <h2
              className="text-6xl md:text-7xl font-display uppercase text-center tracking-tight"
              aria-label={title ?? ""}
            >
              {titleWords.map((word, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="inline-block overflow-hidden align-bottom"
                  style={{
                    marginRight: i < titleWords.length - 1 ? "0.3em" : undefined,
                  }}
                >
                  <span className="collab-word-inner inline-block will-change-transform">
                    {word}
                  </span>
                </span>
              ))}
            </h2>
          )}

          {subtitle && (
            <div className="overflow-hidden">
              <p className="collab-desc text-lg md:text-xl text-center text-neutral-200 max-w-2xl mx-auto font-body will-change-transform">
                {subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="overflow-hidden md:overflow-visible" ref={emblaRef}>
          <div className="flex md:grid md:grid-cols-3 md:gap-10">
            {collaborations.map((item, index) => (
              <Link
                href={`/artist/${item.handle}`}
                key={index}
                className="cursor-pointer shrink-0
           w-[72vw] max-w-[320px] ml-5 last:mr-5
           md:w-auto md:ml-0 md:last:mr-0 md:max-w-none"
              >
                <div
                  className="collab-card group relative overflow-hidden rounded-[28px] md:rounded-[36px] bg-neutral-900
             will-change-transform"
                >
                  <div className="relative aspect-389/510 w-full">
                    <Image
                      src={getStrapiMedia(item.imageUrl)}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="pointer-events-none w-full h-full absolute inset-0 rounded-3xl"
                      style={{
                        boxShadow: `
                          inset 10.8px 10.8px 16.19px rgba(0,0,0,0.24),
                          inset -10.8px -10.8px 16.19px rgba(255,255,255,0.12)
                        `,
                      }}
                    />
                  </div>

                  <div className="absolute h-50 bottom-0 w-full left-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 lg:bottom-10 lg:left-10">
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-display font-semibold tracking-wide leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-neutral-300 font-medium font-body text-sm sm:text-md md:text-lg lg:text-xl">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {isCarouselActive && (
          <div className="flex justify-center gap-2 mt-8 md:hidden">
            {collaborations.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
