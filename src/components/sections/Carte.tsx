import { site } from "@/config/site";
import { BoutonCommander } from "@/components/actions/Boutons";
import { OrbVague } from "@/components/ui/OrbVague";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { CarrouselPizzas } from "./carte/CarrouselPizzas";
import { CielDecor } from "./carte/CielDecor";

// `note` est prévue dans la config ; à défaut, phrase par défaut.
const textes: typeof site.textes.carte & { note?: string } = site.textes.carte;
const note = textes.note ?? "La carte complète et les prix à jour sont sur notre outil de commande.";

/**
 * La carte : une sélection de pizzas posées sur des arches, sur le Ciel de Béziers.
 * Tous les textes sont en bleu nuit (6,9:1 sur ciel), jamais en calcaire.
 */
export function Carte() {
  return (
    <section id="carte" aria-labelledby="carte-titre" data-surface="clair" className="relative isolate bg-ciel text-nuit">
      <OrbVague haut="var(--color-nuit)" bas="var(--color-ciel)" />

      <div className="relative pb-20 pt-10 md:pb-28 md:pt-16">
        <CielDecor />

        <div className="relative mx-auto max-w-6xl px-5">
          <SectionTitre
            id="carte-titre"
            surface="clair"
            align="centre"
            surtitre={textes.surtitre}
            titre={textes.titre}
            intro={textes.intro}
          />
        </div>

        <CarrouselPizzas pizzas={site.pizzas} className="relative mt-4 md:mt-8" />

        <div className="relative mx-auto mt-14 flex max-w-xl flex-col items-center px-5 text-center md:mt-20">
          <BoutonCommander variante="nuit" forme="arche" className="min-h-14! px-8! shadow-[0_18px_36px_-18px_rgba(5,26,75,0.7)]">
            {textes.bouton}
          </BoutonCommander>
          <p className="mt-4 max-w-[36ch] text-[0.9375rem] leading-relaxed text-nuit/80">{note}</p>
        </div>
      </div>

      <OrbVague haut="var(--color-ciel)" bas="var(--color-nuit)" inverse />
    </section>
  );
}
