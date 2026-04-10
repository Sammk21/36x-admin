"use client";
import Image from "next/image";

interface PageShellProps {
  bottomImage?: string | null;
  bgTileImage?: string;
  ImageAlt?: string;
  children?: React.ReactNode;
  className?: string;
}
export default function PageShell({
  bottomImage = "/images/top-on.jpg",
  bgTileImage,
  children,
  className = "",
  ImageAlt = "",
}: PageShellProps) {
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
      <div className="w-full absolute bottom-0 left-0 h-auto">
        <div className="w-full h-full relative">
          <Image
            src={bottomImage || ""}
            alt={ImageAlt}
            width={0}
            height={0}
            sizes="100vw"
            className={`w-full absolute bottom-0 left-0 h-auto object-contain `}
            priority
          />
          <Image
            src={"/images/stars.png"}
            alt={ImageAlt}
            width={0}
            height={0}
            sizes="100vw"
            className={` w-full absolute bottom-0 left-0   h-auto object-contain `}
            priority
          />
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
