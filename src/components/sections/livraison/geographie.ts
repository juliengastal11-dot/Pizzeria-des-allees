/**
 * Géographie réelle de la zone de livraison.
 * Coordonnées officielles (geo.api.gouv.fr pour les communes, adresse.data.gouv.fr pour le 43).
 *
 * ⚠ Les clés suivent `site.livraison.communes` : ajouter une commune dans src/config/site.ts
 * demande d'ajouter ici ses coordonnées (longitude, latitude). Sans elles, la commune reste
 * dans la liste mais n'a pas de point sur la carte et n'entre pas dans le tracé de la zone.
 * La position du restaurant, elle, est dans site.adresse.geo.
 */

import { site } from "@/config/site";

/** [longitude, latitude] en degrés décimaux (WGS 84). */
export type Coordonnees = readonly [lon: number, lat: number];

/** Côté de l'étiquette par rapport au point, choisi pour éviter les chevauchements sur mobile. */
export type Cote = "droite" | "gauche" | "dessus" | "dessous";

export type Lieu = {
  coord: Coordonnees;
  cote: Cote;
  /** Étiquette sur plusieurs lignes (sinon une seule ligne, jamais coupée au trait d'union). */
  lignes?: readonly string[];
};

/** Le 43, 43 Allées Paul Riquet (site.adresse.geo). */
export const RESTAURANT: Coordonnees = [site.adresse.geo.longitude, site.adresse.geo.latitude];

export const LIEUX: Partial<Record<string, Lieu>> = {
  Béziers: { coord: [3.2342, 43.3481], cote: "droite" },
  "Villeneuve-lès-Béziers": { coord: [3.2909, 43.3178], cote: "gauche" },
  "Boujan-sur-Libron": { coord: [3.2628, 43.3803], cote: "droite", lignes: ["Boujan-", "sur-Libron"] },
  "Lignan-sur-Orb": { coord: [3.1728, 43.383], cote: "droite" },
  Sauvian: { coord: [3.2541, 43.2885], cote: "gauche" },
  Sérignan: { coord: [3.3011, 43.271], cote: "gauche" },
  Corneilhan: { coord: [3.1927, 43.4026], cote: "droite" },
};

/* ------------------------------------------------------------------------
 * Calculs (projection locale en kilomètres autour du 43 : largement assez
 * précise à l'échelle d'une vingtaine de kilomètres)
 * --------------------------------------------------------------------- */

const KM_PAR_DEGRE_LAT = 110.574;
const KM_PAR_DEGRE_LON = 111.32 * Math.cos((RESTAURANT[1] * Math.PI) / 180);

type Plan = { x: number; y: number };

function versPlan([lon, lat]: Coordonnees): Plan {
  return { x: (lon - RESTAURANT[0]) * KM_PAR_DEGRE_LON, y: (lat - RESTAURANT[1]) * KM_PAR_DEGRE_LAT };
}

function versCoord({ x, y }: Plan): [number, number] {
  return [RESTAURANT[0] + x / KM_PAR_DEGRE_LON, RESTAURANT[1] + y / KM_PAR_DEGRE_LAT];
}

/** Distance à vol d'oiseau, en kilomètres. */
export function distanceKm(a: Coordonnees, b: Coordonnees): number {
  const p = versPlan(a);
  const q = versPlan(b);
  return Math.hypot(q.x - p.x, q.y - p.y);
}

/** « au nord », « au nord-est »… (site.textes.livraison.communes.directions), dans le sens des aiguilles d'une montre. */
const DIRECTIONS: readonly string[] = site.textes.livraison.communes.directions;

/** Direction de `b` vue depuis `a`, en toutes lettres (« au sud-est »). */
export function direction(a: Coordonnees, b: Coordonnees): string {
  const p = versPlan(a);
  const q = versPlan(b);
  const cap = (Math.atan2(q.x - p.x, q.y - p.y) * 180) / Math.PI; // 0 = nord, 90 = est
  return DIRECTIONS[Math.round(((cap + 360) % 360) / 45) % 8];
}

/** Enveloppe convexe (chaîne monotone d'Andrew), sens trigonométrique. */
function enveloppe(points: Plan[]): Plan[] {
  const tries = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (tries.length < 3) return tries;
  const croix = (o: Plan, a: Plan, b: Plan) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const bas: Plan[] = [];
  for (const p of tries) {
    while (bas.length >= 2 && croix(bas[bas.length - 2], bas[bas.length - 1], p) <= 0) bas.pop();
    bas.push(p);
  }
  const haut: Plan[] = [];
  for (const p of [...tries].reverse()) {
    while (haut.length >= 2 && croix(haut[haut.length - 2], haut[haut.length - 1], p) <= 0) haut.pop();
    haut.push(p);
  }
  return [...bas.slice(0, -1), ...haut.slice(0, -1)];
}

/**
 * Contour de la zone de livraison : l'enveloppe des communes et du 43, élargie de `margeKm`
 * avec des angles arrondis (tampon lisse, comme un bassin). Anneau GeoJSON fermé.
 */
export function zoneLivraison(points: readonly Coordonnees[], margeKm = 2.2): [number, number][] {
  const coque = enveloppe([RESTAURANT, ...points].map(versPlan));
  const n = coque.length;
  const anneau: [number, number][] = [];
  const normale = (a: Plan, b: Plan) => {
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return Math.atan2(-(b.x - a.x) / l, (b.y - a.y) / l); // normale extérieure (sens trigonométrique)
  };
  for (let i = 0; i < n; i++) {
    const avant = coque[(i - 1 + n) % n];
    const ici = coque[i];
    const apres = coque[(i + 1) % n];
    const debut = normale(avant, ici);
    let fin = normale(ici, apres);
    while (fin < debut) fin += 2 * Math.PI;
    const pas = Math.max(2, Math.ceil((fin - debut) / (Math.PI / 18)));
    for (let k = 0; k <= pas; k++) {
      const t = debut + ((fin - debut) * k) / pas;
      anneau.push(versCoord({ x: ici.x + margeKm * Math.cos(t), y: ici.y + margeKm * Math.sin(t) }));
    }
  }
  anneau.push(anneau[0]);
  return anneau;
}

/** Trajet légèrement bombé du 43 vers une commune, comme une route (LineString GeoJSON). */
export function trajet(vers: Coordonnees, courbure = 0.16, segments = 40): [number, number][] {
  const a = versPlan(RESTAURANT);
  const b = versPlan(vers);
  const c = { x: (a.x + b.x) / 2 - (b.y - a.y) * courbure, y: (a.y + b.y) / 2 + (b.x - a.x) * courbure };
  const ligne: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    ligne.push(versCoord({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y }));
  }
  return ligne;
}

/** Emprise [ouest, sud, est, nord] d'un ensemble de points. */
export function emprise(points: readonly Coordonnees[]): [number, number, number, number] {
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}
