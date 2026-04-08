"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(CustomEase);

CustomEase.create("elastic-css", ".2, 1.33, .25, 1");
CustomEase.create("ease-in-css", ".25, 1, 0.1, 1");

const LINES = [
  ["BORN", "ON", "BRICK,"],
  ["BUILT", "FOR", "MOTION"],
];

const HomeHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      gsap.set(".single-word-inner", { yPercent: 101 });

      tl.to(".single-word-inner", {
        yPercent: 0,
        rotate: 0.001,
        stagger: 0.05,
        duration: 1,
        ease: "elastic-css",
        delay: 0.3,
        clearProps: "all",
      });

  
      tl.fromTo(
        ".animate-slide-in",
        { yPercent: 101 },
        {
          yPercent: 0,
          rotate: 0.001,
          duration: 1,
          ease: "ease-in-css",
          delay: 0.2,
          clearProps: "all",
        },
        "<",
      );

      tl.fromTo(
        ".animate-fade-in",
        { y: "40px", opacity: 0 },
        {
          y: "0px",
          opacity: 1,
          rotate: 0.001,
          stagger: 0.05,
          duration: 1,
          ease: "elastic-css",
          clearProps: "all",
        },
        "<",
      );
       tl.to(
        ".hero-lights-on",
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.inOut",
        },
        "-=0.1" 
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen text-white flex items-center justify-center"
    >
      <div className="text-center px-4 flex items-center justify-center flex-col">
        <div>
          <h1
            className="text-7xl sm:text-[13vw] lg:text-[9vw] font-display tracking-normal leading-[104%]"
            aria-label="BORN ON BRICK, BUILT FOR MOTION"
          >
            {LINES.map((words, lineIdx) => (
              <span key={lineIdx} className="block" aria-hidden="true">
                {words.map((word, wordIdx) => (
                  /*
                   * Outer span: overflow-hidden clips the word as it rises.
                   * Inner span (.single-word-inner): the GSAP target.
                   */
                  <span
                    key={wordIdx}
                    className="split-words animate-transition inline-block overflow-hidden align-bottom"
                    style={{
                      marginRight:
                        wordIdx < words.length - 1 ? "0.25em" : undefined,
                    }}
                  >
                    <span className="single-word-inner inline-block will-change-transform">
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          {/* overflow-hidden on wrapper clips the subtitle slide */}
          <div className="overflow-hidden mt-2">
            <p className="animate-slide-in text-xl md:text-3xl font-body will-change-transform">
              Streetwear from the underground up.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            size="responsive"
            className="animate-fade-in rounded-lg will-change-transform"
          >
            Community CTA
          </Button>
          <Button
            size="responsive"
            variant="outline"
            className="animate-fade-in rounded-lg will-change-transform"
          >
            Collections CTA
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
