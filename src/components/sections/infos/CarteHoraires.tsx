"use client";

import { useId, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { JOURS, site, type Jour } from "@/config/site";
import { formatCreneaux, horairesDuJour, libelleJour, maintenantABeziers, statutOuverture, type Statut } from "@/lib/horaires";
import { Valeur } from "@/components/ui/Valeur";
import { useMinuteCourante } from "@/components/sections/infos/useMinuteCourante";

/** « 18 h 30 » ne se coupe jamais en fin de ligne. */
function insecable(texte: string) {
  return texte.replace(/(\d+) h(?: (\d{2}))?/g, (_: string, h: string, m: string | undefined) =>
    m ? `${h} h ${m}` : `${h} h`,
  );
}

function texteStatut(statut: Statut, aujourdhui: Jour): string {
  if (statut.ouvert) return `Ouvert · jusqu'à ${statut.jusqua}`;
  if (!statut.prochaine) return "Fermé";
  const ecart = (JOURS.indexOf(statut.prochaine.jour) - JOURS.indexOf(aujourdhui) + 7) % 7;
  const quand = ecart === 0 ? "" : ecart === 1 ? "demain " : `${statut.prochaine.jour} `;
  return `Fermé · on rallume ${quand}à ${statut.prochaine.heure}`;
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
                  <span className="sr-only"> (aujourd&apos;hui)</span>
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
 * Carte « Horaires ». Tant que `site.horaires.aConfirmer` est vrai : mention
 * [À CONFIRMER] et semaine d'exemple en retrait. Sinon : semaine, jour courant
 * sous une pastille qui suit le survol, et badge Ouvert / Fermé (heure de Béziers,
 * calculée après le montage pour éviter tout écart d'hydratation).
 */
export function CarteHoraires() {
  const aConfirmer: boolean = site.horaires.aConfirmer;
  const minute = useMinuteCourante();
  const [survol, setSurvol] = useState<Jour | null>(null);
  const groupe = useId();

  const instant = aConfirmer || minute === null ? null : new Date(minute * 60_000);
  const aujourdhui = instant ? maintenantABeziers(instant).jour : null;
  const statut = instant ? statutOuverture(instant) : null;

  return (
    <article
      data-surface="clair"
      aria-labelledby="infos-horaires"
      className="h-full rounded-[2.5rem] bg-calcaire-clair p-6 text-nuit shadow-[0_40px_80px_-40px_rgba(6,15,46,0.9)] sm:p-8"
    >
      <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-3">
        <h3 id="infos-horaires" className="font-display text-[1.75rem] font-semibold leading-none">
          Horaires
        </h3>
        {aConfirmer ? (
          <Valeur valeur="[À CONFIRMER]" className="text-[1.0625rem] font-semibold" />
        ) : (
          statut && aujourdhui && <BadgeStatut statut={statut} aujourdhui={aujourdhui} />
        )}
      </div>

      {aConfirmer ? (
        <figure className="mt-5 rounded-[1.75rem] border border-dashed border-eau/50 px-1 pb-2 pt-4 sm:px-2">
          <figcaption className="surtitre px-3 text-eau sm:px-4">Exemple à valider</figcaption>
          <Semaine attenue />
        </figure>
      ) : (
        <LayoutGroup id={groupe}>
          <Semaine actif={survol ?? aujourdhui} aujourdhui={aujourdhui} onSurvol={setSurvol} />
        </LayoutGroup>
      )}
    </article>
  );
}
