import { Banknote, Coins, CreditCard, Ticket } from "lucide-react";
import { site } from "@/config/site";

/** Icône choisie d'après le libellé du moyen de paiement. */
function IconePaiement({ libelle }: { libelle: string }) {
  const l = libelle.toLowerCase();
  const props = { "aria-hidden": true, className: "size-[1.15em] shrink-0", strokeWidth: 2.1 } as const;
  if (/titre|ticket|restaurant|chèque|cheque/.test(l)) return <Ticket {...props} />;
  if (/carte|bancaire|\bcb\b|sans contact/.test(l)) return <CreditCard {...props} />;
  if (/espèce|espece|liquide|cash/.test(l)) return <Banknote {...props} />;
  return <Coins {...props} />;
}

/** Moyens de paiement en ovales, comme les bassins des écluses de Fonseranes. */
export function Paiements({ className }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className ?? ""}`}>
      {site.paiements.map((moyen) => (
        <li
          key={moyen}
          className="inline-flex min-h-12 items-center gap-2 rounded-[50%] bg-ciel-pale px-6 py-2 text-[0.9375rem] font-semibold text-nuit"
        >
          <IconePaiement libelle={moyen} />
          {moyen}
        </li>
      ))}
    </ul>
  );
}
