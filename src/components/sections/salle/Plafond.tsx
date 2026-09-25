"use client";

import { useId, useRef } from "react";
import { motion, useInView, type Variants } from "motion/react";

/**
 * Le plafond de la salle : des ampoules à filament pendues à des fils de
 * longueurs inégales. Elles s'allument une à une quand la section arrive à
 * l'écran ; une seule vacille, une seule fois (WCAG 2.3.1).
 * Mouvement réduit : les ampoules sont allumées d'emblée (classe motion-reduce).
 */

// 3 ampoules sur mobile, 5 en desktop (`large` = desktop seulement)
const AMPOULES = [
  { fil: 44, large: true },
  { fil: 28 },
  { fil: 18, vacille: true },
  { fil: 34 },
  { fil: 50, large: true },
] as const;

const DELAI = 0.15;
const PAS = 0.2;

const lumiere: Variants = {
  eteint: { opacity: 0 },
  allume: (i: number) =>
    AMPOULES[i] && "vacille" in AMPOULES[i]
      ? {
          opacity: [0, 1, 0.2, 1],
          transition: { delay: DELAI + i * PAS, duration: 0.7, times: [0, 0.3, 0.5, 1], ease: "easeOut" },
        }
      : { opacity: 1, transition: { delay: DELAI + i * PAS, duration: 0.5, ease: "easeOut" } },
};

// Petit balancement unique à l'allumage, comme si on venait d'effleurer le fil
const balancement: Variants = {
  eteint: { rotate: 0 },
  allume: (i: number) => ({
    rotate: [0, i % 2 ? -2.5 : 2.5, i % 2 ? 1.2 : -1.2, 0],
    transition: { delay: DELAI + i * PAS, duration: 1.6, ease: "easeInOut" },
  }),
};

const chaleur: Variants = {
  eteint: { opacity: 0 },
  allume: { opacity: 1, transition: { delay: DELAI + AMPOULES.length * PAS, duration: 1.2, ease: "easeOut" } },
};

export function Plafond() {
  const ref = useRef<HTMLDivElement>(null);
  const allume = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-28 md:h-32"
      initial="eteint"
      animate={allume ? "allume" : "eteint"}
    >
      {/* La pièce se réchauffe une fois les ampoules allumées */}
      <motion.div
        variants={chaleur}
        className="absolute left-1/2 top-0 h-[28rem] w-[150%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(242,211,140,0.1),transparent_62%)] motion-reduce:opacity-100! md:w-[110%]"
      />
      {/* Moulure du plafond */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-filet/50 to-transparent" />

      <div className="relative mx-auto flex max-w-6xl justify-around px-5">
        {AMPOULES.map((a, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={balancement}
            className={`${"large" in a ? "hidden md:flex" : "flex"} origin-top flex-col items-center`}
          >
            <span className="block h-1.5 w-4 rounded-b-full bg-filet/80" />
            <span className="block w-px bg-pierre/45" style={{ height: a.fil }} />
            <div className="relative">
              <motion.div
                custom={i}
                variants={lumiere}
                className="absolute left-1/2 top-[60%] size-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,211,140,0.42)_0%,rgba(242,211,140,0.13)_36%,transparent_68%)] motion-reduce:opacity-100! md:size-48"
              />
              <Ampoule index={i} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/** Ampoule à filament type Edison, dessinée à la main. */
function Ampoule({ index }: { index: number }) {
  const lueur = `lueur-${useId().replace(/[^\w-]/g, "")}`;
  const verre =
    "M10.5 10 H17.5 C17.5 14 25.5 18 25.5 29 C25.5 38.5 20.3 45 14 45 C7.7 45 2.5 38.5 2.5 29 C2.5 18 10.5 14 10.5 10 Z";
  const filament = "M10.5 27 L12.25 23.5 L14 27 L15.75 23.5 L17.5 27";

  return (
    <svg viewBox="0 0 28 46" width="28" height="46" className="relative block h-auto w-8 md:w-10" fill="none">
      <defs>
        <radialGradient id={lueur}>
          <stop offset="0%" stopColor="var(--color-halo)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-halo)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Douille laiton */}
      <rect x="9" y="0" width="10" height="10.5" rx="2" fill="var(--color-filet)" />
      <path d="M9 3.5h10M9 6.8h10" stroke="var(--color-minuit)" strokeOpacity="0.55" strokeWidth="0.8" />

      {/* Éteinte */}
      <path d={verre} fill="var(--color-calcaire)" fillOpacity="0.05" stroke="var(--color-pierre)" strokeOpacity="0.45" strokeWidth="0.9" />
      <path d="M12.3 10.5 V21 L10.5 27 M15.7 10.5 V21 L17.5 27" stroke="var(--color-pierre)" strokeOpacity="0.45" strokeWidth="0.7" />
      <path d={filament} stroke="var(--color-pierre)" strokeOpacity="0.55" strokeWidth="0.9" strokeLinejoin="round" />

      {/* Allumée */}
      <motion.g custom={index} variants={lumiere} className="motion-reduce:opacity-100!">
        <circle cx="14" cy="26" r="12" fill={`url(#${lueur})`} />
        <path d={verre} fill="var(--color-halo)" fillOpacity="0.28" stroke="var(--color-or-clair)" strokeOpacity="0.75" strokeWidth="0.9" />
        <path d={filament} stroke="var(--color-or-clair)" strokeWidth="1.3" strokeLinejoin="round" />
        <path d={filament} stroke="var(--color-calcaire-clair)" strokeWidth="0.5" strokeLinejoin="round" />
      </motion.g>
    </svg>
  );
}
