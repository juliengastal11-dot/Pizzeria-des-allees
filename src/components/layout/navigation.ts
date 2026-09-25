/** Sections de l'accueil reliées par le menu, dans l'ordre du défilement. */
export const SECTIONS = [
  { id: "histoire", libelle: "Notre histoire" },
  { id: "carte", libelle: "La carte" },
  { id: "livraison", libelle: "Livraison" },
  { id: "salle", libelle: "La salle" },
  { id: "infos", libelle: "Infos pratiques" },
] as const;

export type IdSection = (typeof SECTIONS)[number]["id"];

/**
 * Lien vers une section de l'accueil, valable depuis toutes les pages :
 * sur l'accueil, Lenis intercepte l'ancre et défile en douceur.
 */
export function ancre(id: string): string {
  return `/#${id}`;
}
