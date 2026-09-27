"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { MOUVEMENT_REDUIT, useMedia } from "./useMedia";

/*
 * Ornement : fenêtre en arche, Saint-Nazaire sur sa colline, le Pont Vieux et
 * ses réverbères qui s'allument un à un, l'Orb dessous. Il se trace en ~3 s à
 * son apparition : en tête des pages de texte, dans la fenêtre Réserver (le
 * temps que TheFork charge) et dans la fenêtre Commander. En mouvement réduit,
 * il apparaît déjà dessiné.
 */

const ENTREE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const ARCHE = "M24 112 A96 96 0 0 1 216 112 V152 Q216 168 200 168 H40 Q24 168 24 152 Z";
const COLLINE = "M24 116 C40 106 56 98 78 96 S122 99 140 108 S190 118 216 116";
const CATHEDRALE =
  "M70 97 V64 H72.5 V60.5 H75.5 V64 H78.5 V60.5 H81.5 V64 H84 V97 M84 74 H106 V99 M106 82 C112 82 116 86 116 92 V101 M64 98 V80 H70 M77 69 V75";
const TABLIER = "M26 129 Q120 117 214 129";
const ARCADES =
  "M30 154 V141 A10 9 0 0 1 50 141 V154 M54 154 V141 A12 10.5 0 0 1 78 141 V154 M82 154 V141 A11 10 0 0 1 104 141 V154 M108 154 V141 A13 11 0 0 1 134 141 V154 M138 154 V141 A10 9 0 0 1 158 141 V154 M162 154 V141 A11 10 0 0 1 184 141 V154 M188 154 V141 A10 9 0 0 1 208 141 V154";
const EAU = "M24 156 C56 151 88 161 120 156 S184 151 216 156";
const EAU_2 = "M40 163 C70 159 96 166 120 163 S170 159 200 163";
const LUNE = "M166 42 a11 11 0 1 0 9 17 a9 9 0 1 1 -9 -17 z";
/** Réverbères posés sur le tablier (y = hauteur du tablier à cet endroit). */
const REVERBERES = [
  { x: 44, y: 126.9 },
  { x: 72, y: 124.6 },
  { x: 100, y: 123.3 },
  { x: 128, y: 123 },
  { x: 156, y: 123.9 },
  { x: 184, y: 125.8 },
];
const ETOILES = [
  { x: 100, y: 36 },
  { x: 140, y: 40 },
  { x: 196, y: 86 },
  { x: 52, y: 84 },
];

/** Le ciel de l'arche selon le fond où l'ornement est posé : elle reste une fenêtre ouverte sur la nuit. */
const CIEL = {
  nuit: { couleur: "var(--color-minuit)", opacite: 0.6 },
  minuit: { couleur: "var(--color-nuit)", opacite: 1 },
  clair: { couleur: "var(--color-nuit)", opacite: 1 },
} as const;

type Props = {
  fond?: keyof typeof CIEL;
  /** Nom lu par le mode relecture (voir src/components/relecture/animations.ts). */
  animation?: string;
  className?: string;
};

export function OrnementPont({ fond = "nuit", animation = "ornement-pont", className }: Props) {
  // Deux ornements peuvent coexister (une page de texte et une fenêtre) : identifiants propres à chacun
  const id = `ornement-${useId().replace(/[^\w-]/g, "")}`;
  // Faux à l'hydratation (pages de texte, rendues au serveur) ; juste dans les fenêtres, montées après coup
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const ciel = CIEL[fond];

  const trace = (delai: number, duree = 1.3) =>
    reduire
      ? { initial: false as const, animate: { pathLength: 1 } }
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: duree, delay: delai, ease: ENTREE },
        };

  const apparition = (delai: number) =>
    reduire
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.6, delay: delai, ease: ENTREE },
        };

  return (
    <svg
      data-animation={animation}
      viewBox="0 0 240 176"
      aria-hidden
      focusable="false"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className ?? ""}`}
    >
      <defs>
        <clipPath id={`${id}-arche`}>
          <path d={ARCHE} />
        </clipPath>
        <radialGradient id={`${id}-lueur`}>
          <stop offset="0" stopColor="var(--color-halo)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--color-halo)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={ARCHE} fill={ciel.couleur} fillOpacity={ciel.opacite} />

      <g clipPath={`url(#${id}-arche)`}>
        {ETOILES.map((e, i) => (
          <motion.circle key={i} cx={e.x} cy={e.y} r="0.9" fill="var(--color-calcaire)" {...apparition(0.9 + i * 0.12)} />
        ))}
        <motion.path d={LUNE} fill="var(--color-or-clair)" fillOpacity="0.9" {...apparition(1.1)} />

        <motion.path d={COLLINE} stroke="var(--color-pierre)" strokeOpacity="0.55" strokeWidth="1.2" {...trace(0.35, 1.4)} />
        <motion.path d={CATHEDRALE} stroke="var(--color-pierre)" strokeWidth="1.3" {...trace(0.5, 1.6)} />
        <motion.circle cx="95" cy="84" r="3.2" stroke="var(--color-pierre)" strokeWidth="1.1" {...trace(1.2, 0.8)} />

        <motion.path d={TABLIER} stroke="var(--color-calcaire)" strokeWidth="1.5" {...trace(0.7, 1.2)} />
        <motion.path d={ARCADES} stroke="var(--color-calcaire)" strokeWidth="1.3" {...trace(0.85, 1.5)} />

        <motion.path d={EAU} stroke="var(--color-orb)" strokeWidth="1.4" {...trace(1, 1.3)} />
        <motion.path d={EAU_2} stroke="var(--color-orb)" strokeOpacity="0.6" strokeWidth="1.2" {...trace(1.15, 1.3)} />

        {REVERBERES.map((r, i) => (
          <g key={r.x}>
            <motion.path d={`M${r.x} ${r.y} V${r.y - 6.5}`} stroke="var(--color-calcaire)" strokeWidth="1" {...trace(1.2, 0.4)} />
            <motion.g {...apparition(1.6 + i * 0.16)}>
              <circle cx={r.x} cy={r.y - 8.5} r="7" fill={`url(#${id}-lueur)`} />
              <circle cx={r.x} cy={r.y - 8.5} r="1.9" fill="var(--color-halo)" />
              <path
                d={`M${r.x} 153.5 V160.5`}
                stroke="var(--color-halo)"
                strokeOpacity="0.5"
                strokeWidth="1.2"
                strokeDasharray="1.5 2.5"
              />
            </motion.g>
          </g>
        ))}
      </g>

      <motion.path d={ARCHE} stroke="var(--color-chene)" strokeWidth="1.6" {...trace(0, 1.4)} />
    </svg>
  );
}
