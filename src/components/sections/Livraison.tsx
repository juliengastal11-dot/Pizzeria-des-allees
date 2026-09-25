import { SectionTitre } from "@/components/ui/SectionTitre";
import { site } from "@/config/site";
import { Onglets } from "./livraison/Onglets";

/** Livraison et à emporter : schéma lumineux des communes livrées, ou les trois écluses du retrait au 43. */
export function Livraison() {
  const t = site.textes.livraison;
  return (
    <section id="livraison" aria-labelledby="livraison-titre" className="relative isolate overflow-hidden bg-nuit py-24 md:py-32">
      {/* Décor : un grand bassin ovale et un halo, immobiles */}
      <div aria-hidden className="pointer-events-none absolute -z-10 inset-0">
        <div className="absolute -right-48 -top-28 h-[26rem] w-[42rem] rounded-[50%] border border-filet/15" />
        <div className="absolute -right-32 -top-16 h-[20rem] w-[32rem] rounded-[50%] border border-filet/10" />
        <div className="absolute -left-40 bottom-0 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(136,168,220,0.07),transparent_65%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-5">
        <Onglets entete={<SectionTitre id="livraison-titre" surtitre={t.surtitre} titre={t.titre} intro={t.intro} />} />
      </div>
    </section>
  );
}
