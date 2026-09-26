/**
 * Essai temporaire de palettes (voir SelecteurPalette.tsx) : constantes et lecture
 * partagées avec le moteur de carte (moteurCarte.ts), qui ne peut pas suivre les
 * jetons CSS tout seul puisque ses couleurs sont posées en JavaScript sur des
 * calques MapLibre, pas en classes Tailwind.
 */
export const CLE_STOCKAGE_PALETTE = "palette-essai";
export const EVENEMENT_PALETTE = "palette-essai:changement";

export function poserPalette(id: string | null) {
  if (id) {
    document.documentElement.dataset.palette = id;
  } else {
    delete document.documentElement.dataset.palette;
  }
  try {
    if (id) localStorage.setItem(CLE_STOCKAGE_PALETTE, id);
    else localStorage.removeItem(CLE_STOCKAGE_PALETTE);
  } catch {
    // Stockage indisponible (navigation privée…) : la palette reste posée pour la session en cours.
  }
  window.dispatchEvent(new Event(EVENEMENT_PALETTE));
}

export function palettePosee(): string | null {
  return document.documentElement.dataset.palette ?? null;
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
