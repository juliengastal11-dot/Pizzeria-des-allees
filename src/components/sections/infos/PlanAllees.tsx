"use client";

import { useId, useRef, type SVGProps } from "react";
import { motion, useScroll, useTransform, type MotionValue, type Variants } from "motion/react";
import { useMouvementReduit } from "@/components/sections/infos/useMouvementReduit";
import { site } from "@/config/site";

/*
 * Plan illustré des Allées Paul-Riquet, la nuit : le Théâtre, la promenade
 * bordée de platanes, la statue de Riquet, le Plateau des Poètes et le 43.
 * Les lampes de la promenade s'allument au fil du défilement, jusqu'au 43,
 * qui brille en or. Uniquement des bleus du site, du calcaire et de l'or.
 * Deux dispositions : à l'horizontale (nord à gauche) sur mobile, pour rester
 * compacte, et en bureau où la carte est large ; à la verticale (nord en haut)
 * sur tablette, où la colonne est étroite et haute.
 */

// Libellés du plan (site.textes.infos.plan) ; le numéro affiché sur le 43 vient de l'adresse
const PLAN = site.textes.infos.plan;
const TEXTES = {
  theatre: PLAN.theatre,
  /** « Plateau » / « des Poètes » : coupé après le premier mot quand le plan est à l'horizontale. */
  plateau: [PLAN.plateau.split(" ")[0], PLAN.plateau.split(" ").slice(1).join(" ")].filter(Boolean),
  statue: PLAN.statue,
  numero: site.adresse.rue.match(/^\d+/)?.[0] ?? "",
};

type Rect = { x: number; y: number; l: number; h: number; r: number };
type Point = { x: number; y: number };
type Etiquette = { lignes: readonly string[]; x: number; y: number; ancre: "start" | "middle"; interligne?: number };

type Disposition = {
  largeur: number;
  hauteur: number;
  /** Taille des libellés, en unités du plan (≈ 14 px affichés). */
  police: number;
  routes: Rect[];
  ilots: Rect[];
  promenade: Rect;
  /** Filet pointillé à l'intérieur de la promenade. */
  bordure: Rect;
  lampes: Point[];
  platanes: Point[];
  theatre: Rect;
  /** Pied des trois fenêtres cintrées du Théâtre. */
  fenetres: Point[];
  etiquetteTheatre: Etiquette;
  plateau: Rect;
  arbresPlateau: Point[];
  etiquettePlateau: Etiquette;
  riquet: Point;
  etiquetteRiquet: Etiquette;
  numero: Rect;
  /** Porte du 43, sur la contre-allée. */
  entree: Point;
  /** Position du 43 le long de la promenade (0 = Théâtre, 1 = Plateau). */
  rang43: number;
};

const serie = (debut: number, pas: number, n: number) => Array.from({ length: n }, (_, i) => debut + i * pas);

// Nord à gauche : le Théâtre à gauche, le Plateau des Poètes à droite, le 43 en bas (côté ouest)
const HORIZONTAL: Disposition = {
  largeur: 432,
  hauteur: 240,
  police: 19.5,
  routes: [
    { x: 88, y: 44, l: 228, h: 16, r: 8 },
    { x: 88, y: 180, l: 228, h: 16, r: 8 },
  ],
  ilots: [
    ...[
      [88, 124],
      [130, 170],
      [176, 212],
      [218, 262],
      [268, 316],
    ].map(([a, b]) => ({ x: a, y: 8, l: b - a, h: 28, r: 8 })),
    ...[
      [88, 124],
      [130, 168],
      [174, 226],
      [272, 316],
    ].map(([a, b]) => ({ x: a, y: 204, l: b - a, h: 28, r: 8 })),
  ],
  promenade: { x: 94, y: 80, l: 216, h: 80, r: 40 },
  bordure: { x: 100, y: 86, l: 204, h: 68, r: 34 },
  lampes: [...serie(112, 17, 4), ...serie(242, 17, 4)].map((x) => ({ x, y: 120 })),
  platanes: serie(100, 16, 14).flatMap((x) => [
    { x, y: 70 },
    { x, y: 170 },
  ]),
  theatre: { x: 14, y: 90, l: 52, h: 58, r: 10 },
  fenetres: [20, 34, 48].map((x) => ({ x, y: 138 })),
  etiquetteTheatre: { lignes: [TEXTES.theatre], x: 40, y: 178, ancre: "middle" },
  plateau: { x: 322, y: 62, l: 108, h: 116, r: 26 },
  arbresPlateau: [
    { x: 336, y: 76 },
    { x: 416, y: 76 },
    { x: 336, y: 164 },
    { x: 416, y: 164 },
  ],
  etiquettePlateau: { lignes: TEXTES.plateau, x: 376, y: 116, ancre: "middle", interligne: 22 },
  riquet: { x: 202, y: 106 },
  etiquetteRiquet: { lignes: [TEXTES.statue], x: 202, y: 148, ancre: "middle" },
  numero: { x: 232, y: 202, l: 34, h: 32, r: 8 },
  entree: { x: 249, y: 188 },
  rang43: 0.71,
};

// Nord en haut : la promenade descend du Théâtre au Plateau des Poètes, le 43 à gauche
const VERTICAL: Disposition = {
  largeur: 320,
  hauteur: 460,
  police: 16,
  routes: [
    { x: 60, y: 62, l: 26, h: 342, r: 13 },
    { x: 234, y: 62, l: 26, h: 342, r: 13 },
  ],
  ilots: [
    ...[
      [70, 118],
      [126, 176],
      [184, 232],
      [240, 272],
      [334, 380],
      [388, 424],
    ].map(([a, b]) => ({ x: 8, y: a, l: 46, h: b - a, r: 10 })),
    ...[
      [70, 110],
      [118, 170],
      [178, 222],
      [230, 282],
      [290, 334],
      [342, 394],
    ].map(([a, b]) => ({ x: 266, y: a, l: 46, h: b - a, r: 10 })),
  ],
  promenade: { x: 112, y: 70, l: 96, h: 326, r: 48 },
  bordure: { x: 119, y: 77, l: 82, h: 312, r: 41 },
  lampes: [94, 114, 134, 154, 174, 268, 288, 308, 328, 348, 368].map((y) => ({ x: 160, y })),
  platanes: serie(90, 20, 15).flatMap((y) => [
    { x: 96, y },
    { x: 224, y },
  ]),
  theatre: { x: 126, y: 16, l: 68, h: 38, r: 11 },
  fenetres: [140, 156, 172].map((x) => ({ x, y: 47 })),
  etiquetteTheatre: { lignes: [TEXTES.theatre], x: 204, y: 40, ancre: "start" },
  plateau: { x: 64, y: 408, l: 192, h: 44, r: 22 },
  arbresPlateau: [
    { x: 78, y: 423 },
    { x: 86, y: 438 },
    { x: 242, y: 423 },
    { x: 234, y: 438 },
  ],
  etiquettePlateau: { lignes: [TEXTES.plateau.join(" ")], x: 160, y: 435, ancre: "middle" },
  riquet: { x: 160, y: 210 },
  etiquetteRiquet: { lignes: [TEXTES.statue], x: 160, y: 250, ancre: "middle" },
  numero: { x: 8, y: 280, l: 46, h: 46, r: 10 },
  entree: { x: 73, y: 303 },
  rang43: 0.71,
};

// Fenêtres allumées dans les îlots (positions relatives), en motifs qui alternent
const FENETRES_ILOT: [number, number][][] = [
  [
    [0.3, 0.38],
    [0.7, 0.62],
  ],
  [[0.52, 0.5]],
  [
    [0.24, 0.62],
    [0.56, 0.34],
    [0.8, 0.66],
  ],
  [],
  [[0.36, 0.42]],
];

/** Part du défilement à laquelle s'allume la lampe de rang `t` (0 → 1 le long de la promenade). */
const seuil = (t: number) => t * 0.8;

const rangees: Variants = { cache: {}, vu: { transition: { staggerChildren: 0.02 } } };
const platane: Variants = {
  cache: { scale: 0, opacity: 0 },
  vu: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
};

function Bloc({ zone: r, className, ...reste }: { zone: Rect; className?: string } & Omit<SVGProps<SVGRectElement>, "ref">) {
  return <rect x={r.x} y={r.y} width={r.l} height={r.h} rx={r.r} className={className} {...reste} />;
}

function Libelle({ e, police, className }: { e: Etiquette; police: number; className: string }) {
  return (
    <text x={e.x} y={e.y} textAnchor={e.ancre} className={className} style={{ fontSize: police }}>
      {e.lignes.map((ligne, i) => (
        <tspan key={ligne} x={e.x} dy={i === 0 ? 0 : (e.interligne ?? police * 1.15)}>
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
      <circle cx={p.x} cy={p.y} r={2} className="fill-[#9099b2]" />
      <motion.g style={{ opacity: allumee ? 1 : opacite }}>
        <circle cx={p.x} cy={p.y} r={11} fill={`url(#${halo})`} />
        <circle cx={p.x} cy={p.y} r={2.6} className="fill-halo" />
      </motion.g>
    </>
  );
}

function Plan({ d, progression, reduire, className }: { d: Disposition; progression: MotionValue<number>; reduire: boolean; className: string }) {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const halo = `${base}-halo`;
  const lueur = `${base}-lueur`;
  const debut43 = seuil(d.rang43);
  const lueur43 = useTransform(progression, [debut43, debut43 + 0.08], [0, 1]);
  const n = d.lampes.length;
  const { numero: b, riquet: s } = d;

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

      {/* Contre-allées et îlots, dans l'ombre */}
      {d.routes.map((r) => (
        <Bloc key={`r${r.x}-${r.y}`} zone={r} className="fill-grain" />
      ))}
      {d.ilots.map((r, k) => (
        <g key={`i${r.x}-${r.y}`}>
          <Bloc zone={r} className="fill-minuit" />
          {/* Quelques fenêtres encore éclairées */}
          {FENETRES_ILOT[k % FENETRES_ILOT.length].map(([fx, fy]) => (
            <rect key={`${fx}-${fy}`} x={r.x + fx * r.l - 1.5} y={r.y + fy * r.h - 1.8} width={3} height={3.6} rx={0.8} className="fill-halo" opacity={0.55} />
          ))}
        </g>
      ))}

      {/* Le Théâtre et ses trois fenêtres éclairées */}
      <Bloc zone={d.theatre} className="fill-minuit stroke-filet" strokeOpacity={0.7} strokeWidth={1.2} />
      {d.fenetres.map((f) => (
        <path key={f.x} d={`M${f.x} ${f.y}v-10a4 4 0 0 1 8 0v10z`} className="fill-halo" />
      ))}
      <Libelle e={d.etiquetteTheatre} police={d.police} className="fill-calcaire font-sans font-semibold" />

      {/* Le Plateau des Poètes */}
      <Bloc zone={d.plateau} className="fill-grain" />
      {d.arbresPlateau.map((a) => (
        <circle key={`p${a.x}-${a.y}`} cx={a.x} cy={a.y} r={4.5} className="fill-ciel" opacity={0.7} />
      ))}
      <Libelle e={d.etiquettePlateau} police={d.police} className="fill-pierre font-sans font-semibold" />

      {/* La promenade et ses lampes */}
      <Bloc zone={d.promenade} className="fill-grain" />
      <Bloc zone={d.bordure} fill="none" className="stroke-halo" strokeOpacity={0.3} strokeWidth={1.2} strokeDasharray="2 7" strokeLinecap="round" />
      {d.lampes.map((p, i) => (
        <Lampe key={`${p.x}-${p.y}`} p={p} debut={seuil(n > 1 ? i / (n - 1) : 0)} progression={progression} allumee={reduire} halo={halo} />
      ))}

      {/* Statue de Riquet */}
      <circle cx={s.x} cy={s.y} r={16} className="fill-minuit" />
      <rect x={s.x - 10} y={s.y + 7} width={20} height={4.5} rx={2} className="fill-calcaire" />
      <rect x={s.x - 6} y={s.y - 3} width={12} height={11} rx={2.5} className="fill-calcaire" opacity={0.85} />
      <rect x={s.x - 2.8} y={s.y - 8.5} width={5.6} height={6.5} rx={2} className="fill-halo" />
      <circle cx={s.x} cy={s.y - 11.5} r={2.8} className="fill-halo" />
      <Libelle e={d.etiquetteRiquet} police={d.police} className="fill-calcaire font-display font-semibold italic" />

      {/* Platanes : petits disques couleur de ciel, comme sous la lune */}
      <motion.g variants={rangees} initial="cache" whileInView="vu" viewport={{ once: true, amount: 0.3 }}>
        {d.platanes.map(({ x, y }) => (
          <motion.circle
            key={`${x}-${y}`}
            variants={platane}
            cx={x}
            cy={y}
            r={4.5}
            className="fill-ciel"
            fillOpacity={0.62}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        ))}
      </motion.g>

      {/* Le 43 : une lumière d'or qui s'allume en dernier */}
      <motion.circle cx={b.x + b.l / 2} cy={b.y + b.h / 2} r={Math.max(b.l, b.h) * 1.1} fill={`url(#${lueur})`} style={{ opacity: reduire ? 1 : lueur43 }} />
      <Bloc zone={b} className="fill-or" />
      <text
        x={b.x + b.l / 2}
        y={b.y + b.h / 2}
        dy="0.35em"
        textAnchor="middle"
        className="fill-nuit font-display font-bold"
        style={{ fontSize: d.police * 1.2 }}
      >
        {TEXTES.numero}
      </text>
      <motion.circle cx={d.entree.x} cy={d.entree.y} r={14} fill={`url(#${halo})`} style={{ opacity: reduire ? 1 : lueur43 }} />
      <circle cx={d.entree.x} cy={d.entree.y} r={5} className="fill-or-clair stroke-nuit" strokeWidth={2} />
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
