import { Armchair, Trees } from "lucide-react";
import { site } from "@/config/site";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { Plafond } from "@/components/sections/salle/Plafond";
import { Galerie } from "@/components/sections/salle/Galerie";

// À déplacer dans site.textes.salle quand la config le prévoira
const NOTE_PHOTOS = "Photos provisoires : le shooting de la réouverture arrive.";

/**
 * La salle et la terrasse : un plafond d'où pendent des ampoules qui
 * s'allument, puis les photos en arches inégales, filtrables et agrandissables.
 */
export function Salle() {
  const { surtitre, titre, intro } = site.textes.salle;

  return (
    <section id="salle" aria-labelledby="salle-titre" className="relative isolate overflow-clip bg-minuit py-24 md:py-32">
      <Plafond />

      <div className="relative mx-auto max-w-6xl px-5">
        <SectionTitre id="salle-titre" surtitre={surtitre} titre={titre} intro={intro} align="centre" />

        <Galerie photos={site.photos.galerie} titreFenetre={surtitre} />

        <div className="mt-8 flex flex-col items-center gap-4 text-center lg:mt-12">
          <ul className="flex flex-wrap justify-center gap-2.5 text-[0.95rem] font-semibold text-calcaire">
            <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-filet/60 bg-grain px-4">
              <Armchair aria-hidden className="size-4 text-or-clair" strokeWidth={2} />
              <span className="tabular-nums">{site.couverts.salle}</span> couverts en salle
            </li>
            <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-filet/60 bg-grain px-4">
              <Trees aria-hidden className="size-4 text-or-clair" strokeWidth={2} />
              <span className="tabular-nums">{site.couverts.terrasse}</span> en terrasse
            </li>
          </ul>
          {site.photos.provisoires && <p className="max-w-[40ch] text-sm italic text-pierre">{NOTE_PHOTOS}</p>}
        </div>
      </div>
    </section>
  );
}
