"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";

interface CardData {
  id: number;
  image: string;
  label: string;
  sub: string;
}

interface CardProps {
  card: CardData;
  index: number;
  total: number;
  isTop: boolean;
  onDismiss: () => void;
  cardWidth: number;
  cardHeight: number;
  stackShiftX: number;
}

const MAX_VISIBLE = 4;
const STACK_SHIFT_Y = 0;
const STACK_SCALE = 0.09;
const DRAG_THRESHOLD = 100;
const SCALE = 0.8;

const cards: CardData[] = [
  {
    id: 1,
    image:
      "/images/product.png",
    label: "COLLECTION 01",
    sub: "Off-White™ × Chicago Bulls",
  },
  {
    id: 2,
    image:
      "/images/product.png",
    label: "COLLECTION 02",
    sub: "Leather Varsity Jacket",
  },
  {
    id: 3,
    image:
      "/images/product.png",
    label: "COLLECTION 03",
    sub: "Abloh Streetwear Edit",
  },
  {
    id: 4,
    image:
      "/images/product.png",
    label: "COLLECTION 04",
    sub: "Basketball Court Capsule",
  },
  {
    id: 5,
    image:
      "/images/product.png",
    label: "COLLECTION 05",
    sub: "Utility Denim Series",
  },
  {
    id: 6,
    image:
      "/images/product.png",
    label: "COLLECTION 06",
    sub: "Archive Hoodie Reissue",
  },
];

function Card({
  card,
  index,
  total,
  onDismiss,
  isTop,
  cardWidth,
  cardHeight,
  stackShiftX,
}: CardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-22, 22]);
  const opacity = useTransform(x, [-250, -100, 0, 100, 250], [0, 1, 1, 1, 0]);

  const stackX = index * stackShiftX;
  const stackY = index * STACK_SHIFT_Y;
  const scale = 1 - index * STACK_SCALE;

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (
      Math.abs(info.offset.x) > DRAG_THRESHOLD ||
      Math.abs(info.offset.y) > DRAG_THRESHOLD
    ) {
      onDismiss();
    }
  };

  return (
    <motion.div
      className="ml-7"
      style={{
        position: "absolute",
        width: cardWidth,
        height: cardHeight,
        left: 0,
        x: isTop ? x : stackX,
        y: isTop ? y : stackY,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        scale,
        zIndex: total - index,
        transformOrigin: "center center",
      }}
      initial={{
        scale: 1 - (index + 1) * STACK_SCALE,
        x: (index + 1) * stackShiftX,
        y: (index + 1) * STACK_SHIFT_Y,
      }}
      animate={{ scale, x: isTop ? 0 : stackX, y: isTop ? 0 : stackY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 24,
          overflow: "hidden",
          background: "#111",
          
          boxShadow: isTop
            ? "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)"
            : `0 ${8 + index * 4}px ${20 + index * 8}px rgba(0,0,0,0.4)`,
          cursor: isTop ? "grab" : "default",
          userSelect: "none",
          position: "relative",
        }}
      >
        <img
          src={card.image}
          alt={card.label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
            filter: isTop ? "none" : `brightness(${0.7 - index * 0.05})`,
          }}
          draggable={false}
        />
        <div
        
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
          }}
        />
               <div
      className="pointer-events-none w-full h-full absolute inset-0 rounded-3xl"
      style={{
        boxShadow: `
          inset 10.8px 10.8px 16.19px rgba(0,0,0,0.24),
          inset -10.8px -10.8px 16.19px rgba(255,255,255,0.12)
        `,
      }}
    />
        {isTop && (
          <div
            style={{ position: "absolute", bottom: 28, left: 24, right: 24 }}
          >
            <div
            className="font-display"
              style={{
      
                fontSize: 11,
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.5)",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              {card.label}
            </div>
            <div
            className="font-display"
              style={{
                fontSize: 26,
                letterSpacing: "0.06em",
                color: "#fff",
                lineHeight: 1.1,
                textTransform: "uppercase",
              }}
            >
              {card.sub}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function StackedSlider() {
  const [deck, setDeck] = useState<CardData[]>(cards);

  const handleDismiss = () => {
    setDeck((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const visible = deck.slice(0, MAX_VISIBLE);

  return (
    <StackedSliderInner
      deck={deck}
      visible={visible}
      onDismiss={handleDismiss}
    />
  );
}

// function useStackDimensions() {
//   const [dims, setDims] = useState({
//     cardWidth: 320,
//     cardHeight: 510,
//     stackShiftX: 70,
//   });

//   if (typeof window !== "undefined") {
//   }

//   const [mounted, setMounted] = useState(false);

//   const update = () => {
//     const w = window.innerWidth;

//     if (w < 480) {
//       setDims({
//         cardWidth: 260 * SCALE,
//         cardHeight: 380 * SCALE,
//         stackShiftX: 36 * SCALE,
//       });
//     } else if (w < 768) {
//       setDims({
//         cardWidth: 300 * SCALE,
//         cardHeight: 440 * SCALE,
//         stackShiftX: 50 * SCALE,
//       });
//     } else {
//       setDims({
//         cardWidth: 395 * SCALE,
//         cardHeight: 560 * SCALE,
//         stackShiftX: 70 * SCALE,
//       });
//     }
//   };

//   // Only run on client
//   if (typeof window !== "undefined" && !mounted) {
//   }

//   return { dims, update, mounted, setMounted };
// }

function StackedSliderInner({
  deck,
  visible,
  onDismiss,
}: {
  deck: CardData[];
  visible: CardData[];
  onDismiss: () => void;
}) {
  const [dims, setDims] = useState({
    cardWidth: 395 * SCALE,
    cardHeight: 560 * SCALE,
    stackShiftX: 70 * SCALE,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;

      if (w < 480) {
        setDims({
          cardWidth: 260 * SCALE,
          cardHeight: 380 * SCALE,
          stackShiftX: 48 * SCALE,
        });
      } else if (w < 768) {
        setDims({
          cardWidth: 300 * SCALE,
          cardHeight: 440 * SCALE,
          stackShiftX: 80 * SCALE,
        });
      } else {
        setDims({
          cardWidth: 395 * SCALE,
          cardHeight: 560 * SCALE,
          stackShiftX: 130 * SCALE,
        });
      }
    };

    update(); // run immediately
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  // Container width = cardWidth + (MAX_VISIBLE - 1) * stackShiftX
  const containerWidth = dims.cardWidth + (MAX_VISIBLE - 1) * dims.stackShiftX;

  return (
    <div
      style={{
        position: "relative",
        width: containerWidth,
        height: dims.cardHeight,
      }}
      className="mx-auto  lg:mx-0"
    >
      {deck.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: dims.cardWidth,
            height: dims.cardHeight,
            borderRadius: 24,
            border: "1px dashed rgba(255,255,255,0.15)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.3)",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 36 }}>✦</div>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            End of Collection
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          {visible.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              total={visible.length}
              isTop={index === 0}
              onDismiss={onDismiss}
              cardWidth={dims.cardWidth}
              cardHeight={dims.cardHeight}
              stackShiftX={dims.stackShiftX}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
