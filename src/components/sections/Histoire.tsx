import { site } from "@/config/site";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { Plafond } from "@/components/sections/salle/Plafond";
import { typographie } from "@/lib/textes";
import { Manifeste } from "./histoire/Manifeste";

/**
 * Notre histoire, en court : sous la même voûte d'ampoules que la salle, le
 * titre et un manifeste de deux ou trois lignes qui s'allume mot à mot. Le mur
 * de pizzas et d'ardoises a été retiré (27/09, Julien) : trop d'informations
 * avant La carte, qui présente les pizzas juste après.
 *
 * Le Hero remonte sur elle (marge négative, z-[1], pour que le Pont Vieux
 * morde sur la section suivante) : sans z-index plus haut ici, le haut de
 * cette section (justement où sont les ampoules) resterait cadré derrière
 * le Hero. `z-[2]` la fait passer devant, comme la Salle (jamais recouverte,
 * n'ayant rien au-dessus qui déborde).
 */
export function Histoire() {
  const { surtitre, titre, manifeste } = site.textes.histoire;
  return (
    <section id="histoire" aria-labelledby="histoire-titre" className="relative isolate z-[2] overflow-clip bg-minuit pb-20 pt-28 md:pb-28 md:pt-36">
      <Plafond />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionTitre id="histoire-titre" surtitre={typographie(surtitre)} titre={typographie(titre)} />
        <Manifeste texte={typographie(manifeste)} className="mt-9 md:mt-12" />
      </div>
    </section>
  );
}
