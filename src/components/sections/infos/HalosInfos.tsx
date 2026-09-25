"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMouvementReduit } from "@/components/sections/infos/useMouvementReduit";

// Les lampes des Allées vues en perspective : deux rangées qui filent vers le Théâtre.
const ETAPES = [0, 0.28, 0.48, 0.62, 0.72, 0.8, 0.86, 0.9];
const LUMIERES = ETAPES.flatMap((t) => [
  { x: 4 + 43 * t, y: 100 - 92 * t, taille: 7 - 5 * t },
  { x: 96 - 43 * t, y: 100 - 92 * t, taille: 7 - 5 * t },
]);

/** Décor de fond de la section : lueurs douces et allée de lumières, en léger parallaxe. */
export function HalosInfos() {
  const ref = useRef<HTMLDivElement>(null);
  const reduire = useMouvementReduit();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lent = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const rapide = useTransform(scrollYProgress, [0, 1], [140, -140]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: reduire ? 0 : lent }}>
        <div className="absolute -left-48 top-[22%] size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgba(242,211,140,0.09),transparent)]" />
        <div className="absolute -right-40 bottom-[2%] size-[32rem] rounded-full bg-[radial-gradient(closest-side,rgba(136,168,220,0.12),transparent)]" />
      </motion.div>
      <motion.div className="absolute right-[4%] top-16 hidden h-52 w-[26rem] lg:block" style={{ y: reduire ? 0 : rapide }}>
        {LUMIERES.map(({ x, y, taille }) => (
          <span
            key={`${x}-${y}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]"
            style={{ left: `${x}%`, top: `${y}%`, width: taille, height: taille, opacity: 0.35 + 0.5 * (taille / 7) }}
          />
        ))}
      </motion.div>
    </div>
  );
}
