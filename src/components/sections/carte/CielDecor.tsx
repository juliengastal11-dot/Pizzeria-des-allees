"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useHydrate } from "./hooks";

// Nuage dessiné à la main (style Haikei) : bosses rondes, base plate.
const NUAGE =
  "M24 78C8 78 2 62 14 54C8 38 26 26 42 34C46 16 70 8 86 20C96 6 124 6 134 24C146 14 170 18 172 36C190 32 206 46 198 60C214 64 214 80 196 80Z";

/**
 * Ciel de Béziers derrière La carte : nuages pâles et martinets qui glissent
 * à des vitesses différentes au défilement. Figés en mouvement réduit.
 */
export function CielDecor() {
  const ref = useRef<HTMLDivElement>(null);
  const hydrate = useHydrate();
  const reduire = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yLent = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yMoyen = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const yRapide = useTransform(scrollYProgress, [0, 1], [110, -110]);
  const fixe = !hydrate || reduire === true;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="texture-grain absolute inset-0 opacity-[0.07]" />

      <motion.svg
        viewBox="0 0 220 90"
        className="absolute -left-16 top-4 w-56 opacity-80 md:left-[2%] md:top-10 md:w-80"
        style={{ y: fixe ? 0 : yLent }}
      >
        <path d={NUAGE} fill="var(--color-ciel-pale)" />
      </motion.svg>

      <motion.svg
        viewBox="0 0 220 90"
        className="absolute -right-24 top-[34%] w-72 opacity-60 md:-right-16 md:w-[28rem]"
        style={{ y: fixe ? 0 : yRapide }}
      >
        <path d={NUAGE} fill="var(--color-ciel-pale)" transform="matrix(-1 0 0 1 220 0)" />
      </motion.svg>

      <motion.svg
        viewBox="0 0 220 90"
        className="absolute -left-12 bottom-0 w-36 opacity-70 md:bottom-24 md:left-[10%] md:w-60"
        style={{ y: fixe ? 0 : yLent }}
      >
        <path d={NUAGE} fill="var(--color-ciel-pale)" />
      </motion.svg>

      {/* Martinets */}
      <motion.svg
        viewBox="0 0 120 50"
        className="absolute right-[6%] top-8 w-24 md:right-[14%] md:top-14 md:w-32"
        style={{ y: fixe ? 0 : yMoyen }}
        fill="none"
        stroke="var(--color-nuit)"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 22 Q 13 13 20 21 Q 27 13 34 22" />
        <path d="M52 10 Q 57 4 62 9 Q 67 4 72 10" />
        <path d="M84 34 Q 90 27 96 33 Q 102 27 108 34" />
      </motion.svg>
    </div>
  );
}
