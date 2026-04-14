"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const topImage = "/images/top-off.png";
const topImageOverlay = "/images/top-on.jpg";
const bgTileImage = "/images/bottom.jpg";

interface PageShellProps {
  topImage?: string;
  topImageOverlay?: string;
  topImageAlt?: string;
  bgTileImage?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function HomePageShell({
  topImage = "/images/top-off.png",
  topImageOverlay = "/images/top-on.jpg",
  bgTileImage = "/images/bottom.jpg",
  children,
  className = "",
  topImageAlt = "",
}: PageShellProps) {
  const [showOn, setShowOn] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const flicker = async () => {
      const delay = (ms: number) =>
        new Promise<void>((res) => setTimeout(res, ms));

      await delay(800);
      if (cancelled) return;

      const flickers: [boolean, number][] = [
        [true, 900],
        [false, 60],
        [true, 200],
        [false, 50],
        [true, 150],
        [false, 100],
        [true, 80],
        [false, 40],
        [true, 300],
        [true, 70],
        [false, 100],

        [false, 0],
      ];

      for (const [state, duration] of flickers) {
        if (cancelled) return;
        setShowOn(state);
        if (duration > 0) await delay(duration);
      }
    };

    flicker();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`relative min-h-screen w-full ${className}`}
      style={{
        backgroundImage: `url(${bgTileImage})`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% auto",
        backgroundPosition: "top center",
      }}
    >
      {/* TOP IMAGES */}
      <div className="absolute top-0 left-0 w-full">
        {/* Lights ON */}
        <Image
          src={topImage}
          alt={topImageAlt}
          width={0}
          height={0}
          sizes="100vw"
          className={`w-full h-auto hero-lights-on object-contain absolute top-0 left-0 ${
            showOn ? "opacity-100" : "opacity-0"
          }`}
          priority
        />

        {/* Lights OFF */}
        <Image
          src={topImageOverlay}
          alt={topImageAlt}
          width={0}
          height={0}
          sizes="100vw"
          className={`w-full h-auto object-contain ${
            showOn ? "opacity-0" : "opacity-100"
          }`}
          priority
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}