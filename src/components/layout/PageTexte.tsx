import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { estPlaceholder, site } from "@/config/site";
import { dateLisible } from "@/lib/textes";
import { OrnementPont } from "@/components/ui/OrnementPont";
import { Valeur } from "@/components/ui/Valeur";

const { pagesLegales, actions } = site.textes;

/*
 * Mise en page des pages de texte (mentions légales, confidentialité) :
 * fond Bleu des Allées, colonne de lecture étroite, ornement en arche avec le
 * Pont Vieux qui s'allume, et un filet vertical le long des sections.
 */

type Props = {
  titre: string;
  surtitre?: string;
  chapo?: ReactNode;
  /** Date de mise à jour affichée sous le titre, au format AAAA-MM-JJ. */
  miseAJour?: string;
  /** Encadré d'avertissement (ex. document provisoire), au-dessus du texte. */
  avertissement?: { titre: string; texte: ReactNode };
  children: ReactNode;
};

export function PageTexte({ titre, surtitre, chapo, miseAJour, avertissement, children }: Props) {
  return (
    <article aria-labelledby="titre-page" className="relative isolate overflow-hidden">
      {/* Halo de lampadaire derrière l'ornement */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[40rem] -translate-x-1/2 -translate-y-[38%] rounded-full bg-[radial-gradient(closest-side,rgba(242,211,140,0.11),rgba(242,211,140,0.03)_60%,transparent)]"
      />

      <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 md:pb-32 md:pt-36">
        <header className="text-center">
          <OrnementPont className="mx-auto block w-[13.5rem] sm:w-[15.5rem]" />
          {surtitre && (
            <p className="surtitre mt-9 text-pierre">
              {surtitre}
            </p>
          )}
          <h1
            id="titre-page"
            className="mt-4 text-[clamp(2.4rem,1.6rem+3.6vw,4.25rem)] font-semibold tracking-[-0.02em] text-calcaire"
          >
            {titre}
          </h1>
          {chapo && <p className="mx-auto mt-6 max-w-[58ch] text-[1.0625rem] leading-relaxed text-pierre md:text-[1.125rem]">{chapo}</p>}
          {miseAJour && (
            <p className="mt-5 text-[0.9375rem] text-pierre">
              {pagesLegales.miseAJour} <time dateTime={miseAJour}>{dateLisible(miseAJour)}</time>
            </p>
          )}
        </header>

        {avertissement && (
          <div
            role="note"
            className="mx-auto mt-12 max-w-prose rounded-[1.75rem] border border-dashed border-or-clair/70 bg-minuit/70 px-5 py-4 sm:px-6"
          >
            <p className="font-semibold text-or-clair">
              {avertissement.titre}
            </p>
            <div className="mt-1.5 text-[0.9375rem] leading-relaxed text-pierre">{avertissement.texte}</div>
          </div>
        )}

        {/* L'allée : un filet vertical le long des sections */}
        <div
          className={[
            "relative mx-auto mt-14 max-w-prose space-y-14 text-pierre md:mt-16",
            "[&_p]:leading-[1.7]",
            "[&_strong]:font-semibold [&_strong]:text-calcaire",
            "[&_a]:text-or-clair [&_a]:underline [&_a]:decoration-or-clair/50 [&_a]:decoration-1 [&_a]:underline-offset-[0.2em]",
            "[&_a]:transition-[text-decoration-color] [&_a]:duration-200 [&_a:hover]:decoration-or-clair",
          ].join(" ")}
        >
          <div
            aria-hidden
            className="absolute bottom-0 left-0 top-3 w-px bg-linear-to-b from-filet/80 via-filet/40 to-transparent"
          />
          {children}
        </div>

        <div className="mx-auto mt-20 flex max-w-prose justify-center sm:justify-start sm:pl-10">
          <Link
            href="/"
            className="group inline-flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-calcaire/85 px-6 font-semibold text-calcaire transition-colors duration-200 hover:bg-calcaire/10"
          >
            <ArrowLeft
              aria-hidden
              strokeWidth={2.2}
              className="size-[1.1em] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            {pagesLegales.retour}
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Section de texte : H2 relié à la section. */
export function SectionTexte({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  const idTitre = `${id}-titre`;
  return (
    <section id={id} aria-labelledby={idTitre} className="relative scroll-mt-28 pl-7 sm:pl-10">
      <h2 id={idTitre} className="text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-semibold tracking-[-0.01em] text-calcaire">
        {titre}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Fiche d'informations (libellé / valeur), sur une surface grain bordée de filet. */
export function Fiche({ children }: { children: ReactNode }) {
  return <dl className="rounded-[1.75rem] border border-filet/60 bg-grain px-5 py-1.5 sm:px-7">{children}</dl>;
}

export function Ligne({ terme, children }: { terme: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-dashed border-filet/45 py-3.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="shrink-0 text-[0.9375rem] text-pierre sm:w-44">{terme}</dt>
      <dd className="min-w-0 break-words text-calcaire">{children}</dd>
    </div>
  );
}

/** Liste à puces en ovale (écluses de Fonseranes). */
export function Liste({ children }: { children: ReactNode }) {
  return <ul className="space-y-2.5">{children}</ul>;
}

export function Point({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-6">
      <span aria-hidden className="absolute left-0 top-[0.68em] block h-1.5 w-3 rounded-full bg-filet" />
      {children}
    </li>
  );
}

/** Lien vers un site externe (nouvel onglet). Désactivé si l'adresse est un placeholder. */
export function LienExterne({ href, children }: { href: string; children: ReactNode }) {
  if (estPlaceholder(href)) return <Valeur valeur={href} />;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline">
      {children}
      <ArrowUpRight aria-hidden strokeWidth={2.2} className="ml-0.5 inline size-[0.95em] -translate-y-px align-middle" />
      <span className="sr-only">{` ${actions.nouvelOnglet}`}</span>
    </a>
  );
}

/** Valeur de configuration cliquable (tel:, mailto:), ou en pointillés tant que c'est un placeholder. */
export function LienValeur({ valeur, href }: { valeur: string; href: string }) {
  if (estPlaceholder(valeur)) return <Valeur valeur={valeur} />;
  return <a href={href}>{valeur}</a>;
}
