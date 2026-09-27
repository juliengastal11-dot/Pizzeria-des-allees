/**
 * Géométrie du hero, à régler ici.
 *
 * La fresque (vidéo, poster, horizon détouré) est une scène 16:9 (1280 × 720).
 * La scène couvre toute la bande du hero, comme un object-fit: cover (voir
 * `.scene` dans hero.module.css) : titre et horizon s'y placent en % de la
 * scène, donc restent calés sur la cathédrale quel que soit l'écran.
 * Dans la scène (conteneur CSS), 1cqw = 1 % de sa largeur ; sa hauteur vaut 56,25cqw.
 *
 * Relevés sur fresque-paysage-horizon.webp :
 * - flèche de Saint-Nazaire : y ≈ 26,4 % (x ≈ 57 %) ; tours : y ≈ 27-29 % (x 51-58 %) ;
 * - cathédrale : x 44,5 % → 76 %, du haut des toits (y ≈ 40-44 %) à la colline ;
 * - colline boisée : x 39 % → 81 %, jusqu'à y ≈ 64 % ;
 * - silhouette opaque (le reste est vivant) : x 38 % → 82 %, y 16 % → 70 %, bords fondus.
 */

/** Cadrage de la scène dans la bande : fraction du débord gardée à gauche / en haut (0,5 = centré). */
export const SCENE = {
  /** Sur téléphone, la bande ne montre qu'une tranche : centrée sur la cathédrale (x ≈ 60 %). */
  x: 0.68,
  /** Sur ordinateur, la bande rogne le haut et le bas : un peu de ciel, plus d'Orb coupé. */
  y: 0.3,
} as const;

/** Titre H1 posé dans le ciel, au-dessus de la cathédrale, qui se lève derrière elle. */
export const TITRE = {
  /** « La Pizzeria » ≈ 28 % de la largeur de la scène. */
  taille: "4.6cqw",
  interligne: 1.02,
  /** Boîte de la ligne 1 au repos : centrée sur la cathédrale, dans le ciel (glyphes ≈ 9,5 % → 25,7 %). */
  gauche: "45.5%",
  haut: "8.5%",
  /** Décalage de « des Allées » vers la droite. */
  retraitLigne2: "4.9cqw",
  /** Départ : 35,6 % de la hauteur plus bas, entièrement caché par la cathédrale et la colline. */
  depart: "20cqw",
  duree: "2.2s",
  delai: "0.35s",
  /** La seconde ligne suit la première. */
  decalageLigne2: "0.12s",
  courbe: "cubic-bezier(0.3, 0.42, 0.28, 1)",
  /** Au défilement, le titre continue de monter (en % de la hauteur de la scène). */
  finDefilement: "-18%",
} as const;

/** Paysage (poster + vidéo + horizon) au défilement : descend et grossit, sans découvrir le haut. */
export const PAYSAGE = {
  yFin: "4%",
  echelleFin: 1.08,
} as const;

/** Ciel de la fresque (relevé sur le poster) : visible un instant, avant le chargement. */
export const CIEL_FRESQUE = "linear-gradient(#1c6cbe, #4f81c7 30%, #b6bede 56%, #8a7358 68%, #3b4a36)";

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
