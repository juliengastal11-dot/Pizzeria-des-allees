import { site } from "@/config/site";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { Entree } from "@/components/sections/infos/Entree";
import { FondAllees } from "@/components/sections/infos/FondAllees";
import { CarteAdresse } from "@/components/sections/infos/CarteAdresse";
import { CarteHoraires } from "@/components/sections/infos/CarteHoraires";
import { CarteContact } from "@/components/sections/infos/CarteContact";

/**
 * Infos pratiques : sur mobile, cartes empilées ; en grand écran, bento
 * asymétrique (l'adresse en arche à gauche sur deux rangées, horaires et
 * contact à droite). En fond, les Allées au soleil couchant tournent en boucle
 * sous un voile nuit. La section suit la ligne de l'Orb qui referme la salle.
 */
export function Infos() {
  const { surtitre, titre } = site.textes.infos;
  return (
    <section id="infos" aria-labelledby="infos-titre" className="relative isolate bg-nuit pb-24 pt-14 md:pb-32 md:pt-20">
      <FondAllees />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionTitre id="infos-titre" surtitre={surtitre} titre={titre} />
        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6 lg:grid-cols-[1.12fr_1fr]">
          <Entree className="md:row-span-2">
            <CarteAdresse />
          </Entree>
          <Entree delai={0.08}>
            <CarteHoraires />
          </Entree>
          <Entree delai={0.16}>
            <CarteContact />
          </Entree>
        </div>
      </div>
    </section>
  );
}
