import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import { estPlaceholder, site } from "@/config/site";
import { Valeur } from "@/components/ui/Valeur";
import { BoutonCommander, BoutonReserver } from "@/components/actions/Boutons";
import { Paiements } from "@/components/sections/infos/Paiements";

const TEXTES = site.textes.infos.contact;

const lien =
  "inline-flex min-h-11 items-center underline decoration-eau/50 decoration-1 underline-offset-4 transition-colors hover:decoration-nuit [overflow-wrap:anywhere]";

function Ligne({ icone, libelle, children }: { icone: ReactNode; libelle: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3.5">
      <span aria-hidden className="grid h-11 w-13 shrink-0 place-items-center rounded-[50%] bg-ciel-pale text-nuit">
        {icone}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-eau">{libelle}</p>
        <p className="text-[1.0625rem] font-semibold leading-snug">{children}</p>
      </div>
    </li>
  );
}

/** Carte « Contact » : téléphone, e-mail, Réserver / Commander, moyens de paiement. */
export function CarteContact() {
  const telephone = site.telephone;
  const email = site.email;

  return (
    <article
      data-surface="clair"
      aria-labelledby="infos-contact"
      className="h-full rounded-[2.5rem] bg-calcaire-clair p-6 text-nuit shadow-[0_40px_80px_-40px_rgba(6,15,46,0.9)] sm:p-8"
    >
      <h3 id="infos-contact" className="font-display text-[1.75rem] font-semibold leading-none">
        {TEXTES.titre}
      </h3>
      <ul className="mt-5 space-y-3">
        <Ligne icone={<Phone className="size-5" strokeWidth={2.1} />} libelle={TEXTES.telephone}>
          {estPlaceholder(telephone) ? (
            <Valeur valeur={telephone} />
          ) : (
            <a href={`tel:${telephone.replace(/[^\d+]/g, "")}`} className={`${lien} tabular-nums`}>
              {telephone}
            </a>
          )}
        </Ligne>
        <Ligne icone={<Mail className="size-5" strokeWidth={2.1} />} libelle={TEXTES.email}>
          {estPlaceholder(email) ? (
            <Valeur valeur={email} />
          ) : (
            <a href={`mailto:${email}`} className={lien}>
              {email}
            </a>
          )}
        </Ligne>
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <BoutonReserver variante="nuit" />
        <BoutonCommander variante="or" anneau />
      </div>

      <div className="mt-7 border-t border-dashed border-eau/35 pt-6">
        <h4 className="font-display text-xl font-semibold leading-tight">{TEXTES.paiements}</h4>
        <Paiements className="mt-4" />
      </div>
    </article>
  );
}
