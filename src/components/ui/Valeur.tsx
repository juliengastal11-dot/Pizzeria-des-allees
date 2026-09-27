import { Fragment } from "react";
import { estPlaceholder } from "@/config/site";
import { morceaux } from "@/lib/textes";

/**
 * Affiche une valeur de la configuration. Si c'est encore un placeholder
 * ("[À CONFIRMER]"…), elle apparaît en pointillés pour être repérée d'un coup d'œil.
 * `cle` : son chemin dans site.ts, pour que le mode relecture sache quelle valeur on remplit.
 */
export function Valeur({ valeur, className, cle }: { valeur: string; className?: string; cle?: string }) {
  if (estPlaceholder(valeur)) {
    return <span data-bloc={cle} className={`placeholder ${className ?? ""}`}>{valeur || "[À CONFIRMER]"}</span>;
  }
  return <span data-bloc={cle} className={className}>{valeur}</span>;
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
