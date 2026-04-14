"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import SectionIntro from "@/components/shared/SectionIntro";

interface ArtistSlide {
  id: number;
  title: string;
  subtitle: string | null;
  bio: string | null;
  imageUrl: string | null;
  handle: string;
}

interface ConceptSectionProps {
  artists?: ArtistSlide[];
}

export default function ConceptSection({ artists = [] }: ConceptSectionProps) {
  if (artists.length === 0) return null;

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
          title={<>THE CONCEPT BEHIND THE PIECE</>}
          className="text-6xl"
          description={<>A visual dialogue between rebellion and rhythm.</>}
        />
      </div>

      <div className="mt-12 md:mt-16">
        <div className="overflow-hidden relative" ref={emblaRef}>
          <div className="flex">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="flex-[0_0_100%] flex justify-center px-4"
              >
                <Link
                  href={`/artist/${artist.handle}`}
                  className="block relative w-full max-w-7xl overflow-hidden rounded-[28px] md:rounded-[40px] group"
                >
                  <div className="relative aspect-4/5 md:aspect-18/8">
                    {artist.imageUrl ? (
                      <Image
                        src={artist.imageUrl}
                        alt={artist.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-900" />
                    )}
                  </div>

                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-10 md:left-10 md:right-10">
                    <h3 className="font-display text-center text-xl md:text-4xl tracking-wide">
                      {artist.title}
                    </h3>

                    {artist.subtitle && (
                      <p className="mt-1 text-base font-medium text-center opacity-80 md:text-xl">
                        {artist.subtitle}
                      </p>
                    )}

                    {artist.bio && (
                      <p className="mt-2 max-w-md text-sm text-white mx-auto text-center opacity-70 md:text-base line-clamp-3">
                        {artist.bio}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {artists.length > 1 && (
            <div className="left-1/2 absolute bottom-3 -translate-x-1/2 z-10 flex justify-center gap-2">
              {artists.map((_, index) => (
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
          )}
        </div>
      </div>
    </section>
  );
}
