"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { LIEUX } from "./geographie";
import type { CarteNuitGL, CommuneCarte } from "./moteurCarte";

const TEXTES = site.textes.livraison.carte;

export type EtatCarte = "attente" | "chargement" | "prete" | "echec" | "economie";

/** Communes de la config qui ont des coordonnées (voir geographie.ts). */
const COMMUNES: CommuneCarte[] = site.livraison.communes.flatMap((nom) => {
  const lieu = LIEUX[nom];
  return lieu ? [{ nom, lieu }] : [];
});

type Props = {
  /** Commune mise en lumière (null : toute la zone). */
  choix: string | null;
  /** Compteur de demandes : un nouveau clic sur la même commune recadre la carte. */
  demande: number;
  /** Commune survolée dans la liste (souris) : son halo s'avive, sans bouger la carte. */
  survol: string | null;
  onChoisir: (nom: string) => void;
  onEtat: (etat: EtatCarte) => void;
};

/**
 * Carte de nuit de la zone de livraison (MapLibre GL + OpenFreeMap).
 * MapLibre n'est téléchargé qu'à l'approche de la section ; en attendant, ou si WebGL manque,
 * un panneau de nuit de même taille tient la place (aucun décalage de mise en page).
 */
export function CarteNuit({ choix, demande, survol, onChoisir, onEtat }: Props) {
  const panneau = useRef<HTMLDivElement>(null);
  const cible = useRef<HTMLDivElement>(null);
  const moteur = useRef<CarteNuitGL | null>(null);
  const surChoix = useRef(onChoisir);
  const [etat, setEtat] = useState<EtatCarte>("attente");
  // Économiseur de données : la carte attend que le visiteur la demande
  const [demandee, setDemandee] = useState(false);

  useEffect(() => {
    surChoix.current = onChoisir;
  }, [onChoisir]);

  useEffect(() => {
    onEtat(etat);
  }, [etat, onEtat]);

  useEffect(() => {
    const zone = panneau.current;
    const conteneur = cible.current;
    if (!zone || !conteneur) return;
    let annule = false;

    const charger = () => {
      setEtat("chargement");
      import("./moteurCarte")
        .then(({ creerCarte }) => {
          if (annule) return null;
          return creerCarte({
            conteneur,
            communes: COMMUNES,
            lignesRestaurant: site.nomLignes,
            zone: site.livraison.zoneDefinie,
            locale: { ...TEXTES.locale },
            libelleRecentrer: TEXTES.recentrer,
            surChoix: (nom) => surChoix.current(nom),
            surPret: () => {
              if (!annule) setEtat("prete");
            },
            surEchec: () => {
              if (!annule) setEtat("echec");
            },
          });
        })
        .then((carte) => {
          if (!carte) return;
          if (annule) carte.detruire();
          else moteur.current = carte;
        })
        .catch(() => {
          if (!annule) setEtat("echec");
        });
    };

    const approche = new IntersectionObserver(
      ([entree]) => {
        if (!entree?.isIntersecting) return;
        approche.disconnect();
        const connexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (connexion?.saveData && !demandee) setEtat("economie");
        else charger();
      },
      { rootMargin: "600px 0px" },
    );
    approche.observe(zone);

    return () => {
      annule = true;
      approche.disconnect();
      moteur.current?.detruire();
      moteur.current = null;
    };
  }, [demandee]);

  useEffect(() => {
    if (etat === "prete") moteur.current?.choisir(choix);
  }, [choix, demande, etat]);

  useEffect(() => {
    if (etat === "prete") moteur.current?.survoler(survol);
  }, [survol, etat]);

  const prete = etat === "prete";
  const message = etat === "echec" ? TEXTES.echec : etat === "economie" ? TEXTES.economie : null;

  return (
    <div
      ref={panneau}
      className="carte-nuit relative isolate h-[25rem] overflow-hidden rounded-[50%_50%_2.5rem_2.5rem/4.5rem_4.5rem_2.5rem_2.5rem] border border-filet/40 bg-minuit sm:h-[28rem] lg:h-[31.5rem]"
    >
      {/* MapLibre pose `position: relative` sur ce conteneur (feuille non « layered », prioritaire) : taille explicite */}
      <div ref={cible} className="h-full w-full" />

      {/* Panneau d'attente et de secours : même taille, même nuit */}
      <div
        aria-hidden={message ? undefined : true}
        className={`absolute inset-0 flex flex-col items-center justify-end bg-minuit px-8 pb-10 text-center transition-opacity duration-700 ease-out motion-reduce:duration-0 ${
          prete ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_46%,rgb(from_var(--color-halo)_r_g_b_/_0.12),transparent_62%)]" />
          {[78, 58, 38].map((taille) => (
            <div
              key={taille}
              className="absolute left-1/2 top-[46%] aspect-[1.35] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-filet/25"
              style={{ width: `${taille}%` }}
            />
          ))}
          <div className="absolute left-[46%] top-[46%] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-calcaire-clair shadow-[0_0_0_3px_rgb(from_var(--color-halo)_r_g_b_/_0.35),0_0_22px_8px_rgb(from_var(--color-halo)_r_g_b_/_0.55)]" />
        </div>

        {message ? (
          <div className="relative max-w-[22rem]">
            <p className="text-[0.9375rem] leading-snug text-calcaire">{message}</p>
            {etat === "economie" && (
              <button
                type="button"
                onClick={() => setDemandee(true)}
                className="mt-4 inline-flex min-h-11 items-center rounded-full border-[1.5px] border-calcaire/85 px-5 font-semibold text-calcaire transition-colors duration-200 hover:bg-calcaire/10"
              >
                {TEXTES.afficher}
              </button>
            )}
          </div>
        ) : (
          <p className="relative font-accent text-[0.9375rem] italic text-pierre">{TEXTES.chargement}</p>
        )}
      </div>
    </div>
  );
}
