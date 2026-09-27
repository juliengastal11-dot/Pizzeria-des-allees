import { ArrowUpRight, Gift } from "lucide-react";
import { estPlaceholder, site } from "@/config/site";
import { Valeur } from "@/components/ui/Valeur";
import { Entree } from "@/components/sections/infos/Entree";

/**
 * Bandeau fidélité, prêt mais masqué : il n'apparaît que lorsque
 * `site.fidelite.actif` passe à true dans la configuration.
 */
export function Fidelite() {
  const actif: boolean = site.fidelite.actif;
  if (!actif) return null;

  const url: string = site.fidelite.url;
  const lienPret = !estPlaceholder(url);

  return (
    <section aria-labelledby="fidelite-titre" className="bg-nuit px-5 pt-16 md:px-8 md:pt-24">
      <h2 id="fidelite-titre" className="sr-only">
        {site.fidelite.titre}
      </h2>
      <Entree className="mx-auto max-w-4xl">
        <div
          data-surface="clair"
          className="flex flex-col items-center gap-4 rounded-[2.5rem] bg-calcaire-clair px-6 py-6 text-center text-encre sm:flex-row sm:rounded-full sm:py-3 sm:pl-3 sm:pr-3 sm:text-left"
        >
          <span aria-hidden className="grid h-12 w-14 shrink-0 place-items-center rounded-[50%] bg-nuit text-or-clair">
            <Gift className="size-5" strokeWidth={2.1} />
          </span>
          <p className="flex-1 text-[1.0625rem] font-semibold leading-snug">{site.fidelite.texte}</p>
          {lienPret ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-nuit px-6 font-semibold text-calcaire transition-colors duration-200 hover:bg-grain"
            >
              {site.fidelite.bouton}
              <ArrowUpRight
                aria-hidden
                className="size-[1em] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
              <span className="sr-only">{` ${site.textes.actions.nouvelOnglet}`}</span>
            </a>
          ) : (
            <span className="inline-flex min-h-12 shrink-0 items-center gap-2 px-4 font-semibold text-eau">
              {site.fidelite.bouton} <Valeur valeur={url} cle="fidelite.url" className="text-sm" />
            </span>
          )}
        </div>
      </Entree>
    </section>
  );
}
