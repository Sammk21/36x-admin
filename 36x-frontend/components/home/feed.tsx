"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StackedSlider from "./slider";
import SectionIntro from "../shared/SectionIntro";
import { Button } from "../ui/button";

gsap.registerPlugin(CustomEase, ScrollTrigger);

CustomEase.create("elastic-css", ".2, 1.33, .25, 1");
CustomEase.create("ease-in-css", ".25, 1, 0.1, 1");

const TITLE_LINE_1 = ["STRAIGHT"];
const TITLE_LINE_2 = ["FROM", "THE", "FEED."];

export default function FeedStackSection() {
  const sectionRef = useRef<HTMLElement>(null);

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
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="w-full text-white bg-transparent flex items-center">
      <div className="max-w-7xl mx-auto w-full lg:px-12 flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
  
        <div className="feed-stack-slider flex justify-center lg:justify-start shrink-0 will-change-transform">
          <StackedSlider />
        </div>

        <div>
          <div>
            {/* Title with word-clip reveal */}
            <h3
              className="lg:text-start text-6xl md:text-7xl leading-none text-center font-display"
              aria-label="STRAIGHT FROM THE FEED."
            >
              {/* Line 1 */}
              <span className="block" aria-hidden="true">
                {TITLE_LINE_1.map((word, i) => (
                  <span
                    key={i}
                    className="inline-block overflow-hidden align-bottom"
                    style={{
                      marginRight:
                        i < TITLE_LINE_1.length - 1 ? "0.25em" : undefined,
                    }}
                  >
                    <span className="feed-word-inner inline-block will-change-transform">
                      {word}
                    </span>
                  </span>
                ))}
              </span>
              {/* Line 2 */}
              <span className="block" aria-hidden="true">
                {TITLE_LINE_2.map((word, i) => (
                  <span
                    key={i}
                    className="inline-block overflow-hidden align-bottom"
                    style={{
                      marginRight:
                        i < TITLE_LINE_2.length - 1 ? "0.25em" : undefined,
                    }}
                  >
                    <span className="feed-word-inner inline-block will-change-transform">
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            </h3>

            {/* Body copy */}
            <div className="overflow-hidden">
              <p className="feed-desc text-neutral-200 leading-relaxed font-medium text-lg md:text-xl lg:text-start font-body text-center will-change-transform">
                The scene never sleeps.
                <br />
                Tap in to what's moving right now.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6 flex justify-center lg:justify-start">
              <Button
                className="feed-cta rounded-lg will-change-transform"
                size="responsive"
              >
                Pull up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
