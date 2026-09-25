"use client";

import { motion, type Variants } from "motion/react";
import { PONT_COMPACT, PONT_LARGE, type Pont } from "./pont";

const entree = [0.22, 1, 0.36, 1] as const;

// « allumee » au défilement (pied de page), « ouvert » quand le menu s'ouvre
const rangee: Variants = {
  allumee: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
  ouvert: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};

const lampe: Variants = {
  eteinte: { opacity: 0.18, scale: 0.5 },
  ferme: { opacity: 0.18, scale: 0.5 },
  allumee: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: entree } },
  ouvert: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: entree } },
};

type Props = {
  pont: Pont;
  /** Couleur de la silhouette ; les arches laissent voir le fond du dessus. */
  remplissage?: string;
  /** Allume les réverbères à l'arrivée à l'écran ; sinon suit l'état du parent (menu). */
  auDefilement?: boolean;
  className?: string;
};

/** Silhouette du Pont Vieux, étirée sur toute sa boîte, avec ses réverbères. */
export function ProfilPont({ pont, remplissage = "var(--color-minuit)", auDefilement = false, className }: Props) {
  const declencheur = auDefilement
    ? { initial: "eteinte", whileInView: "allumee", viewport: { once: true, amount: 0.6 } }
    : {};

  return (
    <motion.div aria-hidden variants={rangee} className={`pointer-events-none ${className ?? ""}`} {...declencheur}>
      <svg viewBox={`0 0 ${pont.largeur} ${pont.hauteur}`} preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path d={pont.silhouette} fillRule="evenodd" style={{ fill: remplissage }} />
        <path d={pont.reverberes} style={{ fill: remplissage }} />
        <path
          d={pont.parapet}
          fill="none"
          style={{ stroke: "var(--color-filet)" }}
          strokeOpacity="0.55"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="0"
          y1={pont.eau}
          x2={pont.largeur}
          y2={pont.eau}
          style={{ stroke: "var(--color-orb)" }}
          strokeOpacity="0.7"
          strokeWidth="1.5"
          strokeDasharray="2 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {pont.lampes.map((l) => (
        <span key={l.gauche} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${l.gauche}%`, top: `${l.haut}%` }}>
          <motion.span
            variants={lampe}
            className="block size-[5px] rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]"
          />
        </span>
      ))}
    </motion.div>
  );
}

/**
 * Bord supérieur du pied de page : le profil du Pont Vieux, posé sur le bleu
 * de la section du dessus. Ses réverbères s'allument un à un à l'arrivée.
 */
export function PontVieux() {
  return (
    <div aria-hidden className="relative h-[4.5rem] bg-nuit md:h-[clamp(5.5rem,7.5vw,7.5rem)]">
      <ProfilPont pont={PONT_COMPACT} auDefilement className="absolute inset-0 md:hidden" />
      <ProfilPont pont={PONT_LARGE} auDefilement className="absolute inset-0 hidden md:block" />
    </div>
  );
}
