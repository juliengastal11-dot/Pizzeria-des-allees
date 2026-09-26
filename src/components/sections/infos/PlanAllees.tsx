"use client";

import { useId, useRef, type SVGProps } from "react";
import { motion, useScroll, useTransform, type MotionValue, type Variants } from "motion/react";
import { useMouvementReduit } from "@/components/sections/infos/useMouvementReduit";
import { site } from "@/config/site";

/*
 * Plan illustré des Allées Paul-Riquet, la nuit, relevé sur OpenStreetMap et la
 * Base Adresse Nationale (septembre 2026) : le Théâtre au nord, la promenade et
 * ses quatre rangées de platanes, la statue de Riquet dans sa clairière, la place
 * Jean-Jaurès et ses pelouses côté ouest, le Plateau des Poètes au sud, et la
 * pizzeria côté est (numéros impairs), entre l'avenue Camille-Saint-Saëns et la
 * rue Victor-Hugo, juste en face de la statue.
 * Les lampes de la promenade s'allument au fil du défilement, jusqu'à la
 * pizzeria qui brille en or. Uniquement des bleus du site, du calcaire et de l'or.
 * Deux dispositions : à l'horizontale (nord à gauche, est en haut) sur mobile et
 * en bureau, où la carte est large ; à la verticale (nord en haut, est à droite)
 * sur tablette, où la colonne est étroite et haute.
 */

const PLAN = site.textes.infos.plan;

/*
 * Relevé, en mètres : s = distance le long de l'axe depuis le bout nord des
 * Allées (vers le sud), t = écart à l'axe (positif vers l'est).
 */
type Troncon = readonly [debut: number, fin: number];

const RELEVE = {
  theatre: { s: [26, 80], t: [-21, 11] },
  promenade: { s: [96, 572], t: [-22, 12] },
  routeEst: [12, 20],
  voieOuest: [-29, -22],
  carrefourSud: [578, 602],
  plateau: 614,
  /** Bâti côté est (numéros impairs) et côté ouest (pairs) : profondeur, puis tronçons entre deux rues. */
  batiEst: { t: [22, 70], troncons: [[0, 137], [146, 388], [398, 411], [444, 446], [455, 510], [519, 578]] },
  batiOuest: { t: [-130, -33], troncons: [[0, 150], [158, 336], [444, 502], [510, 578]] },
  /** Rues transversales (Saint-Saëns à 388–398, Victor-Hugo à 446–455, autour de la place Jean-Jaurès). */
  ruesEst: [[137, 146], [388, 398], [446, 455], [510, 519]],
  ruesOuest: [[150, 158], [336, 344], [436, 444], [502, 510]],
  /** Place Jean-Jaurès, face à la statue : un parvis ouvert sur la promenade, quatre pelouses, des arbres en grille. */
  place: { s: [344, 436], t: [-130, -22] },
  pelouses: [
    { s: [352, 384], t: [-89, -36] },
    { s: [396, 428], t: [-89, -36] },
    { s: [352, 384], t: [-117, -92] },
    { s: [396, 428], t: [-117, -92] },
  ],
  arbresPlace: { s: [360, 376, 404, 420], t: [-48, -70, -104] },
  /** Rangées de platanes (écart à l'axe), plantées de 106 à 566 m ; les deux du milieu s'ouvrent autour de la statue. */
  rangees: [10, 2, -13, -20],
  plantation: [106, 566],
  clairiere: [368, 412],
  riquet: { s: 390, t: -7 },
  /** Axe de l'allée centrale, où sont les lampes. */
  lampes: -5.5,
  /** Façade de la pizzeria (43 Allées Paul Riquet, côté est, vers 421–435 m), élargie pour rester lisible, et sa porte. */
  pizzeria: { s: [413, 442], porte: 428 },
} as const satisfies Record<string, unknown>;

/** Échelle linéaire par morceaux : repères [valeur relevée, coordonnée du plan], valeurs croissantes. */
function echelle(reperes: readonly (readonly [number, number])[]) {
  return (v: number) => {
    let i = 1;
    while (i < reperes.length - 1 && v > reperes[i][0]) i++;
    const [a, pa] = reperes[i - 1];
    const [b, pb] = reperes[i];
    return pa + ((v - a) * (pb - pa)) / (b - a);
  };
}

type Rect = { x: number; y: number; l: number; h: number };
type Point = { x: number; y: number };
type Etiquette = {
  lignes: readonly string[];
  x: number;
  y: number;
  ancre: "start" | "middle" | "end";
  rotation?: number;
  interligne?: number;
  /** Écrit sur la façade dorée (texte nuit), au lieu d'à côté. */
  enseigne?: boolean;
};

type Disposition = {
  largeur: number;
  hauteur: number;
  /** Taille des libellés, en unités du plan (≈ 13 à 14 px affichés). */
  police: number;
  horizontal: boolean;
  /** Le long de l'axe : s (m) → coordonnée du plan. Étirée autour de la statue et de la pizzeria. */
  long: (s: number) => number;
  /** En travers : t (m) → coordonnée du plan. La promenade est élargie pour lire ses rangées. */
  travers: (t: number) => number;
  pasPlatanes: number;
  pasLampes: number;
  arbresPlateau: readonly Point[];
  etiquettes: { theatre: Etiquette; plateau: Etiquette; riquet: Etiquette; pizzeria: Etiquette };
  /** Tronçons (coordonnées le long de l'axe) où les façades restent sans fenêtre, sous un libellé. */
  sansFenetres: Troncon;
};

// Nord à gauche, est en haut : la pizzeria est sur la rangée du haut
const long_h = echelle([
  [-30, 0],
  [0, 6],
  [26, 10],
  [80, 56],
  [96, 64],
  [340, 164],
  [440, 258],
  [572, 306],
  [602, 320],
  [614, 326],
  [760, 432],
]);
const travers_h = echelle([
  [-130, 250],
  [-118, 240],
  [-33, 169],
  [-29, 163],
  [-22, 152],
  [12, 48],
  [20, 33],
  [22, 30],
  [60, 0],
  [70, -8],
]);

const HORIZONTAL: Disposition = {
  largeur: 432,
  hauteur: 240,
  police: 16,
  horizontal: true,
  long: long_h,
  travers: travers_h,
  pasPlatanes: 13.5,
  pasLampes: 15,
  arbresPlateau: [
    { x: 346, y: 28 },
    { x: 414, y: 34 },
    { x: 344, y: 208 },
    { x: 418, y: 200 },
    { x: 382, y: 222 },
    { x: 364, y: 46 },
  ],
  etiquettes: {
    theatre: { lignes: [PLAN.theatre], x: (long_h(26) + long_h(80)) / 2, y: (travers_h(11) + travers_h(-21)) / 2, ancre: "middle", rotation: -90 },
    plateau: { lignes: PLAN.plateau.split(" ").length > 1 ? [PLAN.plateau.split(" ")[0], PLAN.plateau.split(" ").slice(1).join(" ")] : [PLAN.plateau], x: 380, y: 114, ancre: "middle", interligne: 19 },
    riquet: { lignes: [PLAN.statue], x: long_h(390), y: travers_h(-7) + 25, ancre: "middle" },
    pizzeria: { lignes: [PLAN.pizzeria], x: long_h(413) - 5, y: 20.5, ancre: "end" },
  },
  sansFenetres: [long_h(240), long_h(413)],
};

// Nord en haut, est à droite : la pizzeria est dans la colonne de droite
const long_v = echelle([
  [-30, 0],
  [0, 6],
  [26, 10],
  [80, 52],
  [96, 60],
  [340, 190],
  [440, 300],
  [572, 354],
  [602, 366],
  [614, 372],
  [720, 460],
]);
const travers_v = echelle([
  [-130, -8],
  [-118, 0],
  [-33, 56],
  [-29, 60],
  [-22, 70],
  [12, 210],
  [20, 226],
  [22, 230],
  [60, 320],
  [70, 330],
]);

const VERTICAL: Disposition = {
  largeur: 320,
  hauteur: 460,
  police: 15,
  horizontal: false,
  long: long_v,
  travers: travers_v,
  pasPlatanes: 14,
  pasLampes: 16,
  arbresPlateau: [
    { x: 26, y: 392 },
    { x: 296, y: 390 },
    { x: 44, y: 444 },
    { x: 282, y: 446 },
    { x: 94, y: 450 },
    { x: 232, y: 448 },
  ],
  etiquettes: {
    theatre: { lignes: [PLAN.theatre], x: (travers_v(-21) + travers_v(11)) / 2, y: (long_v(26) + long_v(80)) / 2 + 5, ancre: "middle" },
    plateau: { lignes: [PLAN.plateau], x: 160, y: 420, ancre: "middle" },
    riquet: { lignes: [PLAN.statue], x: travers_v(-7), y: long_v(390) + 26, ancre: "middle" },
    pizzeria: { lignes: [PLAN.pizzeria], x: (travers_v(22) + 320) / 2 + 2, y: (long_v(413) + long_v(442)) / 2 + 4.5, ancre: "middle", enseigne: true },
  },
  sansFenetres: [0, 0],
};

/* ------------------------------------------------------------------------
 * Géométrie du plan, calculée une fois par disposition
 * --------------------------------------------------------------------- */

function zone(d: Disposition, s: Troncon, t: Troncon): Rect {
  const a = d.long(s[0]);
  const b = d.long(s[1]);
  const c = d.travers(t[0]);
  const e = d.travers(t[1]);
  const [x0, x1, y0, y1] = d.horizontal ? [a, b, c, e] : [c, e, a, b];
  return { x: Math.min(x0, x1), y: Math.min(y0, y1), l: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
}

/** Point du plan à partir d'une position le long de l'axe `u` (déjà en unités du plan) et d'un écart `t` (m). */
const surAxe = (d: Disposition, u: number, t: number): Point => (d.horizontal ? { x: u, y: d.travers(t) } : { x: d.travers(t), y: u });
const point = (d: Disposition, s: number, t: number): Point => surAxe(d, d.long(s), t);

/** Positions régulières le long de l'axe, entre deux abscisses du plan, hors d'un intervalle. */
function jalons(debut: number, fin: number, pas: number, sauf?: Troncon): number[] {
  const n = Math.max(1, Math.round((fin - debut) / pas));
  return Array.from({ length: n + 1 }, (_, i) => debut + ((fin - debut) * i) / n).filter((u) => !sauf || u < sauf[0] || u > sauf[1]);
}

// Fenêtres encore éclairées dans les façades (positions relatives), en motifs qui alternent
const MOTIFS_FENETRES: readonly (readonly [number, number])[][] = [
  [
    [0.3, 0.4],
    [0.72, 0.64],
  ],
  [[0.5, 0.52]],
  [
    [0.22, 0.62],
    [0.58, 0.34],
    [0.82, 0.68],
  ],
  [],
  [[0.38, 0.44]],
];

function construire(d: Disposition) {
  const R = RELEVE;
  const cadre: Rect = { x: 0, y: 0, l: d.largeur, h: d.hauteur };
  const visible = (r: Rect): Rect => {
    const x = Math.max(r.x, cadre.x);
    const y = Math.max(r.y, cadre.y);
    return { x, y, l: Math.min(r.x + r.l, cadre.l) - x, h: Math.min(r.y + r.h, cadre.h) - y };
  };

  // Façades : chaque tronçon est découpé en immeubles d'environ 40 unités, séparés d'un fin joint
  const facades: { r: Rect; fenetres: Point[] }[] = [];
  let k = 0;
  for (const [cote, bati] of [["est", R.batiEst], ["ouest", R.batiOuest]] as const) {
    for (const [s0, s1] of bati.troncons) {
      const u0 = d.long(s0);
      const u1 = d.long(s1);
      const n = Math.max(1, Math.round((u1 - u0) / 40));
      for (let i = 0; i < n; i++) {
        const a = u0 + ((u1 - u0) * i) / n + (i > 0 ? 1.25 : 0);
        const b = u0 + ((u1 - u0) * (i + 1)) / n - (i < n - 1 ? 1.25 : 0);
        const [t0, t1] = bati.t;
        const c = d.travers(t0);
        const e = d.travers(t1);
        const r: Rect = d.horizontal
          ? { x: a, y: Math.min(c, e), l: b - a, h: Math.abs(e - c) }
          : { x: Math.min(c, e), y: a, l: Math.abs(e - c), h: b - a };
        const v = visible(r);
        const sousLibelle = cote === "est" && b > d.sansFenetres[0] && a < d.sansFenetres[1];
        const fenetres = sousLibelle || v.l <= 0 || v.h <= 0 ? [] : MOTIFS_FENETRES[k % MOTIFS_FENETRES.length].map(([fx, fy]) => ({ x: v.x + fx * v.l, y: v.y + fy * v.h }));
        k++;
        facades.push({ r, fenetres });
      }
    }
  }

  const routes: Rect[] = [
    zone(d, [-30, R.carrefourSud[1]], R.routeEst),
    zone(d, [-30, R.place.s[0]], R.voieOuest),
    zone(d, [R.place.s[1], R.carrefourSud[1]], R.voieOuest),
    zone(d, R.carrefourSud, [-140, 80]),
    ...R.ruesEst.map((s) => zone(d, s, [R.routeEst[1], 80])),
    ...R.ruesOuest.map((s) => zone(d, s, [-140, R.voieOuest[0]])),
  ];

  const debutPromenade = d.long(R.promenade.s[0]);
  const finPromenade = d.long(R.promenade.s[1]);
  const clairiere: Troncon = [d.long(R.clairiere[0]), d.long(R.clairiere[1])];
  const rang = (u: number) => (u - debutPromenade) / (finPromenade - debutPromenade);

  const platanes = R.rangees.flatMap((t) =>
    jalons(d.long(R.plantation[0]), d.long(R.plantation[1]), d.pasPlatanes, t === 2 || t === -13 ? clairiere : undefined).map((u) => surAxe(d, u, t)),
  );
  // Une lampe sur deux intervalles de l'allée centrale, en s'écartant de la statue et de son nom
  const lampes = jalons(d.long(R.plantation[0]), d.long(R.plantation[1]), d.pasLampes, [clairiere[0] - 4, clairiere[1] + 4]).map((u) => ({
    p: surAxe(d, u, R.lampes),
    rang: rang(u),
  }));

  return {
    facades,
    routes,
    theatre: zone(d, R.theatre.s, R.theatre.t),
    // Trois baies éclairées sur la façade du Théâtre, face à la promenade
    baies: [5, -5, -15].map((t) => point(d, R.theatre.s[1] - 5, t)),
    plateau: zone(d, [R.plateau, 900], [-140, 80]),
    place: zone(d, R.place.s, R.place.t),
    pelouses: R.pelouses.map((p) => zone(d, p.s, p.t)),
    arbresPlace: R.arbresPlace.s.flatMap((s) => R.arbresPlace.t.map((t) => point(d, s, t))),
    promenade: zone(d, R.promenade.s, R.promenade.t),
    platanes,
    lampes,
    riquet: point(d, R.riquet.s, R.riquet.t),
    pizzeria: zone(d, R.pizzeria.s, [R.batiEst.t[0], 80]),
    porte: point(d, R.pizzeria.porte, R.batiEst.t[0] - 1),
    rangPizzeria: rang(d.long(R.pizzeria.porte)),
  };
}

const GEOMETRIES = new Map<Disposition, ReturnType<typeof construire>>([
  [HORIZONTAL, construire(HORIZONTAL)],
  [VERTICAL, construire(VERTICAL)],
]);

/** Part du défilement à laquelle s'allume la lampe de rang `t` (0 → 1 le long de la promenade). */
const seuil = (t: number) => t * 0.8;

const rangees: Variants = { cache: {}, vu: { transition: { staggerChildren: 0.012 } } };
const platane: Variants = {
  cache: { scale: 0, opacity: 0 },
  vu: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
};

function Bloc({ zone: r, rx, className, ...reste }: { zone: Rect; rx: number; className?: string } & Omit<SVGProps<SVGRectElement>, "ref">) {
  return <rect x={r.x} y={r.y} width={r.l} height={r.h} rx={rx} className={className} {...reste} />;
}

function Libelle({ e, police, className, contour = false }: { e: Etiquette; police: number; className: string; contour?: boolean }) {
  return (
    <text
      x={e.x}
      y={e.y}
      textAnchor={e.ancre}
      transform={e.rotation ? `rotate(${e.rotation} ${e.x} ${e.y})` : undefined}
      dy={e.rotation ? "0.35em" : undefined}
      className={className}
      style={{ fontSize: police }}
      // Contour couleur de nuit sous les lettres : lisibles sur les façades et les rues
      {...(contour ? { stroke: "var(--color-minuit)", strokeWidth: 3.5, strokeLinejoin: "round" as const, paintOrder: "stroke" } : {})}
    >
      {e.lignes.map((ligne, i) => (
        <tspan key={ligne} x={e.x} dy={i === 0 ? (e.rotation ? "0.35em" : 0) : (e.interligne ?? police * 1.15)}>
          {ligne}
        </tspan>
      ))}
    </text>
  );
}

function Lampe({ p, debut, progression, allumee, halo }: { p: Point; debut: number; progression: MotionValue<number>; allumee: boolean; halo: string }) {
  const opacite = useTransform(progression, [debut, debut + 0.06], [0, 1]);
  return (
    <>
      <circle cx={p.x} cy={p.y} r={1.8} className="fill-[#9099b2]" />
      <motion.g style={{ opacity: allumee ? 1 : opacite }}>
        <circle cx={p.x} cy={p.y} r={10} fill={`url(#${halo})`} />
        <circle cx={p.x} cy={p.y} r={2.3} className="fill-halo" />
      </motion.g>
    </>
  );
}

function Plan({ d, progression, reduire, className }: { d: Disposition; progression: MotionValue<number>; reduire: boolean; className: string }) {
  const g = GEOMETRIES.get(d)!;
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const halo = `${base}-halo`;
  const lueur = `${base}-lueur`;
  const debutPizzeria = seuil(g.rangPizzeria);
  const lueurPizzeria = useTransform(progression, [debutPizzeria, debutPizzeria + 0.08], [0, 1]);
  const { riquet: s, pizzeria: p, porte } = g;

  return (
    <svg viewBox={`0 0 ${d.largeur} ${d.hauteur}`} preserveAspectRatio="xMidYMid meet" className={className} focusable="false">
      <defs>
        <radialGradient id={halo}>
          <stop offset="0" style={{ stopColor: "var(--color-halo)", stopOpacity: 0.9 }} />
          <stop offset="0.45" style={{ stopColor: "var(--color-halo)", stopOpacity: 0.35 }} />
          <stop offset="1" style={{ stopColor: "var(--color-halo)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={lueur}>
          <stop offset="0" style={{ stopColor: "var(--color-or)", stopOpacity: 0.75 }} />
          <stop offset="0.5" style={{ stopColor: "var(--color-or)", stopOpacity: 0.25 }} />
          <stop offset="1" style={{ stopColor: "var(--color-or)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Rues : les deux voies des Allées, les rues transversales, le carrefour du sud */}
      {g.routes.map((r) => (
        <Bloc key={`r${r.x}-${r.y}`} zone={r} rx={0} className="fill-grain" />
      ))}

      {/* Le Plateau des Poètes, au-delà du carrefour */}
      <Bloc zone={g.plateau} rx={22} className="fill-ciel" fillOpacity={0.1} />
      {d.arbresPlateau.map((a) => (
        <circle key={`p${a.x}-${a.y}`} cx={a.x} cy={a.y} r={5} className="fill-ciel" opacity={0.55} />
      ))}
      <Libelle e={d.etiquettes.plateau} police={d.police} className="fill-pierre font-sans font-semibold" />

      {/* Façades, dans l'ombre, avec quelques fenêtres encore éclairées */}
      {g.facades.map(({ r, fenetres }) => (
        <g key={`f${r.x}-${r.y}`}>
          <Bloc zone={r} rx={5} className="fill-minuit" />
          {fenetres.map((f) => (
            <rect key={`${f.x}-${f.y}`} x={f.x - 1.5} y={f.y - 1.8} width={3} height={3.6} rx={0.8} className="fill-halo" opacity={0.55} />
          ))}
        </g>
      ))}

      {/* Le Théâtre, au bout nord, ses trois baies tournées vers la promenade */}
      <Bloc zone={g.theatre} rx={9} className="fill-minuit stroke-filet" strokeOpacity={0.7} strokeWidth={1.2} />
      {g.baies.map((b) =>
        d.horizontal ? (
          <rect key={b.y} x={b.x - 2} y={b.y - 5} width={4} height={10} rx={2} className="fill-halo" />
        ) : (
          <rect key={b.x} x={b.x - 5} y={b.y - 2} width={10} height={4} rx={2} className="fill-halo" />
        ),
      )}
      <Libelle e={d.etiquettes.theatre} police={d.police * 0.92} className="fill-calcaire font-sans font-semibold" />

      {/* La promenade, ouverte sur le parvis de la place Jean-Jaurès et ses pelouses */}
      <Bloc zone={g.promenade} rx={6} className="fill-ciel" fillOpacity={0.16} />
      <Bloc zone={g.place} rx={0} className="fill-ciel" fillOpacity={0.16} />
      {g.pelouses.map((r) => (
        <Bloc key={`l${r.x}-${r.y}`} zone={r} rx={4} className="fill-ciel" fillOpacity={0.2} />
      ))}
      {g.arbresPlace.map((a) => (
        <circle key={`a${a.x}-${a.y}`} cx={a.x} cy={a.y} r={3.6} className="fill-ciel" opacity={0.55} />
      ))}

      {/* Lampes de l'allée centrale */}
      {g.lampes.map(({ p: l, rang }) => (
        <Lampe key={`${l.x}-${l.y}`} p={l} debut={seuil(rang)} progression={progression} allumee={reduire} halo={halo} />
      ))}

      {/* Statue de Riquet, dans sa clairière */}
      <circle cx={s.x} cy={s.y} r={13} className="fill-minuit" />
      <rect x={s.x - 9} y={s.y + 5.5} width={18} height={4} rx={2} className="fill-calcaire" />
      <rect x={s.x - 5.5} y={s.y - 3.5} width={11} height={10} rx={2.5} className="fill-calcaire" opacity={0.85} />
      <rect x={s.x - 2.5} y={s.y - 8.5} width={5} height={6} rx={2} className="fill-halo" />
      <circle cx={s.x} cy={s.y - 11} r={2.5} className="fill-halo" />
      <Libelle e={d.etiquettes.riquet} police={d.police * 0.88} className="fill-calcaire font-display font-semibold italic" />

      {/* Platanes : quatre rangées de petits disques couleur de ciel, comme sous la lune */}
      <motion.g variants={rangees} initial="cache" whileInView="vu" viewport={{ once: true, amount: 0.3 }}>
        {g.platanes.map(({ x, y }) => (
          <motion.circle
            key={`${x}-${y}`}
            variants={platane}
            cx={x}
            cy={y}
            r={3.8}
            className="fill-ciel"
            fillOpacity={0.58}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        ))}
      </motion.g>

      {/* La pizzeria : une façade d'or qui s'allume en dernier, sa porte sur le trottoir */}
      <motion.circle cx={p.x + p.l / 2} cy={porte.y} r={30} fill={`url(#${lueur})`} style={{ opacity: reduire ? 1 : lueurPizzeria }} />
      <Bloc zone={p} rx={5} className="fill-or" />
      <motion.circle cx={porte.x} cy={porte.y} r={13} fill={`url(#${halo})`} style={{ opacity: reduire ? 1 : lueurPizzeria }} />
      <circle cx={porte.x} cy={porte.y} r={4.5} className="fill-or-clair stroke-nuit" strokeWidth={2} />
      {d.etiquettes.pizzeria.enseigne ? (
        <Libelle e={d.etiquettes.pizzeria} police={d.police * 0.84} className="fill-nuit font-display font-bold italic" />
      ) : (
        <Libelle e={d.etiquettes.pizzeria} police={d.police} contour className="fill-or-clair font-display font-semibold italic" />
      )}
    </svg>
  );
}

export function PlanAllees() {
  const cadre = useRef<HTMLDivElement>(null);
  const reduire = useMouvementReduit();
  const { scrollYProgress } = useScroll({ target: cadre, offset: ["start 0.85", "end 0.5"] });

  return (
    <div ref={cadre} aria-hidden className="absolute inset-0">
      <Plan d={HORIZONTAL} progression={scrollYProgress} reduire={reduire} className="size-full md:hidden lg:block" />
      <Plan d={VERTICAL} progression={scrollYProgress} reduire={reduire} className="hidden size-full md:block lg:hidden" />
    </div>
  );
}
