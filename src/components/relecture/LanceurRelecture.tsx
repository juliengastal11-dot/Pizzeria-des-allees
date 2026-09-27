"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/*
 * Mode relecture : il s'active avec « ?relecture » dans l'adresse (le lien à
 * envoyer au relecteur), puis reste actif pendant la visite, d'une page à
 * l'autre. Les visiteurs ordinaires ne téléchargent rien : l'outil n'est chargé
 * qu'à ce moment-là.
 */
const Relecture = dynamic(() => import("./Relecture").then((m) => m.Relecture), { ssr: false });

export const CLE_RELECTURE = "relecture-active";
const EVENEMENT = "relecture:changement";

function actif(): boolean {
  try {
    return new URLSearchParams(location.search).has("relecture") || sessionStorage.getItem(CLE_RELECTURE) === "1";
  } catch {
    return false;
  }
}

function abonner(prevenir: () => void) {
  addEventListener(EVENEMENT, prevenir);
  addEventListener("popstate", prevenir);
  return () => {
    removeEventListener(EVENEMENT, prevenir);
    removeEventListener("popstate", prevenir);
  };
}

/** Sortie du mode relecture : l'adresse et le site redeviennent normaux (les retours restent gardés). */
function quitter() {
  try {
    sessionStorage.removeItem(CLE_RELECTURE);
  } catch {
    // Stockage indisponible : il suffit de retirer « ?relecture » de l'adresse
  }
  const url = new URL(location.href);
  url.searchParams.delete("relecture");
  history.replaceState(history.state, "", url);
  dispatchEvent(new Event(EVENEMENT));
}

export function LanceurRelecture() {
  const relecture = useSyncExternalStore(abonner, actif, () => false);
  return relecture ? <Relecture quitter={quitter} /> : null;
}
