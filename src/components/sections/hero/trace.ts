import { ALLUMAGE, anglesLumieres, VARIANTES, type Cta, type Variante, type VarianteDef } from "./geometrie";

/**
 * Plan du Pont Vieux, calculé une fois côté serveur à partir de geometrie.ts :
 * chemins SVG du dessin, boîtes des deux arches-boutons, points de lumière.
 * Coordonnées en pixels CSS, origine en haut à gauche de la boîte du pont,
 * dont le milieu est posé au milieu de l'écran.
 */

/** Arrondi au dixième : chemins compacts et identiques d'un moteur à l'autre. */
const n = (v: number) => Math.round(v * 10) / 10;

type Arche = { x0: number; x1: number; cx: number; r: number; h: number; portee: number; cta?: Cta };
type Point = readonly [number, number];

export type ArcheBouton = {
  /** Boîte de l'ouverture : de la clé à la ligne d'eau. */
  gauche: number;
  haut: number;
  largeur: number;
  hauteur: number;
  rayon: number;
  /** Hauteur du centre du libellé au-dessus de la ligne d'eau. */
  centreLibelle: number;
  intrados: string;
  extrados: string;
  reflet: string;
};

export type Travee = {
  /** Sommets = points de lumière (marqueurs SVG). */
  feux: string;
  reflets: string;
  /** Progression du défilement à laquelle la travée s'allume. */
  debut: number;
  /** Allumage à l'arrivée (s), ou null si elle attend le défilement. */
  delai: number | null;
};

export type PlanPont = {
  largeur: number;
  hauteur: number;
  eau: number;
  intrados: string;
  extrados: string;
  reflets: string;
  becs: string;
  oculi: string;
  /** Maçonnerie pleine évidée par les arches, et son reflet. */
  corps: string;
  corpsReflet: string;
  cordon: string;
  parapet: string;
  ligneEau: string;
  rides: { d: string; tirets: string; decalage: number; orb?: boolean }[];
  boutons: Record<Cta, ArcheBouton>;
  travees: Travee[];
  feu: VarianteDef["feu"];
};

const arcHaut = (a: Arche, eau: number) =>
  `M${n(a.x0)} ${n(eau)}V${n(eau - a.h)}A${n(a.r)} ${n(a.r)} 0 0 1 ${n(a.x1)} ${n(eau - a.h)}V${n(eau)}`;

const extrados = (a: Arche, eau: number, e: number) => {
  const R = a.r + e;
  return `M${n(a.cx - R)} ${n(eau - a.h)}A${n(R)} ${n(R)} 0 0 1 ${n(a.cx + R)} ${n(eau - a.h)}`;
};

/** Reflet : l'arche retournée sur la ligne d'eau et écrasée. */
const arcReflet = (a: Arche, eau: number, k: number) =>
  `M${n(a.x0)} ${n(eau)}V${n(eau + a.h * k)}A${n(a.r)} ${n(a.r * k)} 0 0 0 ${n(a.x1)} ${n(eau + a.h * k)}V${n(eau)}`;

const cercle = (cx: number, cy: number, r: number) =>
  `M${n(cx + r)} ${n(cy)}A${n(r)} ${n(r)} 0 1 0 ${n(cx - r)} ${n(cy)}A${n(r)} ${n(r)} 0 1 0 ${n(cx + r)} ${n(cy)}`;

const sommets = (points: Point[]) => points.map(([x, y], i) => `${i ? "L" : "M"}${n(x)} ${n(y)}`).join("");

function calculer(v: VarianteDef): PlanPont {
  // 1. Arches posées de gauche à droite, puis recentrées sur le couple Commander / Réserver
  let x = 0;
  const brutes: Arche[] = v.arches.map((def) => {
    const a = { x0: x, x1: x + def.portee, cx: x + def.portee / 2, r: def.portee / 2, h: def.pied, portee: def.portee, cta: def.cta };
    x += def.portee + v.pile;
    return a;
  });
  const commander = brutes.find((a) => a.cta === "commander");
  const reserver = brutes.find((a) => a.cta === "reserver");
  if (!commander || !reserver) throw new Error("Il faut une arche Commander et une arche Réserver");
  const milieu = (commander.x0 + reserver.x1) / 2;
  const demi = Math.max(milieu - brutes[0].x0, brutes[brutes.length - 1].x1 - milieu);
  const arches = brutes.map((a) => ({ ...a, x0: a.x0 - milieu + demi, x1: a.x1 - milieu + demi, cx: a.cx - milieu + demi }));
  const largeur = 2 * demi;

  // 2. Tablier : parabole très plate, assez haute pour passer au-dessus de chaque extrados
  const u = (px: number) => (px - demi) / demi;
  const hauteurMini = (a: Arche) => a.h + a.r + v.archivolte + v.degagement;
  const sommetTablier = Math.max(...arches.map((a) => hauteurMini(a) + v.bosse * u(a.cx) ** 2));
  const tablier = (px: number) => sommetTablier - v.bosse * u(px) ** 2; // hauteur au-dessus de l'eau
  // Ligne d'eau : sous les lanternes du parapet et leur halo
  const eau = n(sommetTablier + v.parapet + v.lanterne + v.feu.halo + 2);
  const y = (h: number) => eau - h;

  // 3. Piles : avant-becs, oculi, lanternes
  const becs: string[] = [];
  const oculi: string[] = [];
  const pointsPile: { lanterne: Point; oculus?: Point }[] = [];
  for (let i = 0; i < arches.length - 1; i++) {
    const g = arches[i];
    const d = arches[i + 1];
    const xm = (g.x1 + d.x0) / 2;
    const p = d.x0 - g.x1;
    // Avant-bec vu d'un peu au-dessus : la proue de la pile fend l'eau en pointe
    const proue = p * 0.42;
    becs.push(`M${n(g.x1)} ${eau}L${n(xm)} ${n(eau + proue)}L${n(d.x0)} ${eau}Z`);

    // Oculus : le plus grand possible (≤ 30 % de la pile) entre les deux extrados, sous le tablier
    const Rg = g.r + v.archivolte;
    const Rd = d.r + v.archivolte;
    const plafond = tablier(xm) - 3;
    let oculus: Point | undefined;
    for (let ro = p * 0.3; ro >= 3; ro -= 0.5) {
      const possibles: number[] = [];
      for (let hc = Math.max(g.h, d.h) + ro; hc <= plafond - ro; hc += 0.5) {
        const dg = Math.hypot(xm - g.cx, hc - g.h) - Rg;
        const dd = Math.hypot(d.cx - xm, hc - d.h) - Rd;
        if (dg >= ro + 2 && dd >= ro + 2) possibles.push(hc);
      }
      if (possibles.length) {
        const hc = (possibles[0] + possibles[possibles.length - 1]) / 2;
        oculi.push(cercle(xm, y(hc), ro));
        oculus = [xm, y(hc)];
        break;
      }
    }
    pointsPile.push({ lanterne: [xm, y(tablier(xm) + v.parapet + v.lanterne)], oculus });
  }

  // 4. Tablier et parapet (Bézier quadratique = parabole exacte), à l'endroit ou reflétés dans l'eau
  const parabole = (decalage: number, k = -1) => {
    const bord = eau + k * (tablier(0) + decalage);
    const milieu = eau + k * (tablier(demi) + decalage);
    return { bord, controle: 2 * milieu - bord };
  };
  const courbe = (decalage: number) => {
    const { bord, controle } = parabole(decalage);
    return `M0 ${n(bord)}Q${n(demi)} ${n(controle)} ${n(largeur)} ${n(bord)}`;
  };
  /** Silhouette pleine (du parapet à l'eau), évidée par les arches (règle evenodd). */
  const silhouette = (k: number) => {
    const { bord, controle } = parabole(v.parapet, k);
    const ouvertures = arches.map((a) => `${k < 0 ? arcHaut(a, eau) : arcReflet(a, eau, v.reflet)}Z`).join("");
    return `M0 ${eau}V${n(bord)}Q${n(demi)} ${n(controle)} ${n(largeur)} ${n(bord)}V${eau}Z${ouvertures}`;
  };

  // 5. Arches-boutons
  const bouton = (a: Arche): ArcheBouton => ({
    gauche: n(a.x0),
    haut: n(y(a.h + a.r)),
    largeur: n(a.portee),
    hauteur: n(a.h + a.r),
    rayon: n(a.r),
    centreLibelle: n(a.h + a.r * v.libelle.centre[a.cta as Cta]),
    intrados: arcHaut(a, eau),
    extrados: extrados(a, eau, v.archivolte),
    reflet: arcReflet(a, eau, v.reflet),
  });
  const simples = arches.filter((a) => !a.cta);

  // 6. Travées (une arche + la pile à sa droite) : lumières, reflets, ordre d'allumage
  const iCommander = arches.findIndex((a) => a.cta === "commander");
  const iReserver = arches.findIndex((a) => a.cta === "reserver");
  const ecran = (a: Arche) => Math.min(Math.max((a.cx - demi) / v.ecranReference + 0.5, 0), 1);
  const uCommander = ecran(arches[iCommander]);
  const reflete = ([px, py]: Point): Point => [px, eau + (eau - py) * v.reflet];

  const travees: Travee[] = arches.map((a, i) => {
    const rayon = a.r - (a.portee >= 100 ? 4 : 3);
    const feux: Point[] = anglesLumieres(a.portee).map((deg) => {
      const t = (deg * Math.PI) / 180;
      return [a.cx - rayon * Math.cos(t), y(a.h) - rayon * Math.sin(t)];
    });
    const pile = pointsPile[i];
    if (pile) {
      feux.push(pile.lanterne);
      if (pile.oculus) feux.push(pile.oculus);
    }
    const auChargement = i <= iCommander;
    const debut = auChargement
      ? ALLUMAGE.premier
      : n(1000 * (ALLUMAGE.premier + ((ecran(a) - uCommander) / (1 - uCommander)) * (ALLUMAGE.dernier - ALLUMAGE.premier))) / 1000;
    return {
      feux: sommets(feux),
      reflets: sommets(feux.map(reflete)),
      debut,
      delai: auChargement ? n(Math.max(ALLUMAGE.premierDelai, ALLUMAGE.commander - (iCommander - i) * ALLUMAGE.ecart) * 100) / 100 : null,
    };
  });

  // 7. L'Orb : ligne d'eau et rides
  const rides = [
    { d: `M0 ${n(eau + 6)}H${n(largeur)}`, tirets: "14 22", decalage: 3 },
    { d: `M0 ${n(eau + 14)}H${n(largeur)}`, tirets: "8 30", decalage: 17, orb: true },
    { d: `M0 ${n(eau + 25)}H${n(largeur)}`, tirets: "20 44", decalage: 31 },
  ];

  const profondeur = Math.max(...pointsPile.map((pp) => reflete(pp.lanterne)[1])) + v.feu.halo * 2;

  return {
    largeur: n(largeur),
    hauteur: Math.ceil(profondeur),
    eau,
    intrados: simples.map((a) => arcHaut(a, eau)).join(""),
    extrados: simples.map((a) => extrados(a, eau, v.archivolte)).join(""),
    reflets: simples.map((a) => arcReflet(a, eau, v.reflet)).join(""),
    becs: becs.join(""),
    oculi: oculi.join(""),
    corps: silhouette(-1),
    corpsReflet: silhouette(v.reflet),
    cordon: courbe(0),
    parapet: courbe(v.parapet),
    ligneEau: `M0 ${eau}H${n(largeur)}`,
    rides,
    boutons: { commander: bouton(arches[iCommander]), reserver: bouton(arches[iReserver]) },
    travees,
    feu: v.feu,
  };
}

export const PLANS: Record<Variante, PlanPont> = {
  mobile: calculer(VARIANTES.mobile),
  large: calculer(VARIANTES.large),
};

