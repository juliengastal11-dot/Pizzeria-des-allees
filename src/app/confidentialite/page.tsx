import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { LienExterne, LienValeur, Liste, PageTexte, Point, SectionTexte } from "@/components/layout/PageTexte";
import { Valeur } from "@/components/ui/Valeur";
import { adresseComplete, site } from "@/config/site";
import { partage } from "@/lib/metadonnees";
import { remplir } from "@/lib/textes";

/*
 * Les données variables (dates, adresses des politiques tiers, durées de
 * conservation, CNIL) viennent de site.legal ; les titres et avertissements de
 * site.textes.pagesLegales. Texte à relire par l'exploitant avant la mise en ligne.
 */
const T = site.textes.pagesLegales.confidentialite;
const { legal } = site;
const description = remplir(T.description, { nom: site.nom });

export const metadata: Metadata = {
  title: T.titre,
  description,
  alternates: { canonical: "/confidentialite" },
  ...partage({ titre: `${T.titre} · ${site.nom}`, description, chemin: "/confidentialite" }),
};

/** Un service tiers : ce qui le déclenche, ce qu'il reçoit, ses propres règles. */
function Service({ usage, nom, children, politique }: { usage: string; nom: string; children: ReactNode; politique: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-filet/60 bg-grain px-5 py-5 sm:px-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex min-h-7 items-center rounded-full border border-filet px-3 text-[0.875rem] font-semibold text-or-clair">
          {usage}
        </span>
        <h3 className="font-soustitre text-[1.25rem] font-semibold text-calcaire">{nom}</h3>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
      <p className="mt-3 text-[0.9375rem]">{politique}</p>
    </div>
  );
}

export default function Confidentialite() {
  return (
    <PageTexte
      surtitre={T.surtitre}
      titre={T.titre}
      miseAJour={legal.miseAJour}
      chapo={T.chapo}
      avertissement={{ titre: T.avertissement.titre, texte: <p>{T.avertissement.texte}</p> }}
    >
      <SectionTexte id="responsable" titre="Qui est responsable de vos données">
        <p>
          <strong>{site.nom}</strong>, exploitée par <Valeur valeur={legal.raisonSociale} cle="legal.raisonSociale" />, {adresseComplete}.
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
            aucune requête à Google Fonts ni à un autre service tiers, à la seule exception du fond de carte de la
            section Livraison (voir OpenFreeMap ci-dessous).
          </Point>
          <Point>
            Les liens vers nos réseaux sociaux ouvrent ces services dans un nouvel onglet&nbsp;; aucun de leurs modules
            n’est intégré aux pages.
          </Point>
          <Point>
            Seul le module de réservation de TheFork, si vous ouvrez la fenêtre «&nbsp;Réserver une table&nbsp;», et la
            carte Google, si vous choisissez de l’afficher, peuvent déposer leurs propres cookies (voir ci-dessous).
          </Point>
        </Liste>
        <p>
          <strong>
            Si des statistiques de fréquentation sont ajoutées, un bandeau de consentement sera mis en place
          </strong>{" "}
          et cette page sera mise à jour.
        </p>
      </SectionTexte>

      <SectionTexte id="services" titre="Les services tiers">
        <p>
          Quatre outils extérieurs rendent le site utile. TheFork, Obypay et Google Maps ne se chargent que si vous
          les sollicitez. Le fond de carte de la section Livraison (OpenFreeMap) se charge quand cette section
          approche de l’écran, sans cookie. Chacun traite vos données sous sa propre responsabilité.
        </p>
        <div className="space-y-4">
          <Service
            usage="Réservation"
            nom="TheFork"
            politique={
              <LienExterne href={legal.politiques.thefork}>Mentions légales et déclaration de confidentialité de TheFork</LienExterne>
            }
          >
            <p>
              Le module de réservation ne se charge que lorsque vous ouvrez la fenêtre «&nbsp;Réserver une
              table&nbsp;». Les informations que vous y saisissez (nom, e-mail, téléphone, date, nombre de couverts)
              sont transmises à TheFork, qui gère la réservation et nous la communique, pour l’exécution de votre
              réservation.
            </p>
            <p>
              <strong>Cookies&nbsp;:</strong> dans cette fenêtre, TheFork peut déposer ses propres cookies
              (fonctionnement du module et, selon vos choix, mesure d’audience). Ils relèvent de sa déclaration relative
              à la confidentialité et aux cookies, où vous pouvez les gérer. Rien n’est chargé si vous n’ouvrez pas la
              fenêtre.
            </p>
          </Service>

          <Service
            usage="Commande"
            nom="Obypay"
            politique={<LienExterne href={legal.politiques.obypay}>Déclaration de confidentialité d’Obypay</LienExterne>}
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
            politique={<LienExterne href={legal.politiques.google}>Règles de confidentialité de Google</LienExterne>}
          >
            <p>
              La carte interactive de la section Infos pratiques n’est chargée que si vous cliquez pour l’afficher.
              Google peut alors recevoir des données de navigation (dont votre adresse IP) et déposer des cookies. Le
              lien «&nbsp;Itinéraire&nbsp;» ouvre Google Maps dans un nouvel onglet.
            </p>
          </Service>

          <Service
            usage="Carte de livraison"
            nom="OpenFreeMap"
            politique={<LienExterne href={legal.politiques.openFreeMap}>Politique de confidentialité d’OpenFreeMap</LienExterne>}
          >
            <p>
              Le fond de la carte des communes livrées est téléchargé depuis les serveurs d’OpenFreeMap quand la
              section Livraison est sur le point de s’afficher (sur demande seulement si votre appareil économise les
              données). Comme pour toute ressource web, ces serveurs reçoivent votre adresse IP et des informations
              techniques (navigateur, page d’origine). OpenFreeMap ne dépose aucun cookie et indique ne pas conserver
              les adresses IP, sauf en cas d’incident de sécurité (30&nbsp;jours au plus).
            </p>
            <p>Base légale&nbsp;: notre intérêt légitime à vous montrer notre zone de livraison.</p>
          </Service>
        </div>
      </SectionTexte>

      <SectionTexte id="hebergement" titre="Hébergement et journaux techniques">
        <p>
          Le site est hébergé par {legal.hebergeur.nom} (États-Unis). Pour acheminer les pages et protéger le site,
          l’hébergeur traite des données techniques de connexion (adresse IP, navigateur, page demandée). Les journaux
          techniques auxquels nous avons accès sont conservés {legal.conservation.journaux}. Ces transferts hors de
          l’Union européenne sont encadrés par les garanties prévues par le RGPD (cadre de protection des données
          UE–États-Unis et clauses contractuelles types)&nbsp;: voir la{" "}
          <LienExterne href={legal.politiques.vercel}>politique de confidentialité de {legal.hebergeur.nom}</LienExterne>.
        </p>
        <p>Base légale&nbsp;: notre intérêt légitime à faire fonctionner et à sécuriser le site.</p>
      </SectionTexte>

      <SectionTexte id="contact" titre="Quand vous nous écrivez ou nous appelez">
        <p>
          Si vous nous contactez par e-mail ou par téléphone, nous utilisons vos coordonnées uniquement pour vous
          répondre. Elles ne sont ni vendues ni cédées.
        </p>
        <p>Base légale&nbsp;: notre intérêt légitime à répondre à vos demandes.</p>
        <p>Durée de conservation&nbsp;: {legal.conservation.contact}.</p>
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
          par TheFork, Obypay, Google ou OpenFreeMap, vous pouvez aussi vous adresser directement à eux.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la{" "}
          <LienExterne href={legal.cnilPlainte}>CNIL</LienExterne>.
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
