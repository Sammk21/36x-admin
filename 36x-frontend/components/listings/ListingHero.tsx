import React from "react";

interface HeroProps {
  bottomImage?: string;
  topImage?: string;
}

const Hero: React.FC<HeroProps> = ({
  bottomImage = "/images/img9.png",
  topImage = "/images/collection-fore.png",
}) => {
  return (
    <section className="relative w-screen h-screen overflow-hidden">
      {/* Bottom Image */}
      <img
        src={bottomImage}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top Image with Gradient Mask */}
      <img
        src={topImage}
        alt="foreground"
        className="absolute  inset-0 w-full h-full object-cover object-bottom z-10"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
        }}
      />
    </section>
  );
};

export default Hero;
