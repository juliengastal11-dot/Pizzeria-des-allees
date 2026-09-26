import { site } from "@/config/site";
import { OrbVague } from "@/components/ui/OrbVague";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { DessinAllees } from "@/components/sections/salle/DessinAllees";
import { Plafond } from "@/components/sections/salle/Plafond";
import { Galerie } from "@/components/sections/salle/Galerie";
import { remplir } from "@/lib/textes";

/**
 * La salle et la terrasse : les Allées Paul-Riquet qui se dessinent en fond,
 * une voûte d'où pendent des ampoules qui s'allument et scintillent, puis les
 * photos en arches inégales qui défilent en continu (et s'agrandissent d'un clic).
 * La section se referme sur la ligne de l'Orb, vers les infos pratiques.
 */
export function Salle() {
  const { surtitre, titre, intro, notePhotos } = site.textes.salle;
  // La capacité vient de site.couverts : le titre ne peut pas la contredire
  const titreComplet = titre.map((ligne) => remplir(ligne, site.couverts));

  return (
    <section id="salle" aria-labelledby="salle-titre" className="relative isolate overflow-clip bg-minuit pt-28 md:pt-36">
      <DessinAllees />
      <Plafond />

      <div className="relative mx-auto max-w-6xl px-5">
        <SectionTitre id="salle-titre" surtitre={surtitre} titre={titreComplet} intro={intro} align="centre" />

        <Galerie photos={site.photos.galerie} titreFenetre={surtitre} />

        {site.photos.provisoires && (
          <p className="mx-auto mt-8 max-w-[40ch] text-center text-sm italic text-pierre lg:mt-12">{notePhotos}</p>
        )}
      </div>

      <OrbVague haut="var(--color-minuit)" bas="var(--color-nuit)" inverse className="mt-14 md:mt-20" />
    </section>
  );
}
