"use client";

import { useCallback, useSyncExternalStore } from "react";
import { EVENEMENT_PALETTE, palettePosee, poserPalette } from "@/lib/palette-essai";

/**
 * Essai temporaire : bandeau tout en haut du site, cinq ambiances complètes à
 * comparer (dont « Nuit », celle du site aujourd'hui). Chaque bouton pose
 * [data-palette] sur <html> — sauf Nuit, qui le retire — ce que globals.css
 * sait redéfinir intégralement ; rien d'autre à changer. Le choix ne vit que
 * dans ce navigateur (localStorage) : personne d'autre n'est affecté.
 * À retirer (ce fichier, son import dans Header.tsx, les blocs [data-palette]
 * de globals.css) une fois qu'un choix est arrêté.
 */
const PALETTES = [
  { id: null, nom: "Nuit", swatch: ["#051a4b", "#e9b950"] },
  { id: "four-a-bois", nom: "Four à bois", swatch: ["#3a1810", "#e8a23f"] },
  { id: "cypres", nom: "Cyprès", swatch: ["#0e2420", "#dcaa3f"] },
  { id: "cave-a-vin", nom: "Cave à vin", swatch: ["#2d0f1c", "#e3a83f"] },
  { id: "tomate", nom: "Tomate", swatch: ["#4a120f", "#dd8a3a"] },
  { id: "pierre", nom: "Pierre", swatch: ["#2b2b2b", "#f5f4f2"] },
  { id: "emeraude", nom: "Émeraude", swatch: ["#0d2b22", "#c99a4a"] },
  { id: "ivoire", nom: "Ivoire", swatch: ["#f2ebdc", "#bd9450"] },
] as const;

/** Palette actuellement posée sur <html> ; nulle avant l'hydratation, comme useMedia. */
function useEssaiActif(): string | null {
  const abonner = useCallback((notifier: () => void) => {
    window.addEventListener(EVENEMENT_PALETTE, notifier);
    return () => window.removeEventListener(EVENEMENT_PALETTE, notifier);
  }, []);
  return useSyncExternalStore(abonner, palettePosee, () => null);
}

export function SelecteurPalette() {
  const actif = useEssaiActif();

  return (
    <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto border-b border-filet/30 bg-minuit px-3 pb-2 pt-[max(0.4rem,env(safe-area-inset-top))] [scrollbar-width:none]">
      <span className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wider text-calcaire/55">Palette d’essai</span>
      <div role="group" aria-label="Palette de couleurs à l'essai" className="flex shrink-0 items-center gap-1.5">
        {PALETTES.map((p) => {
          const estActive = actif === p.id;
          return (
            <button
              key={p.nom}
              type="button"
              onClick={() => poserPalette(p.id)}
              aria-pressed={estActive}
              aria-label={`Palette ${p.nom}${estActive ? " (active)" : ""}`}
              title={p.nom}
              className={`grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors ${
                estActive ? "border-or-clair" : "border-calcaire/40 hover:border-calcaire/70"
              }`}
            >
              <span
                aria-hidden
                className="size-[18px] rounded-full ring-1 ring-inset ring-black/15"
                style={{ background: `linear-gradient(135deg, ${p.swatch[0]} 50%, ${p.swatch[1]} 50%)` }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
