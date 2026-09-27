import type { CSSProperties } from "react";
import { site } from "@/config/site";
import { HeroScene } from "./HeroScene";
import { HeroDevanture } from "./HeroDevanture";
import { PontLumineux } from "./PontLumineux";
import styles from "./hero.module.css";

const TITRE_ID = "hero-titre";

/** Retard de l'entrée CSS d'un texte (classe `monte`). */
const delai = (secondes: number) => ({ "--delai": `${secondes}s` }) as CSSProperties;

/**
 * Hero (27/09, choix de Julien) : la devanture de la pizzeria en bannière sur
 * toute la largeur ; dessous, le Pont Vieux dessiné au trait dont deux arches
 * sont Commander et Réserver, puis la phrase d'accroche. Même ordre sur tous
 * les écrans.
 */
export function Hero() {
  const { accroche } = site.textes.hero;

  return (
    <HeroScene
      titreId={TITRE_ID}
      className="relative isolate z-[1] -mb-6 overflow-x-clip bg-nuit pb-10 pt-[var(--inset-haut,env(safe-area-inset-top))] md:-mb-10 md:pb-14"
    >
      <HeroDevanture titreId={TITRE_ID} />

      <PontLumineux className="-mt-3 md:-mt-5" />

      {/* Sous le pont, la phrase remonte jusqu'au bas des reflets ; le bas du hero la garde hors de la voûte de la section suivante */}
      <div className="relative mx-auto -mt-4 max-w-xl px-5 text-center md:-mt-6 lg:max-w-2xl">
        <p
          className={`${styles.monte} font-accent text-[1.3rem] italic leading-snug text-calcaire md:text-[1.5rem] lg:text-[clamp(1.6rem,0.8rem_+_1.5vw,2.4rem)]`}
          style={delai(0.55)}
        >
          {accroche}
        </p>
      </div>
    </HeroScene>
  );
}
