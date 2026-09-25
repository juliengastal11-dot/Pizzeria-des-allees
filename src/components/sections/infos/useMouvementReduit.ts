import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const sansAbonnement = () => () => {};

/**
 * Préférence « réduire les animations », prise en compte seulement après
 * l'hydratation : le HTML serveur et le premier rendu client restent identiques.
 */
export function useMouvementReduit(): boolean {
  const monte = useSyncExternalStore(sansAbonnement, () => true, () => false);
  const reduire = useReducedMotion();
  return monte && reduire === true;
}
