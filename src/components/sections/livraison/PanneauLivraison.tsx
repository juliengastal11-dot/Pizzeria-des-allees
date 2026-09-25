"use client";

import { useCallback, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import { Coins, ReceiptEuro, Timer } from "lucide-react";
import { BoutonCommander } from "@/components/actions/Boutons";
import { Valeur } from "@/components/ui/Valeur";
import { site } from "@/config/site";
import { remplir } from "@/lib/textes";
import { CarteNuit, type EtatCarte } from "./CarteNuit";
import { direction, distanceKm, LIEUX, RESTAURANT } from "./geographie";

const TEXTES = site.textes.livraison;

const INFOS = [
  { libelle: TEXTES.conditions.minimum, valeur: site.livraison.minimumCommande, Icone: ReceiptEuro },
  { libelle: TEXTES.conditions.frais, valeur: site.livraison.frais, Icone: Coins },
  { libelle: TEXTES.conditions.delai, valeur: site.livraison.delai, Icone: Timer },
] as const;

const ville: string = site.adresse.ville;
const communes: readonly string[] = site.livraison.communes;

const pression = { whileHover: { scale: 1.04 }, whileTap: { scale: 0.95 }, transition: { type: "spring", stiffness: 500, damping: 30 } } as const;

/** Phrase annoncée (et affichée) quand on choisit une commune. */
function annonce(nom: string): string {
  const lieu = LIEUX[nom];
  if (nom === ville || !lieu) return remplir(TEXTES.communes.annonceCentre, { commune: nom });
  const km = Math.max(1, Math.round(distanceKm(RESTAURANT, lieu.coord)));
  return remplir(TEXTES.communes.annonce, { commune: nom, km, direction: direction(RESTAURANT, lieu.coord) });
}

/**
 * Panneau « Livraison » : la carte de nuit, puis la liste des communes.
 * Chaque commune est un bouton « Voir … sur la carte » : la carte se cadre sur le trajet depuis le 43,
 * et une phrase (région live) dit où se trouve la commune, pour tout le monde.
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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
      <div className="mx-auto w-full max-w-[36rem] lg:max-w-none">
        <CarteNuit choix={choix} demande={demande} survol={survol} onChoisir={choisir} onEtat={setEtatCarte} />

        {/* Légende des symboles de la carte (le texte utile est dans la liste) ; sans carte, elle s'efface sans décaler la page */}
        <ul
          aria-hidden
          className={`mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-2 text-[0.875rem] text-pierre lg:justify-start ${sansCarte ? "invisible" : ""}`}
        >
          <li className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-calcaire-clair shadow-[0_0_0_2px_rgba(242,211,140,0.35),0_0_12px_4px_rgba(242,211,140,0.5)]" />
            <span className="font-display font-semibold italic text-or-clair">{TEXTES.carte.restaurant}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]" />
            {TEXTES.carte.legende.commune}
          </li>
          <li className="flex items-center gap-2.5">
            <span className="h-3 w-5 rounded-[50%] border-[1.5px] border-dashed border-or-clair/90 bg-or/10" />
            {TEXTES.carte.legende.zone}
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-display text-[1.6rem] font-semibold leading-tight text-calcaire">{TEXTES.communes.titre}</h3>
        <p aria-live="polite" className="mt-2 min-h-[3em] text-[0.9375rem] leading-snug text-pierre">
          {sansCarte ? TEXTES.communes.aideSansCarte : choix ? annonce(choix) : TEXTES.communes.aide}
        </p>

        <ul role="list" className="mt-4 flex flex-wrap gap-2.5">
          {communes.map((nom) => {
            const allume = choix === nom;
            const pastille = (
              <span
                aria-hidden
                className={`size-2 shrink-0 rounded-full bg-halo shadow-[0_0_10px_3px_rgba(242,211,140,0.6)] transition-opacity duration-300 ${
                  allume || survol === nom ? "opacity-100" : "opacity-80"
                }`}
              />
            );
            return (
              <li key={nom}>
                {sansCarte ? (
                  <span className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-filet bg-grain px-4 text-[0.9375rem] font-semibold text-calcaire">
                    {pastille}
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
                    className={`inline-flex min-h-11 items-center gap-2.5 rounded-full border bg-grain px-4 text-[0.9375rem] font-semibold transition-colors duration-200 ${
                      allume ? "border-or-clair text-or-clair" : "border-filet text-calcaire hover:border-calcaire/70"
                    }`}
                    {...pression}
                  >
                    {pastille}
                    {nom}
                  </motion.button>
                )}
              </li>
            );
          })}
        </ul>

        {/* Conditions : lignes à points de conduite, comme sur une carte de restaurant */}
        <dl className="mt-9 space-y-1">
          {INFOS.map(({ libelle, valeur, Icone }) => (
            <div key={libelle} className="flex items-center gap-2.5 py-2">
              <dt className="flex min-w-0 flex-1 items-center gap-2 text-[0.9375rem] text-pierre after:h-0 after:min-w-3 after:flex-1 after:translate-y-[0.35em] after:border-b-2 after:border-dotted after:border-filet/70 after:content-['']">
                <Icone aria-hidden className="size-[1.15rem] shrink-0 text-or-clair" strokeWidth={2} />
                <span className="min-w-0">{libelle}</span>
              </dt>
              <dd className="shrink-0 whitespace-nowrap text-[0.9375rem] font-semibold tabular-nums text-calcaire">
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
