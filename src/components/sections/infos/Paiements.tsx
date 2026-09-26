import { Banknote, Coins, Ticket } from "lucide-react";
import { site } from "@/config/site";
import { LogoCB, LogoMastercard, LogoVisa } from "./IconesPaiement";

/** Icône choisie d'après le libellé du moyen de paiement (hors carte, voir les logos ci-dessous). */
function IconePaiement({ libelle }: { libelle: string }) {
  const l = libelle.toLowerCase();
  const props = { "aria-hidden": true, className: "size-[1.15em] shrink-0", strokeWidth: 2.1 } as const;
  if (/titre|ticket|restaurant|chèque|cheque/.test(l)) return <Ticket {...props} />;
  if (/espèce|espece|liquide|cash/.test(l)) return <Banknote {...props} />;
  return <Coins {...props} />;
}

/** Moyens de paiement en ovales, comme les bassins des écluses de Fonseranes. */
export function Paiements({ className }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className ?? ""}`}>
      {site.paiements.map((moyen) =>
        /carte|bancaire|\bcb\b|sans contact/.test(moyen.toLowerCase()) ? (
          <li
            key={moyen}
            className="inline-flex min-h-12 items-center gap-2 rounded-[50%] bg-ciel-pale px-5 py-2 text-[0.9375rem] font-semibold text-encre"
          >
            <span className="flex items-center gap-1.5">
              <LogoVisa className="h-[1.6em] w-auto rounded-[0.2em]" />
              <LogoMastercard className="h-[1.6em] w-auto rounded-[0.2em]" />
              <LogoCB className="h-[1.6em] w-auto rounded-[0.2em]" />
            </span>
            {moyen}
          </li>
        ) : (
          <li
            key={moyen}
            className="inline-flex min-h-12 items-center gap-2 rounded-[50%] bg-ciel-pale px-6 py-2 text-[0.9375rem] font-semibold text-encre"
          >
            <IconePaiement libelle={moyen} />
            {moyen}
          </li>
        ),
      )}
    </ul>
  );
}
