
"use client";

import Image from "next/image";
import { BlurFade } from "@/components/ui/blur-fade";
import SectionIntro from "../shared/SectionIntro";
import Link from "next/link";

export interface FragmentImage {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
}

interface FragmentOfMovementProps {
  title: React.ReactNode;
  description: React.ReactNode;
  images: string[];
  className?: string;
  columns?: number;
  routeTo?: "collection" | "category";
}

export function Masonry({
  columns = 3,
  title,
  description,
  images,
  className = "",
  routeTo
}: FragmentOfMovementProps) {
  return (
    <section className={`w-full text-white py-16 md:py-24 ${className}`}>
      <div className="max-w-300 mx-auto">
        <div className="text-center mb-16 px-2 space-y-4">
          <SectionIntro
            descriptionClassName="text-neutral-200"
            title={title}
            className="text-6xl"
            description={description}
          />
        </div>
        <div className={`columns-2 md:columns-${columns} gap-6 px-4 space-y-6`}>
          {images.map((imageUrl, idx) => (
            <BlurFade key={imageUrl} delay={0.1 + idx * 0.05} inView>
              <Link href={routeTo === "collection" ? "/collections" : "/categories"}>
              <div className="relative w-full overflow-hidden rounded-2xl">
                <Image
                  src={imageUrl}
                  alt={`Fragment ${idx + 1}`}
                  width={800}
                  height={1000}
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
                <div
                  className="pointer-events-none w-full h-full absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: `
                      inset 10.8px 10.8px 16.19px rgba(0,0,0,0.24),
                      inset -10.8px -10.8px 16.19px rgba(255,255,255,0.12)
                    `,
                  }}
                />
              </div>
              </Link>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
