import { site, type Photo } from "@/config/site";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { Manifeste } from "./histoire/Manifeste";
import { PhotosArches } from "./histoire/PhotosArches";
import { Points } from "./histoire/Points";
import { typographie } from "./histoire/outils";

/**
 * Notre histoire : le manifeste qui s'allume mot à mot, deux arches de la salle,
 * et les trois engagements. Mobile : titre → manifeste → photos → engagements.
 * Ordinateur : texte à gauche face aux photos, engagements en trois colonnes dessous.
 */
export function Histoire() {
  const { surtitre, titre, manifeste, points } = site.textes.histoire;
  const galerie: readonly Photo[] = site.photos.galerie;
  // Les deux arches : photos de la galerie choisies dans site.photos.histoire
  const grande = galerie.find((p) => p.src === site.photos.histoire.grande);
  const petite = galerie.find((p) => p.src === site.photos.histoire.petite);

  return (
    <section id="histoire" aria-labelledby="histoire-titre" className="relative overflow-x-clip bg-nuit py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {/* Bureau : titre et manifeste à gauche face aux photos, puis les trois engagements sur toute la largeur */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto] lg:gap-x-12">
          <SectionTitre
            id="histoire-titre"
            surtitre={typographie(surtitre)}
            titre={typographie(titre)}
            className="lg:col-span-7 lg:col-start-1 lg:row-start-1"
          />

          <Manifeste
            texte={typographie(manifeste)}
            className="mt-9 md:mt-12 lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:mt-10 lg:self-start"
          />

          <PhotosArches
            grande={grande}
            petite={petite}
            className="mt-16 md:mt-20 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:mt-6 lg:self-start"
          />

          <Points
            points={points}
            className="mt-16 md:mt-20 lg:col-span-12 lg:col-start-1 lg:row-start-3 lg:mt-24"
          />
        </div>
      </div>
    </section>
  );
}
