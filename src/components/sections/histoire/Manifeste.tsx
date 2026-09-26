"use client";

import { Fragment, useRef, type RefObject } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { normaliserMot } from "./outils";
import { BUREAU, MOUVEMENT_REDUIT, useMedia } from "./useMedia";

const MOTS_CLES = new Set(["beziers", "allee", "allees", "platane", "platanes"]);

// Chaque mot s'allume sur 20 % de la course ; le dernier démarre à 80 %.
const ETALEMENT = 0.8;
const DUREE_MOT = 0.2;

type Props = {
  texte: string;
  className?: string;
  /**
   * En grand écran, où le manifeste reste en place (sticky), la lecture suit
   * l'entrée de cet élément à l'écran (le mur de cadres) plutôt que la sienne.
   */
  cible?: RefObject<HTMLElement | null>;
};

/**
 * Manifeste révélé mot à mot au défilement : chaque mot, d'abord « éteint »
 * (#9099b2, 5,9:1 sur nuit), s'allume en calcaire (les mots clés en or clair).
 * L'allumage est une copie du mot posée dessus dont seule l'opacité varie :
 * aucune couleur animée, le texte reste lisible à chaque instant.
 * Les lecteurs d'écran reçoivent la phrase entière une seule fois (copie sr-only).
 */
export function Manifeste({ texte, className, cible }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduire = useMedia(MOUVEMENT_REDUIT);
  const suivreCible = useMedia(BUREAU) && Boolean(cible);
  const { scrollYProgress } = useScroll({
    target: suivreCible ? cible : ref,
    offset: suivreCible ? ["start 0.9", "start 0.35"] : ["start 0.85", "end 0.45"],
  });
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

      <p
        ref={ref}
        className="font-titre text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] font-medium leading-[1.3] tracking-[-0.01em] text-[#9099b2] md:max-w-[32ch]"
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
  const debut = total <= 1 ? 0 : (index / (total - 1)) * ETALEMENT;
  const fin = Math.min(1, debut + DUREE_MOT);
  const opacite = useTransform(progression, [debut, fin], reduire ? [1, 1] : [0, 1]);

  // inline-block : un mot composé (« Paul-Riquet ») ne se coupe jamais au trait d'union
  return (
    <span className={`relative inline-block ${cle ? "italic" : ""}`}>
      {mot}
      <motion.span
        className={`absolute inset-0 motion-reduce:opacity-100! ${cle ? "text-or-clair" : "text-calcaire"} ${reduire ? "" : "will-change-[opacity]"}`}
        style={{ opacity: opacite }}
      >
        {mot}
      </motion.span>
    </span>
  );
}
