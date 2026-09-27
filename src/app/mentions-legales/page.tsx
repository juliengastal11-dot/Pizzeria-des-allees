import type { Metadata } from "next";
import Link from "next/link";
import {
  Fiche,
  LienExterne,
  LienValeur,
  Ligne,
  Liste,
  PageTexte,
  Point,
  SectionTexte,
} from "@/components/layout/PageTexte";
import { TexteAvecValeurs, Valeur } from "@/components/ui/Valeur";
import { adresseComplete, estPlaceholder, site } from "@/config/site";
import { partage } from "@/lib/metadonnees";
import { remplir } from "@/lib/textes";

/*
 * Les données variables (société, hébergeur, médiateur, crédits, dates) viennent
 * de site.legal ; les titres et avertissements de site.textes.pagesLegales.
 * Le texte juridique ci-dessous est à relire par l'exploitant avant la mise en ligne.
 */
const T = site.textes.pagesLegales.mentions;
const { legal } = site;
const description = remplir(T.description, { nom: site.nom, adresse: adresseComplete });

export const metadata: Metadata = {
  title: T.titre,
  description,
  alternates: { canonical: "/mentions-legales" },
  ...partage({ titre: `${T.titre} · ${site.nom}`, description, chemin: "/mentions-legales" }),
};

const telephoneHref = `tel:${site.telephone.replace(/[^\d+]/g, "")}`;

export default function MentionsLegales() {
  return (
    <PageTexte
      surtitre={T.surtitre}
      titre={T.titre}
      chapo={T.chapo}
      miseAJour={legal.miseAJour}
      avertissement={{ titre: T.avertissement.titre, texte: <p>{T.avertissement.texte}</p> }}
    >
      <SectionTexte id="editeur" titre="Éditeur du site">
        <Fiche>
          <Ligne terme="Nom commercial">{site.nom}</Ligne>
          <Ligne terme="Raison sociale">
            <Valeur valeur={legal.raisonSociale} cle="legal.raisonSociale" />
          </Ligne>
          <Ligne terme="Forme juridique">
            <Valeur valeur={legal.formeJuridique} cle="legal.formeJuridique" />
          </Ligne>
          <Ligne terme="Capital social">
            <Valeur valeur={legal.capital} cle="legal.capital" />
          </Ligne>
          <Ligne terme="SIRET">
            <Valeur valeur={legal.siret} cle="legal.siret" className="tabular-nums" />
          </Ligne>
          <Ligne terme="RCS">
            <Valeur valeur={legal.rcs} cle="legal.rcs" />
          </Ligne>
          <Ligne terme="TVA intracommunautaire">
            <Valeur valeur={legal.tva} cle="legal.tva" className="tabular-nums" />
          </Ligne>
          <Ligne terme="Adresse">
            <address className="not-italic">{adresseComplete}</address>
          </Ligne>
          <Ligne terme="Téléphone">
            <LienValeur valeur={site.telephone} href={telephoneHref} />
          </Ligne>
          <Ligne terme="E-mail">
            <LienValeur valeur={site.email} href={`mailto:${site.email}`} />
          </Ligne>
        </Fiche>
      </SectionTexte>

      <SectionTexte id="publication" titre="Directeur de la publication">
        <p>
          <Valeur valeur={legal.directeurPublication} cle="legal.directeurPublication" className="text-calcaire" />
        </p>
      </SectionTexte>

      <SectionTexte id="hebergement" titre="Hébergement">
        <Fiche>
          <Ligne terme="Hébergeur">{legal.hebergeur.nom}</Ligne>
          <Ligne terme="Adresse">
            <address className="not-italic">{legal.hebergeur.adresse}</address>
          </Ligne>
          <Ligne terme="Téléphone">
            <LienValeur valeur={legal.hebergeur.telephone} href={`tel:${legal.hebergeur.telephone.replace(/[^\d+]/g, "")}`} />
          </Ligne>
          <Ligne terme="Site">
            <LienExterne href={legal.hebergeur.site}>{legal.hebergeur.site.replace(/^https?:\/\//, "")}</LienExterne>
          </Ligne>
        </Fiche>
      </SectionTexte>

      <SectionTexte id="conception" titre="Conception et réalisation">
        <p>
          Site conçu et réalisé par <Valeur valeur={legal.concepteur} cle="legal.concepteur" className="text-calcaire" />.
        </p>
      </SectionTexte>

      <SectionTexte id="propriete" titre="Propriété intellectuelle">
        <p>
          Les textes, le logo, les illustrations, les photographies et la mise en page de ce site appartiennent à
          l’éditeur ou sont utilisés avec l’accord de leurs auteurs. Toute reproduction, représentation ou adaptation,
          totale ou partielle, sans autorisation écrite préalable est interdite (articles L.&nbsp;335-2 et suivants du
          Code de la propriété intellectuelle).
        </p>
        <p>
          Les œuvres reproduites, notamment la fresque de la salle (présentée en photo et en animation sur la page
          d’accueil), restent la propriété de leurs auteurs.
        </p>
      </SectionTexte>

      <SectionTexte id="credits" titre="Crédits">
        <Liste>
          <Point>
            <strong>{legal.credits.fresque.libelle}&nbsp;:</strong> <TexteAvecValeurs texte={legal.credits.fresque.texte} />
          </Point>
          <Point>
            <strong>Photographies et visuels&nbsp;:</strong>{" "}
            {site.photos.provisoires ? legal.credits.visuelsProvisoires : <Valeur valeur={legal.credits.photographe} cle="legal.credits.photographe" />}
          </Point>
          <Point>
            <strong>Carte de la zone de livraison&nbsp;:</strong> {legal.credits.carte}
          </Point>
          <Point>
            <strong>Polices&nbsp;:</strong> {legal.credits.polices}
          </Point>
          <Point>
            <strong>Pictogrammes&nbsp;:</strong> {legal.credits.pictogrammes}
          </Point>
        </Liste>
      </SectionTexte>

      <SectionTexte id="services-tiers" titre="Services tiers et liens">
        <p>
          La commande en ligne, la réservation de table et les cartes sont assurées par des services extérieurs
          (Obypay, TheFork, Google Maps, OpenFreeMap), qui restent responsables de leur contenu et de leur
          fonctionnement. Les liens vers d’autres sites s’ouvrent dans un nouvel onglet&nbsp;; nous ne répondons pas de
          leur contenu.
        </p>
      </SectionTexte>

      <SectionTexte id="mediation" titre="Médiation de la consommation">
        <p>
          En cas de litige qui n’aurait pas trouvé de solution avec nous, vous pouvez recourir gratuitement à un
          médiateur de la consommation (articles L.&nbsp;611-1 et suivants du Code de la consommation).
        </p>
        <p>
          Médiateur&nbsp;: <Valeur valeur={legal.mediateur.nom} cle="legal.mediateur.nom" className="text-calcaire" />
          {!estPlaceholder(legal.mediateur.nom) && (
            <>
              {" "}
              (<LienExterne href={legal.mediateur.site}>{legal.mediateur.site.replace(/^https?:\/\//, "")}</LienExterne>)
            </>
          )}
        </p>
      </SectionTexte>

      <SectionTexte id="donnees" titre="Données personnelles">
        <p>
          Ce site ne dépose aucun cookie de suivi. Pour savoir quelles données sont traitées et comment exercer vos
          droits, consultez notre <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </SectionTexte>
    </PageTexte>
  );
}
