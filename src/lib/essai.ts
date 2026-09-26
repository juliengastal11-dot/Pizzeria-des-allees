/**
 * Réglages d'essai (temporaire, voir BandeauEssai.tsx) : la palette de couleurs
 * ([data-palette]) et la palette typographique ([data-typo]) posées sur <html>,
 * retenues dans ce navigateur seulement. Le moteur de carte (moteurCarte.ts) écoute
 * aussi le changement : ses couleurs sont posées en JavaScript sur des calques
 * MapLibre, pas en classes Tailwind.
 */
export type Reglage = "palette" | "typo";

/** Clés de stockage, lues aussi par le script du layout avant la première peinture. */
const CLES: Record<Reglage, string> = { palette: "palette-essai", typo: "typo-essai" };

export const EVENEMENT_ESSAI = "essai:changement";

export function poserReglage(reglage: Reglage, id: string | null) {
  const racine = document.documentElement;
  if (id) racine.dataset[reglage] = id;
  else delete racine.dataset[reglage];
  try {
    if (id) localStorage.setItem(CLES[reglage], id);
    else localStorage.removeItem(CLES[reglage]);
  } catch {
    // Stockage indisponible (navigation privée…) : le réglage reste posé pour la session en cours.
  }
  window.dispatchEvent(new Event(EVENEMENT_ESSAI));
}

export function reglagePose(reglage: Reglage): string | null {
  return document.documentElement.dataset[reglage] ?? null;
}

/** Couleurs de la palette active, pour les calques MapLibre (zone de livraison, trajet). */
export function couleursPaletteCarte() {
  const s = getComputedStyle(document.documentElement);
  const lire = (nom: string, repli: string) => s.getPropertyValue(nom).trim() || repli;
  return {
    halo: lire("--color-halo", "#f2d38c"),
    or: lire("--color-or", "#e9b950"),
    orClair: lire("--color-or-clair", "#f4da90"),
    minuit: lire("--color-minuit", "#060f2e"),
  };
}
