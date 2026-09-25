import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { adresseComplete, estPlaceholder, site } from "@/config/site";
import { HeroScene } from "./HeroScene";
import { HeroFenetre } from "./HeroFenetre";
import { PontLumineux } from "./PontLumineux";
import styles from "./hero.module.css";

const TITRE_ID = "hero-titre";

/** Retard de l'entrée CSS d'un texte (classe `monte`). */
const delai = (secondes: number) => ({ "--delai": `${secondes}s` }) as CSSProperties;

/**
 * Hero « Les Quinze Arches » : une fenêtre en arche ouverte sur la fresque
 * animée de la salle, le nom qui se lève derrière Saint-Nazaire, et le Pont
 * Vieux dessiné au trait dont deux arches sont Commander et Réserver.
 *
 * Mobile : surtitre, arche, pont, texte (en-tête, arche et arches-boutons dans
 * le premier écran). Ordinateur : texte à gauche, arche à droite, pont sur
 * toute la largeur de l'écran.
 */
export function Hero() {
  const { surtitre, accroche, modes } = site.textes.hero;
  const itineraire = !estPlaceholder(site.liens.itineraire);
  const adresse = (
    <>
      <MapPin aria-hidden className="size-4 shrink-0 text-or" strokeWidth={2.2} />
      {adresseComplete}
    </>
  );

  return (
    <HeroScene
      titreId={TITRE_ID}
      className="relative isolate z-[1] -mb-6 overflow-x-clip bg-nuit pb-4 pt-[calc(4.75rem_+_env(safe-area-inset-top))] md:-mb-10 md:pt-24 lg:-mb-20 lg:pt-[5.75rem]"
    >
      <div
        className={[
          "mx-auto grid max-w-6xl px-5",
          "[grid-template-areas:'surtitre'_'arche'_'pont'_'texte']",
          "lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[1fr_auto_auto_1fr_auto] lg:gap-x-14 xl:gap-x-20",
          "lg:[grid-template-areas:'._arche'_'surtitre_arche'_'texte_arche'_'._arche'_'pont_pont']",
        ].join(" ")}
      >
        <p
          className={`${styles.monte} surtitre mx-auto flex w-full max-w-[28rem] items-center gap-2.5 text-or-clair [grid-area:surtitre] sm:max-w-none sm:justify-center lg:justify-start`}
          style={delai(0.1)}
        >
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-or shadow-[0_0_10px_2px_rgba(242,211,140,0.55)]" />
          {surtitre}
        </p>

        {/* La fenêtre en arche, 3:4, dimensionnée sur la hauteur d'écran */}
        <div className={`${styles.cadre} relative mx-auto mt-4 [grid-area:arche] lg:mt-0`}>
          <HeroFenetre titreId={TITRE_ID} />
        </div>

        <PontLumineux className="mt-3 [grid-area:pont] md:mt-5 lg:mt-4" />

        <div className="mt-2 [grid-area:texte] sm:mx-auto sm:max-w-xl sm:text-center lg:mx-0 lg:mt-6 lg:max-w-lg lg:text-left">
          <p
            className={`${styles.monte} font-display text-[1.3rem] italic leading-snug text-calcaire md:text-[1.5rem] lg:text-[clamp(1.6rem,0.8rem_+_1.5vw,2.4rem)]`}
            style={delai(0.55)}
          >
            {accroche}
          </p>
          <ul className={`${styles.monte} mt-6 flex flex-wrap gap-2 sm:justify-center lg:justify-start`} style={delai(0.7)}>
            {modes.split(/\s*·\s*/).map((mode) => (
              <li key={mode} className="rounded-full border border-filet/70 bg-grain px-3.5 py-1.5 text-sm font-semibold text-pierre">
                {mode}
              </li>
            ))}
          </ul>
          {/* L'adresse reste visible d'emblée (pas d'entrée depuis l'invisible) */}
          {itineraire ? (
            <a
              href={site.liens.itineraire}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full text-[0.9375rem] text-pierre underline-offset-4 transition-colors hover:text-calcaire hover:underline"
            >
              {adresse}
              <span className="sr-only">{` ${site.textes.actions.itineraireNouvelOnglet}`}</span>
            </a>
          ) : (
            <p className="mt-4 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-pierre">{adresse}</p>
          )}
        </div>
      </div>
    </HeroScene>
  );
}
