import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { BoutonCommander, BoutonReserver } from "@/components/actions/Boutons";
import { Valeur } from "@/components/ui/Valeur";
import { JOURS, adresseComplete, estPlaceholder, site, type Jour } from "@/config/site";
import { remplir } from "@/lib/textes";
import { IconeFacebook, IconeInstagram } from "./IconesReseaux";
import { PontVieux } from "./PontVieux";
import { SECTIONS, ancre } from "./navigation";

const { footer: T, actions } = site.textes;
const R = T.resumeHoraires;

/** « lundi », « lundi et mardi », « lundi, mardi et mercredi » */
function enumerer(mots: string[]): string {
  return mots.length < 2 ? mots.join("") : `${mots.slice(0, -1).join(", ")} ${R.et} ${mots[mots.length - 1]}`;
}

/** Résumé court des jours d'ouverture, ex. « du mardi au dimanche, fermé le lundi » (modèles : site.textes.footer.resumeHoraires). */
function resumeHoraires(): string {
  const ouvert = (j: Jour) => site.horaires.semaine[j].length > 0;
  const ouverts = JOURS.filter(ouvert);
  const fermes = JOURS.filter((j) => !ouvert(j));
  if (ouverts.length === 0) return R.toujoursFerme;
  if (fermes.length === 0) return R.tousLesJours;
  const fermeture = fermes.length === 1 ? remplir(R.fermeUnJour, { jour: fermes[0] }) : remplir(R.fermePlusieursJours, { jours: enumerer(fermes) });
  // Plage continue, éventuellement à cheval sur deux semaines
  const debut = JOURS.findIndex((j, i) => ouvert(j) && !ouvert(JOURS[(i + 6) % 7]));
  let n = 0;
  while (n < 7 && ouvert(JOURS[(debut + n) % 7])) n++;
  if (n === ouverts.length) return `${remplir(R.plage, { debut: JOURS[debut], fin: JOURS[(debut + n - 1) % 7] })}, ${fermeture}`;
  return `${enumerer(ouverts)}, ${fermeture}`;
}

const lienDiscret = "inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-calcaire hover:underline";

/**
 * Pied de page minuit, bordé en haut par le profil du Pont Vieux.
 * Sur mobile, une marge basse laisse la place à la barre Commander / Réserver.
 */
export function Footer() {
  const annee = new Date().getFullYear();
  const telReel = !estPlaceholder(site.telephone);
  const reseaux = [
    { nom: "Instagram", url: site.reseaux.instagram, Icone: IconeInstagram },
    { nom: "Facebook", url: site.reseaux.facebook, Icone: IconeFacebook },
  ];

  return (
    <footer className="relative bg-minuit text-calcaire">
      <PontVieux />

      <div className="relative mx-auto max-w-6xl px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-12 md:px-8 md:pb-12 md:pt-16">
        {/* Lueur des réverbères sur l'eau */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(55%_100%_at_50%_0%,rgba(242,211,140,0.07),transparent_70%)]"
        />

        <div className="relative grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <Image src={site.logo.src} alt={site.logo.alt} width={112} height={112} className="size-24 md:size-28" />
            <p className="mt-7 max-w-[15ch] font-accent text-[clamp(2rem,1.3rem+3.2vw,3.5rem)] font-medium italic leading-[1.04] tracking-[-0.01em] text-or-clair">
              {site.textes.footer.signature}
            </p>
            {/* Bloc repéré par la barre mobile, qui se retire quand il est à l'écran */}
            <div data-cta-bloc className="mt-8 flex flex-wrap gap-3">
              <BoutonCommander variante="or" />
              <BoutonReserver variante="contour" />
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-[auto_1fr] sm:gap-12">
            <nav aria-labelledby="pied-sections">
              <p id="pied-sections" className="surtitre text-pierre">
                {T.titreNavigation}
              </p>
              <ul className="mt-3">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={ancre(s.id)}
                      className="inline-flex min-h-11 items-center text-calcaire transition-colors duration-200 hover:text-or-clair"
                    >
                      {s.libelle}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="rounded-[2.5rem_2.5rem_1.25rem_1.25rem] border border-filet/50 bg-grain/60 p-6 sm:p-7">
              <p className="surtitre text-pierre">{T.titreCoordonnees}</p>
              <address className="mt-3 space-y-1 not-italic">
                <a
                  href={site.liens.itineraire}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-11 items-start gap-3 py-1.5 transition-colors hover:text-or-clair"
                >
                  <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-or" />
                  <span>
                    {adresseComplete}
                    <span className="mt-1 flex items-center gap-1 font-petit text-sm font-semibold text-or-clair">
                      {actions.itineraire}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="sr-only">{` ${actions.nouvelOnglet}`}</span>
                  </span>
                </a>
                {telReel ? (
                  <a
                    href={`tel:${site.telephone.replace(/\s/g, "")}`}
                    className="flex min-h-11 items-center gap-3 tabular-nums transition-colors hover:text-or-clair"
                  >
                    <Phone aria-hidden className="size-5 shrink-0 text-or" />
                    {site.telephone}
                  </a>
                ) : (
                  <p className="flex min-h-11 items-center gap-3">
                    <Phone aria-hidden className="size-5 shrink-0 text-or" />
                    <Valeur valeur={site.telephone} />
                  </p>
                )}
                <p className="flex min-h-11 items-center gap-3">
                  <Clock aria-hidden className="size-5 shrink-0 text-or" />
                  <span>
                    {`${T.horaires} `}
                    {site.horaires.aConfirmer ? <Valeur valeur={site.horaires.mentionAConfirmer} /> : resumeHoraires()}
                  </span>
                </p>
              </address>

              <p className="surtitre mt-6 text-pierre">{T.titreReseaux}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {reseaux.map(({ nom, url, Icone }) => (
                  <li key={nom}>
                    {estPlaceholder(url) ? (
                      <span className="inline-flex min-h-11 flex-wrap items-center gap-x-2.5 gap-y-1 text-pierre">
                        <span aria-hidden className="grid size-11 place-items-center rounded-full border border-dashed border-filet/60">
                          <Icone className="size-5" />
                        </span>
                        {nom}
                        <Valeur valeur={url} className="text-sm" />
                      </span>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex min-h-11 items-center gap-2.5 text-calcaire transition-colors hover:text-or-clair"
                      >
                        <span
                          aria-hidden
                          className="grid size-11 place-items-center rounded-full border border-filet/70 transition-colors group-hover:border-or-clair group-hover:bg-minuit"
                        >
                          <Icone className="size-5" />
                        </span>
                        {nom}
                        <span className="sr-only">{` ${actions.nouvelOnglet}`}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative mt-14 border-t border-filet/30 pt-5 font-petit text-sm leading-relaxed text-pierre md:mt-20">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
            <ul className="flex flex-wrap gap-x-6">
              <li>
                <Link href="/mentions-legales" className={lienDiscret}>
                  {T.mentionsLegales}
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className={lienDiscret}>
                  {T.confidentialite}
                </Link>
              </li>
            </ul>
            <a href={ancre("accueil")} className="group inline-flex min-h-11 items-center gap-2.5 font-semibold text-calcaire">
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-full border border-filet/60 transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                <ArrowUp className="size-4" />
              </span>
              {T.hautDePage}
            </a>
          </div>
          <div className="mt-3 space-y-1.5">
            {site.photos.provisoires && (
              <p>{T.visuelsProvisoires}</p>
            )}
            <p>
              {T.credit} <Valeur valeur={site.legal.concepteur} />
            </p>
            <p>
              © {annee} {site.nom}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
