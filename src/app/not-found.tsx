import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import * as motion from "motion/react-client";
import { site } from "@/config/site";
import { remplir } from "@/lib/textes";

const T = site.textes.introuvable;

export const metadata: Metadata = {
  title: T.titreOnglet,
  description: remplir(T.description, { nom: site.nom }),
  // Next ajoute lui-même « noindex » aux pages 404 : pas de seconde balise robots héritée du layout,
  // et pas de canonical vers l'accueil.
  robots: null,
  alternates: { canonical: null },
};

/*
 * 404 : une seule ampoule Edison, éteinte. Elle s'allume (et le mot « éteinte »
 * avec elle) quand on survole ou qu'on cible au clavier le lien de retour.
 * Tout se joue en CSS (:has), la page reste un composant serveur.
 */
const ALLUME = "group-has-[a:hover]/allee:opacity-100 group-has-[a:focus-visible]/allee:opacity-100 group-has-[a:active]/allee:opacity-100";

export default function PageIntrouvable() {
  return (
    <section
      aria-labelledby="titre-introuvable"
      className="group/allee relative isolate flex min-h-svh flex-col items-center overflow-hidden px-5 pb-24 text-center md:pb-32"
    >
      {/* Lueur de l'ampoule sur la page */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-[-5rem] -z-10 size-[38rem] sm:top-[-3.25rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,211,140,0.2),rgba(242,211,140,0.06)_55%,transparent)] opacity-0 transition-opacity delay-75 duration-700 ${ALLUME}`}
      />

      <motion.div
        aria-hidden
        className="w-[7.25rem] sm:w-[8.25rem]"
        style={{ originX: 0.5, originY: 0 }}
        initial={{ rotate: 7 }}
        animate={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 30, damping: 3.5 }}
      >
        <Ampoule />
      </motion.div>

      <p className="surtitre mt-8 text-pierre">{T.surtitre}</p>
      <h1
        id="titre-introuvable"
        className="mt-4 max-w-[14ch] text-[clamp(2.5rem,1.6rem+4vw,4.75rem)] font-semibold tracking-[-0.02em] text-calcaire"
      >
        {T.titreDebut}{" "}
        <em className="text-[#9099B2] transition-colors duration-500 group-has-[a:hover]/allee:text-or-clair group-has-[a:focus-visible]/allee:text-or-clair group-has-[a:active]/allee:text-or-clair">
          {T.titreMot}
        </em>
        {T.titreFin}
      </h1>
      <p className="mx-auto mt-6 max-w-[40ch] text-[1.0625rem] leading-relaxed text-pierre">
        {T.texte}
      </p>

      <Link
        href="/"
        className="group mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-or px-7 font-semibold text-nuit transition-colors duration-200 hover:bg-or-clair"
      >
        <ArrowLeft
          aria-hidden
          strokeWidth={2.2}
          className="size-[1.1em] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
        />
        {T.bouton}
      </Link>
    </section>
  );
}

/** Ampoule à filament suspendue à son fil : le haut du fil (sous l'en-tête) sert de pivot au balancement. */
function Ampoule() {
  const verre = "M52 134 C52 146 28 158 28 188 C28 218 44 240 60 240 C76 240 92 218 92 188 C92 158 68 146 68 134 Z";
  return (
    <svg viewBox="0 -70 120 320" fill="none" strokeLinecap="round" strokeLinejoin="round" className="block w-full overflow-visible">
      <defs>
        <radialGradient id="ampoule-lueur">
          <stop offset="0" stopColor="var(--color-halo)" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="var(--color-halo)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--color-halo)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Fil et douille */}
      <path d="M60 -70 V96" stroke="var(--color-filet)" strokeWidth="2" />
      <rect x="47" y="96" width="26" height="32" rx="4" fill="var(--color-minuit)" stroke="var(--color-filet)" strokeWidth="1.5" />
      <path d="M47 104 H73 M47 112 H73 M47 120 H73" stroke="var(--color-filet)" strokeOpacity="0.7" strokeWidth="1" />
      <path d="M50 128 H70 L68 134 H52 Z" fill="var(--color-grain)" stroke="var(--color-filet)" strokeWidth="1.2" />

      {/* Lueur (allumée) */}
      <circle cx="60" cy="182" r="62" fill="url(#ampoule-lueur)" className={`opacity-0 transition-opacity delay-75 duration-500 ${ALLUME}`} />

      {/* Verre : éteint, puis teinté d'or une fois allumé */}
      <path d={verre} fill="var(--color-grain)" fillOpacity="0.45" stroke="#9099B2" strokeWidth="1.5" />
      <path d={verre} fill="var(--color-halo)" fillOpacity="0.4" stroke="var(--color-halo)" strokeWidth="1.5" className={`opacity-0 transition-opacity duration-300 ${ALLUME}`} />
      <path d="M38 180 C38 168 43 159 50 153" stroke="var(--color-calcaire)" strokeOpacity="0.3" strokeWidth="1.5" />

      {/* Filament : gris éteint, or allumé (l'or s'allume un peu avant la lueur) */}
      <path d="M58 134 L52 178 M62 134 L68 178" stroke="#9099B2" strokeWidth="1" />
      <path d="M52 178 q2 -7 4 0 t4 0 t4 0 t4 0" stroke="#9099B2" strokeWidth="1.4" />
      <path
        d="M52 178 q2 -7 4 0 t4 0 t4 0 t4 0"
        stroke="var(--color-halo)"
        strokeWidth="1.8"
        className={`opacity-0 transition-opacity duration-150 ${ALLUME}`}
      />
    </svg>
  );
}
