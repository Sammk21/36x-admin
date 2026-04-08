"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const bgTileImage = "/images/collection-foregroud.png";

interface PageShellProps {
  topImageAlt?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function HomePageShell({
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
      <div className="relative z-10">{children}</div>
    </div>
  );
}
