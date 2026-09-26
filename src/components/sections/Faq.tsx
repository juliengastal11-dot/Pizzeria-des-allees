import { ChevronDown } from "lucide-react";
import { site } from "@/config/site";
import { enumererOu, remplir, typographie } from "@/lib/textes";
import { SectionTitre } from "@/components/ui/SectionTitre";
import { Entree } from "@/components/sections/infos/Entree";

const TEXTES = site.textes.faq;

/** Jetons remplacés dans les réponses (voir aussi `faqJsonLd`, qui recalcule les mêmes). */
const JETONS_FAQ = { communes: enumererOu(site.livraison.communes), ...site.couverts };

/**
 * FAQ, en accordéon natif (`<details>`/`<summary>`) : chaque réponse est déjà
 * dans le HTML envoyé par le serveur, seulement repliée visuellement (le
 * navigateur s'en charge, sans JavaScript) — indispensable pour que les moteurs
 * de recherche l'indexent, et cohérent avec les données structurées FAQPage
 * (`faqJsonLd`, incluses dans `layout.tsx`), qui portent le même texte.
 */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-titre" className="relative isolate bg-nuit py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <SectionTitre id="faq-titre" surtitre={TEXTES.surtitre} titre={TEXTES.titre} align="centre" />

        <div className="mt-10 space-y-3 md:mt-14">
          {TEXTES.items.map(({ question, reponse }, i) => (
            <Entree key={question} delai={Math.min(i * 0.06, 0.3)}>
              <details className="group rounded-[1.75rem] border border-filet/50 bg-grain/60 open:bg-grain">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-[1.75rem] px-5 py-3.5 font-semibold text-calcaire transition-colors hover:text-or-clair sm:px-6 [&::-webkit-details-marker]:hidden">
                  {typographie(question)}
                  <ChevronDown
                    aria-hidden
                    className="size-5 shrink-0 text-or-clair transition-transform duration-300 group-open:rotate-180"
                    strokeWidth={2.2}
                  />
                </summary>
                <div className="px-5 pb-5 leading-relaxed text-pierre sm:px-6">{typographie(remplir(reponse, JETONS_FAQ))}</div>
              </details>
            </Entree>
          ))}
        </div>
      </div>
    </section>
  );
}
