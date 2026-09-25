import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { LienExterne, LienValeur, Liste, PageTexte, Point, SectionTexte } from "@/components/layout/PageTexte";
import { Valeur } from "@/components/ui/Valeur";
import { adresseComplete, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Données personnelles et cookies sur le site de ${site.nom} : aucun cookie de suivi, aucun compte, services tiers chargés seulement à votre demande.`,
  alternates: { canonical: "/confidentialite" },
};

const MISE_A_JOUR = { iso: "2026-09-25", libelle: "25 septembre 2026" };

/** Politiques des services tiers (vérifiées le 25/09/2026, sauf `aVerifier`). */
const POLITIQUES = {
  thefork: { url: "https://www.thefork.fr/legal", aVerifier: true },
  obypay: { url: "https://obypay.com/declaration-de-confidentialite-ue/", aVerifier: false },
  google: { url: "https://policies.google.com/privacy?hl=fr", aVerifier: false },
  vercel: { url: "https://vercel.com/legal/privacy-policy", aVerifier: false },
};
const CNIL_PLAINTE = "https://www.cnil.fr/fr/plaintes";

function Politique({ politique, children }: { politique: { url: string; aVerifier: boolean }; children: ReactNode }) {
  return (
    <>
      <LienExterne href={politique.url}>{children}</LienExterne>
      {politique.aVerifier && (
        <>
          {" "}
          <Valeur valeur="[À VÉRIFIER]" className="text-[0.875rem]" />
        </>
      )}
    </>
  );
}

/** Un service tiers : ce qui le déclenche, ce qu'il reçoit, ses propres règles. */
function Service({ usage, nom, children, politique }: { usage: string; nom: string; children: ReactNode; politique: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-filet/60 bg-grain px-5 py-5 sm:px-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex min-h-7 items-center rounded-full border border-filet px-3 text-[0.875rem] font-semibold text-or-clair">
          {usage}
        </span>
        <h3 className="font-display text-[1.25rem] font-semibold text-calcaire">{nom}</h3>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
      <p className="mt-3 text-[0.9375rem]">{politique}</p>
    </div>
  );
}

export default function Confidentialite() {
  return (
    <PageTexte
      surtitre="Vos données"
      titre="Politique de confidentialité"
      miseAJour={MISE_A_JOUR}
      chapo={
        <>
          En bref&nbsp;: ce site ne dépose aucun cookie de suivi, ne vous demande de créer aucun compte et ne collecte
          lui-même aucune donnée vous concernant. Seuls les services que vous choisissez d’ouvrir (réservation,
          commande, carte) reçoivent des informations, selon leurs propres règles.
        </>
      }
      avertissement={{
        titre: "Projet à valider",
        texte: <p>Cette politique est un projet rédigé avec le site. Elle doit être relue et validée par l’exploitant avant la mise en ligne.</p>,
      }}
    >
      <SectionTexte id="responsable" titre="Qui est responsable de vos données">
        <p>
          <strong>{site.nom}</strong>, exploitée par <Valeur valeur={site.legal.raisonSociale} />, {adresseComplete}.
        </p>
        <p>
          Pour toute question sur vos données&nbsp;: <LienValeur valeur={site.email} href={`mailto:${site.email}`} />.
        </p>
      </SectionTexte>

      <SectionTexte id="cookies" titre="Cookies et mesure d’audience">
        <Liste>
          <Point>Aucun cookie publicitaire, de réseau social ou de mesure d’audience n’est déposé par ce site.</Point>
          <Point>Aucun compte à créer, aucun formulaire à remplir sur le site lui-même.</Point>
          <Point>
            Les polices de caractères et les images sont hébergées avec le site&nbsp;: l’affichage des pages n’envoie
            aucune requête à Google Fonts ni à un autre service tiers.
          </Point>
          <Point>
            Les liens vers nos réseaux sociaux ouvrent ces services dans un nouvel onglet&nbsp;; aucun de leurs modules
            n’est intégré aux pages.
          </Point>
        </Liste>
        <p>
          <strong>
            Si des statistiques de fréquentation sont ajoutées, un bandeau de consentement sera mis en place
          </strong>{" "}
          et cette page sera mise à jour.
        </p>
      </SectionTexte>

      <SectionTexte id="services" titre="Les services tiers, seulement à votre demande">
        <p>
          Trois outils extérieurs rendent le site utile. Aucun ne se charge tant que vous ne l’avez pas sollicité, et
          chacun traite vos données sous sa propre responsabilité.
        </p>
        <div className="space-y-4">
          <Service
            usage="Réservation"
            nom="TheFork"
            politique={<Politique politique={POLITIQUES.thefork}>Politique de confidentialité de TheFork</Politique>}
          >
            <p>
              Le module de réservation ne se charge que lorsque vous ouvrez la fenêtre «&nbsp;Réserver une
              table&nbsp;». Les informations que vous y saisissez (nom, e-mail, téléphone, date, nombre de couverts)
              sont transmises à TheFork, qui gère la réservation et nous la communique. TheFork peut déposer ses
              propres cookies dans cette fenêtre.
            </p>
          </Service>

          <Service
            usage="Commande"
            nom="Obypay"
            politique={<Politique politique={POLITIQUES.obypay}>Déclaration de confidentialité d’Obypay</Politique>}
          >
            <p>
              Le bouton «&nbsp;Commander&nbsp;» vous emmène sur le site d’Obypay, notre outil de commande et de
              paiement. Votre commande, vos coordonnées et votre paiement y sont traités par Obypay et, pour la
              livraison, par son partenaire coursier. Aucune donnée bancaire ne transite par ce site.
            </p>
          </Service>

          <Service
            usage="Carte"
            nom="Google Maps"
            politique={<Politique politique={POLITIQUES.google}>Règles de confidentialité de Google</Politique>}
          >
            <p>
              La carte interactive n’est chargée que si vous cliquez pour l’afficher. Google peut alors recevoir des
              données de navigation (dont votre adresse IP) et déposer des cookies. Le lien «&nbsp;Itinéraire&nbsp;»
              ouvre Google Maps dans un nouvel onglet.
            </p>
          </Service>
        </div>
      </SectionTexte>

      <SectionTexte id="hebergement" titre="Hébergement et journaux techniques">
        <p>
          Le site est hébergé par {site.legal.hebergeur.nom} (États-Unis). Pour acheminer les pages et protéger le
          site, l’hébergeur traite des données techniques de connexion (adresse IP, navigateur, page demandée) pendant
          une durée limitée. Ces transferts hors de l’Union européenne sont encadrés par les garanties prévues par le
          RGPD&nbsp;: voir la{" "}
          <Politique politique={POLITIQUES.vercel}>politique de confidentialité de {site.legal.hebergeur.nom}</Politique>.
        </p>
        <p>Base légale&nbsp;: notre intérêt légitime à faire fonctionner et à sécuriser le site.</p>
      </SectionTexte>

      <SectionTexte id="contact" titre="Quand vous nous écrivez ou nous appelez">
        <p>
          Si vous nous contactez par e-mail ou par téléphone, nous utilisons vos coordonnées uniquement pour vous
          répondre, et ne les conservons que le temps nécessaire au traitement de votre demande. Elles ne sont ni
          vendues ni cédées.
        </p>
      </SectionTexte>

      <SectionTexte id="droits" titre="Vos droits">
        <p>Conformément au RGPD et à la loi Informatique et Libertés, vous pouvez à tout moment&nbsp;:</p>
        <Liste>
          <Point>accéder à vos données et en obtenir une copie&nbsp;;</Point>
          <Point>les faire rectifier ou effacer&nbsp;;</Point>
          <Point>vous opposer à leur traitement ou en demander la limitation&nbsp;;</Point>
          <Point>demander leur portabilité&nbsp;;</Point>
          <Point>définir des directives sur leur sort après votre décès.</Point>
        </Liste>
        <p>
          Écrivez-nous à <LienValeur valeur={site.email} href={`mailto:${site.email}`} />. Pour les données traitées
          par TheFork, Obypay ou Google, vous pouvez aussi vous adresser directement à eux.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la{" "}
          <LienExterne href={CNIL_PLAINTE}>CNIL</LienExterne>.
        </p>
      </SectionTexte>

      <SectionTexte id="evolutions" titre="Évolutions de cette politique">
        <p>
          Cette page peut évoluer, par exemple si un nouvel outil est ajouté au site. La date de dernière mise à jour
          figure en haut de page. Voir aussi les <Link href="/mentions-legales">mentions légales</Link>.
        </p>
      </SectionTexte>
    </PageTexte>
  );
}
