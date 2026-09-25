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

/** Pizza qui sort du tableau. */
export const PIZZA = {
  rotationFin: 40,
  monteeFin: -36,
} as const;

/* ---------------------------------------------------------------------------
 * Pont Vieux lumineux
 * ------------------------------------------------------------------------ */

export type Format = "mobile" | "tablette" | "bureau";

export type ArchePont = {
  /** Largeur relative (fr) par format ; absente = arche masquée dans ce format. */
  largeur: Partial<Record<Format, number>> & { bureau: number };
  /** Hauteur de l'ouverture, en % de la hauteur maximale sous le tablier. */
  hauteur: number;
  bouton?: "commander" | "reserver";
};

/**
 * Quinze arches inégales, comme le vrai pont. Les boutons sont dans la 6e et la 10e.
 * Mobile : 5 arches ; tablette : 9 ; ordinateur : 15.
 */
export const ARCHES: ArchePont[] = [
  { largeur: { bureau: 0.55 }, hauteur: 46 },
  { largeur: { bureau: 0.8 }, hauteur: 60 },
  { largeur: { tablette: 0.75, bureau: 1 }, hauteur: 70 },
  { largeur: { tablette: 0.6, bureau: 0.7 }, hauteur: 56 },
  { largeur: { mobile: 0.42, tablette: 0.85, bureau: 1.1 }, hauteur: 74 },
  { largeur: { mobile: 2.3, tablette: 3, bureau: 3.4 }, hauteur: 100, bouton: "commander" },
  { largeur: { tablette: 0.6, bureau: 0.75 }, hauteur: 60 },
  { largeur: { mobile: 0.4, tablette: 0.9, bureau: 1.05 }, hauteur: 72 },
  { largeur: { bureau: 0.6 }, hauteur: 54 },
  { largeur: { mobile: 2.9, tablette: 3.4, bureau: 3.8 }, hauteur: 100, bouton: "reserver" },
  { largeur: { mobile: 0.45, tablette: 0.85, bureau: 0.95 }, hauteur: 70 },
  { largeur: { tablette: 0.65, bureau: 0.7 }, hauteur: 58 },
  { largeur: { bureau: 0.9 }, hauteur: 66 },
  { largeur: { bureau: 0.6 }, hauteur: 52 },
  { largeur: { bureau: 0.5 }, hauteur: 44 },
];

/** Largeur des piles entre deux arches, par format. */
export const PILE: Record<Format, string> = { mobile: "6px", tablette: "8px", bureau: "10px" };

/** Angles (degrés) des points de lumière sur la courbe de chaque arche. */
export const ANGLES_LUMIERES = {
  petite: [30, 90, 150],
  bouton: [14, 52, 90, 128, 166],
} as const;

/** Compression verticale des reflets dans l'Orb. */
export const REFLET = 0.45;

/** Allumage des arches au défilement du hero (progression 0 → 1). */
export const ALLUMAGE = {
  /** Début d'allumage de la première et de la dernière arche. */
  premier: 0.015,
  dernier: 0.49,
  /** Durée d'allumage d'une arche, en progression. */
  fenetre: 0.07,
  /** À l'arrivée, les lumières courent de la première arche jusqu'à celle de Commander (délais en s). */
  delaiChargement: 1.5,
  ecartChargement: 0.18,
  eteinte: { opacite: 0.15, echelle: 0.6 },
  /** Opacité des reflets une fois allumés. */
  reflet: 0.35,
} as const;
