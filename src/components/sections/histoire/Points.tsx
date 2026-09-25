import { Reveal } from "@/components/ui/Reveal";
import { IconeArche } from "./IconesArche";
import { morceaux, typographie } from "./outils";

type Point = { titre: string; texte: string };

/** Les trois engagements : une liste courte, pas des cartes. */
export function Points({ points, className }: { points: readonly Point[]; className?: string }) {
  return (
    <ul className={`max-w-xl ${className ?? ""}`}>
      {points.map((point, i) => (
        <Reveal
          key={point.titre}
          as="li"
          delai={i * 0.12}
          className="flex items-start gap-5 border-t border-filet/35 py-6 first:border-t-0 first:pt-0 last:pb-0"
        >
          <IconeArche variante={i} className="mt-0.5 h-12 w-10 shrink-0 text-or-clair" />
          <div className="min-w-0">
            <h3 className="text-[1.35rem] font-semibold leading-tight text-calcaire">{typographie(point.titre)}</h3>
            <p className="mt-2 text-pierre">
              {morceaux(typographie(point.texte)).map((m, j) =>
                m.placeholder ? (
                  <span key={j} className="placeholder my-0.5 text-[0.94em]">
                    {m.texte}
                  </span>
                ) : (
                  <span key={j}>{m.texte}</span>
                ),
              )}
            </p>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
