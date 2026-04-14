"use client";

import React, { useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Button } from "../ui/button";
import Link from "next/link";

gsap.registerPlugin(CustomEase);

CustomEase.create("elastic-css", ".2, 1.33, .25, 1");
CustomEase.create("ease-in-css", ".25, 1, 0.1, 1");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CollectionItem {
  id: string;
  title: string;
  tag: string;
  image: string;
  handle?: string;
}

const SlideCard: React.FC<{ item: CollectionItem; href?: string }> = ({ item, href }) => {
  const inner = (
    <div className="relative first:ml-5 w-full overflow-hidden aspect-12/17 rounded-3xl">
    {/* Image */}
    <img
      src={item.image}
      alt={item.title}
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
    />

    <div
      className="pointer-events-none absolute inset-0 rounded-3xl"
      style={{
        boxShadow: `
          inset 10.8px 10.8px 16.19px rgba(0,0,0,0.24),
          inset -10.8px -10.8px 16.19px rgba(255,255,255,0.12)
        `,
      }}
    />

    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

    <div className="absolute bottom-0 left-0 flex flex-col gap-1 p-5">
      <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/60">
        {item.tag}
      </span>
      <p className="text-sm font-semibold leading-tight text-white">
        {item.title}
      </p>
    </div>
  </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
};

// ─── Arrow Icon ───────────────────────────────────────────────────────────────

const ArrowIcon: React.FC<{ dir?: "left" | "right" }> = ({ dir = "right" }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={dir === "left" ? "rotate-180" : ""}
  >
    <path
      d="M1 7h12M8 2l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

interface HeroCollectionProps {
  collections?: CollectionItem[];
  title?: string | null;
  subtitle?: string | null;
}

const HeroCollection: React.FC<HeroCollectionProps> = ({ collections = [], title, subtitle }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const autoplay = useRef(Autoplay({ delay: 3200, stopOnInteraction: true }));

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: "start",
    },
    [autoplay.current],
  );

  const scrollPrev = useCallback(() => {
    autoplay.current.stop();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    autoplay.current.stop();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // ── Title words: clip + rise with elastic-css ──────────────
      gsap.set(".hero-col-word-inner", { yPercent: 101 });

      tl.to(".hero-col-word-inner", {
        yPercent: 0,
        rotate: 0.001,
        stagger: 0.05,
        duration: 1,
        ease: "elastic-css",
        delay: 0.2,
        clearProps: "all",
      });

      // ── Subtitle slides in with ease-in-css ────────────────────
      tl.fromTo(
        ".hero-col-sub",
        { yPercent: 101 },
        {
          yPercent: 0,
          rotate: 0.001,
          duration: 1,
          ease: "ease-in-css",
          clearProps: "all",
        },
        "<0.1",
      );

      // ── CTA button fades + lifts ────────────────────────────────
      tl.fromTo(
        ".hero-col-cta",
        { y: "40px", opacity: 0 },
        {
          y: "0px",
          opacity: 1,
          rotate: 0.001,
          duration: 1,
          ease: "elastic-css",
          clearProps: "all",
        },
        "<0.1",
      );

      // ── Cards stagger in from right + fade ─────────────────────
      tl.fromTo(
        ".hero-col-card",
        { x: "60px", opacity: 0 },
        {
          x: "0px",
          opacity: 1,
          rotate: 0.001,
          stagger: 0.08,
          duration: 1,
          ease: "elastic-css",
          clearProps: "all",
        },
        "<0.15",
      );
    },
    { scope: sectionRef },
  );

  const titleWords = title ? title.split(" ") : [];

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-fit w-full"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex-col flex justify-between w-full md:flex-row">
        {/* ── Left: copy ─────────────────────────────────────────── */}
        <div className="flex w-full md:pl-20 my-auto shrink-0 flex-col mb-8 md:mb-14 md:w-[45%]">
          {titleWords.length > 0 && (
            <h1
              className="text-6xl lg:text-7xl md:text-start text-center font-display tracking-normal leading-[104%] text-white"
              aria-label={title ?? ""}
            >
              <span className="block" aria-hidden="true">
                {titleWords.map((word, i) => (
                  <span
                    key={i}
                    className="inline-block overflow-hidden align-bottom"
                    style={{
                      marginRight: i < titleWords.length - 1 ? "0.25em" : undefined,
                    }}
                  >
                    <span className="hero-col-word-inner inline-block will-change-transform">
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            </h1>
          )}

          {subtitle && (
            <div className="overflow-hidden">
              <p className="hero-col-sub w-full text-white md:text-start font-light text-lg md:text-xl text-center leading-relaxed will-change-transform">
                {subtitle}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="w-full justify-center md:justify-start flex items-center">
            <Button
              size={"responsive"}
              className="hero-col-cta mt-6 font-semibold rounded-lg w-fit border-white will-change-transform"
              variant="default"
            >
              Explore Collections
            </Button>
          </div>
        </div>

        {/* ── Right: carousel ────────────────────────────────────── */}
        <div className="flex flex-col relative justify-center flex-1 min-w-0 z-10 gap-4">
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {collections.map((item) => (
                  <div
                    key={item.id}
                    className="hero-col-card mr-3.5 min-w-0 flex-[0_0_230px] md:flex-[0_0_250px] lg:flex-[0_0_290px] xl:flex-[0_0_330px] will-change-transform"
                  >
                    <SlideCard item={item} href={item.handle ? `/collections/${item.handle}` : undefined} />
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-30 bg-linear-to-l from-black to-transparent" />
          </div>

          {/* ── Prev / Next buttons ─────────────────────────────── */}
          <div className="flex justify-end gap-2 pr-1">
            <button
              onClick={scrollPrev}
              aria-label="Previous collection"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <ArrowIcon dir="left" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next collection"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <ArrowIcon dir="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCollection;
