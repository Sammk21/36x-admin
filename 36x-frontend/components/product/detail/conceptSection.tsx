"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import SectionIntro from "@/components/shared/SectionIntro";

const slides = [
  {
    id: 1,
    title: "NEO",
    subtitle: "Street Poet & Muralist",
    desc: "Beats. Paint. Asphalt. 36x took over the East Lot with raw sets and live walls.",
    img: "/images/concept.png",
  },
  {
    id: 2,
    title: "HOOD MONARCHY",
    subtitle: "CREW 404. Graffiti Collective",
    desc: "No invites, just rhythm, movement, and noise.",
    img: "/images/concept.png",
  },
];

export default function ConceptSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full bg-[#111111] py-16 md:py-24">
      <div className="text-center mb-16 px-2 space-y-4">
        <SectionIntro
          descriptionClassName="text-neutral-200"
          titleClassName="text-5xl text-white"
          title={<> THE CONCEPT BEHIND THE PIECE</>}
          className="text-6xl"
          description={<>A visual dialogue between rebellion and rhythm.</>}
        />
      </div>

      <div className="mt-12 md:mt-16">
        <div className="overflow-hidden relative" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex-[0_0_100%] flex justify-center px-4"
              >
                <div className="relative w-full max-w-7xl overflow-hidden rounded-[28px] md:rounded-[40px]">
                  <div className="relative aspect-4/5 md:aspect-18/8">
                    <Image
                      src={slide.img}
                      alt={slide.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute justify-center g bottom-6 font-body left-6 right-6 text-white md:bottom-10 md:left-10">
                    <h3 className="font-display text-center text-xl md:text-4xl tracking-wide">
                      {slide.title}
                    </h3>

                    <p className="mt-1 text-base text-white  font-medium text-center opacity-80 md:text-xl">
                      {slide.subtitle}
                    </p>

                    <p className="mt-2 max-w-md text-lg text-white mx-auto text-center opacity-80">
                      {slide.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="left-1/2 absolute bottom-3 -translate-x-1/2 z-10 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  selectedIndex === index ? "w-6 bg-white" : "bg-white/30",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
