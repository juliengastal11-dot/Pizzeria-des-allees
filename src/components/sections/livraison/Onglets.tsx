"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, type Variants } from "motion/react";
import { Bike, Store } from "lucide-react";
import { PanneauEmporter } from "./PanneauEmporter";
import { PanneauLivraison } from "./PanneauLivraison";
import { TEXTES } from "./textes";

const ONGLETS = [
  { id: "livraison", libelle: TEXTES.onglets.livraison, Icone: Bike },
  { id: "emporter", libelle: TEXTES.onglets.emporter, Icone: Store },
] as const;

type Mode = (typeof ONGLETS)[number]["id"];

const glisse: Variants = {
  entre: (sens: number) => ({ x: 24 * sens, opacity: 0 }),
  visible: { x: 0, opacity: 1 },
  sort: (sens: number) => ({ x: -24 * sens, opacity: 0 }),
};

/**
 * Titre de la section + rail d'onglets (Livraison / À emporter) et panneaux.
 * Onglets accessibles : flèches gauche/droite, Début/Fin, tabindex itinérant.
 */
export function Onglets({ entete }: { entete: ReactNode }) {
  const [mode, setMode] = useState<Mode>("livraison");
  const [sens, setSens] = useState(1);
  const boutons = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const index = ONGLETS.findIndex((o) => o.id === mode);

  function choisir(i: number) {
    if (i === index) return;
    setSens(i > index ? 1 : -1);
    setMode(ONGLETS[i].id);
  }

  function surTouche(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = ONGLETS.length;
    let cible = -1;
    if (e.key === "ArrowRight") cible = (i + 1) % n;
    else if (e.key === "ArrowLeft") cible = (i - 1 + n) % n;
    else if (e.key === "Home") cible = 0;
    else if (e.key === "End") cible = n - 1;
    if (cible < 0) return;
    e.preventDefault();
    choisir(cible);
    boutons.current[cible]?.focus();
  }

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        {entete}

        <LayoutGroup id={`${base}-onglets`}>
          <div
            role="tablist"
            aria-label={TEXTES.ongletsAria}
            className="relative flex w-full shrink-0 rounded-full border border-filet bg-grain p-1 sm:w-auto sm:self-start lg:self-auto"
          >
            {ONGLETS.map((o, i) => {
              const actif = o.id === mode;
              return (
                <motion.button
                  key={o.id}
                  ref={(el) => {
                    boutons.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${base}-onglet-${o.id}`}
                  aria-selected={actif}
                  aria-controls={actif ? `${base}-panneau-${o.id}` : undefined}
                  tabIndex={actif ? 0 : -1}
                  onClick={() => choisir(i)}
                  onKeyDown={(e) => surTouche(e, i)}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`relative inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold transition-colors duration-200 sm:flex-none ${
                    actif ? "text-nuit" : "text-calcaire hover:text-or-clair"
                  }`}
                >
                  {actif && (
                    <motion.span
                      layoutId="pastille"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-or shadow-[0_0_18px_rgba(242,211,140,0.35)]"
                      transition={{ type: "spring", stiffness: 500, damping: 34 }}
                    />
                  )}
                  <o.Icone aria-hidden className="relative size-[1.1em] shrink-0" strokeWidth={2.2} />
                  <span className="relative">{o.libelle}</span>
                </motion.button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <div className="mt-10 lg:mt-14">
        <AnimatePresence mode="wait" initial={false} custom={sens}>
          <motion.div
            key={mode}
            role="tabpanel"
            id={`${base}-panneau-${mode}`}
            aria-labelledby={`${base}-onglet-${mode}`}
            custom={sens}
            variants={glisse}
            initial="entre"
            animate="visible"
            exit="sort"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === "livraison" ? <PanneauLivraison /> : <PanneauEmporter />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
