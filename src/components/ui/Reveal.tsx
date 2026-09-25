"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "motion/react";
import { ENTREE, preparerApparition } from "./apparition";

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
 * Le serveur rend le bloc visible ; il n'est escamoté qu'après le montage, s'il
 * est encore hors écran (voir preparerApparition).
 */
export function Reveal({ children, className, delai = 0, y = 28, as = "div" }: Props) {
  // Le type exact de la balise importe peu : on ne touche qu'à son style
  const ref = useRef<HTMLDivElement>(null);
  const Balise = as as "div";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return preparerApparition(
      el,
      () => {
        el.style.opacity = "0";
        el.style.transform = `translateY(${y}px)`;
      },
      () => animate(el, { opacity: [0, 1], y: [y, 0] }, { duration: 0.8, delay: delai, ease: ENTREE }),
    );
    // Réglages lus une seule fois, au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Balise ref={ref} className={className}>
      {children}
    </Balise>
  );
}
