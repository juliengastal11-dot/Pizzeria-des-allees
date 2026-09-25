"use client";

import { motion } from "motion/react";

/** Contour festonné à `lobes` demi-cercles, dans un carré de 100 × 100. */
function feston(lobes = 12, rayon = 40, centre = 50): string {
  const pas = (2 * Math.PI) / lobes;
  const f = (n: number) => n.toFixed(2);
  const points = Array.from({ length: lobes }, (_, i) => {
    const angle = i * pas - Math.PI / 2;
    return [centre + rayon * Math.cos(angle), centre + rayon * Math.sin(angle)] as const;
  });
  const lobe = rayon * Math.sin(pas / 2);
  const arcs = points.map((_, i) => {
    const [x, y] = points[(i + 1) % lobes];
    return `A${f(lobe)} ${f(lobe)} 0 0 1 ${f(x)} ${f(y)}`;
  });
  return `M${f(points[0][0])} ${f(points[0][1])} ${arcs.join(" ")}Z`;
}

const FESTON = feston();

/**
 * Pastille « Du moment » : une étiquette festonnée or clair, posée de travers
 * sur le bord de la pizza. Elle se tamponne quand la carte arrive à l'écran.
 */
export function BadgeDuMoment() {
  return (
    <motion.p
      className="absolute right-[1.5cqw] top-[4cqw] z-10 grid size-[5.5rem] place-items-center text-nuit"
      initial={{ scale: 0.55, rotate: -38 }}
      whileInView={{ scale: 1, rotate: -12 }}
      viewport={{ once: true, amount: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 13, delay: 0.25 }}
    >
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
        <path
          d={FESTON}
          fill="var(--color-or-clair)"
          stroke="var(--color-nuit)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke="var(--color-nuit)"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeDasharray="1.5 3.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="relative text-center font-display text-[0.95rem] font-semibold italic leading-[1.02]">
        Du
        <br />
        moment
      </span>
    </motion.p>
  );
}
