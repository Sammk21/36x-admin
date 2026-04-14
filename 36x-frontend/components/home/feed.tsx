"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StackedSlider, { type CardData } from "./slider";
import { Button } from "../ui/button";
import Link from "next/link";

gsap.registerPlugin(CustomEase, ScrollTrigger);

CustomEase.create("elastic-css", ".2, 1.33, .25, 1");
CustomEase.create("ease-in-css", ".25, 1, 0.1, 1");

interface FeedSectionProps {
  title?: string | null;
  description?: string | null;
  buttonText?: string | null;
  buttonHref?: string | null;
  posts?: CardData[];
}

export default function FeedStackSection({
  title,
  description,
  buttonText,
  buttonHref,
  posts = [],
}: FeedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const titleWords = title ? title.split(" ") : [];

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });

      tl.fromTo(
        ".feed-stack-slider",
        { x: "-50px", opacity: 0 },
        {
          x: "0px",
          opacity: 1,
          rotate: 0.001,
          duration: 1.2,
          ease: "elastic-css",
          clearProps: "all",
        },
      );

      if (titleWords.length > 0) {
        gsap.set(".feed-word-inner", { yPercent: 101 });

        tl.to(
          ".feed-word-inner",
          {
            yPercent: 0,
            rotate: 0.001,
            stagger: 0.05,
            duration: 1,
            ease: "elastic-css",
            clearProps: "all",
          },
          "<0.1",
        );
      }

      if (description) {
        tl.fromTo(
          ".feed-desc",
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
      }

      if (buttonText) {
        tl.fromTo(
          ".feed-cta",
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
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="w-full text-white bg-transparent flex items-center">
      <div className="max-w-7xl mx-auto w-full lg:px-12 flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-center lg:gap-16">

        <div className="feed-stack-slider flex justify-center lg:justify-start shrink-0 will-change-transform">
          <StackedSlider cards={posts} />
        </div>

        {(titleWords.length > 0 || description || buttonText) && (
          <div>
            <div>
              {titleWords.length > 0 && (
                <h3
                  className="lg:text-start text-6xl md:text-7xl leading-none text-center font-display"
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
                        <span className="feed-word-inner inline-block will-change-transform">
                          {word}
                        </span>
                      </span>
                    ))}
                  </span>
                </h3>
              )}

              {description && (
                <div className="overflow-hidden">
                  <p className="feed-desc text-neutral-200 leading-relaxed font-medium text-lg md:text-xl lg:text-start font-body text-center will-change-transform">
                    {description}
                  </p>
                </div>
              )}

              {buttonText && (
                <div className="mt-6 flex justify-center lg:justify-start">
                  {buttonHref ? (
                    <Link href={buttonHref}>
                      <Button className="feed-cta rounded-lg will-change-transform" size="responsive">
                        {buttonText}
                      </Button>
                    </Link>
                  ) : (
                    <Button className="feed-cta rounded-lg will-change-transform" size="responsive">
                      {buttonText}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
