"use client";

import { useId, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { JOURS, site, type Jour } from "@/config/site";
import { remplir } from "@/lib/textes";
import { formatCreneaux, horairesDuJour, libelleJour, maintenantABeziers, statutOuverture, type Statut } from "@/lib/horaires";
import { Valeur } from "@/components/ui/Valeur";
import { useMinuteCourante } from "@/components/sections/infos/useMinuteCourante";

const TEXTES = site.textes.infos.horaires;

/** « 18 h 30 » ne se coupe jamais en fin de ligne. */
function insecable(texte: string) {
  return texte.replace(/(\d+) h(?: (\d{2}))?/g, (_: string, h: string, m: string | undefined) =>
    m ? `${h} h ${m}` : `${h} h`,
  );
}

function texteStatut(statut: Statut, aujourdhui: Jour): string {
  if (statut.ouvert) return remplir(TEXTES.ouvert, { heure: statut.jusqua });
  if (!statut.prochaine) return TEXTES.ferme;
  const ecart = (JOURS.indexOf(statut.prochaine.jour) - JOURS.indexOf(aujourdhui) + 7) % 7;
  const quand = ecart === 0 ? "" : ecart === 1 ? TEXTES.demain : statut.prochaine.jour;
  // Aujourd'hui, {quand} est vide : pas de double espace
  return remplir(TEXTES.fermeRallume, { quand, heure: statut.prochaine.heure }).replace(/ {2,}/g, " ");
}

function BadgeStatut({ statut, aujourdhui }: { statut: Statut; aujourdhui: Jour }) {
  return (
    <motion.p
      initial={{ opacity: 0.4, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="inline-flex min-h-10 items-center gap-2.5 rounded-[1.25rem] bg-nuit px-4 py-1.5 text-[0.9375rem] font-semibold leading-snug text-calcaire"
    >
      <span
        aria-hidden
        className={`size-2.5 shrink-0 rounded-full ${
          statut.ouvert ? "bg-halo shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]" : "border-2 border-[#9099b2]"
        }`}
      />
      {insecable(texteStatut(statut, aujourdhui))}
    </motion.p>
  );
}

type PropsSemaine = {
  /** Horaires encore à valider : tout le tableau passe en retrait (texte eau). */
  attenue?: boolean;
  /** Ligne sous la pastille (le jour survolé, sinon aujourd'hui). */
  actif?: Jour | null;
  aujourdhui?: Jour | null;
  onSurvol?: (jour: Jour | null) => void;
};

function Semaine({ attenue = false, actif = null, aujourdhui = null, onSurvol }: PropsSemaine) {
  return (
    <dl className={`mt-3 text-[0.9375rem] sm:text-base ${attenue ? "text-eau" : "text-nuit"}`} onPointerLeave={() => onSurvol?.(null)}>
      {JOURS.map((jour) => {
        const creneaux = horairesDuJour(jour);
        const estAujourdhui = jour === aujourdhui;
        return (
          <div
            key={jour}
            aria-current={estAujourdhui ? "date" : undefined}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") onSurvol?.(jour);
            }}
            className="relative isolate grid grid-cols-[auto_1fr] items-baseline gap-x-3 rounded-[1.4rem] px-3 py-2 sm:px-4"
          >
            {actif === jour && (
              <motion.span
                layoutId="pastille-jour"
                aria-hidden
                className="absolute inset-0 -z-10 rounded-[1.4rem] bg-ciel-pale"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <dt className="flex items-center gap-2 font-semibold">
              {libelleJour(jour)}
              {estAujourdhui && (
                <>
                  <span aria-hidden className="size-2 rounded-full bg-or ring-2 ring-nuit" />
                  <span className="sr-only">{` ${TEXTES.aujourdhui}`}</span>
                </>
              )}
            </dt>
            <dd className="text-right tabular-nums">
              {creneaux.length === 0 ? (
                <span className="italic">{formatCreneaux(creneaux)}</span>
              ) : (
                creneaux.map((c) => (
                  <span key={c.ouverture} className="block">
                    {insecable(formatCreneaux([c]))}
                  </span>
                ))
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/**
 * Semaine confirmée : jour courant sous une pastille qui suit le survol, et badge
 * Ouvert / Fermé (heure de Béziers, lue après le montage pour éviter tout écart
 * d'hydratation). Monté seulement quand les horaires sont validés : sinon, aucune
 * minuterie ne tourne pour rien.
 */
function SemaineConfirmee() {
  const minute = useMinuteCourante();
  const [survol, setSurvol] = useState<Jour | null>(null);
  const groupe = useId();

  const instant = minute === null ? null : new Date(minute * 60_000);
  const aujourdhui = instant ? maintenantABeziers(instant).jour : null;
  const statut = instant ? statutOuverture(instant) : null;

  return (
    <>
      <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-3">
        <h3 id="infos-horaires" className="font-display text-[1.75rem] font-semibold leading-none">
          {TEXTES.titre}
        </h3>
        {statut && aujourdhui && <BadgeStatut statut={statut} aujourdhui={aujourdhui} />}
      </div>
      <LayoutGroup id={groupe}>
        <Semaine actif={survol ?? aujourdhui} aujourdhui={aujourdhui} onSurvol={setSurvol} />
      </LayoutGroup>
    </>
  );
}

/**
 * Horaires pas encore validés : « Horaires [À CONFIRMER] » bien en vue, et la
 * semaine d'exemple (mise en page à valider) repliée, pour qu'aucun client ne
 * s'y fie.
 */
function SemaineAConfirmer() {
  return (
    <>
      <h3 id="infos-horaires" className="flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-[1.75rem] font-semibold leading-none">
        {TEXTES.titre}
        <Valeur valeur={site.horaires.mentionAConfirmer} className="font-sans text-[1.0625rem] font-semibold leading-snug" />
      </h3>
      <p className="mt-3 text-[0.9375rem] leading-snug text-eau">{TEXTES.enAttente}</p>
      <details className="group mt-4 rounded-[1.75rem] border border-dashed border-eau/50 open:pb-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-[1.75rem] px-4 py-2 text-sm font-semibold text-eau transition-colors hover:text-nuit sm:px-5 [&::-webkit-details-marker]:hidden">
          {TEXTES.voirExemple}
          <ChevronDown aria-hidden className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-180" strokeWidth={2.2} />
        </summary>
        <div className="px-1 sm:px-2">
          <Semaine attenue />
        </div>
      </details>
    </>
  );
}

/** Carte « Horaires ». */
export function CarteHoraires() {
  const aConfirmer: boolean = site.horaires.aConfirmer;

  return (
    <article
      data-surface="clair"
      aria-labelledby="infos-horaires"
      className="h-full rounded-[2.5rem] bg-calcaire-clair p-6 text-nuit shadow-[0_40px_80px_-40px_rgba(6,15,46,0.9)] sm:p-8"
    >
      {aConfirmer ? <SemaineAConfirmer /> : <SemaineConfirmee />}
    </article>
  );
}
