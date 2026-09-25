/**
 * Schéma de la zone de livraison (pas à l'échelle).
 * Boîte 0-100 : x vers l'est, y vers le sud. Les noms suivent `site.livraison.communes` :
 * une commune absente d'ici reste dans la liste, sans point sur le schéma.
 */

export type Cote = "droite" | "gauche" | "dessous";

export type Lieu = {
  x: number;
  y: number;
  /** Côté de l'étiquette, choisi pour éviter les chevauchements sur mobile. */
  cote: Cote;
  /** Largeur max de l'étiquette (em) pour la couper après un trait d'union. */
  largeur?: number;
  /** Décalage vertical de l'étiquette (px). */
  dy?: number;
  /** Courbure du trajet depuis le 43 (0,18 par défaut ; négatif = de l'autre côté). */
  courbe?: number;
};

export const LIEUX: Partial<Record<string, Lieu>> = {
  Corneilhan: { x: 30, y: 8, cote: "droite" },
  "Lignan-sur-Orb": { x: 18, y: 22, cote: "droite", dy: -5 },
  Béziers: { x: 42, y: 38, cote: "droite" },
  "Boujan-sur-Libron": { x: 66, y: 24, cote: "droite", largeur: 6.5 },
  "Villeneuve-lès-Béziers": { x: 60, y: 60, cote: "dessous", largeur: 6.2 },
  Sauvian: { x: 36, y: 76, cote: "gauche" },
  Sérignan: { x: 58, y: 88, cote: "droite", courbe: -0.08 },
};

/** Le 43, au cœur de Béziers. */
export const RESTAURANT = { x: 42, y: 38 } as const;

/** L'Orb : du nord-ouest, par Lignan, à l'ouest de Béziers, entre Sauvian et Villeneuve, vers Sérignan. */
export const ORB = "M 5 -2 C 9 8, 13 15, 18 22 S 27 35, 32 41 S 40 56, 46 66 S 51 82, 53 90 S 55 98, 56 102";

/** Le Libron : à l'est, du nord au sud, par Boujan. */
export const LIBRON = "M 72 -2 C 70 8, 67 16, 66 24 S 72 38, 77 48 S 86 64, 89 78 S 92 94, 93 102";

export const RIVIERES = [
  { nom: "Orb", x: 36, y: 50, cote: "gauche" },
  { nom: "Libron", x: 78, y: 46, cote: "droite" },
] as const satisfies readonly { nom: string; x: number; y: number; cote: Cote }[];

/** Courbe douce du 43 vers une commune (légèrement bombée, comme une route). */
export function trajet({ x, y, courbe = 0.18 }: Lieu): string {
  const { x: x0, y: y0 } = RESTAURANT;
  const dx = x - x0;
  const dy = y - y0;
  const cx = x0 + dx / 2 - dy * courbe;
  const cy = y0 + dy / 2 + dx * courbe;
  return `M ${x0} ${y0} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x} ${y}`;
}

export function distance(x: number, y: number): number {
  return Math.hypot(x - RESTAURANT.x, y - RESTAURANT.y);
}
