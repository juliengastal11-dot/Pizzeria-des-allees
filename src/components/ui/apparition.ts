"use client";

import { inView } from "motion/react";
import { MOUVEMENT_REDUIT } from "./useMedia";

/**
 * Apparition au défilement sans contenu invisible avant l'hydratation.
 *
 * Le serveur rend l'état final (lisible sans JavaScript et sur une 4G lente).
 * Une fois monté, si le bloc est encore sous la ligne de flottaison, on le met
 * dans son état de départ (invisible pour le visiteur, puisqu'il est hors écran)
 * puis on le révèle quand il arrive à l'écran. Déjà visible, ou mouvement
 * réduit demandé : on ne touche à rien.
 *
 * Renvoie la fonction de nettoyage de l'observateur (à rendre depuis useEffect).
 */
export function preparerApparition(
  declencheur: Element,
  cacher: () => void,
  reveler: () => void,
  proportion = 0.25,
): (() => void) | undefined {
  if (window.matchMedia(MOUVEMENT_REDUIT).matches) return;
  if (declencheur.getBoundingClientRect().top < window.innerHeight) return;
  cacher();
  // Sans fonction renvoyée par le rappel, inView n'observe qu'une fois.
  return inView(declencheur, () => reveler(), { amount: proportion });
}

/** Courbe d'entrée commune (voir la direction artistique, §6). */
export const ENTREE = [0.22, 1, 0.36, 1] as const;
