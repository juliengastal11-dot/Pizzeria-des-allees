import { useSyncExternalStore } from "react";

const rien = () => () => {};

/** Faux au rendu serveur et pendant l'hydratation, vrai ensuite. */
export function useHydrate(): boolean {
  return useSyncExternalStore(
    rien,
    () => true,
    () => false,
  );
}

// Point de rupture lg de Tailwind (64rem) : la carte passe en grille 3 × 2.
const REQUETE_LARGE = "(min-width: 64rem)";

/** Vrai à partir de l'écran large (grille), faux sur mobile et tablette (carrousel). */
export function useEcranLarge(): boolean {
  return useSyncExternalStore(
    (rappel) => {
      const requete = window.matchMedia(REQUETE_LARGE);
      requete.addEventListener("change", rappel);
      return () => requete.removeEventListener("change", rappel);
    },
    () => window.matchMedia(REQUETE_LARGE).matches,
    () => false,
  );
}
