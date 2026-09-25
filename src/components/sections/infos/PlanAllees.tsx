"use client";

import { useId, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue, type Variants } from "motion/react";
import { useMouvementReduit } from "@/components/sections/infos/useMouvementReduit";

/*
 * Plan illustré des Allées Paul-Riquet (viewBox 320 × 460, nord en haut) :
 * le Théâtre, la promenade en Bleu des Allées bordée de platanes, la statue de
 * Riquet, le Plateau des Poètes et le 43. Les lampes de la promenade
 * s'allument au fil du défilement, jusqu'au point d'or du 43.
 */

const LAMPES = [94, 114, 134, 154, 174, 268, 288, 308, 328, 348, 368];
const PLATANES = Array.from({ length: 15 }, (_, i) => 90 + i * 20).flatMap((y) => [
  { x: 96, y },
  { x: 224, y },
]);
const ILOTS_OUEST: [number, number][] = [
  [70, 118],
  [126, 176],
  [184, 232],
  [240, 272],
  [334, 380],
  [388, 424],
];
const ILOTS_EST: [number, number][] = [
  [70, 110],
  [118, 170],
  [178, 222],
  [230, 282],
  [290, 334],
  [342, 394],
];
const NUMERO = { x: 70, y: 303 };

const Y0 = LAMPES[0];
const Y1 = LAMPES[LAMPES.length - 1];
/** Part du défilement à laquelle s'allume un point situé à la hauteur y. */
const seuil = (y: number) => (Math.max(0, y - Y0) / (Y1 - Y0)) * 0.8;

const rangees: Variants = { cache: {}, vu: { transition: { staggerChildren: 0.022 } } };
const platane: Variants = {
  cache: { scale: 0, opacity: 0 },
  vu: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
};

function Lampe({ y, progression, allumee, halo }: { y: number; progression: MotionValue<number>; allumee: boolean; halo: string }) {
  const debut = seuil(y);
  const opacite = useTransform(progression, [debut, debut + 0.06], [0, 1]);
  return (
    <>
      <circle cx={160} cy={y} r={2} className="fill-[#9099b2]" />
      <motion.g style={{ opacity: allumee ? 1 : opacite }}>
        <circle cx={160} cy={y} r={11} fill={`url(#${halo})`} />
        <circle cx={160} cy={y} r={2.6} className="fill-halo" />
      </motion.g>
    </>
  );
}

export function PlanAllees() {
  const cadre = useRef<HTMLDivElement>(null);
  const reduire = useMouvementReduit();
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const halo = `${base}-halo`;
  const lueur = `${base}-lueur`;

  const { scrollYProgress } = useScroll({ target: cadre, offset: ["start 0.85", "end 0.5"] });
  const debut43 = seuil(NUMERO.y);
  const lueur43 = useTransform(scrollYProgress, [debut43, debut43 + 0.08], [0, 1]);

  return (
    <div ref={cadre} aria-hidden className="absolute inset-0">
      <svg viewBox="0 0 320 460" preserveAspectRatio="xMidYMid meet" className="size-full" focusable="false">
        <defs>
          <radialGradient id={halo}>
            <stop offset="0" style={{ stopColor: "var(--color-halo)", stopOpacity: 0.9 }} />
            <stop offset="0.45" style={{ stopColor: "var(--color-halo)", stopOpacity: 0.35 }} />
            <stop offset="1" style={{ stopColor: "var(--color-halo)", stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id={lueur}>
            <stop offset="0" style={{ stopColor: "var(--color-or)", stopOpacity: 0.85 }} />
            <stop offset="0.5" style={{ stopColor: "var(--color-or)", stopOpacity: 0.3 }} />
            <stop offset="1" style={{ stopColor: "var(--color-or)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Contre-allées et îlots */}
        <rect x={60} y={62} width={26} height={342} rx={13} className="fill-calcaire-clair" />
        <rect x={234} y={62} width={26} height={342} rx={13} className="fill-calcaire-clair" />
        {ILOTS_OUEST.map(([haut, bas]) => (
          <rect key={`o${haut}`} x={8} y={haut} width={46} height={bas - haut} rx={10} className="fill-pierre" opacity={0.32} />
        ))}
        {ILOTS_EST.map(([haut, bas]) => (
          <rect key={`e${haut}`} x={266} y={haut} width={46} height={bas - haut} rx={10} className="fill-pierre" opacity={0.32} />
        ))}

        {/* Le 43, façade bleu nuit */}
        <rect x={8} y={280} width={46} height={46} rx={10} className="fill-nuit" />
        <text x={31} y={309} textAnchor="middle" className="fill-calcaire font-display text-[18px] font-bold">
          43
        </text>

        {/* Le Théâtre, au nord */}
        <rect x={126} y={16} width={68} height={38} rx={11} className="fill-nuit" />
        {[140, 156, 172].map((x) => (
          <path key={x} d={`M${x} 47v-10a4 4 0 0 1 8 0v10z`} className="fill-halo" />
        ))}
        <text x={204} y={40} className="fill-nuit font-sans text-[14px] font-semibold">
          Théâtre
        </text>

        {/* Le Plateau des Poètes, au sud */}
        <rect x={64} y={408} width={192} height={44} rx={22} className="fill-vigne" opacity={0.2} />
        {[
          [78, 423],
          [86, 438],
          [242, 423],
          [234, 438],
        ].map(([x, y]) => (
          <circle key={`p${x}-${y}`} cx={x} cy={y} r={5} className="fill-vigne" opacity={0.85} />
        ))}
        <text x={160} y={435} textAnchor="middle" className="fill-nuit font-sans text-[14px] font-semibold">
          Plateau des Poètes
        </text>

        {/* La promenade */}
        <rect x={112} y={70} width={96} height={326} rx={48} className="fill-nuit" />
        <rect
          x={119}
          y={77}
          width={82}
          height={312}
          rx={41}
          fill="none"
          className="stroke-halo"
          strokeOpacity={0.3}
          strokeWidth={1.2}
          strokeDasharray="2 7"
          strokeLinecap="round"
        />
        {LAMPES.map((y) => (
          <Lampe key={y} y={y} progression={scrollYProgress} allumee={reduire} halo={halo} />
        ))}

        {/* Statue de Riquet */}
        <circle cx={160} cy={213} r={17} className="fill-grain" />
        <rect x={150} y={221} width={20} height={4.5} rx={2} className="fill-calcaire" />
        <rect x={154} y={211} width={12} height={11} rx={2.5} className="fill-calcaire" opacity={0.85} />
        <rect x={157.2} y={205.5} width={5.6} height={6.5} rx={2} className="fill-halo" />
        <circle cx={160} cy={202.5} r={2.8} className="fill-halo" />
        <text x={160} y={250} textAnchor="middle" className="fill-calcaire font-display text-[14px] font-semibold italic">
          Riquet
        </text>

        {/* Platanes */}
        <motion.g variants={rangees} initial="cache" whileInView="vu" viewport={{ once: true, amount: 0.3 }}>
          {PLATANES.map(({ x, y }) => (
            <motion.g key={`${x}-${y}`} variants={platane} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
              <circle cx={x + 1.5} cy={y + 2} r={6.8} className="fill-nuit" opacity={0.16} />
              <circle cx={x} cy={y} r={6.8} className="fill-vigne" />
              <circle cx={x - 2} cy={y - 2.2} r={2.2} className="fill-calcaire-clair" opacity={0.28} />
            </motion.g>
          ))}
        </motion.g>

        {/* Point de lumière du 43 */}
        <motion.circle cx={NUMERO.x} cy={NUMERO.y} r={22} fill={`url(#${lueur})`} style={{ opacity: reduire ? 1 : lueur43 }} />
        <circle cx={NUMERO.x} cy={NUMERO.y} r={6.5} className="fill-or stroke-nuit" strokeWidth={2.5} />
      </svg>
    </div>
  );
}
