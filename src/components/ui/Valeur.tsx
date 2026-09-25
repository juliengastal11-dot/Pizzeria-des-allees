import { estPlaceholder } from "@/config/site";

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
