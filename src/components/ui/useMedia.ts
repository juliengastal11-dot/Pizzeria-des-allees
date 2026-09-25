"use client";

import { useCallback, useSyncExternalStore } from "react";

export const MOUVEMENT_REDUIT = "(prefers-reduced-motion: reduce)";
/** Souris ou pavé tactile (pas le doigt) : le seul cas où le défilement lissé a un sens. */
export const POINTEUR_FIN = "(hover: hover) and (pointer: fine)";

/**
 * Media query suivie en direct. Faux côté serveur et pendant l'hydratation,
 * puis la vraie valeur : aucun écart entre le HTML serveur et le client.
 */
export function useMedia(requete: string): boolean {
  const abonner = useCallback(
    (notifier: () => void) => {
      const liste = window.matchMedia(requete);
      liste.addEventListener("change", notifier);
      return () => liste.removeEventListener("change", notifier);
    },
    [requete],
  );
  return useSyncExternalStore(
    abonner,
    () => window.matchMedia(requete).matches,
    () => false,
  );
}
