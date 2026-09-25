"use client";

import { useSyncExternalStore } from "react";

const sansAbonnement = () => () => {};

type Connexion = { saveData?: boolean; effectiveType?: string };

/** La vidéo n'est proposée ni en économie de données, ni sur un réseau lent (2G, 3G). */
function reseauPermetVideo(): boolean {
  const connexion = (navigator as Navigator & { connection?: Connexion }).connection;
  if (connexion?.saveData) return false;
  return !/2g|3g/.test(connexion?.effectiveType ?? "");
}

/** Faux côté serveur et à l'hydratation (le poster suffit), puis l'état du réseau. */
export function useVideoPermise(): boolean {
  return useSyncExternalStore(sansAbonnement, reseauPermetVideo, () => false);
}
