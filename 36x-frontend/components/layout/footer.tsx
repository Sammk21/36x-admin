"use client";

import Image from "next/image";

export default function FooterGraffiti() {
  return (
    <footer className="relative w-full h-[50dvh] lg:min-h-screen overflow-hidden">
      {/* Brick Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/bricksBg.jpg"
          alt="brick background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Background Graffiti */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src="/images/backgroundGraffiti.png"
          alt="graffiti background"
          width={3373}
          height={1837}
          className="w-[120vw] max-w-none  mix-blend-color-dodge "
        />
      </div>

      {/* 36X Graffiti Overlay */}
      <div className="absolute inset-0  flex items-center justify-center pointer-events-none">
        <Image
          src="/images/36xgrafitti.png"
          alt="36x graffiti"
          width={945}
          height={537}
          className="opacity-80 mix-blend-color-dodge w-[60vw] max-w-225"
        />
      </div>

      {/* Bottom Gradient Mask */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black pointer-events-none" />

      {/* Footer Content */}
      <div className=" z-10 flex items-end justify-center absolute bottom-0 left-1/2 -translate-x-1/2 pb-8">
        <h2 className="text-white text-3xl md:text-6xl font-bold font-display">
          WEAR THE ART.
        </h2>
      </div>
    </footer>
  );
}
