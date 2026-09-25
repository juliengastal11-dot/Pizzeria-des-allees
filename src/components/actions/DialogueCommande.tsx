"use client";

import { Fenetre } from "@/components/ui/Fenetre";
import { Valeur } from "@/components/ui/Valeur";
import { site } from "@/config/site";

/** Affichée tant que le lien Obypay n'est pas renseigné dans la configuration. */
export function DialogueCommande({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  return (
    <Fenetre ouvert={ouvert} onFermer={onFermer} titre="Commander en ligne">
      <div className="space-y-4 px-5 py-6 sm:px-6">
        <p className="text-lg">
          La commande en ligne, en click &amp; collect ou en livraison, ouvre très bientôt.
        </p>
        <p className="text-pierre">
          Lien de l&apos;outil de commande : <Valeur valeur={site.liens.commander} />
        </p>
        <p className="text-pierre">
          En attendant, appelez-nous au <Valeur valeur={site.telephone} />.
        </p>
      </div>
    </Fenetre>
  );
}
