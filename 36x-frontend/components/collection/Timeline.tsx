"use client";

import { useRef, useState, useCallback, useEffect, JSX } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Speaker = "human" | "cat" | "title";

export interface Panel {
  text: string;
  speaker: Speaker;
}

export interface CollectionCardData {
  title: string;
  subtitle: string;
  collectionBanner: string;
  accentColor: string;
}

export interface ChapterData {
  id: string;
  chapter: string;
  chapterSub: string;
  chapterBanner?: string;
  collection?: CollectionCardData;
  collectionHandle?: string;
}

// ─── Story (Comic) Card ───────────────────────────────────────────────────────

function StoryCard({ chapterBanner }: { chapterBanner?: string }): JSX.Element {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-white aspect-[3/1]"
      style={{
        border: "2.5px solid #d1d5db",
        boxShadow: "0 6px 48px rgba(0,0,0,0.6)",
      }}
    >
      <Image
        src={chapterBanner ?? "/images/img11.png"}
        alt="comic strip"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}

// ─── Collection Card ──────────────────────────────────────────────────────────

function CollectionCard({ item }: { item: CollectionCardData }): JSX.Element {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full rounded-2xl aspect-973/600 overflow-hidden cursor-pointer"
      style={{
        boxShadow: hovered
          ? "0 24px 64px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.1)"
          : "0 10px 48px rgba(0,0,0,0.7)",
        transition: "box-shadow 0.35s ease",
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${item.collectionBanner})`,
          backgroundColor: item.accentColor,
          transform: hovered ? "scale(1.045)" : "scale(1)",
          transition: "transform 0.7s ease",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(140deg,${item.accentColor}e0 0%,rgba(0,0,0,0.2) 55%,rgba(0,0,0,0.72) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
        }}
      />
      <div
        className="absolute bottom-0 w-full z-10 p-6 flex flex-col justify-end"
        style={{ minHeight: "270px" }}
      >
        <h2
          className="text-white font-display leading-none mb-1 md:mt-0 mt-2"
          style={{
            fontSize: "clamp(1.5rem,5.5vw,2.8rem)",
            letterSpacing: "0.07em",
          }}
        >
          {item.title}
        </h2>
        <p
          className="text-white italic font-medium font-body hidden md:block"
          style={{ fontSize: "1rem" }}
        >
          {item.subtitle}
        </p>
        <Button
          variant="outline"
          className="absolute bottom-5 text-sm sm:text-md text-white right-5 flex items-center gap-1.5 px-4 py-2 font-bold"
        >
          VIEW
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Chapter group ────────────────────────────────────────────────────────────

const VERT_GAP = 44;
const DOT_TOP = 24;
const PATH_RADIUS = 18;

interface ChapterGroupProps {
  group: ChapterData;
  spineX: number;
  storyLeft: number;
  collLeft: number;
}

function ChapterGroup({ group, spineX, storyLeft, collLeft }: ChapterGroupProps): JSX.Element {
  const groupRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(groupRef, { once: true, margin: "-50px" });

  const [storyH, setStoryH] = useState<number>(170);
  const [collH, setCollH] = useState<number>(270);

  const storyMeasureRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const ro = new ResizeObserver(() => setStoryH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const collMeasureRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const ro = new ResizeObserver(() => setCollH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const collIndent = collLeft - storyLeft;
  const c1H = storyLeft - spineX;
  const c1V = 30;
  const storyTopY = DOT_TOP + 4 + c1V;
  const storyBottomY = storyTopY + storyH;
  const c2VertDrop = VERT_GAP + collH / 2;
  const c2HorizJog = collIndent;
  const SVG_PADDING = 10;

  const dash = {
    stroke: "white" as const,
    strokeWidth: "1.5",
    strokeDasharray: "5 5",
    strokeLinecap: "round" as const,
    fill: "none",
  };

  return (
    <div ref={groupRef} className="relative mb-16">
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} aria-hidden="true">
        {/* Chapter label */}
        <div className="absolute select-none" style={{ left: -20, top: `${DOT_TOP - 10}px`, width: `${spineX}px` }}>
          <div className="text-4xl font-display text-white text-left">
            <span className="block md:hidden absolute left-[calc(100%+40px)] whitespace-nowrap">{group.chapter}</span>
            <span className="hidden md:block">{group.chapter}</span>
          </div>
        </div>

        <div
          className="absolute select-none text-right font-display text-2xl hidden md:block"
          style={{ left: -30, top: `${DOT_TOP + 30}px`, width: `${spineX}px` }}
        >
          <div style={{ color: "rgba(255,255,255,0.45)" }}>{group.chapterSub}</div>
        </div>

        {/* Spine dot */}
        <motion.div
          className="absolute bg-white z-10 rounded-full"
          style={{
            width: 11, height: 11,
            border: "2.5px solid white",
            left: `${spineX - 5}px`,
            top: `${DOT_TOP - 1}px`,
            backgroundColor: "#000",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.1 }}
        />

        {/* Horizontal connector to story card */}
        <svg
          className="absolute overflow-visible"
          style={{ left: `${spineX}px`, top: `${DOT_TOP + 4}px`, width: `${c1H + 4}px`, height: `${c1V + 4}px`, overflow: "visible" }}
        >
          <motion.path
            d={`M0 0 H${c1H - 10} A10 10 0 0 1 ${c1H} ${10} V${c1V}`}
            stroke="white" strokeWidth={1.5} strokeDasharray="6 6"
            strokeDashoffset={200} strokeLinecap="round" fill="none"
            initial={{ strokeDashoffset: 200, opacity: 0 }}
            animate={isInView ? { strokeDashoffset: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>

        {/* Connector to collection card */}
        {group.collection && (
          <svg
            className="absolute overflow-visible"
            style={{ left: `${storyLeft}px`, top: `${storyBottomY}px`, width: `${c2HorizJog + SVG_PADDING}px`, height: `${c2VertDrop + SVG_PADDING}px`, overflow: "visible" }}
          >
            <motion.path
              d={`M0 0 V${c2VertDrop - PATH_RADIUS} Q0 ${c2VertDrop} ${PATH_RADIUS} ${c2VertDrop} H${c2HorizJog}`}
              {...dash}
              initial={{ strokeDashoffset: 200, opacity: 0 }}
              animate={isInView ? { strokeDashoffset: 0, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.65, ease: "easeOut" }}
            />
            <motion.circle
              cx={c2HorizJog} cy={c2VertDrop} r="4.5"
              fill="black" stroke="white" strokeWidth="2.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 1.3 }}
            />
          </svg>
        )}
      </div>

      {/* Story / comic strip */}
      <div style={{ paddingLeft: `${storyLeft}px`, paddingTop: `${storyTopY - 4}px` }}>
        <motion.div
          ref={storyMeasureRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
        >
          <StoryCard chapterBanner={group.chapterBanner} />
        </motion.div>
      </div>

      {/* Collection card */}
      {group.collection && (
        <div style={{ paddingLeft: `${collLeft}px`, marginTop: `${VERT_GAP}px` }}>
          <motion.div
            ref={collMeasureRef}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            {group.collectionHandle ? (
              <Link href={`/collections/${group.collectionHandle}`} className="block">
                <CollectionCard item={group.collection} />
              </Link>
            ) : (
              <CollectionCard item={group.collection} />
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Vertical spine ───────────────────────────────────────────────────────────

function VerticalSpine({ spineX }: { spineX: number }): JSX.Element {
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{ left: `${spineX}px`, width: "2px", zIndex: 1 }}
      aria-hidden="true"
    >
      <motion.div
        className="w-full h-full"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        style={{
          transformOrigin: "top",
          background:
            "repeating-linear-gradient(to bottom,rgba(255,255,255,0.65) 0px,rgba(255,255,255,0.65) 5px,transparent 5px,transparent 12px)",
        }}
      />
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

interface TimelineProps {
  chapters: ChapterData[];
}

export default function Timeline({ chapters }: TimelineProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const [dims, setDims] = useState({ spineX: 72, storyLeft: 96, collLeft: 140 });

  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.offsetWidth ?? window.innerWidth;
      if (w < 480) setDims({ spineX: 38, storyLeft: 54, collLeft: 72 });
      else if (w < 768) setDims({ spineX: 52, storyLeft: 72, collLeft: 100 });
      else setDims({ spineX: 72, storyLeft: 96, collLeft: 140 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full h-auto flex flex-col py-8">
      <div ref={scrollRef} className="relative z-10 flex-1" style={{ overscrollBehavior: "contain" }}>
        <div ref={containerRef} className="relative mx-auto px-3 sm:px-6 md:px-16 pb-16 pt-4" style={{ maxWidth: "900px", width: "100%" }}>
          <div style={{ minHeight: "20px" }} />
          <VerticalSpine spineX={dims.spineX} />
          {chapters.map((group) => (
            <ChapterGroup
              key={group.id}
              group={group}
              spineX={dims.spineX}
              storyLeft={dims.storyLeft}
              collLeft={dims.collLeft}
            />
          ))}
          <motion.div
            className="absolute fill-white rounded-full bg-white"
            style={{ width: 8, height: 8, left: `${dims.spineX - 4}px`, bottom: "4rem", opacity: 0.3 }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}
