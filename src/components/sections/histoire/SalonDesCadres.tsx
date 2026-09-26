"use client";

import { useRef } from "react";
import { site } from "@/config/site";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { typographie } from "@/lib/textes";
import { Manifeste } from "./Manifeste";
import { MurDeCadres } from "./MurDeCadres";

/**
 * Le salon : à gauche le titre et le manifeste (qui restent en place pendant
 * que l'on descend, en grand écran), à droite le mur de cadres. Le manifeste
 * s'allume mot à mot sur l'arrivée du mur à l'écran (même point de départ).
 * Mobile : titre, manifeste, puis le mur sur deux colonnes.
 */
export function SalonDesCadres() {
  const mur = useRef<HTMLDivElement>(null);
  const { surtitre, titre, manifeste } = site.textes.histoire;

  return (
    <div className="grid grid-cols-1 gap-y-14 md:gap-y-16 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionTitre id="histoire-titre" surtitre={typographie(surtitre)} titre={typographie(titre)} />
        <Manifeste texte={typographie(manifeste)} cible={mur} className="mt-9 md:mt-12 lg:mt-10" />
      </div>

      <MurDeCadres conteneur={mur} />
    </div>
  );
}
