"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { Bike, Store } from "lucide-react";
import { PanneauEmporter } from "./PanneauEmporter";
import { PanneauLivraison } from "./PanneauLivraison";
import { site } from "@/config/site";

const TEXTES = site.textes.livraison.onglets;

const ONGLETS = [
  { id: "livraison", libelle: TEXTES.livraison, Icone: Bike, Panneau: PanneauLivraison },
  { id: "emporter", libelle: TEXTES.emporter, Icone: Store, Panneau: PanneauEmporter },
] as const;

type Mode = (typeof ONGLETS)[number]["id"];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Titre de la section + rail d'onglets (Livraison / À emporter) et panneaux.
 * Onglets accessibles : flèches gauche/droite, Début/Fin, tabindex itinérant.
 * Les deux panneaux restent dans le DOM (id stables, `hidden` sur l'inactif) : aria-controls
 * pointe toujours vers un panneau existant, et la carte n'est pas rechargée à chaque aller-retour.
 */
export function Onglets({ entete }: { entete: ReactNode }) {
  const [mode, setMode] = useState<Mode>("livraison");
  const boutons = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const index = ONGLETS.findIndex((o) => o.id === mode);

  function choisir(i: number) {
    if (i !== index) setMode(ONGLETS[i].id);
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
            aria-label={TEXTES.aria}
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
                  aria-controls={`${base}-panneau-${o.id}`}
                  tabIndex={actif ? 0 : -1}
                  onClick={() => choisir(i)}
                  onKeyDown={(e) => surTouche(e, i)}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`relative inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold transition-colors duration-200 sm:flex-none ${
                    actif ? "text-encre" : "text-calcaire hover:text-or-clair"
                  }`}
                >
                  {/* Onglet actif en calcaire : l'or reste réservé aux boutons Commander */}
                  {actif && (
                    <motion.span
                      layoutId="pastille"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-calcaire"
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
        {ONGLETS.map((o, i) => {
          const actif = o.id === mode;
          return (
            <div
              key={o.id}
              role="tabpanel"
              id={`${base}-panneau-${o.id}`}
              aria-labelledby={`${base}-onglet-${o.id}`}
              hidden={!actif}
            >
              {/* Le panneau qui apparaît glisse depuis le côté de son onglet */}
              <motion.div
                initial={false}
                animate={actif ? { x: 0, opacity: 1 } : { x: i > index ? 24 : -24, opacity: 0 }}
                transition={{ duration: actif ? 0.3 : 0, ease: EASE }}
              >
                <o.Panneau />
              </motion.div>
            </div>
          );
        })}
      </div>
    </>
  );
}
