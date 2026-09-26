/**
 * Géométrie du hero, à régler ici.
 *
 * La fresque (vidéo, poster, horizon détouré) est un cadre 3:4 (900 × 1200) :
 * l'arche a exactement ce rapport, donc 1 % de la fresque = 1 % de l'arche.
 * Dans l'arche (conteneur CSS), 1cqi = 1 % de sa largeur ; sa hauteur vaut 133,3cqi.
 *
 * Relevés sur fresque-horizon.webp :
 * - pointes des tours de Saint-Nazaire : y ≈ 29-31 % (x 45-62 %) ;
 * - bande opaque (cathédrale, remparts, colline) : y 48 % → 66,8 % pour x ≥ 28 % ;
 * - ciel ouvert à gauche de x ≈ 28 % jusqu'à y ≈ 52 %.
 * Le haut de l'arche est un demi-cercle (rayon 50cqi) : le titre doit y tenir.
 */

/** Titre H1 posé dans le ciel, qui se lève derrière la cathédrale. */
export const TITRE = {
  /** « La Pizzeria » ≈ 63 % de la largeur de l'arche. */
  taille: "10.3cqi",
  interligne: 1.02,
  /** Boîte de la ligne 1 au repos (glyphes ≈ 11 % → 25 % de la hauteur). */
  gauche: "21.5%",
  haut: "10.1%",
  /** Décalage de « des Allées » vers la droite. */
  retraitLigne2: "11cqi",
  /** Départ : 38 % de la hauteur plus bas, entièrement caché par la colline. */
  depart: "51cqi",
  duree: "2.2s",
  delai: "0.35s",
  /** La seconde ligne suit la première. */
  decalageLigne2: "0.12s",
  courbe: "cubic-bezier(0.3, 0.42, 0.28, 1)",
  /** Au défilement, le titre continue de monter (en % de la hauteur de l'arche). */
  finDefilement: "-18%",
} as const;

/** Paysage (poster + vidéo + horizon) au défilement : descend et grossit, sans découvrir le haut. */
export const PAYSAGE = {
  yFin: "4%",
  echelleFin: 1.08,
} as const;

/** Ciel de la fresque (relevé sur le poster) : visible un instant, avant le chargement. */
export const CIEL_FRESQUE = "linear-gradient(#0263c1, #4886d3 26%, #7aa0dc 36%, #2d4a50 62%, #1f2a18)";

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
