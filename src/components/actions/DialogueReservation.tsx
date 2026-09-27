"use client";

import { useState, type RefObject } from "react";
import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { Fenetre } from "@/components/ui/Fenetre";
import { OrnementPont } from "@/components/ui/OrnementPont";
import { useOuvertures } from "@/components/ui/useOuvertures";
import { estPlaceholder, site } from "@/config/site";

const TEXTES = site.textes.actions.fenetreReservation;

const lien = "inline-flex min-h-11 items-center gap-1.5 py-2 font-semibold text-or-clair underline-offset-4 hover:underline";

type Props = { ouvert: boolean; onFermer: () => void; retour?: RefObject<HTMLElement | null> };

/**
 * Réservation TheFork : le widget n'est chargé qu'à l'ouverture de la fenêtre
 * (aucun contenu tiers ni cookie tant que le visiteur ne le demande pas).
 */
export function DialogueReservation({ ouvert, onFermer, retour }: Props) {
  const [charge, setCharge] = useState(false);
  // Le widget reste monté après la première ouverture (pas de rechargement à chaque fois)
  const [demande, setDemande] = useState(false);
  if (ouvert && !demande) setDemande(true);
  const ouvertures = useOuvertures(ouvert);

  const telReel = !estPlaceholder(site.telephone);

  return (
    <Fenetre ouvert={ouvert} onFermer={onFermer} titre={TEXTES.titre} retour={retour} large>
      {/* Hauteur : ce qui reste entre le titre et les liens de secours, qui restent visibles sans défiler */}
      <div className="relative h-[min(calc(92svh-13.5rem),40rem)] min-h-80 bg-calcaire-clair" data-surface="clair">
        {/* Le temps que TheFork charge, Béziers se dessine ; le module le recouvre dès qu'il s'affiche */}
        {!charge && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
            <OrnementPont key={ouvertures} fond="clair" animation="ornement-fenetres" className="w-44 sm:w-52" />
            <p className="text-eau" role="status">
              {TEXTES.chargement}
            </p>
          </div>
        )}
        {demande && (
          <iframe
            src={site.liens.reserver}
            title={TEXTES.titreIframe}
            className="relative size-full border-0"
            onLoad={() => setCharge(true)}
            allow="payment"
          />
        )}
      </div>
      <div className="flex flex-col gap-2 px-5 py-3 text-sm text-pierre sm:px-6">
        <p className="pt-1">
          {TEXTES.fournisseur}{" "}
          <Link href="/confidentialite" className="font-semibold text-calcaire underline underline-offset-4 hover:text-or-clair">
            {TEXTES.confidentialite}
          </Link>
        </p>
        <div className="flex flex-wrap gap-x-5">
          <a href={site.liens.reserver} target="_blank" rel="noopener noreferrer" className={lien}>
            {TEXTES.ouvrirOnglet}
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
          {telReel && (
            <a href={`tel:${site.telephone.replace(/\s/g, "")}`} className={`${lien} tabular-nums`}>
              <Phone aria-hidden className="size-4" />
              {site.telephone}
            </a>
          )}
        </div>
      </div>
    </Fenetre>
  );
}
