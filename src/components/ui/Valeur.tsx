import { Fragment } from "react";
import { estPlaceholder } from "@/config/site";
import { morceaux } from "@/lib/textes";

/**
 * Affiche une valeur de la configuration. Si c'est encore un placeholder
 * ("[À CONFIRMER]"…), elle apparaît en pointillés pour être repérée d'un coup d'œil.
 */
export function Valeur({ valeur, className }: { valeur: string; className?: string }) {
  if (estPlaceholder(valeur)) {
    return <span className={`placeholder ${className ?? ""}`}>{valeur || "[À CONFIRMER]"}</span>;
  }
  return <span className={className}>{valeur}</span>;
}

/** Phrase de la configuration dont seules les parties « […] » sont en pointillés (et suivent la ligne). */
export function TexteAvecValeurs({ texte }: { texte: string }) {
  return (
    <>
      {morceaux(texte).map((m, i) =>
        m.placeholder ? (
          <span key={i} className="placeholder inline! [box-decoration-break:clone]">
            {m.texte}
          </span>
        ) : (
          <Fragment key={i}>{m.texte}</Fragment>
        ),
      )}
    </>
  );
}
