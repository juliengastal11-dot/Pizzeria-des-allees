import { site, type Photo } from "@/config/site";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { Manifeste } from "./histoire/Manifeste";
import { PhotosArches } from "./histoire/PhotosArches";
import { Points } from "./histoire/Points";
import { typographie } from "./histoire/outils";

/**
 * Notre histoire : le manifeste qui s'allume mot à mot, deux arches de la salle,
 * et les trois engagements. Mobile : titre → manifeste → photos → engagements.
 * Ordinateur : texte à gauche, photos à droite.
 */
export function Histoire() {
  const { surtitre, titre, manifeste, points } = site.textes.histoire;
  const galerie: readonly Photo[] = site.photos.galerie;
  const mousse = galerie.find((p) => p.src.includes("salle-cadres-vegetaux"));
  const vignes = galerie.find((p) => p.src.includes("salle-vignes"));

  return (
    <section id="histoire" aria-labelledby="histoire-titre" className="relative overflow-x-clip bg-nuit py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_auto_1fr] lg:gap-x-12 lg:gap-y-12">
          <SectionTitre
            id="histoire-titre"
            surtitre={typographie(surtitre)}
            titre={typographie(titre)}
            className="lg:col-span-7 lg:col-start-1 lg:row-start-1"
          />

          <Manifeste
            texte={typographie(manifeste)}
            className="mt-9 md:mt-12 lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:mt-2"
          />

          <PhotosArches
            grande={mousse}
            petite={vignes}
            className="mt-16 md:mt-20 lg:col-span-5 lg:col-start-8 lg:row-span-3 lg:row-start-1 lg:mt-0 lg:self-center"
          />

          <Points
            points={points}
            className="mt-16 md:mt-20 lg:col-span-7 lg:col-start-1 lg:row-start-3 lg:mt-4"
          />
        </div>
      </div>
    </section>
  );
}
