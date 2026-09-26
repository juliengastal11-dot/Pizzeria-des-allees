"use client";

import { useCallback, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import { BoutonCommander } from "@/components/actions/Boutons";
import { site } from "@/config/site";
import { remplir } from "@/lib/textes";
import { CarteNuit, type EtatCarte } from "./CarteNuit";
import { direction, distanceKm, LIEUX, RESTAURANT } from "./geographie";

const TEXTES = site.textes.livraison;

const ville: string = site.adresse.ville;
const communes: readonly string[] = site.livraison.communes;
const zoneDefinie: boolean = site.livraison.zoneDefinie;

const pression = { whileHover: { scale: 1.04 }, whileTap: { scale: 0.95 }, transition: { type: "spring", stiffness: 500, damping: 30 } } as const;

/** Phrase annoncée (et affichée) quand on choisit une commune. */
function annonce(nom: string): string {
  const lieu = LIEUX[nom];
  if (nom === ville || !lieu) return remplir(TEXTES.communes.annonceCentre, { commune: nom });
  const km = Math.max(1, Math.round(distanceKm(RESTAURANT, lieu.coord)));
  return remplir(TEXTES.communes.annonce, { commune: nom, km, direction: direction(RESTAURANT, lieu.coord) });
}

/**
 * Panneau « Livraison » : la carte de nuit, puis la liste des communes (centrée) et le bouton Commander,
 * au milieu de la page. Chaque commune est un bouton « Voir … sur la carte » : la carte se cadre sur le
 * trajet depuis la pizzeria, et une phrase (région live) dit où se trouve la commune, pour tout le monde.
 */
export function PanneauLivraison() {
  const [choix, setChoix] = useState<string | null>(null);
  const [demande, setDemande] = useState(0);
  const [survol, setSurvol] = useState<string | null>(null);
  const [etatCarte, setEtatCarte] = useState<EtatCarte>("attente");

  const choisir = useCallback((nom: string) => {
    setChoix(nom);
    setDemande((n) => n + 1);
  }, []);

  const sansCarte = etatCarte === "echec";

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
        <div className="mx-auto w-full max-w-[36rem] lg:max-w-none">
          <CarteNuit choix={choix} demande={demande} survol={survol} onChoisir={choisir} onEtat={setEtatCarte} />

          {/* Légende de la carte ; sans carte, elle s'efface sans décaler la page */}
          <div
            className={`mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-2 font-petit text-[0.875rem] text-pierre lg:justify-start ${sansCarte ? "invisible" : ""}`}
          >
            {/* Symboles : décoratifs pour les lecteurs d'écran (le texte utile est dans la liste) */}
            <ul aria-hidden className="contents">
              <li className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-full bg-calcaire-clair shadow-[0_0_0_2px_rgba(242,211,140,0.35),0_0_12px_4px_rgba(242,211,140,0.5)]" />
                <span className="font-accent font-semibold italic text-or-clair">{site.nom}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]" />
                {TEXTES.carte.legende.commune}
              </li>
              {zoneDefinie && (
                <li className="flex items-center gap-2.5">
                  <span className="h-3 w-5 rounded-[50%] border-[1.5px] border-dashed border-or-clair/90 bg-or/10" />
                  {TEXTES.carte.legende.zone}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-soustitre text-[1.6rem] font-semibold leading-tight text-calcaire">{TEXTES.communes.titre}</h3>
          <p aria-live="polite" className="mx-auto mt-2 min-h-[3em] max-w-[34rem] text-[0.9375rem] leading-snug text-pierre">
            {sansCarte ? TEXTES.communes.aideSansCarte : choix ? annonce(choix) : TEXTES.communes.aide}
          </p>

          <ul role="list" className="mt-4 flex flex-wrap justify-center gap-2.5">
            {communes.map((nom) => {
              const allume = choix === nom;
              return (
                <li key={nom}>
                  {sansCarte ? (
                    <span className="inline-flex min-h-11 items-center rounded-full border border-filet bg-grain px-4 text-[0.9375rem] font-semibold text-calcaire">
                      {nom}
                    </span>
                  ) : (
                    <motion.button
                      type="button"
                      aria-label={remplir(TEXTES.communes.voirSurCarte, { commune: nom })}
                      onClick={() => choisir(nom)}
                      onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => {
                        if (e.pointerType === "mouse") setSurvol(nom);
                      }}
                      onPointerLeave={() => setSurvol((s) => (s === nom ? null : s))}
                      className={`inline-flex min-h-11 items-center rounded-full border bg-grain px-4 text-[0.9375rem] font-semibold transition-colors duration-200 ${
                        allume ? "border-or-clair text-or-clair" : "border-filet text-calcaire hover:border-calcaire/70"
                      }`}
                      {...pression}
                    >
                      {nom}
                    </motion.button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Au milieu de la page, sous la carte et la liste */}
      <div className="mt-10 flex justify-center lg:mt-14">
        <BoutonCommander>{TEXTES.boutonLivraison}</BoutonCommander>
      </div>
    </>
  );
}
