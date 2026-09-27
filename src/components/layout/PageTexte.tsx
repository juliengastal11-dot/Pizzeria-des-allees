import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import * as motion from "motion/react-client";
import { estPlaceholder, site } from "@/config/site";
import { dateLisible } from "@/lib/textes";
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

const ENTREE = [0.22, 1, 0.36, 1] as [number, number, number, number];

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
          <OrnementPont />
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

/* ---------------------------------------------------------------------------
 * Ornement : fenêtre en arche, Saint-Nazaire sur sa colline, le Pont Vieux et
 * ses réverbères qui s'allument un à un, l'Orb dessous.
 * ------------------------------------------------------------------------ */

const ARCHE = "M24 112 A96 96 0 0 1 216 112 V152 Q216 168 200 168 H40 Q24 168 24 152 Z";
const COLLINE = "M24 116 C40 106 56 98 78 96 S122 99 140 108 S190 118 216 116";
const CATHEDRALE =
  "M70 97 V64 H72.5 V60.5 H75.5 V64 H78.5 V60.5 H81.5 V64 H84 V97 M84 74 H106 V99 M106 82 C112 82 116 86 116 92 V101 M64 98 V80 H70 M77 69 V75";
const TABLIER = "M26 129 Q120 117 214 129";
const ARCADES =
  "M30 154 V141 A10 9 0 0 1 50 141 V154 M54 154 V141 A12 10.5 0 0 1 78 141 V154 M82 154 V141 A11 10 0 0 1 104 141 V154 M108 154 V141 A13 11 0 0 1 134 141 V154 M138 154 V141 A10 9 0 0 1 158 141 V154 M162 154 V141 A11 10 0 0 1 184 141 V154 M188 154 V141 A10 9 0 0 1 208 141 V154";
const EAU = "M24 156 C56 151 88 161 120 156 S184 151 216 156";
const EAU_2 = "M40 163 C70 159 96 166 120 163 S170 159 200 163";
const LUNE = "M166 42 a11 11 0 1 0 9 17 a9 9 0 1 1 -9 -17 z";
/** Réverbères posés sur le tablier (y = hauteur du tablier à cet endroit). */
const REVERBERES = [
  { x: 44, y: 126.9 },
  { x: 72, y: 124.6 },
  { x: 100, y: 123.3 },
  { x: 128, y: 123 },
  { x: 156, y: 123.9 },
  { x: 184, y: 125.8 },
];
const ETOILES = [
  { x: 100, y: 36 },
  { x: 140, y: 40 },
  { x: 196, y: 86 },
  { x: 52, y: 84 },
];

function trace(delai: number, duree = 1.3) {
  return {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: duree, delay: delai, ease: ENTREE },
  };
}

function apparition(delai: number) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, delay: delai, ease: ENTREE },
  };
}

function OrnementPont() {
  return (
    <svg
      data-animation="ornement-pont"
      viewBox="0 0 240 176"
      aria-hidden
      focusable="false"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto block w-[13.5rem] overflow-visible sm:w-[15.5rem]"
    >
      <defs>
        <clipPath id="ornement-arche">
          <path d={ARCHE} />
        </clipPath>
        <radialGradient id="ornement-lueur">
          <stop offset="0" stopColor="var(--color-halo)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--color-halo)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={ARCHE} fill="var(--color-minuit)" fillOpacity="0.6" />

      <g clipPath="url(#ornement-arche)">
        {ETOILES.map((e, i) => (
          <motion.circle key={i} cx={e.x} cy={e.y} r="0.9" fill="var(--color-calcaire)" {...apparition(0.9 + i * 0.12)} />
        ))}
        <motion.path d={LUNE} fill="var(--color-or-clair)" fillOpacity="0.9" {...apparition(1.1)} />

        <motion.path d={COLLINE} stroke="var(--color-pierre)" strokeOpacity="0.55" strokeWidth="1.2" {...trace(0.35, 1.4)} />
        <motion.path d={CATHEDRALE} stroke="var(--color-pierre)" strokeWidth="1.3" {...trace(0.5, 1.6)} />
        <motion.circle cx="95" cy="84" r="3.2" stroke="var(--color-pierre)" strokeWidth="1.1" {...trace(1.2, 0.8)} />

        <motion.path d={TABLIER} stroke="var(--color-calcaire)" strokeWidth="1.5" {...trace(0.7, 1.2)} />
        <motion.path d={ARCADES} stroke="var(--color-calcaire)" strokeWidth="1.3" {...trace(0.85, 1.5)} />

        <motion.path d={EAU} stroke="var(--color-orb)" strokeWidth="1.4" {...trace(1, 1.3)} />
        <motion.path d={EAU_2} stroke="var(--color-orb)" strokeOpacity="0.6" strokeWidth="1.2" {...trace(1.15, 1.3)} />

        {REVERBERES.map((r, i) => (
          <g key={r.x}>
            <motion.path d={`M${r.x} ${r.y} V${r.y - 6.5}`} stroke="var(--color-calcaire)" strokeWidth="1" {...trace(1.2, 0.4)} />
            <motion.g {...apparition(1.6 + i * 0.16)}>
              <circle cx={r.x} cy={r.y - 8.5} r="7" fill="url(#ornement-lueur)" />
              <circle cx={r.x} cy={r.y - 8.5} r="1.9" fill="var(--color-halo)" />
              <path
                d={`M${r.x} 153.5 V160.5`}
                stroke="var(--color-halo)"
                strokeOpacity="0.5"
                strokeWidth="1.2"
                strokeDasharray="1.5 2.5"
              />
            </motion.g>
          </g>
        ))}
      </g>

      <motion.path d={ARCHE} stroke="var(--color-chene)" strokeWidth="1.6" {...trace(0, 1.4)} />
    </svg>
  );
}
