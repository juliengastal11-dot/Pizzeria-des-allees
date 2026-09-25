"use client";

import { useId, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { site } from "@/config/site";
import { distance, LIBRON, LIEUX, ORB, RESTAURANT, RIVIERES, trajet, type Cote, type Lieu } from "./geographie";
import { LE_43, TEXTES } from "./textes";

const EASE = [0.22, 1, 0.36, 1] as const;

const ville: string = site.adresse.ville;
const communes: readonly string[] = site.livraison.communes;

type Commune = { nom: string; lieu: Lieu; rang: number; delai: number; chemin: string };

// Les communes s'allument du plus proche au plus lointain du 43.
const POINTS: Commune[] = communes
  .filter((nom) => nom !== ville)
  .flatMap((nom) => {
    const lieu = LIEUX[nom];
    return lieu ? [{ nom, lieu }] : [];
  })
  .sort((a, b) => distance(a.lieu.x, a.lieu.y) - distance(b.lieu.x, b.lieu.y))
  .map(({ nom, lieu }, rang) => ({ nom, lieu, rang, delai: 0.6 + rang * 0.14, chemin: trajet(lieu) }));

const PLACEMENT: Record<Cote, string> = {
  droite: "translate-x-[0.7rem] -translate-y-1/2",
  gauche: "translate-x-[calc(-100%_-_0.7rem)] -translate-y-1/2 text-right",
  dessous: "-translate-x-[0.4rem] translate-y-[0.55rem]",
};

const OMBRE_TEXTE = "[text-shadow:0_0_6px_var(--color-minuit),0_0_2px_var(--color-minuit)]";

function position(x: number, y: number): CSSProperties {
  return { left: `${x}%`, top: `${y}%` };
}

/**
 * Schéma lumineux de la zone de livraison : l'Orb et le Libron se tracent,
 * puis les communes s'allument une à une autour du 43. `lumiere` = commune
 * mise en avant depuis les pastilles (halo renforcé + trajet en pointillés).
 */
export function SchemaCommunes({ lumiere }: { lumiere: string | null }) {
  const reduire = useReducedMotion() ?? false;
  const idMasque = `trajet-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const riviere: Variants = {
    eteint: { pathLength: 0, opacity: 0 },
    allume: (delai: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: reduire ? 0 : 1.2, delay: reduire ? 0 : delai, ease: [0.65, 0, 0.35, 1] },
        opacity: { duration: 0.3, delay: reduire ? 0 : delai },
      },
    }),
  };
  const lampe: Variants = {
    eteint: { opacity: 0.2, scale: 0.45 },
    allume: (delai: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: reduire ? 0 : delai, duration: reduire ? 0.3 : 0.55, ease: EASE },
    }),
  };
  const etiquette: Variants = {
    eteint: { opacity: 0, y: 4 },
    allume: (delai: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: reduire ? 0 : delai + 0.12, duration: reduire ? 0.3 : 0.5, ease: EASE },
    }),
  };
  const onde: Variants = {
    eteint: { opacity: 0, scale: 1 },
    allume: reduire
      ? { opacity: 0 }
      : { opacity: [0.9, 0], scale: [1, 4.6], transition: { delay: 0.45, duration: 1.6, ease: "easeOut" } },
  };

  const cible = POINTS.find((p) => p.nom === lumiere);
  const siegeActif = lumiere === ville;

  return (
    <div aria-hidden className="relative overflow-hidden rounded-[2.5rem] border border-filet/40 bg-minuit p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_46%_40%,rgba(242,211,140,0.11),transparent_58%)]" />

      <motion.div
        className="relative aspect-square w-full select-none"
        initial="eteint"
        whileInView="allume"
        viewport={{ once: true, amount: 0.4 }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" fill="none">
          {/* Cercles de distance autour du 43 */}
          {[17, 33, 51].map((r) => (
            <circle
              key={r}
              cx={RESTAURANT.x}
              cy={RESTAURANT.y}
              r={r}
              className="stroke-filet"
              strokeOpacity={0.32}
              strokeWidth={0.3}
              strokeDasharray="0.6 1.5"
              strokeLinecap="round"
            />
          ))}

          {/* Nord */}
          <path d="M 93 12 L 93 4.5 M 91.3 6.4 L 93 4.5 L 94.7 6.4" className="stroke-pierre" strokeWidth={0.45} strokeLinecap="round" strokeLinejoin="round" />

          {/* Rivières : lit clair, puis cours d'eau */}
          <motion.path d={ORB} className="stroke-ciel" strokeOpacity={0.14} strokeWidth={3.2} strokeLinecap="round" variants={riviere} custom={0} />
          <motion.path d={ORB} className="stroke-ciel" strokeWidth={1} strokeLinecap="round" variants={riviere} custom={0} />
          <motion.path d={LIBRON} className="stroke-orb" strokeOpacity={0.16} strokeWidth={2.8} strokeLinecap="round" variants={riviere} custom={0.25} />
          <motion.path d={LIBRON} className="stroke-orb" strokeWidth={0.85} strokeLinecap="round" variants={riviere} custom={0.25} />

          {/* Trajet lumineux du 43 vers la commune choisie */}
          <AnimatePresence>
            {cible && (
              <motion.g
                key={cible.nom}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <mask id={`${idMasque}-${cible.rang}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
                  <motion.path
                    d={cible.chemin}
                    stroke="#fff"
                    strokeWidth={4}
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduire ? 0 : 0.75, ease: EASE }}
                  />
                </mask>
                <g mask={`url(#${idMasque}-${cible.rang})`}>
                  <path d={cible.chemin} className="stroke-halo" strokeOpacity={0.2} strokeWidth={2.4} strokeLinecap="round" />
                  <path d={cible.chemin} className="stroke-halo" strokeWidth={0.9} strokeLinecap="round" strokeDasharray="0.01 2.1" />
                </g>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        <span className="absolute -translate-x-1/2 text-[0.75rem] font-semibold text-pierre" style={{ left: "93%", top: "13%" }}>
          N
        </span>

        {RIVIERES.map((r, i) => (
          <div key={r.nom} className={`absolute w-max ${PLACEMENT[r.cote]}`} style={position(r.x, r.y)}>
            <motion.span
              variants={etiquette}
              custom={0.9 + i * 0.2}
              className={`block font-display text-[0.75rem] font-semibold italic text-pierre sm:text-[0.8125rem] ${OMBRE_TEXTE}`}
            >
              {r.nom}
            </motion.span>
          </div>
        ))}

        {POINTS.map((p) => {
          const actif = lumiere === p.nom;
          return (
            <div key={p.nom}>
              <div className="absolute" style={position(p.lieu.x, p.lieu.y)}>
                <motion.span
                  className="absolute -ml-7 -mt-7 block size-14 rounded-full bg-[radial-gradient(circle,rgba(242,211,140,0.6)_0%,rgba(242,211,140,0.2)_38%,transparent_68%)]"
                  initial={false}
                  animate={{ opacity: actif ? 1 : 0, scale: actif ? 1 : 0.4 }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
                <motion.span
                  variants={lampe}
                  custom={p.delai}
                  className="absolute -ml-[3.5px] -mt-[3.5px] block size-[7px] rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]"
                />
              </div>
              <div
                className={`absolute w-max text-[0.75rem] leading-[1.15] sm:text-[0.8125rem] ${PLACEMENT[p.lieu.cote]}`}
                style={{
                  ...position(p.lieu.x, p.lieu.y),
                  marginTop: p.lieu.dy,
                  maxWidth: p.lieu.largeur ? `${p.lieu.largeur}em` : undefined,
                }}
              >
                <motion.span
                  variants={etiquette}
                  custom={p.delai}
                  className={`block font-semibold transition-colors duration-300 ${actif ? "text-or-clair" : "text-calcaire"} ${OMBRE_TEXTE}`}
                >
                  {p.nom}
                </motion.span>
              </div>
            </div>
          );
        })}

        {/* Le 43 : la lumière la plus vive, une onde à l'arrivée */}
        <div className="absolute" style={position(RESTAURANT.x, RESTAURANT.y)}>
          <motion.span
            className="absolute -ml-10 -mt-10 block size-20 rounded-full bg-[radial-gradient(circle,rgba(242,211,140,0.55)_0%,rgba(242,211,140,0.16)_40%,transparent_70%)]"
            initial={false}
            animate={{ opacity: siegeActif ? 1 : 0, scale: siegeActif ? 1 : 0.5 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
          <motion.span variants={onde} className="absolute -ml-2 -mt-2 block size-4 rounded-full border border-halo" />
          <motion.span
            variants={lampe}
            custom={0.2}
            className="absolute -ml-1.5 -mt-1.5 block size-3 rounded-full bg-calcaire-clair shadow-[0_0_0_3px_rgba(242,211,140,0.35),0_0_22px_7px_rgba(242,211,140,0.6)]"
          />
        </div>
        <div className="absolute w-max translate-x-[0.95rem] -translate-y-1/2" style={position(RESTAURANT.x, RESTAURANT.y)}>
          <motion.span variants={etiquette} custom={0.2} className={`block leading-[1.15] ${OMBRE_TEXTE}`}>
            <span className={`block text-[0.75rem] font-semibold transition-colors duration-300 sm:text-[0.8125rem] ${siegeActif ? "text-or-clair" : "text-calcaire"}`}>
              {ville}
            </span>
            <span className="block font-display text-[0.875rem] font-semibold italic text-or-clair">{LE_43}</span>
          </motion.span>
        </div>
      </motion.div>

      <p className="relative mt-3 px-2 text-[0.875rem] italic text-pierre">{TEXTES.legende}</p>
    </div>
  );
}
