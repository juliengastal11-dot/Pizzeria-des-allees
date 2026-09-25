"use client";

import { Fragment, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { normaliserMot } from "./outils";
import { MOUVEMENT_REDUIT, useMedia } from "./useMedia";

// Mot « éteint » (5,9:1 sur nuit), puis calcaire ; les mots clés s'allument en or clair.
const ETEINT = "#9099b2";
const CALCAIRE = "#f1e0c8";
const OR_CLAIR = "#f4da90";

const MOTS_CLES = new Set(["beziers", "allee", "allees", "platane", "platanes"]);

// Chaque mot s'allume sur 20 % de la course ; le dernier démarre à 80 %.
const ETALEMENT = 0.8;
const DUREE_MOT = 0.2;

type Props = { texte: string; className?: string };

/**
 * Manifeste révélé mot à mot au défilement : chaque mot passe de « éteint » à calcaire.
 * Les lecteurs d'écran reçoivent la phrase entière une seule fois (copie sr-only).
 */
export function Manifeste({ texte, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  // Espaces normales seulement : les insécables restent collées au mot.
  const mots = texte.split(" ").filter(Boolean);

  return (
    <div className={`relative md:pl-9 ${className ?? ""}`}>
      {/* Filet de lumière qui descend avec la lecture */}
      <span aria-hidden className="absolute bottom-3 left-0 top-3 hidden w-px overflow-hidden rounded-full bg-filet/35 md:block">
        <motion.span
          className="absolute inset-0 origin-top bg-or-clair motion-reduce:transform-none!"
          style={{ scaleY: reduire ? 1 : scrollYProgress }}
        />
      </span>
      <span
        aria-hidden
        className="absolute left-[-2.5px] top-3 hidden size-1.5 -translate-y-1/2 rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)] md:block"
      />

      <p
        ref={ref}
        className="font-display text-[clamp(1.6rem,1.1rem+2.4vw,2.9rem)] font-medium leading-[1.25] tracking-[-0.01em] md:max-w-[26ch]"
      >
        <span className="sr-only">{texte}</span>
        <span aria-hidden="true">
          {mots.map((mot, i) => (
            <Fragment key={i}>
              <Mot mot={mot} index={i} total={mots.length} progression={scrollYProgress} reduire={reduire} />
              {i < mots.length - 1 && " "}
            </Fragment>
          ))}
        </span>
      </p>
    </div>
  );
}

function Mot({
  mot,
  index,
  total,
  progression,
  reduire,
}: {
  mot: string;
  index: number;
  total: number;
  progression: MotionValue<number>;
  reduire: boolean;
}) {
  const cle = MOTS_CLES.has(normaliserMot(mot));
  const cible = cle ? OR_CLAIR : CALCAIRE;
  const debut = total <= 1 ? 0 : (index / (total - 1)) * ETALEMENT;
  const fin = Math.min(1, debut + DUREE_MOT);
  const couleur = useTransform(progression, [debut, fin], reduire ? [cible, cible] : [ETEINT, cible]);

  return (
    <motion.span
      style={{ color: couleur }}
      className={cle ? "italic motion-reduce:text-or-clair!" : "motion-reduce:text-calcaire!"}
    >
      {mot}
    </motion.span>
  );
}
