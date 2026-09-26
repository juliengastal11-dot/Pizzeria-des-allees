"use client";

import { useCallback, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { EVENEMENT_ESSAI, poserReglage, reglagePose, type Reglage } from "@/lib/essai";

/**
 * Essai temporaire : bandeau tout en haut du site, sur deux lignes réglées à part.
 * Couleurs : huit ambiances, dont « Nuit », celle du site. Typographie : cinq
 * palettes, dont « Enseigne », celle du site. Chaque bouton pose [data-palette] ou
 * [data-typo] sur <html> — sauf le premier de chaque ligne, qui le retire — ce que
 * globals.css sait redéfinir. Le choix ne vit que dans ce navigateur : personne
 * d'autre n'est affecté. À retirer (ce fichier, son import dans Header.tsx,
 * lib/essai.ts, les blocs [data-palette] et [data-typo] de globals.css et les
 * polices d'essai du layout) une fois les choix arrêtés.
 */
const COULEURS = [
  { id: null, nom: "Nuit", swatch: ["#051a4b", "#e9b950"] },
  { id: "four-a-bois", nom: "Four à bois", swatch: ["#3a1810", "#e8a23f"] },
  { id: "cypres", nom: "Cyprès", swatch: ["#0e2420", "#dcaa3f"] },
  { id: "cave-a-vin", nom: "Cave à vin", swatch: ["#2d0f1c", "#e3a83f"] },
  { id: "tomate", nom: "Tomate", swatch: ["#4a120f", "#dd8a3a"] },
  { id: "pierre", nom: "Pierre", swatch: ["#2b2b2b", "#f5f4f2"] },
  { id: "emeraude", nom: "Émeraude", swatch: ["#0d2b22", "#c99a4a"] },
  { id: "ivoire", nom: "Ivoire", swatch: ["#f2ebdc", "#bd9450"] },
] as const;

/** `apercu` : le « Aa » du bouton, dans la police des titres de la palette. */
const TYPOS: readonly { id: string | null; nom: string; polices: string; apercu: CSSProperties }[] = [
  { id: null, nom: "Enseigne", polices: "Besley et Figtree", apercu: { fontFamily: "var(--font-besley)" } },
  { id: "editorial", nom: "Éditorial", polices: "Playfair Display et Raleway", apercu: { fontFamily: "var(--font-playfair)" } },
  { id: "gravure", nom: "Gravure", polices: "Cormorant Garamond et Raleway", apercu: { fontFamily: "var(--font-cormorant)" } },
  {
    id: "ardoise",
    nom: "Ardoise",
    polices: "Fraunces, Caveat et Figtree",
    apercu: { fontFamily: "var(--font-fraunces)", fontVariationSettings: '"SOFT" 100' },
  },
  {
    id: "comptoir",
    nom: "Comptoir",
    polices: "Bricolage Grotesque, Instrument Serif et DM Mono",
    apercu: { fontFamily: "var(--font-bricolage)" },
  },
];

/** Réglage actuellement posé sur <html> ; nul avant l'hydratation, comme useMedia. */
function useReglage(reglage: Reglage): string | null {
  const abonner = useCallback((notifier: () => void) => {
    window.addEventListener(EVENEMENT_ESSAI, notifier);
    return () => window.removeEventListener(EVENEMENT_ESSAI, notifier);
  }, []);
  return useSyncExternalStore(abonner, () => reglagePose(reglage), () => null);
}

const BOUTON = "grid h-9 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors";
const bordure = (actif: boolean) => (actif ? "border-or-clair" : "border-calcaire/40 hover:border-calcaire/70");

function Ligne({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-calcaire/55">{libelle}</span>
      <div role="group" aria-label={`${libelle} à l'essai`} className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {children}
      </div>
    </>
  );
}

export function BandeauEssai() {
  const palette = useReglage("palette");
  const typo = useReglage("typo");

  return (
    // data-bandeau-essai : globals.css en déduit la place à laisser en haut de la page (--hauteur-essai)
    <div
      data-bandeau-essai
      className="pointer-events-auto relative z-10 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 border-b border-filet/30 bg-minuit px-3 pb-2 pt-[max(0.4rem,env(safe-area-inset-top))] font-[system-ui,sans-serif]"
    >
      <Ligne libelle="Couleurs">
        {COULEURS.map((c) => {
          const actif = palette === c.id;
          return (
            <button
              key={c.nom}
              type="button"
              onClick={() => poserReglage("palette", c.id)}
              aria-pressed={actif}
              aria-label={`Couleurs ${c.nom}${actif ? " (actives)" : ""}`}
              title={c.nom}
              className={`${BOUTON} w-9 ${bordure(actif)}`}
            >
              <span
                aria-hidden
                className="size-[18px] rounded-full ring-1 ring-inset ring-black/15"
                style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
              />
            </button>
          );
        })}
      </Ligne>

      <Ligne libelle="Typographie">
        {TYPOS.map((t) => {
          const actif = typo === t.id;
          return (
            <button
              key={t.nom}
              type="button"
              onClick={() => poserReglage("typo", t.id)}
              aria-pressed={actif}
              aria-label={`Typographie ${t.nom} (${t.polices})${actif ? ", active" : ""}`}
              title={`${t.nom} : ${t.polices}`}
              className={`${BOUTON} min-w-11 px-2.5 text-calcaire ${bordure(actif)}`}
            >
              <span aria-hidden className="text-[1.15rem] leading-none" style={t.apercu}>
                Aa
              </span>
            </button>
          );
        })}
      </Ligne>
    </div>
  );
}
