/**
 * Géométrie du hero, à régler ici.
 *
 * En haut, la photo de la devanture en bannière (réglages dans `site.hero.photo`
 * et `.bande` de hero.module.css) ; dessous, le Pont Vieux dessiné au trait.
 */

/** Photo au défilement : elle descend et grossit, sans découvrir le haut de la bande. */
export const PAYSAGE = {
  yFin: "4%",
  echelleFin: 1.08,
} as const;

/** Tons de la devanture, relevés de haut en bas sur la photo : visibles un instant, avant son chargement. */
export const FOND_DEVANTURE =
  "linear-gradient(#67554c, #3f3a38 14%, #584133 28%, #7a532f 43%, #664326 57%, #553722 71%, #4e3425 86%, #57392a)";

/* ---------------------------------------------------------------------------
 * Pont Vieux dessiné au trait (valeurs en pixels CSS, dessin jamais mis à l'échelle)
 *
 * Arches en plein cintre de portées inégales sur des piles massives, avant-becs
 * au pied des piles, oculi dans les tympans, tablier presque plat à peine bombé,
 * et le reflet de chaque arche dans l'Orb. Commander et Réserver sont deux des
 * arches : le dessin est le bouton.
 * ------------------------------------------------------------------------ */

export type Cta = "commander" | "reserver";

export type ArcheDef = {
  /** Portée (largeur de l'ouverture). */
  portee: number;
  /** Hauteur des piédroits, de l'eau à la naissance de l'arc. */
  pied: number;
  cta?: Cta;
};

export type VarianteDef = {
  /** De gauche à droite ; le pont est centré sur le milieu du couple Commander / Réserver. */
  arches: ArcheDef[];
  /** Largeur des piles. */
  pile: number;
  /** Épaisseur du rouleau de claveaux (extrados). */
  archivolte: number;
  /** Maçonnerie entre l'extrados le plus haut et le tablier. */
  degagement: number;
  parapet: number;
  /** Les lanternes posées sur le parapet, au-dessus des piles. */
  lanterne: number;
  /** Dos d'âne du tablier : il descend de cette hauteur vers les extrémités. */
  bosse: number;
  /** Compression verticale des reflets dans l'Orb. */
  reflet: number;
  /** Rayons des points de lumière : cœur et halo. */
  feu: { coeur: number; halo: number };
  /** Largeur d'écran de référence pour l'ordre d'allumage (gauche → droite). */
  ecranReference: number;
  /**
   * Libellés des arches-boutons : hauteur de leur centre au-dessus de la naissance, en fraction du rayon.
   * Leur taille (15 px au téléphone, 16 px au-delà) est dans pont.module.css : les portées sont réglées pour elle.
   */
  libelle: { centre: Record<Cta, number> };
};

/** Téléphone (< 768 px) : on voit Commander, une petite arche, Réserver, et le pont qui file hors champ. */
const MOBILE: VarianteDef = {
  arches: [
    { portee: 44, pied: 10 },
    { portee: 52, pied: 11 },
    { portee: 58, pied: 12 },
    { portee: 64, pied: 13 },
    { portee: 114, pied: 16, cta: "commander" },
    { portee: 48, pied: 13 },
    { portee: 100, pied: 16, cta: "reserver" },
    { portee: 62, pied: 13 },
    { portee: 56, pied: 12 },
    { portee: 50, pied: 11 },
    { portee: 44, pied: 10 },
  ],
  pile: 18,
  archivolte: 5,
  degagement: 4,
  parapet: 5,
  lanterne: 2,
  bosse: 10,
  reflet: 0.82,
  feu: { coeur: 1.7, halo: 6.5 },
  ecranReference: 390,
  libelle: { centre: { commander: 0.3, reserver: 0.3 } },
};

/** Tablette et ordinateur (≥ 768 px) : le pont traverse tout l'écran. */
const LARGE: VarianteDef = {
  arches: [
    { portee: 60, pied: 11 },
    { portee: 72, pied: 12 },
    { portee: 66, pied: 12 },
    { portee: 84, pied: 13 },
    { portee: 78, pied: 13 },
    { portee: 96, pied: 14 },
    { portee: 88, pied: 14 },
    { portee: 104, pied: 15 },
    { portee: 156, pied: 17, cta: "commander" },
    { portee: 76, pied: 14 },
    { portee: 168, pied: 17, cta: "reserver" },
    { portee: 100, pied: 15 },
    { portee: 110, pied: 15 },
    { portee: 86, pied: 14 },
    { portee: 94, pied: 13 },
    { portee: 74, pied: 13 },
    { portee: 80, pied: 12 },
    { portee: 64, pied: 11 },
  ],
  pile: 26,
  archivolte: 6,
  degagement: 5,
  parapet: 7,
  lanterne: 3,
  bosse: 28,
  reflet: 0.8,
  feu: { coeur: 2, halo: 8 },
  ecranReference: 1440,
  libelle: { centre: { commander: 0.34, reserver: 0.34 } },
};

export const VARIANTES = { mobile: MOBILE, large: LARGE } as const;
export type Variante = keyof typeof VARIANTES;

/** Angles (degrés) des points de lumière sur l'intrados, selon la portée. */
export function anglesLumieres(portee: number): readonly number[] {
  // Arches-boutons : les lumières restent au-dessus du libellé
  if (portee >= 100) return [36, 63, 90, 117, 144];
  if (portee >= 56) return [28, 90, 152];
  return [35, 90, 145];
}

/** Allumage au défilement du hero (progression 0 → 1). */
export const ALLUMAGE = {
  /** Les arches à droite de Commander s'allument entre ces deux progressions, de gauche à droite. */
  premier: 0.02,
  dernier: 0.5,
  /** Durée d'allumage d'une travée, en progression (reportée dans pont.module.css). */
  fenetre: 0.06,
  /** À l'arrivée, les lumières courent jusqu'à Commander, qui s'allume à cet instant (s). */
  commander: 2.3,
  ecart: 0.16,
  premierDelai: 0.9,
} as const;
