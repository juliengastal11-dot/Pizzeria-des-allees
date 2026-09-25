import { site } from "@/config/site";

export type IdSection = keyof typeof site.navigation.sections;

/** Sections de l'accueil reliées par le menu, dans l'ordre du défilement (libellés : site.navigation.sections). */
export const SECTIONS = (Object.keys(site.navigation.sections) as IdSection[]).map((id) => ({
  id,
  libelle: site.navigation.sections[id],
}));

/**
 * Lien vers une section de l'accueil, valable depuis toutes les pages :
 * sur l'accueil, Lenis intercepte l'ancre et défile en douceur.
 */
export function ancre(id: string): string {
  return `/#${id}`;
}
