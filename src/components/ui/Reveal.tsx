"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Décalage en secondes (pour échelonner des éléments voisins). */
  delai?: number;
  /** Distance de montée en px. */
  y?: number;
  as?: "div" | "li" | "section" | "p" | "article";
};

/**
 * Apparition au défilement : montée + fondu, une seule fois.
 * À réserver aux blocs secondaires : les CTA, prix, horaires et adresse restent
 * visibles d'emblée (ils ne font que glisser, sans partir d'une opacité nulle).
 */
export function Reveal({ children, className, delai = 0, y = 28, as = "div" }: Props) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay: delai, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}
