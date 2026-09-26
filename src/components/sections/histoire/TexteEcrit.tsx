"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { preparerApparition } from "@/components/ui/apparition";

type Props = {
  texte: string;
  className?: string;
  /** Intervalle entre deux lettres, en millisecondes. */
  pasMs?: number;
  /** Attente avant la première lettre, en millisecondes. */
  departMs?: number;
};

/**
 * Phrase qui s'écrit à la main quand son cadre arrive à l'écran : les lettres
 * apparaissent l'une après l'autre, avec un éclat d'encre fraîche (animation
 * CSS, voir `.ecriture` dans globals.css). Le serveur rend la phrase entière ;
 * elle n'est effacée qu'après le montage, si elle est encore sous la ligne de
 * flottaison (preparerApparition). Mouvement réduit : rien ne bouge.
 * Les lecteurs d'écran reçoivent la phrase entière une seule fois (copie sr-only).
 */
export function TexteEcrit({ texte, className, pasMs = 42, departMs = 250 }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return preparerApparition(
      el,
      () => el.setAttribute("data-ecriture", "attente"),
      () => el.setAttribute("data-ecriture", "en-cours"),
      0.6,
    );
  }, []);

  // Espaces normales seulement : les insécables restent dans leur mot
  const mots = texte.split(" ").filter(Boolean);
  let rang = 0;

  return (
    <p ref={ref} className={`ecriture ${className ?? ""}`} style={{ "--pas": `${pasMs}ms`, "--depart": `${departMs}ms` } as CSSProperties}>
      <span className="sr-only">{texte}</span>
      <span aria-hidden="true">
        {mots.map((mot, i) => (
          <Fragment key={i}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(mot).map((lettre, j) => (
                <span key={j} className="lettre" style={{ "--i": rang++ } as CSSProperties}>
                  {lettre}
                </span>
              ))}
            </span>
            {i < mots.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </p>
  );
}
