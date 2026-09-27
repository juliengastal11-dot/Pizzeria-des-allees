"use client";

import type { RefObject } from "react";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { Fenetre } from "@/components/ui/Fenetre";
import { OrnementPont } from "@/components/ui/OrnementPont";
import { useOuvertures } from "@/components/ui/useOuvertures";
import { adresseComplete, estPlaceholder, site } from "@/config/site";

const { actions } = site.textes;
const TEXTES = actions.fenetreCommande;

const lien =
  "inline-flex min-h-11 items-center gap-2 font-semibold text-or-clair underline-offset-4 transition-colors hover:text-calcaire hover:underline";

type Props = { ouvert: boolean; onFermer: () => void; retour?: RefObject<HTMLElement | null> };

/**
 * Affichée tant que le lien Obypay n'est pas renseigné dans la configuration.
 * Aucun placeholder brut n'est montré au client : sans numéro réel, on renvoie
 * vers l'adresse (itinéraire) plutôt que vers « [À CONFIRMER] ».
 */
export function DialogueCommande({ ouvert, onFermer, retour }: Props) {
  const telReel = !estPlaceholder(site.telephone);
  const ouvertures = useOuvertures(ouvert);

  return (
    <Fenetre ouvert={ouvert} onFermer={onFermer} titre={TEXTES.titre} retour={retour}>
      <div className="space-y-4 px-5 py-6 sm:px-6">
        {/* En attendant la commande en ligne, Béziers se dessine à chaque ouverture */}
        <OrnementPont key={ouvertures} fond="minuit" animation="ornement-fenetres" className="mx-auto mb-6 block w-40 sm:w-44" />
        <p className="text-lg">{TEXTES.annonce}</p>
        {telReel ? (
          <p className="text-pierre">
            {TEXTES.attenteTelephone}{" "}
            <a href={`tel:${site.telephone.replace(/\s/g, "")}`} className={`${lien} tabular-nums`}>
              <Phone aria-hidden className="size-4 shrink-0" />
              {site.telephone}
            </a>
            .
          </p>
        ) : (
          <div className="text-pierre">
            <p>{TEXTES.attenteAdresse}</p>
            <a
              href={site.liens.itineraire}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-2 flex min-h-11 items-start gap-3 py-1 font-semibold text-calcaire transition-colors hover:text-or-clair"
            >
              <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-or" />
              <span>
                {adresseComplete}
                <span className="mt-1 flex items-center gap-1 text-sm text-or-clair">
                  {actions.itineraire}
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
                <span className="sr-only">{` ${actions.nouvelOnglet}`}</span>
              </span>
            </a>
          </div>
        )}
      </div>
    </Fenetre>
  );
}
