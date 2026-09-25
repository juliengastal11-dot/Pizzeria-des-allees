import { useSyncExternalStore } from "react";

function abonner(prevenir: () => void) {
  const minuterie = window.setInterval(prevenir, 15_000);
  document.addEventListener("visibilitychange", prevenir);
  return () => {
    window.clearInterval(minuterie);
    document.removeEventListener("visibilitychange", prevenir);
  };
}

const minuteClient = () => Math.floor(Date.now() / 60_000);
const minuteServeur = () => null;

/**
 * Minute courante (horodatage / 60 000). Vaut null au rendu serveur et pendant
 * l'hydratation : l'heure n'est lue qu'une fois la page montée, sans décalage.
 */
export function useMinuteCourante(): number | null {
  return useSyncExternalStore<number | null>(abonner, minuteClient, minuteServeur);
}
