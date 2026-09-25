"use client";

import { useState, type FocusEvent, type PointerEvent } from "react";
import { motion } from "motion/react";
import { Coins, ReceiptEuro, Timer } from "lucide-react";
import { BoutonCommander } from "@/components/actions/Boutons";
import { Valeur } from "@/components/ui/Valeur";
import { site } from "@/config/site";
import { SchemaCommunes } from "./SchemaCommunes";
import { TEXTES } from "./textes";

const INFOS = [
  { libelle: TEXTES.infos.minimum, valeur: site.livraison.minimumCommande, Icone: ReceiptEuro },
  { libelle: TEXTES.infos.frais, valeur: site.livraison.frais, Icone: Coins },
  { libelle: TEXTES.infos.delai, valeur: site.livraison.delai, Icone: Timer },
] as const;

const pression = { whileHover: { scale: 1.04 }, whileTap: { scale: 0.95 }, transition: { type: "spring", stiffness: 500, damping: 30 } } as const;

/** Panneau « Livraison » : schéma des communes à gauche, pastilles et infos à droite. */
export function PanneauLivraison() {
  // Survol (souris) ou focus clavier : éphémère. Choix (clic, toucher) : reste allumé.
  const [survol, setSurvol] = useState<string | null>(null);
  const [choix, setChoix] = useState<string | null>(null);
  const lumiere = survol ?? choix;

  const eteindre = (nom: string) => setSurvol((s) => (s === nom ? null : s));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
      <div className="mx-auto w-full max-w-[34rem] lg:max-w-none">
        <SchemaCommunes lumiere={lumiere} />
      </div>

      <div>
        <h3 className="font-display text-[1.6rem] font-semibold leading-tight text-calcaire">{TEXTES.communesTitre}</h3>
        <p aria-hidden className="mt-2 text-[0.9375rem] text-pierre">
          {TEXTES.communesAide}
        </p>

        <ul role="list" className="mt-5 flex flex-wrap gap-2.5">
          {site.livraison.communes.map((nom) => {
            const allume = lumiere === nom;
            return (
              <li key={nom}>
                <motion.button
                  type="button"
                  aria-pressed={choix === nom}
                  onClick={() => setChoix((c) => (c === nom ? null : nom))}
                  onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => {
                    if (e.pointerType === "mouse") setSurvol(nom);
                  }}
                  onPointerLeave={() => eteindre(nom)}
                  onFocus={(e: FocusEvent<HTMLButtonElement>) => {
                    if (e.currentTarget.matches(":focus-visible")) setSurvol(nom);
                  }}
                  onBlur={() => eteindre(nom)}
                  className={`inline-flex min-h-11 items-center gap-2.5 rounded-full border bg-grain px-4 text-[0.9375rem] font-semibold text-calcaire transition-colors duration-200 ${
                    allume ? "border-or-clair" : "border-filet"
                  }`}
                  {...pression}
                >
                  <span
                    aria-hidden
                    className={`size-2 shrink-0 rounded-full bg-halo shadow-[0_0_10px_3px_rgba(242,211,140,0.6)] transition-opacity duration-300 ${
                      allume ? "opacity-100" : "opacity-50"
                    }`}
                  />
                  {nom}
                </motion.button>
              </li>
            );
          })}
        </ul>

        <dl className="mt-8 overflow-hidden rounded-[1.75rem] border border-filet/50 bg-grain/60">
          {INFOS.map(({ libelle, valeur, Icone }, i) => (
            <div
              key={libelle}
              className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5 ${i > 0 ? "border-t border-dashed border-filet/35" : ""}`}
            >
              <dt className="flex items-center gap-3 text-[0.9375rem] text-pierre">
                <Icone aria-hidden className="size-[1.15rem] shrink-0 text-or-clair" strokeWidth={2} />
                {libelle}
              </dt>
              <dd className="ml-auto font-semibold tabular-nums text-calcaire">
                <Valeur valeur={valeur} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <BoutonCommander>{TEXTES.boutonLivraison}</BoutonCommander>
        </div>
      </div>
    </div>
  );
}
