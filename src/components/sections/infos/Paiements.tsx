import type { CSSProperties } from "react";
import Image from "next/image";
import { site } from "@/config/site";

/**
 * Logo de chaque moyen de paiement de site.paiements (choisis par Julien) ; le libellé de la
 * config devient le texte de remplacement. Un moyen sans logo garde son libellé.
 */
type Logo = { motif: RegExp; src: string; largeur: number; hauteur: number; complement?: string };

const LOGOS: readonly Logo[] = [
  {
    motif: /carte|bancaire|\bcb\b|sans contact/,
    src: "/images/paiements/cartes.webp",
    largeur: 391,
    hauteur: 113,
    complement: " : CB, Mastercard, Visa, paiement sans contact",
  },
  { motif: /titre|ticket|restaurant/, src: "/images/paiements/titres-restaurant.webp", largeur: 338, hauteur: 240 },
  { motif: /espèce|espece|liquide|cash/, src: "/images/paiements/especes.webp", largeur: 192, hauteur: 192 },
];

/** Largeur prise par une plaque autour de son logo (px-2 et bordure), et espace entre plaques (gap-2). */
const CADRE_PLAQUE = 18;
const ESPACE = 8;

/** Moyens de paiement en logos seulement, chacun sur une plaque blanche comme un autocollant de vitrine. */
export function Paiements({ className }: { className?: string }) {
  const moyens = site.paiements.map((moyen) => ({
    moyen,
    logo: LOGOS.find((l) => l.motif.test(moyen.toLowerCase())),
  }));

  // Les logos gardent une hauteur commune qui suit la largeur de la liste (2,75 rem au plus),
  // pour tenir sur une seule ligne jusque dans une carte étroite de mobile ou de tablette.
  const logos = moyens.flatMap((m) => (m.logo ? [m.logo] : []));
  const ratios = logos.reduce((somme, l) => somme + l.largeur / l.hauteur, 0);
  const reserve = logos.length * CADRE_PLAQUE + (moyens.length - 1) * ESPACE + 1;
  const hauteur = { "--hauteur-logo": `min(2.75rem, calc((100cqw - ${reserve}px) / ${ratios.toFixed(3)}))` } as CSSProperties;

  return (
    <ul className={`@container flex flex-wrap items-center gap-2 ${className ?? ""}`} style={hauteur}>
      {moyens.map(({ moyen, logo }) => (
        <li
          key={moyen}
          className="grid place-items-center rounded-xl border border-black/10 bg-white px-2 py-1.5 font-semibold text-encre shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
        >
          {logo ? (
            <Image
              src={logo.src}
              alt={`${moyen}${logo.complement ?? ""}`}
              width={logo.largeur}
              height={logo.hauteur}
              sizes="160px"
              className="h-(--hauteur-logo) w-auto"
            />
          ) : (
            moyen
          )}
        </li>
      ))}
    </ul>
  );
}
