"use client";

import { useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";
import { Fenetre } from "@/components/ui/Fenetre";
import { estPlaceholder, site } from "@/config/site";

/**
 * Réservation TheFork : le widget n'est chargé qu'à l'ouverture de la fenêtre
 * (aucun contenu tiers ni cookie tant que le visiteur ne le demande pas).
 */
export function DialogueReservation({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const [charge, setCharge] = useState(false);
  // Le widget reste monté après la première ouverture (pas de rechargement à chaque fois)
  const [demande, setDemande] = useState(false);
  if (ouvert && !demande) setDemande(true);

  const telReel = !estPlaceholder(site.telephone);

  return (
    <Fenetre ouvert={ouvert} onFermer={onFermer} titre="Réserver une table" large>
      <div className="relative h-[min(70svh,40rem)] bg-calcaire-clair" data-surface="clair">
        {!charge && (
          <p className="absolute inset-0 grid place-items-center px-6 text-center text-eau" role="status">
            Chargement du module de réservation…
          </p>
        )}
        {demande && (
          <iframe
            src={site.liens.reserver}
            title="Réservation en ligne avec TheFork"
            className="relative size-full border-0"
            onLoad={() => setCharge(true)}
            allow="payment"
          />
        )}
      </div>
      <div className="flex flex-col gap-3 px-5 py-4 text-sm text-pierre sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Module fourni par TheFork.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a
            href={site.liens.reserver}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-or-clair underline-offset-4 hover:underline"
          >
            Ouvrir dans un nouvel onglet
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
          {telReel && (
            <a
              href={`tel:${site.telephone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 font-semibold text-or-clair underline-offset-4 hover:underline"
            >
              <Phone aria-hidden className="size-4" />
              {site.telephone}
            </a>
          )}
        </div>
      </div>
    </Fenetre>
  );
}
