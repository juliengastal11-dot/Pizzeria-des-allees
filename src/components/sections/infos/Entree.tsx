"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Décalage en secondes, pour échelonner les cartes voisines. */
  delai?: number;
};

/**
 * Entrée d'une carte au défilement : elle glisse vers sa place sans jamais
 * partir d'une opacité nulle (elle porte adresse, horaires et CTA).
 */
export function Entree({ children, className, delai = 0 }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ y: 56, opacity: 0.5 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.9, delay: delai, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
