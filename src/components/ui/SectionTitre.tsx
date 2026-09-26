"use client";

import { Fragment, useEffect, useRef } from "react";
import { animate } from "motion/react";
import { typographie } from "@/lib/textes";
import { ENTREE, preparerApparition } from "./apparition";

type Props = {
  surtitre: string;
  /** Une chaîne, ou plusieurs segments affichés chacun sur sa ligne (pour maîtriser les coupures). */
  titre: string | readonly string[];
  intro?: string;
  id?: string;
  /** "clair" pour les fonds clairs (La carte) : textes en bleu. */
  surface?: "sombre" | "clair";
  align?: "gauche" | "centre";
  className?: string;
};

/**
 * Surtitre + titre H2 (qui sort d'un masque ligne par ligne) + chapô.
 * Le masque a une marge verticale compensée pour ne jamais couper les accents.
 * Le serveur rend le titre lisible : il n'est masqué qu'après le montage, et
 * seulement s'il est encore sous la ligne de flottaison (voir preparerApparition).
 */
export function SectionTitre({ surtitre, titre, intro, id, surface = "sombre", align = "gauche", className }: Props) {
  const clair = surface === "clair";
  // Typographie française appliquée en filet de sécurité aux textes de la configuration
  const lignes = (typeof titre === "string" ? [titre] : titre).map(typographie);
  const refTitre = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h2 = refTitre.current;
    if (!h2) return;
    const textes = Array.from(h2.querySelectorAll<HTMLElement>("[data-ligne]"));
    // Le H2 ne bouge pas (seules les lignes glissent dans leur masque) : c'est lui qu'on observe.
    return preparerApparition(
      h2,
      () => textes.forEach((t) => (t.style.transform = "translateY(105%)")),
      () => textes.forEach((t, i) => animate(t, { y: ["105%", "0%"] }, { duration: 0.9, delay: i * 0.08, ease: ENTREE })),
      0.5,
    );
  }, []);

  return (
    <div className={`${align === "centre" ? "mx-auto text-center" : ""} max-w-3xl ${className ?? ""}`}>
      <p className={`surtitre ${clair ? "text-nuit" : "text-pierre"}`}>
        {typographie(surtitre)}
      </p>
      <h2 ref={refTitre} id={id} className={`mt-4 text-[clamp(2.1rem,1.4rem+3.4vw,3.9rem)] font-semibold tracking-[-0.018em] ${clair ? "text-nuit" : "text-calcaire"}`}>
        {lignes.map((ligne, i) => (
          <Fragment key={i}>
            {/* Espace entre les lignes pour le nom accessible (sans effet visuel entre deux blocs) */}
            {i > 0 && " "}
            <span className="-my-[0.15em] block overflow-hidden py-[0.15em]">
              <span data-ligne className="block">
                {ligne}
              </span>
            </span>
          </Fragment>
        ))}
      </h2>
      {intro && (
        <p className={`mt-5 max-w-[62ch] text-[1.0625rem] leading-relaxed ${align === "centre" ? "mx-auto" : ""} ${clair ? "text-nuit/90" : "text-pierre"}`}>
          {typographie(intro)}
        </p>
      )}
    </div>
  );
}
